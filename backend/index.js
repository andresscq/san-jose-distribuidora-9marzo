const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcrypt"); // Añadido para el Login
require("dotenv").config();

const app = express();

// --- 1. CONFIGURACIÓN DE MIDDLEWARES ---
app.use(cors());
app.use(express.json());

// --- 2. ACCESO PÚBLICO A ARCHIVOS ---
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- 3. CONFIGURACIÓN DE POSTGRESQL ---
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// --- 4. CONFIGURACIÓN DE MULTER (CARGA DE CVs) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/hojas_de_vida/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten archivos PDF"), false);
    }
  },
});

// --- NUEVO: RUTA DE LOGIN (Para validar a Juanito Alimaña) ---
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
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

// --- 5. RUTAS DE RECLUTAMIENTO (GESTIÓN DE TALENTO) ---

// POST: Recibir postulación
app.post("/api/postular", upload.single("archivoPdf"), async (req, res) => {
  const { nombre, edad, estudio, experiencia, telefono } = req.body;
  const hoja_de_vida_url = req.file ? req.file.path : null;

  try {
    const result = await pool.query(
      "INSERT INTO postulantes (nombre, edad, estudio, experiencia, hoja_de_vida_url, telefono, estado) VALUES ($1, $2, $3, $4, $5, $6, 'Pendiente') RETURNING *",
      [nombre, edad, estudio, experiencia, hoja_de_vida_url, telefono],
    );
    res.json({ message: "¡Postulación enviada!", postulante: result.rows[0] });
  } catch (err) {
    console.error("Error al postular:", err.message);
    res.status(500).json({ error: "Error al procesar la postulación" });
  }
});

// GET: Obtener lista de candidatos
app.get("/api/postulantes", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM postulantes ORDER BY id DESC", // Cambié 'fecha' por 'id' para evitar error si no existe columna fecha
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener candidatos" });
  }
});

// PUT: Actualizar estado del candidato (Me interesa, Rechazado, etc)
app.put("/api/postulantes/:id/estado", async (req, res) => {
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

// DELETE: Eliminar un candidato
app.delete("/api/postulantes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM postulantes WHERE id = $1", [id]);
    res.json({ message: "Candidato eliminado" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar" });
  }
});

// --- 6. RUTAS DE PRODUCTOS (INVENTARIO) ---

app.get("/api/productos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM productos ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

app.put("/api/productos/:id", async (req, res) => {
  const { id } = req.params;
  const { precio_unidad } = req.body;
  try {
    const result = await pool.query(
      "UPDATE productos SET precio_unidad = $1 WHERE id = $2 RETURNING *",
      [precio_unidad, id],
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar precio" });
  }
});

// --- RUTA DE REGISTRO CORREGIDA ---
app.post("/api/registro", async (req, res) => {
  const { nombre, email, password } = req.body;

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // EL CAMBIO ESTÁ AQUÍ: Agregamos el $4 para el rol
    const result = await pool.query(
      "INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4) RETURNING id, nombre, email, rol",
      [nombre, email, hashedPassword, "postulante"], // <--- Aquí hay 4 valores
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error en registro:", err.message);
    if (err.code === "23505") {
      return res.status(400).json({ error: "Este correo ya está registrado" });
    }
    res.status(500).json({ error: "Error al crear la cuenta" });
  }
});

// --- 7. ENCENDER SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 SERVIDOR EJECUTÁNDOSE EN: http://localhost:${PORT}`);
});
