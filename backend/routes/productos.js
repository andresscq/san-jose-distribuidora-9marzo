const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pool = require("../db");

// --- 1. CONFIGURACIÓN DE ALMACENAMIENTO ---
const storageProd = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/productos/";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `PROD-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const uploadProd = multer({ storage: storageProd });

// --- 2. RUTAS DE CATEGORÍAS ---

router.get("/categorias", async (req, res) => {
  try {
    const result = await pool.query(
      // Primero las favoritas, y dentro de esas, la más recientemente actualizada
      "SELECT * FROM categorias ORDER BY es_prioridad DESC, updated_at DESC, nombre ASC",
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener categorías" });
  }
});

router.post("/categorias", async (req, res) => {
  const { nombre } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO categorias (nombre) VALUES ($1) RETURNING *",
      [nombre.trim().toUpperCase()],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: "Esa categoría ya existe" });
  }
});

// Editar Categoría (Sincronizado con el Front)
router.put("/categorias/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  try {
    await pool.query("UPDATE categorias SET nombre = $1 WHERE id = $2", [
      nombre.toUpperCase(),
      id,
    ]);
    res.json({ message: "Categoría actualizada" });
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar categoría" });
  }
});

// Busca esta parte en tu productos.js y cámbiala por esta:
router.put("/categorias/:id/prioridad", async (req, res) => {
  const { id } = req.params;
  const { es_prioridad } = req.body;

  console.log(`Cambiando prioridad de Cat ID: ${id} a: ${es_prioridad}`);

  try {
    const result = await pool.query(
      // ACTUALIZAMOS es_prioridad Y TAMBIÉN updated_at
      "UPDATE categorias SET es_prioridad = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
      [es_prioridad, id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    res.json({ message: "Prioridad actualizada", data: result.rows[0] });
  } catch (err) {
    console.error("ERROR SQL PRIORIDAD:", err.message);
    res.status(500).json({ error: "Error interno", detalle: err.message });
  }
});

router.delete("/categorias/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM categorias WHERE id = $1", [id]);
    res.json({ message: "Categoría eliminada" });
  } catch (err) {
    res
      .status(400)
      .json({ error: "No se puede eliminar: tiene productos vinculados" });
  }
});

// --- 3. RUTAS DE PRODUCTOS ---

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, c.nombre AS nombre_categoria 
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      ORDER BY p.id DESC`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

router.post("/", uploadProd.single("imagen"), async (req, res) => {
  const { nombre, descripcion, stock, stock_alerta, categoria_id } = req.body;
  const imagen_url = req.file ? req.file.path : null;
  try {
    const result = await pool.query(
      `INSERT INTO productos (nombre, descripcion, imagen_url, stock, stock_alerta, categoria_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        nombre,
        descripcion,
        imagen_url,
        parseInt(stock) || 0,
        parseInt(stock_alerta) || 5,
        categoria_id,
      ],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Error al guardar producto" });
  }
});

// --- RUTAS DE CATEGORÍAS EN productos.js ---

router.put("/:id", uploadProd.single("imagen"), async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, stock, stock_alerta, categoria_id } = req.body;
  try {
    if (req.file) {
      const oldImg = await pool.query(
        "SELECT imagen_url FROM productos WHERE id = $1",
        [id],
      );
      if (
        oldImg.rows[0]?.imagen_url &&
        fs.existsSync(oldImg.rows[0].imagen_url)
      ) {
        fs.unlinkSync(oldImg.rows[0].imagen_url);
      }
      await pool.query(
        `UPDATE productos SET nombre=$1, descripcion=$2, stock=$3, stock_alerta=$4, categoria_id=$5, imagen_url=$6 WHERE id=$7`,
        [
          nombre,
          descripcion,
          stock,
          stock_alerta,
          categoria_id,
          req.file.path,
          id,
        ],
      );
    } else {
      await pool.query(
        `UPDATE productos SET nombre=$1, descripcion=$2, stock=$3, stock_alerta=$4, categoria_id=$5 WHERE id=$6`,
        [nombre, descripcion, stock, stock_alerta, categoria_id, id],
      );
    }
    res.json({ message: "Actualizado" });
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar" });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT imagen_url FROM productos WHERE id = $1",
      [id],
    );
    if (
      result.rows[0]?.imagen_url &&
      fs.existsSync(result.rows[0].imagen_url)
    ) {
      fs.unlinkSync(result.rows[0].imagen_url);
    }
    await pool.query("DELETE FROM productos WHERE id = $1", [id]);
    res.json({ message: "Eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar" });
  }
});

// --- NUEVA: BORRADO MASIVO ---
router.post("/delete-many", async (req, res) => {
  const { ids } = req.body;
  if (!ids || ids.length === 0)
    return res.status(400).json({ error: "No IDs" });
  try {
    const result = await pool.query(
      "SELECT imagen_url FROM productos WHERE id = ANY($1)",
      [ids],
    );
    result.rows.forEach((p) => {
      if (p.imagen_url && fs.existsSync(p.imagen_url))
        fs.unlinkSync(p.imagen_url);
    });
    await pool.query("DELETE FROM productos WHERE id = ANY($1)", [ids]);
    res.json({ message: "Productos eliminados" });
  } catch (err) {
    res.status(500).json({ error: "Error masivo" });
  }
});

module.exports = router;
