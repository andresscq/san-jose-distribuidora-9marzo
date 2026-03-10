import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

// Importación de Páginas
import { Home } from "./pages/Home";
import { Admin } from "./pages/Admin";
import { Catalogo } from "./pages/Catalogo";
import { Trabajo } from "./pages/Trabajo"; // Este ahora tiene el "Portero" adentro

// Componente para resetear el scroll al cambiar de página (Muy útil para la experiencia de usuario)
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
      {/* Resetea la vista arriba cada vez que navegas */}
      <ScrollToTop />

      <Routes>
        {/* --- RUTAS PÚBLICAS --- */}
        <Route path="/" element={<Home />} />
        <Route path="/productos" element={<Catalogo />} />

        {/* Esta ruta "/unetes" ahora es inteligente. 
            Si el usuario no está logueado, el componente Trabajo mostrará el Login automáticamente.
        */}
        <Route path="/unetes" element={<Trabajo />} />

        {/* --- RUTA DE ADMINISTRACIÓN (Protegida por URL secreta) --- */}
        <Route path="/admin-sj-2026" element={<Admin />} />

        {/* --- COMODÍN (404) --- */}
        {/* Si escriben cualquier cosa mal, los mandamos de vuelta a la página principal */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
