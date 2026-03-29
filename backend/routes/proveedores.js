const express = require("express");
const router = express.Router();
const pool = require("../db"); // Conexión a tu base de datos
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// --- CONFIGURACIÓN DE ALMACENAMIENTO (CATÁLOGOS) ---
const storageCat = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/catalogos/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `CAT-${uniqueSuffix}-${file.originalname}`);
  },
});

const uploadCat = multer({
  storage: storageCat,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten archivos PDF"), false);
    }
  },
});

// --- MIDDLEWARE DE SEGURIDAD (ADMIN) ---
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

// --- RUTAS ---

/**
 * 1. REGISTRAR / ACTUALIZAR PERFIL CORPORATIVO
 * Se activa cuando el usuario tipo proveedor llena su formulario.
 */
router.post(
  "/perfil-proveedor",
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

/**
 * 2. OBTENER LISTA DE PROVEEDORES (ADMIN)
 */
router.get("/proveedores", esAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM proveedores ORDER BY id DESC",
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener la lista de proveedores" });
  }
});

/**
 * 3. ACTUALIZAR ESTADO DEL PROVEEDOR (ADMIN)
 * Ej: "Pendiente" -> "Me interesa" / "Rechazado"
 */
router.put("/proveedores/:id/estado", esAdmin, async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  try {
    await pool.query("UPDATE proveedores SET estado = $1 WHERE id = $2", [
      estado,
      id,
    ]);
    res.json({ message: "Estado actualizado correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar el estado" });
  }
});

/**
 * 4. ELIMINAR PROVEEDOR (ADMIN + BORRADO DE ARCHIVO)
 */
router.delete("/proveedores/:id", esAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Buscamos la ruta del catálogo antes de borrar el registro
    const buscar = await pool.query(
      "SELECT catalogo_url FROM proveedores WHERE id = $1",
      [id],
    );

    if (buscar.rows.length === 0) {
      return res.status(404).json({ error: "Proveedor no encontrado" });
    }

    const rutaCatalogo = buscar.rows[0].catalogo_url;

    // 2. Borramos el registro de la base de datos
    await pool.query("DELETE FROM proveedores WHERE id = $1", [id]);

    // 3. Borramos el archivo físico de forma segura
    if (rutaCatalogo) {
      // Normalizamos la ruta (importante por si estás en Windows o Linux)
      const pathLimpio = rutaCatalogo.replace(/\\/g, "/");
      const pathCompleto = path.join(__dirname, "..", pathLimpio); // ".." para salir de la carpeta /routes

      if (fs.existsSync(pathCompleto)) {
        try {
          fs.unlinkSync(pathCompleto);
          console.log("✅ Archivo eliminado:", pathCompleto);
        } catch (fileErr) {
          console.error("⚠️ Error al borrar archivo físico:", fileErr.message);
        }
      }
    }

    res.json({ message: "Proveedor eliminado correctamente" });
  } catch (err) {
    console.error("Error al eliminar proveedor:", err.message);
    res.status(500).json({ error: "Error interno al eliminar el proveedor" });
  }
});

module.exports = router;
