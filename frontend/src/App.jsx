import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

// Importación de Páginas
import { Home } from "./pages/Home";
import { Admin } from "./pages/Admin";
import { Catalogo } from "./pages/Catalogo";
import { Trabajo } from "./pages/Trabajo";
import { Proveedores } from "./pages/Proveedores"; // Nueva página para empresas
import { TodasLasSedes } from "./components/TodasLasSedes";

// Componente para resetear el scroll al cambiar de página
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        {/* --- RUTAS PÚBLICAS --- */}
        <Route path="/" element={<Home />} />
        <Route path="/productos" element={<Catalogo />} />
        <Route path="/todas-las-sedes" element={<TodasLasSedes />} />

        {/* --- PORTAL DE POSTULANTES (TRABAJO) --- */}
        <Route path="/unetes" element={<Trabajo />} />

        {/* --- NUEVA RUTA: PORTAL DE PROVEEDORES --- 
            Aquí es donde mandamos al usuario cuando hace clic en el botón verde de la Navbar
        */}
        <Route path="/acceso-proveedores" element={<Proveedores />} />

        {/* --- RUTA DE ADMINISTRACIÓN --- */}
        <Route path="/admin-sj-2026" element={<Admin />} />

        {/* --- COMODÍN (404) --- */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
