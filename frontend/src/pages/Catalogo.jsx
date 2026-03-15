import { useEffect, useState } from "react";
import api from "../api/axios";
import { Navbar } from "../components/Navbar";
import { ProductoCard } from "../components/ProductoCard";

export const Catalogo = () => {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSel, setCategoriaSel] = useState("Todas");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerProductos = async () => {
      try {
        // Esta ruta debe coincidir con tu API corregida (la que tiene el JOIN)
        const respuesta = await api.get("/api/productos");
        setProductos(respuesta.data);
      } catch (error) {
        console.error("Error al cargar productos:", error);
      } finally {
        setCargando(false);
      }
    };
    obtenerProductos();
  }, []);

  // Extraemos las categorías de forma única basándonos en los nombres que vienen del backend
  const categoriasDinamicas = [
    "Todas",
    ...new Set(productos.map((p) => p.nombre_categoria).filter(Boolean)),
  ];

  // Filtramos por búsqueda y por categoría seleccionada
  const filtrados = productos.filter((p) => {
    const matchNombre = p.nombre
      ?.toLowerCase()
      .includes(busqueda.toLowerCase());
    const matchCat =
      categoriaSel === "Todas" || p.nombre_categoria === categoriaSel;
    return matchNombre && matchCat;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto pt-32 pb-20 px-6">
        {/* Cabecera del Catálogo */}
        <header className="mb-12">
          <h1 className="text-5xl font-black text-green-900 italic uppercase tracking-tighter">
            Nuestro <span className="text-yellow-500">Inventario</span>
          </h1>
          <p className="text-slate-400 font-bold mt-2 uppercase text-[10px] tracking-[0.3em]">
            Productos frescos directamente a tu negocio
          </p>
        </header>

        {/* Barra de Búsqueda Premium */}
        <div className="relative mb-8 group">
          <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl">
            🔍
          </span>
          <input
            type="text"
            placeholder="¿Qué estás buscando hoy? (ej. Queso, Huevos, Jamón...)"
            className="w-full p-6 pl-16 bg-white rounded-[30px] shadow-sm outline-none border-2 border-transparent focus:border-green-900/10 font-bold transition-all placeholder:text-slate-300"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* Filtros de Categoría Estilo Píldora */}
        <div className="flex flex-wrap gap-3 mb-16 justify-center md:justify-start">
          {categoriasDinamicas.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaSel(cat)}
              className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${
                categoriaSel === cat
                  ? "bg-green-900 text-white border-green-900 shadow-xl scale-105"
                  : "bg-white text-slate-400 hover:text-green-900 border-slate-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Estado de Carga */}
        {cargando ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-900"></div>
          </div>
        ) : (
          <>
            {/* Grilla de Productos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filtrados.map((prod) => (
                <ProductoCard
                  key={prod.id}
                  nombre={prod.nombre}
                  categoria={prod.nombre_categoria}
                  imagen={prod.imagen_url}
                  descripcion={prod.descripcion} // Enviamos la descripción a la card
                  stock={prod.stock} // Enviamos el stock a la card
                  stock_alerta={prod.stock_alerta} // Enviamos el límite de alerta
                  telefono="593987654321" // WhatsApp de la distribuidora
                />
              ))}
            </div>

            {/* Mensaje de No Resultados */}
            {filtrados.length === 0 && (
              <div className="text-center py-24 bg-white rounded-[40px] border-2 border-dashed border-slate-100">
                <p className="text-slate-400 font-black uppercase tracking-widest text-xs">
                  Lo sentimos, no encontramos productos que coincidan con tu
                  búsqueda
                </p>
                <button
                  onClick={() => {
                    setBusqueda("");
                    setCategoriaSel("Todas");
                  }}
                  className="mt-4 text-green-900 font-bold underline text-xs uppercase"
                >
                  Ver todo el catálogo
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};
