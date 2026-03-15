const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcrypt");
const fs = require("fs");
const productosRoutes = require("./routes/productos");
const sedesRoutes = require("./routes/sedes"); // 1. IMPORTA LAS RUTAS DE SEDES
require("dotenv").config();

const app = express();

// --- 1. CONFIGURACIÓN DE MIDDLEWARES ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/productos", productosRoutes);
app.use("/api/sedes", sedesRoutes);

// --- 2. ACCESO PÚBLICO A ARCHIVOS ---
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- 3. CONFIGURACIÓN DE POSTGRESQL ---
const pool = require("./db");

// --- NUEVO: MIDDLEWARE DE SEGURIDAD PARA ADMIN ---
const esAdmin = (req, res, next) => {
  const { rol } = req.headers;
  if (rol === "admin") {
    next();
  } else {
    res.status(403).json({
      error: "Acceso denegado. Se requieren permisos de administrador.",
    });
  }
};

// --- ASEGURAR QUE LAS CARPETAS EXISTAN ---
const carpetas = ["uploads/hojas_de_vida", "uploads/catalogos"];
carpetas.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// --- 4. CONFIGURACIÓN DE MULTER ---

const storageCV = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/hojas_de_vida/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const storageCat = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/catalogos/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `CAT-${uniqueSuffix}-${file.originalname}`);
  },
});

const uploadCV = multer({
  storage: storageCV,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Solo se permiten archivos PDF"), false);
  },
});

const uploadCat = multer({
  storage: storageCat,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Solo se permiten archivos PDF"), false);
  },
});

// --- RUTA DE LOGIN ---
app.post("/api/login", async (req, res) => {
  const { email, password, rol } = req.body;
  try {
    const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const usuario = result.rows[0];
    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (!passwordValida) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    if (rol && usuario.rol !== rol) {
      return res.status(403).json({
        error: `Acceso denegado. Esta cuenta es de tipo ${usuario.rol}.`,
      });
    }

    res.json({
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    });
  } catch (err) {
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// --- 5. RUTAS DE RECLUTAMIENTO (POSTULANTES) ---

app.post("/api/postular", uploadCV.single("archivoPdf"), async (req, res) => {
  const { nombre, edad, estudio, experiencia, telefono, usuario_id } = req.body;
  const hoja_de_vida_url = req.file ? req.file.path : null;

  try {
    const query = `
      INSERT INTO postulantes (usuario_id, nombre, edad, estudio, experiencia, telefono, hoja_de_vida_url, estado)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'Pendiente')
      ON CONFLICT (usuario_id) 
      DO UPDATE SET 
        nombre = EXCLUDED.nombre,
        edad = EXCLUDED.edad,
        estudio = EXCLUDED.estudio,
        experiencia = EXCLUDED.experiencia,
        telefono = EXCLUDED.telefono,
        hoja_de_vida_url = COALESCE(EXCLUDED.hoja_de_vida_url, postulantes.hoja_de_vida_url),
        estado = 'Pendiente'
      RETURNING *;
    `;

    const result = await pool.query(query, [
      usuario_id,
      nombre,
      edad,
      estudio,
      experiencia,
      telefono,
      hoja_de_vida_url,
    ]);

    res.json({
      message: "¡CV recibido con éxito!",
      postulante: result.rows[0],
    });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: "Error al procesar la postulación" });
  }
});

// Protegida con esAdmin
app.get("/api/postulantes", esAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM postulantes ORDER BY id DESC",
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener candidatos" });
  }
});

// Protegida con esAdmin
app.put("/api/postulantes/:id/estado", esAdmin, async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  try {
    const result = await pool.query(
      "UPDATE postulantes SET estado = $1 WHERE id = $2 RETURNING *",
      [estado, id],
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar estado" });
  }
});

// Actualizar estado del proveedor
app.put("/api/proveedores/:id/estado", esAdmin, async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  try {
    await pool.query("UPDATE proveedores SET estado = $1 WHERE id = $2", [
      estado,
      id,
    ]);
    res.json({ message: "Estado actualizado" });
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar estado" });
  }
});

// Protegida con esAdmin
app.delete("/api/postulantes/:id", esAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM postulantes WHERE id = $1", [id]);
    res.json({ message: "Candidato eliminado" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar" });
  }
});

// --- 6. RUTAS DE PROVEEDORES ---

// Protegida con esAdmin
app.get("/api/proveedores", esAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM proveedores ORDER BY id DESC",
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener proveedores:", err.message);
    res.status(500).json({ error: "Error al obtener la lista de proveedores" });
  }
});

