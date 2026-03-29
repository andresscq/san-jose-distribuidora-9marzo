import { useState, useEffect } from "react";
import api from "../api/axios";

export const SeccionPostulantes = () => {
  const [postulantes, setPostulantes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [idExpandido, setIdExpandido] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState("Todos");

  useEffect(() => {
    obtenerPostulantes();
  }, []);

  const obtenerPostulantes = async () => {
    try {
      const res = await api.get("/api/postulantes", {
        headers: { rol: "admin" },
      });
      setPostulantes(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error al obtener postulantes:", error);
    } finally {
      setCargando(false);
    }
  };

  const actualizarEstado = async (id, nuevoEstado) => {
    try {
      await api.put(
        `/api/postulantes/${id}/estado`,
        { estado: nuevoEstado },
        { headers: { rol: "admin" } },
      );
      obtenerPostulantes();
    } catch (error) {
      alert("Error al actualizar");
    }
  };

  const eliminarPostulante = async (id) => {
    if (window.confirm("¿Eliminar este registro permanentemente?")) {
      try {
        await api.delete(`/api/postulantes/${id}`, {
          headers: { rol: "admin" },
        });
        obtenerPostulantes();
      } catch (error) {
        alert("Error al eliminar");
      }
    }
  };

  const contactarWhatsApp = (nombre, telefono) => {
    if (!telefono) return alert("No hay teléfono registrado");
    let numLimpio = telefono.replace(/\D/g, "");
    if (numLimpio.startsWith("0")) numLimpio = numLimpio.substring(1);
    const mensaje = encodeURIComponent(
      `Hola ${nombre}, te saludamos de Distribuidora San José. 👋`,
    );
    window.open(`https://wa.me/593${numLimpio}?text=${mensaje}`, "_blank");
  };

  const filtrados = postulantes.filter((p) => {
    const coincideNombre = p.nombre
      ?.toLowerCase()
      .includes(busqueda.toLowerCase());
    const estadoCandidato = p.estado || "Pendiente";
    const coincideEstado =
      filtroEstado === "Todos" || estadoCandidato === filtroEstado;
    return coincideNombre && coincideEstado;
  });

  if (cargando)
    return (
      <div className="p-20 text-center font-black animate-pulse text-green-900 tracking-[0.2em]">
        SINCRONIZANDO TALENTO SAN JOSÉ...
      </div>
    );

  return (
    <div className="mt-5 animate-fadeIn max-w-[1400px] mx-auto px-4">
      {/* HEADER DINÁMICO */}
      <div className="flex flex-col lg:flex-row justify-between items-end mb-10 gap-6">
        <div>
          <h2 className="text-6xl font-black text-green-950 italic uppercase tracking-tighter leading-none">
            Panel <span className="text-yellow-500 underline">Talento</span>
          </h2>
          <p className="text-slate-400 font-bold text-[13px] mt-3 uppercase tracking-[0.4em]">
            Gestión de Postulaciones Externas
          </p>
        </div>
        <div className="relative w-full lg:w-96">
          <input
            type="text"
            placeholder="Filtrar por nombre..."
            className="w-full p-5 rounded-[25px] border-4 border-slate-100 focus:border-green-600 outline-none font-black uppercase text-[11px] shadow-2xl transition-all tracking-widest"
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* TABS DE FILTRADO */}
      <div className="flex flex-wrap gap-3 mb-12 bg-white/50 p-2 rounded-[30px] w-fit shadow-sm border border-slate-100">
        {["Todos", "Me interesa", "Pendiente", "Rechazado"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFiltroEstado(tab)}
            className={`px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.15em] transition-all ${
              filtroEstado === tab
                ? "bg-green-900 text-white shadow-xl scale-105"
                : "text-slate-400 hover:text-green-900 hover:bg-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* GRID DE POSTULANTES */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        {filtrados.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-[55px] shadow-2xl border border-slate-50 overflow-hidden flex flex-col hover:shadow-green-100/50 transition-all duration-500 relative group"
          >
            {/* FECHA FORMATEADA (SOLUCIÓN A LA "T") */}
            <div className="absolute top-10 right-12 text-right">
              <p className="text-[9px] font-black text-slate-300 uppercase italic tracking-widest mb-1">
                Registro
              </p>
              <p className="text-[13px] font-black text-green-800 bg-green-50 px-3 py-1 rounded-full">
                {p.fecha_postulacion
                  ? new Date(p.fecha_postulacion).toLocaleDateString("es-EC", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                  : "S/F"}
              </p>
            </div>

            <div className="p-10 flex-grow">
              <div className="flex justify-between items-start mb-10">
                <div className="flex gap-6">
                  <div className="h-20 w-20 bg-green-950 rounded-[28px] flex items-center justify-center text-white text-4xl font-black italic shadow-2xl group-hover:scale-110 transition-transform">
                    {p.nombre?.charAt(0).toUpperCase()}
                  </div>
                  <div className="max-w-[180px] md:max-w-xs">
                    <h4 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-tight mb-2 truncate">
                      {p.nombre}
                    </h4>
                    <span
                      className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${
                        (p.estado || "Pendiente") === "Me interesa"
                          ? "bg-yellow-400 border-yellow-500 text-green-950"
                          : (p.estado || "Pendiente") === "Rechazado"
                            ? "bg-red-50 border-red-100 text-red-500"
                            : "bg-slate-50 border-slate-200 text-slate-400"
                      }`}
                    >
                      • {p.estado || "Pendiente"}
                    </span>
                  </div>
                </div>
              </div>

              {/* INFO BOXES */}
              <div className="grid grid-cols-2 gap-5 mb-10">
                <div className="bg-slate-50/50 p-6 rounded-[35px] border border-slate-100">
                  <p className="text-[11px] font-black text-slate-400 uppercase italic mb-2 tracking-widest">
                    Perfil Académico
                  </p>
                  <p className="text-[14px] font-black text-slate-700 uppercase leading-none">
                    {p.edad} AÑOS <span className="text-green-600 mx-1">|</span>{" "}
                    {p.estudio || "S/I"}
                  </p>
                </div>
                <div className="bg-green-50/30 p-6 rounded-[35px] border border-green-100">
                  <p className="text-[11px] font-black text-slate-400 uppercase italic mb-2 tracking-widest">
                    Contacto
                  </p>
                  <p className="text-[14px] font-black text-green-800 tracking-widest leading-none">
                    {p.telefono || "Sin número"}
                  </p>
                </div>
              </div>

              {/* EXPERIENCIA SECTION */}
              <div className="mb-10">
                <div className="bg-white p-7 rounded-[40px] border-2 border-slate-50 shadow-inner italic text-slate-500 relative">
                  <p
                    className={`text-[15px] leading-relaxed ${idExpandido === p.id ? "" : "line-clamp-2"}`}
                  >
                    "
                    {p.experiencia ||
                      "Candidato no especificó detalles de trayectoria."}
                    "
                  </p>
                  {p.experiencia?.length > 80 && (
                    <button
                      onClick={() =>
                        setIdExpandido(idExpandido === p.id ? null : p.id)
                      }
                      className="mt-4 text-[11px] font-black text-green-900 underline uppercase tracking-tighter block"
                    >
                      {idExpandido === p.id ? "↑ VER MENOS" : "↓ VER MAS"}
                    </button>
                  )}
                </div>
              </div>

              {/* BOTONES DE ACCIÓN */}
              <div className="flex flex-wrap md:flex-nowrap gap-3">
                <button
                  onClick={() => actualizarEstado(p.id, "Me interesa")}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-green-950 text-[11px] font-black py-4 rounded-[20px] uppercase shadow-lg transition-all active:scale-95"
                >
                  ⭐ Seleccionar
                </button>
                <button
                  onClick={() => actualizarEstado(p.id, "Pendiente")}
                  className="flex-1 bg-slate-100 text-slate-400 hover:text-green-900 text-[11px] font-black py-4 rounded-[20px] uppercase transition-all"
                >
                  ⏳ En espera
                </button>
                <button
                  onClick={() => actualizarEstado(p.id, "Rechazado")}
                  className="flex-1 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white text-[11px] font-black py-4 rounded-[20px] uppercase transition-all"
                >
                  ❌ Rechazar
                </button>
                <button
                  onClick={() => eliminarPostulante(p.id)}
                  className="w-14 h-14 bg-slate-100 text-slate-300 hover:bg-red-600 hover:text-white rounded-[20px] transition-all flex items-center justify-center text-xl shadow-sm"
                >
                  🗑️
                </button>
              </div>
            </div>

            {/* BARRA DE CONTACTO INFERIOR */}
            <div className="bg-slate-950 p-7 flex flex-col sm:flex-row justify-between items-center gap-4 px-12">
              <button
                onClick={() => contactarWhatsApp(p.nombre, p.telefono)}
                className="w-full sm:w-auto bg-[#25D366] text-white text-[12px] font-black px-10 py-4 rounded-full hover:scale-105 transition-all shadow-xl tracking-widest flex items-center justify-center gap-2"
              >
                WHATSAPP DIRECTO
              </button>
              {p.hoja_de_vida_url && (
                <a
                  href={`http://localhost:3000/${p.hoja_de_vida_url.replace(/\\/g, "/")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-white border-b-2 border-yellow-500 px-2 py-1 text-[11px] font-black uppercase tracking-[0.2em] hover:text-yellow-400 transition-colors"
                >
                  ABRIR CURRÍCULUM PDF
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtrados.length === 0 && (
        <div className="text-center p-32 bg-slate-50 border-4 border-dashed border-slate-100 rounded-[60px] mt-10">
          <p className="text-slate-300 font-black text-2xl uppercase italic tracking-widest">
            No hay registros en esta sección
          </p>
        </div>
      )}
    </div>
  );
};
