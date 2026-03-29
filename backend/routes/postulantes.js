const express = require("express");
const router = express.Router();
const pool = require("../db");
const multer = require("multer");
const path = require("path");

// --- 1. CONFIGURACIÓN DE ALMACENAMIENTO (CVs) ---
const storageCV = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/hojas_de_vida/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const uploadCV = multer({
  storage: storageCV,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten archivos PDF"), false);
    }
  },
});

// --- 2. MIDDLEWARE DE SEGURIDAD (ADMIN) ---
const esAdmin = (req, res, next) => {
  const rol = req.headers["rol"] || req.headers["authorization"];
  if (rol === "admin") {
    next();
  } else {
    res.status(403).json({
      error: "Acceso denegado. Se requieren permisos de administrador.",
    });
  }
};

// --- 3. RUTAS ---

/**
 * POSTULAR / ACTUALIZAR PERFIL
 * Restricción de 2 meses (60 días) para evitar spam.
 */
router.post("/postular", uploadCV.single("archivoPdf"), async (req, res) => {
  const { nombre, edad, estudio, experiencia, telefono, usuario_id } = req.body;
  const hoja_de_vida_url = req.file ? req.file.path : null;

  if (!usuario_id || usuario_id === "undefined") {
    return res.status(400).json({ error: "ID de usuario no proporcionado" });
  }

  try {
    // --- RESTRICCIÓN DE TIEMPO (60 DÍAS) ---
    const checkFecha = await pool.query(
      "SELECT fecha_postulacion FROM postulantes WHERE usuario_id = $1",
      [usuario_id],
    );

    if (checkFecha.rows.length > 0 && checkFecha.rows[0].fecha_postulacion) {
      const ultimaPost = new Date(checkFecha.rows[0].fecha_postulacion);
      const ahora = new Date();

      // Calculamos la diferencia en días
      const diferenciaDias = (ahora - ultimaPost) / (1000 * 60 * 60 * 24);

      if (diferenciaDias < 60) {
        const diasFaltantes = Math.ceil(60 - diferenciaDias);
        return res.status(429).json({
          error: `Ya tienes una postulación registrada. Podrás actualizar tu perfil en ${diasFaltantes} días.`,
        });
      }
    }

    // --- UPSERT (Insertar o Actualizar) ---
    const query = `
      INSERT INTO postulantes (usuario_id, nombre, edad, estudio, experiencia, telefono, hoja_de_vida_url, estado, fecha_postulacion)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'Pendiente', NOW())
      ON CONFLICT (usuario_id) 
      DO UPDATE SET 
        nombre = EXCLUDED.nombre,
        edad = EXCLUDED.edad,
        estudio = EXCLUDED.estudio,
        experiencia = EXCLUDED.experiencia,
        telefono = EXCLUDED.telefono,
        hoja_de_vida_url = COALESCE(EXCLUDED.hoja_de_vida_url, postulantes.hoja_de_vida_url),
        estado = 'Pendiente',
        fecha_postulacion = NOW()
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
      message: "¡Formulario enviado con éxito!",
      postulante: result.rows[0],
    });
  } catch (err) {
    console.error("Error en DB:", err.message);
    res.status(500).json({ error: "Error al procesar la solicitud" });
  }
});

/**
 * OBTENER TODOS LOS POSTULANTES (ADMIN)
 */
router.get("/postulantes", esAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, u.email 
       FROM postulantes p
       JOIN usuarios u ON p.usuario_id = u.id
       WHERE p.nombre IS NOT NULL 
       ORDER BY p.id DESC`,
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener candidatos" });
  }
});

/**
 * ACTUALIZAR ESTADO (ADMIN)
 */
router.put("/postulantes/:id/estado", esAdmin, async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  try {
    const result = await pool.query(
      "UPDATE postulantes SET estado = $1 WHERE id = $2 RETURNING *",
      [estado, id],
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Error al cambiar estado" });
  }
});

/**
 * ELIMINAR POSTULANTE (ADMIN)
 */
router.delete("/postulantes/:id", esAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM postulantes WHERE id = $1", [id]);
    res.json({ message: "Registro eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar" });
  }
});

module.exports = router;
