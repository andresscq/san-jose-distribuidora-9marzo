import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { MapPin, Clock, MessageCircle, Navigation, Store } from "lucide-react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export const TodasLasSedes = () => {
  const [sedes, setSedes] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarSedes = async () => {
      try {
        const res = await api.get("/api/sedes");
        setSedes(res.data);
      } catch (err) {
        console.error("Error al cargar todas las sedes", err);
      } finally {
        setCargando(false);
      }
    };
    cargarSedes();
    window.scrollTo(0, 0); // Inicia la página desde arriba
  }, []);

  // Lógica de Estado: Abierto / Cerrado / Por Cerrar
  const obtenerEstadoSede = (horarioStr) => {
    try {
      if (!horarioStr || !horarioStr.includes("-"))
        return { texto: "Consultar", color: "bg-slate-100 text-slate-500" };

      const ahora = new Date();
      const horaActual = ahora.getHours() + ahora.getMinutes() / 60;

      const [inicio, fin] = horarioStr.split("-").map((h) => {
        const [hora, min] = h.trim().split(":").map(Number);
        return hora + min / 60;
      });

      if (horaActual >= inicio && horaActual < fin) {
        if (fin - horaActual < 0.5)
          return {
            texto: "Cierre Próximo",
            color: "bg-orange-100 text-orange-600",
          };
        return { texto: "Abierto Ahora", color: "bg-green-100 text-green-600" };
      }
      return { texto: "Cerrado", color: "bg-red-100 text-red-600" };
    } catch (e) {
      return { texto: "Ver Horario", color: "bg-slate-100 text-slate-500" };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar con alta jerarquía visual */}
      <div className="relative z-[110]">
        <Navbar />
      </div>

      {/* Espaciado superior (pt-40) para que la Navbar no tape el título */}
      <main className="flex-grow pt-30 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <header className="mb-16 text-center">
            <h1 className="text-4xl md:text-5xl font-black text-green-900 uppercase italic tracking-tighter leading-tight">
              Nuestra Red de <span className="text-yellow-500">Locales</span>
            </h1>
            <p className="text-slate-400 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.4em] mt-4">
              Distribuidora San José • Cobertura Nacional y Atención de Primera
            </p>
          </header>

          {cargando ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-900"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {sedes.map((sede) => {
                // Limpieza de ruta de imagen
                const rutaLimpia = sede.imagen_url
                  ? sede.imagen_url.replace(/^\//, "")
                  : "";
                const urlImagen = rutaLimpia
                  ? `http://localhost:3000/${rutaLimpia}`
                  : "https://via.placeholder.com/600x400?text=San+Jose+Sede";

                const estado = obtenerEstadoSede(sede.horario);

                // Configuración de mensaje de WhatsApp
                const textoWhatsApp = encodeURIComponent(
                  `¡Hola! 👋 Vengo de la web y me gustaría obtener más información sobre los productos en la sede: ${sede.nombre_sede}.`,
                );
                const enlaceWhatsApp = `https://wa.me/${sede.telefono_vendedor}?text=${textoWhatsApp}`;

                return (
                  <div
                    key={sede.id}
                    className="bg-white rounded-[40px] overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col group hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
                  >
                    {/* Imagen Compacta (Aspect Ratio 16:9) */}
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={urlImagen}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        alt={sede.nombre_sede}
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/600x400?text=Imagen+No+Disponible";
                        }}
                      />
                      {/* Badge Dinámico */}
                      <div
                        className={`absolute bottom-4 right-6 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm backdrop-blur-md ${estado.color}`}
                      >
                        ● {estado.texto}
                      </div>
                    </div>

                    <div className="p-9 flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-5">
                        <h3 className="text-2xl font-black text-green-900 uppercase italic leading-none">
                          {sede.nombre_sede}
                        </h3>
                        <Store size={20} className="text-slate-200" />
                      </div>

                      <div className="space-y-4 mb-10">
                        <div className="flex items-start gap-4 text-slate-500">
                          <MapPin
                            className="text-yellow-500 shrink-0"
                            size={18}
                          />
                          <span className="text-[10px] font-bold uppercase tracking-wide leading-relaxed">
                            {sede.ubicacion}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-slate-500">
                          <Clock
                            className="text-yellow-500 shrink-0"
                            size={18}
                          />
                          <span className="text-[10px] font-bold uppercase tracking-wide">
                            {sede.horario}
                          </span>
                        </div>
                      </div>

                      {/* Botones de Acción */}
                      <div className="mt-auto grid grid-cols-2 gap-4">
                        <a
                          href={sede.google_maps_link}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-2 bg-slate-50 text-slate-600 py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100"
                        >
                          <Navigation size={14} /> Mapa
                        </a>
                        <a
                          href={enlaceWhatsApp}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-2 bg-green-900 text-white py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-yellow-500 hover:text-green-900 transition-all shadow-lg"
                        >
                          <MessageCircle size={14} /> WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};