// --- ELIMINAR PROVEEDOR (Versión Corregida) ---
app.delete("/api/proveedores/:id", esAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Buscamos la ruta del catálogo
    const buscar = await pool.query(
      "SELECT catalogo_url FROM proveedores WHERE id = $1",
      [id],
    );

    if (buscar.rows.length === 0) {
      return res.status(404).json({ error: "Proveedor no encontrado" });
    }

    const rutaCatalogo = buscar.rows[0].catalogo_url;

    // 2. Borramos el registro de la base de datos PRIMERO
    await pool.query("DELETE FROM proveedores WHERE id = $1", [id]);

    // 3. Borramos el archivo físico de forma segura
    if (rutaCatalogo) {
      // Normalizamos la ruta para evitar errores de barras invertidas
      const pathLimpio = rutaCatalogo.replace(/\\/g, "/");
      const pathCompleto = path.join(__dirname, pathLimpio);

      if (fs.existsSync(pathCompleto)) {
        try {
          fs.unlinkSync(pathCompleto);
          console.log("✅ Archivo borrado:", pathCompleto);
        } catch (fileErr) {
          console.error(
            "⚠️ No se pudo borrar el archivo físico, pero el registro sí se eliminó:",
            fileErr.message,
          );
        }
      }
    }

    res.json({ message: "Proveedor eliminado correctamente" });
  } catch (err) {
    console.error("❌ Error en el servidor al eliminar:", err.message);
    res.status(500).json({ error: "Error interno al eliminar el proveedor" });
  }
});

app.post(
  "/api/perfil-proveedor",
  uploadCat.single("catalogo"),
  async (req, res) => {
    const { usuario_id, nombre_empresa, ruc, telefono_corporativo } = req.body;
    const catalogo_url = req.file ? req.file.path : null;

    try {
      const query = `
      INSERT INTO proveedores (usuario_id, nombre_empresa, ruc, telefono_corporativo, catalogo_url)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (usuario_id) 
      DO UPDATE SET 
        nombre_empresa = EXCLUDED.nombre_empresa,
        ruc = EXCLUDED.ruc,
        telefono_corporativo = EXCLUDED.telefono_corporativo,
        catalogo_url = COALESCE(EXCLUDED.catalogo_url, proveedores.catalogo_url);
    `;
      await pool.query(query, [
        usuario_id,
        nombre_empresa,
        ruc,
        telefono_corporativo,
        catalogo_url,
      ]);
      res.json({ message: "Perfil corporativo actualizado correctamente" });
    } catch (err) {
      console.error("Error al actualizar perfil proveedor:", err.message);
      res
        .status(500)
        .json({ error: "Error al actualizar perfil de proveedor" });
    }
  },
);

// --- 7. RUTAS DE PRODUCTOS ---

// 1. OBTENER PRODUCTOS (Con el nombre de la categoría incluido)
app.get("/api/productos", async (req, res) => {
  try {
    const query = `
      SELECT p.*, c.nombre AS nombre_categoria 
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      ORDER BY p.id ASC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

// 2. ACTUALIZAR PRODUCTO (Para que guarde stock, descripción, etc.)
app.put("/api/productos/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, stock, stock_alerta, categoria_id } = req.body;

  try {
    const query = `
      UPDATE productos 
      SET nombre = $1, 
          descripcion = $2, 
          stock = $3, 
          stock_alerta = $4, 
          categoria_id = $5 
      WHERE id = $6 
      RETURNING *
    `;
    const values = [nombre, descripcion, stock, stock_alerta, categoria_id, id];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar el producto" });
  }
});

// --- RUTA DE REGISTRO ---
// --- RUTA DE REGISTRO MEJORADA ---
app.post("/api/registro", async (req, res) => {
  const { nombre, email, password, rol } = req.body;
  const client = await pool.connect();

  try {
    await client.query("BEGIN"); // Inicia transacción

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const rolFinal = rol || "postulante";

    // 1. Crear el usuario en la tabla 'usuarios'
    const resultUsuario = await client.query(
      "INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4) RETURNING id, nombre, email, rol",
      [nombre, email, hashedPassword, rolFinal],
    );

    const nuevoUsuario = resultUsuario.rows[0];

    // 2. Crear el perfil inicial (sin PDF ni Edad por ahora)
    if (rolFinal === "postulante") {
      await client.query(
        "INSERT INTO postulantes (nombre, usuario_id, estado) VALUES ($1, $2, $3)",
        [nombre, nuevoUsuario.id, "Pendiente"],
      );
    } else if (rolFinal === "proveedor") {
      await client.query(
        "INSERT INTO proveedores (usuario_id, nombre_empresa) VALUES ($1, $2)",
        [nuevoUsuario.id, nombre],
      );
    }

    await client.query("COMMIT"); // Guarda todo si no hubo errores
    res.status(201).json(nuevoUsuario);
  } catch (err) {
    await client.query("ROLLBACK"); // Si algo falló, deshace todo (limpieza automática)
    console.error("Error en registro:", err.message);

    if (err.code === "23505") {
      return res.status(400).json({ error: "Este correo ya está registrado" });
    }
    res.status(500).json({ error: "Error al crear la cuenta" });
  } finally {
    client.release(); // Cierra la conexión
  }
});

// --- 8. ENCENDER SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 SERVIDOR EJECUTÁNDOSE EN: http://localhost:${PORT}`);
});
