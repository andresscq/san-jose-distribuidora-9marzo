const express = require("express");
const router = express.Router();
const pool = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 1. Lógica para asegurar que la carpeta existe
const uploadDir = path.join(__dirname, "../uploads/sedes");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. Configuración de Multer para la subcarpeta 'sedes'
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/sedes/"); // Se guarda en uploads/sedes/
  },
  filename: (req, file, cb) => {
    // Nombre único: sede-1700000000.jpg
    cb(null, `sede-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

// --- RUTAS API ---

// OBTENER SEDES
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM sedes ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener sedes" });
  }
});

// CREAR SEDE
router.post("/", upload.single("imagen"), async (req, res) => {
  try {
    const {
      nombre_sede,
      ubicacion,
      horario,
      telefono_vendedor,
      google_maps_link,
    } = req.body;
    // Guardamos la ruta completa en la DB: /uploads/sedes/nombre.jpg
    const imagen_url = req.file ? `/uploads/sedes/${req.file.filename}` : null;

    const result = await pool.query(
      "INSERT INTO sedes (nombre_sede, ubicacion, horario, telefono_vendedor, google_maps_link, imagen_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [
        nombre_sede,
        ubicacion,
        horario,
        telefono_vendedor,
        google_maps_link,
        imagen_url,
      ],
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Error al crear la sede en la base de datos" });
  }
});

// ACTUALIZAR SEDE
router.put("/:id", upload.single("imagen"), async (req, res) => {
  const { id } = req.params;
  const {
    nombre_sede,
    ubicacion,
    horario,
    telefono_vendedor,
    google_maps_link,
  } = req.body;

  try {
    let query = `
      UPDATE sedes 
      SET nombre_sede = $1, ubicacion = $2, horario = $3, telefono_vendedor = $4, google_maps_link = $5
    `;
    let params = [
      nombre_sede,
      ubicacion,
      horario,
      telefono_vendedor,
      google_maps_link,
    ];

    if (req.file) {
      const imagen_url = `/uploads/sedes/${req.file.filename}`;
      query += ", imagen_url = $6 WHERE id = $7";
      params.push(imagen_url, id);
    } else {
      query += " WHERE id = $6";
      params.push(id);
    }

    const result = await pool.query(query, params);
    if (result.rowCount === 0)
      return res.status(404).json({ error: "Sede no encontrada" });

    res.json({ message: "Sede actualizada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar" });
  }
});

// ELIMINAR SEDE
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Opcional: Podrías buscar la imagen en el disco y borrarla aquí con fs.unlink
    await pool.query("DELETE FROM sedes WHERE id = $1", [id]);
    res.json({ message: "Sede eliminada" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar" });
  }
});

module.exports = router;
