import React, { useState, useEffect } from "react";
import api from "../api/axios";
import {
  Users,
  Search,
  Trash2,
  Edit2,
  Phone,
  Plus,
  CheckCircle,
  XCircle,
  User,
  MessageCircle,
  X,
  Clock,
  Save,
  ShieldCheck,
  LayoutGrid,
  Settings,
  ArrowRight,
} from "lucide-react";

export const GestionEmpleados = () => {
  const [empleados, setEmpleados] = useState([]);
  const [filtro, setFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [editando, setEditando] = useState(null);
  const [nuevoEmpleado, setNuevoEmpleado] = useState({
    nombre: "",
    telefono: "",
    activo: true,
  });

  const [config, setConfig] = useState({
    hora_apertura: "07:00",
    hora_cierre: "19:00",
    whatsapp_central: "",
  });
  const [cargandoConfig, setCargandoConfig] = useState(false);

  const cargarDatos = async () => {
    try {
      const [resEmp, resConf] = await Promise.all([
        api.get("/api/empleados"),
        api.get("/api/empleados/configuracion"),
      ]);

      setEmpleados(Array.isArray(resEmp.data) ? resEmp.data : []);
      if (resConf.data) {
        setConfig(resConf.data);
      }
    } catch (err) {
      console.error("Error al cargar datos:", err);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const guardarConfiguracion = async () => {
    setCargandoConfig(true);
    try {
      await api.put("/api/empleados/config/update", config);
      alert("✅ Configuración de sistema actualizada con éxito");
    } catch (err) {
      alert("Error al actualizar la configuración");
    } finally {
      setCargandoConfig(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = editando ? editando : nuevoEmpleado;
      if (editando) {
        await api.put(`/api/empleados/${editando.id}`, payload);
      } else {
        await api.post("/api/empleados", payload);
      }
      setEditando(null);
      setNuevoEmpleado({ nombre: "", telefono: "", activo: true });
      cargarDatos();
    } catch (err) {
      alert("Error al procesar la solicitud");
    }
  };

  const togglEstado = async (emp) => {
    try {
      await api.put(`/api/empleados/${emp.id}`, {
        ...emp,
        activo: !emp.activo,
      });
      cargarDatos();
    } catch (err) {
      alert("No se pudo cambiar el estado");
    }
  };

  const eliminarEmpleado = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de eliminar a ${nombre}?`)) {
      try {
        await api.delete(`/api/empleados/${id}`);
        cargarDatos();
      } catch (err) {
        alert("Error al eliminar");
      }
    }
  };

  const empleadosFiltrados = empleados.filter((emp) => {
    const n = (emp.nombre || "").toLowerCase();
    const t = emp.telefono || "";
    const coincideBusqueda =
      n.includes(busqueda.toLowerCase()) || t.includes(busqueda);
    const coincideFiltro =
      filtro === "todos"
        ? true
        : filtro === "activos"
          ? emp.activo
          : !emp.activo;
    return coincideBusqueda && coincideFiltro;
  });

  return (
    // CAMBIO DE FONDO: De azul oscuro a un degradado gris/blanco sutil
    <div className="p-4 md:p-10 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 min-h-screen font-sans text-slate-800">
      <div className="max-w-7xl mx-auto">
        {/* HEADER: Estilo minimalista con sombra suave */}
        <header className="mb-10 flex flex-col lg:flex-row justify-between items-center gap-6 bg-white p-6 md:p-8 rounded-[35px] shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-green-900 rounded-3xl shadow-lg shadow-green-100 rotate-3">
              <LayoutGrid className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                Gestión <span className="text-yellow-500 italic">Asesores</span>
              </h1>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-1">
                Distribuidora San José • Administración
              </p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4 bg-slate-50 p-3 rounded-[30px] border border-slate-100">
            <div className="flex items-center gap-3 px-4">
              <Clock className="text-slate-400" size={19} />
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  className="bg-white border border-slate-200 rounded-xl p-2 text-xs font-black text-slate-700 outline-none focus:ring-2 ring-green-500/20"
                  value={config.hora_apertura.slice(0, 5)}
                  onChange={(e) =>
                    setConfig({ ...config, hora_apertura: e.target.value })
                  }
                />
                <ArrowRight size={14} className="text-green-900" />
                <input
                  type="time"
                  className="bg-white border border-slate-200 rounded-xl p-2 text-xs font-black text-slate-700 outline-none focus:ring-2 ring-green-500/20"
                  value={config.hora_cierre.slice(0, 5)}
                  onChange={(e) =>
                    setConfig({ ...config, hora_cierre: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="h-6 w-[1px] bg-slate-200 hidden sm:block"></div>

            <div className="flex items-center gap-3 px-2">
              <ShieldCheck className="text-green-600" size={20} />
              <input
                type="text"
                placeholder="WhatsApp Central"
                className="bg-white border border-slate-200 rounded-xl p-2 text-xs font-black text-slate-700 w-36 outline-none focus:ring-2 ring-green-500/20"
                value={config.whatsapp_central}
                onChange={(e) =>
                  setConfig({ ...config, whatsapp_central: e.target.value })
                }
              />
            </div>

            <button
              onClick={guardarConfiguracion}
              disabled={cargandoConfig}
              className="bg-slate-900 hover:bg-black text-white p-3 rounded-2xl transition-all active:scale-95 shadow-lg shadow-slate-200"
            >
              <Save
                size={20}
                className={cargandoConfig ? "animate-spin" : ""}
              />
            </button>
          </div>
        </header>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* COLUMNA IZQUIERDA: FORMULARIO ESTILO TARJETA BLANCA */}
          <aside className="lg:col-span-4">
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 sticky top-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center">
                  <Plus className="text-green-600" size={24} />
                </div>
                <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">
                  {editando ? "Editar Datos" : "Nuevo Registro"}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Nombre del Asesor
                  </label>
                  <div className="relative">
                    <User
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                      size={18}
                    />
                    <input
                      className="w-full bg-slate-50 border border-slate-100 p-4 pl-12 rounded-2xl font-bold text-slate-700 outline-none focus:border-green-500/50 focus:bg-white transition-all text-sm uppercase"
                      placeholder="Ej: Andres Pérez"
                      value={editando ? editando.nombre : nuevoEmpleado.nombre}
                      onChange={(e) =>
                        editando
                          ? setEditando({ ...editando, nombre: e.target.value })
                          : setNuevoEmpleado({
                              ...nuevoEmpleado,
                              nombre: e.target.value,
                            })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Número de Contacto
                  </label>
                  <div className="relative">
                    <Phone
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                      size={18}
                    />
                    <input
                      className="w-full bg-slate-50 border border-slate-100 p-4 pl-12 rounded-2xl font-bold text-slate-700 outline-none focus:border-green-500/50 focus:bg-white transition-all text-sm"
                      placeholder="593..."
                      value={
                        editando ? editando.telefono : nuevoEmpleado.telefono
                      }
                      onChange={(e) =>
                        editando
                          ? setEditando({
                              ...editando,
                              telefono: e.target.value,
                            })
                          : setNuevoEmpleado({
                              ...nuevoEmpleado,
                              telefono: e.target.value,
                            })
                      }
                      required
                    />
                  </div>
                </div>

                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-5 rounded-[22px] font-black uppercase text-[11px] tracking-[0.2em] transition-all shadow-xl shadow-green-100 active:scale-95 flex items-center justify-center gap-2 mt-4">
                  {editando ? <Save size={18} /> : <Plus size={18} />}
                  {editando ? "Guardar Cambios" : "Confirmar Registro"}
                </button>

                {editando && (
                  <button
                    type="button"
                    onClick={() => setEditando(null)}
                    className="w-full text-slate-400 py-2 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:text-red-500 transition-all"
                  >
                    Cancelar Edición
                  </button>
                )}
              </form>
            </div>
          </aside>

          {/* COLUMNA DERECHA: LISTADO DE ASESORES */}
          <main className="lg:col-span-8">
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="BUSCAR EN EL EQUIPO..."
                  className="w-full bg-white border border-slate-100 p-5 pl-14 rounded-[25px] outline-none font-bold text-slate-700 text-sm shadow-sm focus:border-green-500/30 transition-all"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>

              <div className="flex bg-white p-1.5 rounded-[22px] border border-slate-100 shadow-sm">
                {["todos", "activos", "inactivos"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setFiltro(t)}
                    className={`px-6 py-3 rounded-[18px] text-[10px] font-black uppercase transition-all ${
                      filtro === t
                        ? "bg-slate-900 text-white shadow-md"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {empleadosFiltrados.map((emp) => (
                <div
                  key={emp.id}
                  className="group bg-white rounded-[40px] p-7 border border-slate-50 hover:border-green-100 shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all duration-500 relative overflow-hidden"
                >
                  <div className="flex justify-between items-start relative z-10">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black italic shadow-inner ${
                        emp.activo
                          ? "bg-green-50 text-green-600"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {emp.nombre.charAt(0)}
                    </div>
                    <button
                      onClick={() => togglEstado(emp)}
                      className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-wider transition-all border ${
                        emp.activo
                          ? "bg-green-50 border-green-200 text-green-600"
                          : "bg-red-50 border-red-100 text-red-400"
                      }`}
                    >
                      {emp.activo ? "Activo Ahora" : "Inactivo"}
                    </button>
                  </div>

                  <div className="mt-6 relative z-10">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter group-hover:text-green-600 transition-colors truncate">
                      {emp.nombre}
                    </h3>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-green-50 transition-colors">
                        <MessageCircle size={16} className="text-green-600" />
                      </div>
                      <span className="text-[15px] font-bold text-slate-500 italic tracking-tight">
                        {emp.telefono}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-8 pt-6 border-t border-slate-50 relative z-10">
                    <button
                      onClick={() => {
                        setEditando(emp);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="flex-1 bg-slate-50 hover:bg-slate-900 hover:text-white py-4 rounded-2xl flex items-center justify-center transition-all text-slate-400 font-bold text-xs uppercase gap-2"
                    >
                      <Edit2 size={16} /> Editar
                    </button>
                    <button
                      onClick={() => eliminarEmpleado(emp.id, emp.nombre)}
                      className="w-14 bg-slate-50 hover:bg-red-50 py-4 rounded-2xl flex items-center justify-center transition-all text-slate-300 hover:text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {empleadosFiltrados.length === 0 && (
              <div className="text-center py-24 bg-white/50 rounded-[40px] border-2 border-dashed border-slate-200">
                <Users className="mx-auto text-slate-200 mb-4" size={48} />
                <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">
                  No se encontraron resultados
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
