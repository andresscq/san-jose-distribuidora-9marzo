import React from "react";
import { Link } from "react-router-dom";
import { ProductoCard } from "./ProductoCard";

export const ProductShowcase = ({ productos, categorias, cargando }) => {
  // 1. Filtramos las categorías marcadas como prioridad (estrella) en el Admin
  const categoriasPrioritarias = categorias
    ? categorias
        .filter((c) => c.es_prioridad)
        .map((c) => c.nombre.toUpperCase())
    : [];

  // 2. Obtenemos las categorías que realmente tienen productos en la base de datos
  const categoriasConStock = [
    ...new Set(productos.map((p) => p.nombre_categoria?.toUpperCase())),
  ].filter(Boolean);

  // 3. CREACIÓN DE LA LISTA FINAL (Máximo 3 categorías)
  const listaFinal = categoriasPrioritarias
    .filter((cat) => categoriasConStock.includes(cat))
    .slice(0, 3);

  return (
    <section id="productos" className="py-24 px-6 scroll-mt-32">
      <div className="max-w-7xl mx-auto">
        {/* Cabecera */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-4">
          <h2 className="text-5xl font-black text-green-900 uppercase italic tracking-tighter text-center md:text-left">
            Selección <span className="text-yellow-500">Premium</span>
          </h2>
          <div className="h-1 flex-grow mx-8 bg-slate-200 hidden md:block rounded-full"></div>
          <p className="text-slate-400 font-bold text-sm tracking-widest uppercase">
            Stock Actualizado 2026
          </p>
        </div>

        {cargando ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center font-black text-green-800 animate-pulse uppercase tracking-widest">
            <div className="text-6xl mb-4">📦</div>
            Sincronizando Stock...
          </div>
        ) : listaFinal.length === 0 ? (
          <div className="text-center py-24 bg-slate-50 rounded-[45px] border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs mb-2">
              No hay categorías destacadas
            </p>
          </div>
        ) : (
          <div className="space-y-32">
            {listaFinal.map((cat) => {
              const filtrados = productos.filter(
                (p) => p.nombre_categoria?.toUpperCase() === cat,
              );

              return (
                <div key={cat} className="group/cat">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Banner de Categoría */}
                    <div className="md:col-span-4 bg-green-900 rounded-[45px] p-10 flex flex-col justify-between text-white relative overflow-hidden shadow-2xl min-h-[400px]">
                      <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>

                      <div className="relative z-10">
                        <span className="text-yellow-400 font-black text-sm tracking-[0.3em] uppercase">
                          Especialidad
                        </span>
                        <h3 className="text-5xl font-black uppercase italic mt-2 leading-none">
                          {cat}
                        </h3>
                      </div>

                      <div className="relative z-10">
                        {/* Descripción de la Categoría */}
                        <p className="text-green-200 font-medium mb-8 text-sm opacity-80 leading-relaxed">
                          {categorias.find(
                            (c) => c.nombre.toUpperCase() === cat,
                          )?.descripcion ||
                            `La mejor selección de ${cat.toLowerCase()} con calidad premium.`}
                        </p>

                        <Link
                          to="/productos"
                          className="inline-block bg-yellow-400 text-green-950 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all shadow-lg text-center"
                        >
                          Explorar Todo
                        </Link>
                      </div>
                    </div>

                    {/* Grid de 3 Productos */}
                    <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filtrados.slice(0, 3).map((prod) => (
                        <ProductoCard
                          key={prod.id}
                          nombre={prod.nombre}
                          categoria={prod.nombre_categoria}
                          imagen={prod.imagen_url}
                          descripcion={prod.descripcion} // <-- PASAMOS LA DESCRIPCIÓN
                          stock={prod.stock} // <-- PASAMOS EL STOCK
                          stock_alerta={prod.stock_alerta} // <-- PASAMOS LA ALERTA
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
