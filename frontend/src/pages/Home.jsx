import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../api/axios";

import { Navbar } from "../components/Navbar";
import { Hero } from "../components/Hero";
import { Features } from "../components/Features";
import { Nosotros } from "../components/Nosotros";
import { ProductShowcase } from "../components/ProductShowcase";
import { Sedes } from "../components/Sedes";
import { Footer } from "../components/Footer";

export const Home = () => {
  const [productos, setProductos] = useState([]);
  // --- NUEVO: Estado para categorías ---
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const { hash } = useLocation();

  // 1. Cargar productos y categorías
  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        // Hacemos ambas peticiones al mismo tiempo
        const [resProductos, resCategorias] = await Promise.all([
          api.get("/api/productos"),
          api.get("/api/productos/categorias"), // Asegúrate que esta ruta sea la correcta en tu backend
        ]);

        setProductos(resProductos.data);
        setCategorias(resCategorias.data); // Guardamos las categorías con su campo 'es_prioridad'
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setCargando(false);
      }
    };
    obtenerDatos();
  }, []);

  // 2. SCROLL MANUAL DE ALTA PRECISIÓN
  useEffect(() => {
    if (hash) {
      const ejecutarScroll = () => {
        const id = hash.replace("#", "");
        const elemento = document.getElementById(id);

        if (elemento) {
          const yOffset = -100;
          const y =
            elemento.getBoundingClientRect().top + window.pageYOffset + yOffset;

          window.scrollTo({ top: y, behavior: "smooth" });
        }
      };

      if (!cargando) {
        const timer = setTimeout(ejecutarScroll, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [hash, cargando]);

  return (
    <div
      id="inicio"
      className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden"
    >
      <Navbar />
      <Hero />
      <Features />
      <Nosotros />
      {/* Ahora 'categorias' ya existe y tiene datos */}
      <ProductShowcase
        productos={productos}
        categorias={categorias}
        cargando={cargando}
      />
      <Sedes />
      <Footer />
    </div>
  );
};
