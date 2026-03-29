const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
require("dotenv").config();

// --- 1. IMPORTACIÓN DE RUTAS ---
const productosRoutes = require("./routes/productos");
const sedesRoutes = require("./routes/sedes");
const empleadosRoutes = require("./routes/empleados");
const vendedoresRoutes = require("./routes/vendedores");
const postulantesRoutes = require("./routes/postulantes");
const proveedoresRoutes = require("./routes/proveedores");

const app = express();
const pool = require("./db"); // Tu conexión a PostgreSQL

// --- 2. MIDDLEWARES ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Acceso a archivos (PDFs de CVs y Catálogos)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- 3. CREACIÓN AUTOMÁTICA DE CARPETAS ---
const carpetas = ["uploads/hojas_de_vida", "uploads/catalogos"];
carpetas.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Carpeta lista: ${dir}`);
  }
});

// --- 4. RUTAS DE LA API ---
app.use("/api", postulantesRoutes);
app.use("/api", proveedoresRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/sedes", sedesRoutes);
app.use("/api/empleados", empleadosRoutes);
app.use("/api/vendedores", vendedoresRoutes);

// --- 5. AUTENTICACIÓN (LOGIN Y REGISTRO) ---

// LOGIN: Verifica credenciales y devuelve datos para el LocalStorage
app.post("/api/login", async (req, res) => {
  const { email, password, rol } = req.body;
  try {
    const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "El correo no está registrado" });
    }

    const usuario = result.rows[0];
    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (!passwordValida) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // Opcional: Validar que el rol coincida con el que seleccionó en el front
    if (rol && usuario.rol !== rol) {
      return res
        .status(403)
        .json({ error: `Esta cuenta es de tipo ${usuario.rol}` });
    }

    // Enviamos los datos necesarios para la sesión
    res.json({
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    });
  } catch (err) {
    console.error("Error en Login:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// REGISTRO: Crea solo el usuario base
// REGISTRO: Crea solo el usuario base
app.post("/api/registro", async (req, res) => {
  const { nombre, email, password, rol } = req.body;

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const rolFinal = rol || "postulante";

    // ✅ CAMBIO CLAVE: Cambiamos 'client' por 'pool'
    const resultUsuario = await pool.query(
      "INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4) RETURNING id, nombre, email, rol",
      [nombre, email, hashedPassword, rolFinal],
    );

    // Devolvemos el usuario creado para que el Front pueda manejar el flujo
    res.status(201).json(resultUsuario.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "Este correo ya está en uso" });
    }
    console.error("Error en Registro:", err.message);
    res.status(500).json({ error: "No se pudo crear la cuenta" });
  }
});

// --- 6. INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
