import { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { AuthPostulante } from "../components/AuthPostulante";
import api from "../api/axios";

export const Trabajo = () => {
  // --- ESTADOS DE AUTENTICACIÓN ---
  const [estaLogueado, setEstaLogueado] = useState(false);
  const [cargandoAuth, setCargandoAuth] = useState(true);

  // --- TUS ESTADOS ORIGINALES ---
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    edad: "",
    estudio: "Bachiller",
    experiencia: "",
    archivoPdf: null,
  });

  // Función para sincronizar el nombre del storage al estado
  const sincronizarUsuario = () => {
    const usuario = localStorage.getItem("usuario_distribuidora");
    if (usuario) {
      const datosUser = JSON.parse(usuario);
      setEstaLogueado(true);
      setFormData((prev) => ({ ...prev, nombre: datosUser.nombre }));
    }
  };

  // Efecto para verificar sesión al cargar
  useEffect(() => {
    sincronizarUsuario();
    setCargandoAuth(false);
  }, []);

  // Esta función se ejecuta cuando AuthPostulante tiene éxito
  const handleEntradaExitosa = () => {
    sincronizarUsuario();
    setEstaLogueado(true);
  };

  // --- TUS FUNCIONES ORIGINALES ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTelefonoChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length === 1 && value !== "0") return;
    if (value.length === 2 && value !== "09") return;
    if (value.length <= 10) {
      setFormData({ ...formData, telefono: value });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== "application/pdf") {
      alert("Solo se permiten archivos PDF");
      return;
    }
    setFormData({ ...formData, archivoPdf: file });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.telefono.length !== 10) {
      alert("El teléfono debe tener 10 dígitos (09...)");
      return;
    }
    setCargando(true);

    const data = new FormData();
    data.append("nombre", formData.nombre);
    data.append("telefono", formData.telefono);
    data.append("edad", formData.edad);
    data.append("estudio", formData.estudio);
    data.append("experiencia", formData.experiencia);
    data.append("archivoPdf", formData.archivoPdf);

    try {
      await api.post("/api/postular", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setEnviado(true);
    } catch (error) {
      alert("Error al enviar postulación");
    } finally {
      setCargando(false);
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem("usuario_distribuidora");
    setEstaLogueado(false);
    setFormData({ ...formData, nombre: "" });
  };

  if (cargandoAuth) return null;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-28 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          {!estaLogueado ? (
            <div className="flex flex-col items-center">
              <div className="text-center mb-10">
                <h2 className="text-4xl font-black text-green-900 uppercase italic">
                  Inicia Sesión para{" "}
                  <span className="text-yellow-500">Postular</span>
                </h2>
                <p className="text-slate-400 font-bold mt-2 uppercase text-xs tracking-widest">
                  Solo usuarios registrados pueden enviar su CV
                </p>
              </div>
              <AuthPostulante alEntrar={handleEntradaExitosa} />
            </div>
          ) : (
            <>
              <div className="text-center mb-16 relative">
                <button
                  onClick={cerrarSesion}
                  className="absolute right-0 top-0 bg-red-50 text-red-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase border border-red-100 hover:bg-red-500 hover:text-white transition-all"
                >
                  Cerrar Sesión
                </button>
                <h2 className="text-6xl font-black text-green-900 uppercase italic tracking-tighter">
                  Trabaja con <span className="text-yellow-500">Nosotros</span>
                </h2>
                <div className="h-1 w-24 bg-yellow-400 mx-auto mt-4 rounded-full"></div>
                <p className="text-slate-500 font-bold mt-6 uppercase tracking-[0.2em] text-sm">
                  Bienvenido,{" "}
                  <span className="text-green-700 font-black">
                    {formData.nombre}
                  </span>
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-12 bg-white p-8 md:p-14 rounded-[50px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-50">
                {/* --- INFORMACIÓN IZQUIERDA (TODO TU CONTENIDO ORIGINAL) --- */}
                <div className="space-y-8">
                  <div className="bg-green-900 text-white p-10 rounded-[40px] relative overflow-hidden shadow-xl">
                    <h3 className="text-3xl font-black mb-6 italic text-yellow-400">
                      ¿Qué buscamos?
                    </h3>
                    <p className="text-green-100 mb-8 leading-relaxed font-medium">
                      Personas comprometidas con la excelencia y el trabajo en
                      equipo para nuestra distribuidora.
                    </p>
                    <div className="space-y-4">
                      {[
                        "Crecimiento real",
                        "Sueldo competitivo",
                        "Ambiente profesional",
                      ].map((item) => (
                        <div key={item} className="flex items-center gap-3">
                          <div className="bg-yellow-400 rounded-full p-1 text-green-900 font-bold">
                            ✓
                          </div>
                          <span className="text-sm font-black uppercase tracking-widest">
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-8 bg-yellow-50 rounded-[40px] border-2 border-dashed border-yellow-200">
                    <h4 className="font-black text-green-900 text-sm uppercase mb-3 italic">
                      Instrucciones:
                    </h4>
                    <p className="text-green-800 text-xs leading-relaxed font-semibold">
                      Completa todos los campos y adjunta tu Hoja de Vida en
                      PDF. <br />
                      <span className="text-red-600">
                        Celular debe empezar con 09.
                      </span>
                    </p>
                  </div>
                </div>

                {/* --- FORMULARIO DERECHA (TUS INPUTS ORIGINALES) --- */}
                {enviado ? (
                  <div className="flex flex-col items-center justify-center text-center space-y-6 py-10">
                    <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-5xl shadow-inner">
                      ✓
                    </div>
                    <h3 className="text-3xl font-black text-green-900 italic uppercase">
                      ¡Postulación Enviada!
                    </h3>
                    <p className="text-slate-500 font-medium px-4">
                      Hemos recibido tu información con éxito.
                    </p>
                    <button
                      onClick={() => setEnviado(false)}
                      className="text-green-700 font-black uppercase text-[10px] tracking-widest border-b-2 border-yellow-400 pb-1"
                    >
                      Enviar otra respuesta
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block tracking-widest">
                        Nombre Completo
                      </label>
                      <input
                        required
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        type="text"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:border-yellow-400 outline-none font-bold text-slate-700 shadow-inner"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block tracking-widest">
                        WhatsApp (Ecuador)
                      </label>
                      <input
                        required
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleTelefonoChange}
                        type="text"
                        placeholder="Ej: 0987654321"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:border-yellow-400 outline-none font-bold text-slate-700 shadow-inner"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block tracking-widest">
                          Edad
                        </label>
                        <input
                          required
                          name="edad"
                          value={formData.edad}
                          onChange={handleChange}
                          type="number"
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:border-yellow-400 outline-none font-bold text-slate-700 shadow-inner"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block tracking-widest">
                          Estudios
                        </label>
                        <select
                          name="estudio"
                          value={formData.estudio}
                          onChange={handleChange}
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:border-yellow-400 outline-none font-bold text-slate-700 appearance-none shadow-inner"
                        >
                          <option value="Bachiller">Bachiller</option>
                          <option value="Universitario">Universitario</option>
                          <option value="Tecnólogo">Tecnólogo</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block tracking-widest">
                        Experiencia Laboral
                      </label>
                      <textarea
                        name="experiencia"
                        value={formData.experiencia}
                        onChange={handleChange}
                        rows="3"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:border-yellow-400 outline-none font-bold text-slate-700 resize-none shadow-inner"
                      ></textarea>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block tracking-widest">
                        Hoja de Vida (SÓLO PDF)
                      </label>
                      <input
                        required
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="w-full text-[10px] font-bold text-slate-400 file:mr-4 file:py-4 file:px-8 file:rounded-2xl file:border-0 file:bg-green-800 file:text-white hover:file:bg-yellow-400 transition-all cursor-pointer shadow-sm"
                      />
                    </div>

                    <button
                      disabled={cargando}
                      type="submit"
                      className={`w-full ${cargando ? "bg-slate-300" : "bg-yellow-400 hover:bg-green-800 hover:text-white"} text-green-900 font-black py-5 rounded-2xl uppercase text-[11px] tracking-[0.3em] shadow-xl transition-all active:scale-95`}
                    >
                      {cargando ? "Enviando perfil..." : "Enviar mi perfil"}
                    </button>
                  </form>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};
