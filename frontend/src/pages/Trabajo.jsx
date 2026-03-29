import { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { AuthPostulante } from "../components/AuthPostulante";
import api from "../api/axios";

export const Trabajo = () => {
  const [estaLogueado, setEstaLogueado] = useState(false);
  const [cargandoAuth, setCargandoAuth] = useState(true);
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

  const sincronizarUsuario = () => {
    const usuarioStr = localStorage.getItem("usuario_distribuidora");
    if (usuarioStr) {
      const datosUser = JSON.parse(usuarioStr);
      if (datosUser.rol === "proveedor") {
        cerrarSesion();
      } else {
        setEstaLogueado(true);
        // Mantenemos el nombre del login pero NO sobreescribimos si el usuario ya escribió algo
        setFormData((prev) => ({
          ...prev,
          nombre: prev.nombre || datosUser.nombre,
        }));
      }
    }
  };

  useEffect(() => {
    sincronizarUsuario();
    setCargandoAuth(false);
  }, []);

  // --- VALIDACIONES DE INPUT (RECUPERADAS) ---
  const handleTelefonoChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Solo números

    // Regla: No permitir que el primer dígito sea distinto de 0
    if (value.length === 1 && value !== "0") return;
    // Regla: No permitir que el segundo dígito sea distinto de 9
    if (value.length === 2 && value !== "09") return;

    if (value.length <= 10) {
      setFormData({ ...formData, telefono: value });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== "application/pdf") {
      alert("Solo se permiten archivos PDF");
      e.target.value = "";
      return;
    }
    setFormData({ ...formData, archivoPdf: file });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const usuario = JSON.parse(localStorage.getItem("usuario_distribuidora"));

    // Validaciones finales antes de enviar
    if (formData.telefono.length !== 10)
      return alert("El teléfono debe tener 10 dígitos (09...)");
    if (!formData.archivoPdf) return alert("Por favor adjunta tu CV en PDF");

    setCargando(true);
    const data = new FormData();
    data.append("usuario_id", usuario.id);
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
      alert(error.response?.data?.error || "Error al enviar");
    } finally {
      setCargando(false);
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem("usuario_distribuidora");
    setEstaLogueado(false);
    setFormData({
      nombre: "",
      telefono: "",
      edad: "",
      estudio: "Bachiller",
      experiencia: "",
      archivoPdf: null,
    });
  };

  if (cargandoAuth) return null;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-28 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          {!estaLogueado ? (
            <div className="flex flex-col items-center">
              <h2 className="text-5xl font-black text-green-900 uppercase italic mb-10 text-center">
                Inicia Sesión para{" "}
                <span className="text-yellow-500">Postular</span>
              </h2>
              <AuthPostulante alEntrar={sincronizarUsuario} />
            </div>
          ) : (
            <>
              <div className="text-center mb-16 relative">
                <button
                  onClick={cerrarSesion}
                  className="absolute right-0 top-0 bg-red-50 text-red-500 px-4 py-2 rounded-xl text-[11px] font-black uppercase border border-red-100 hover:bg-red-500 hover:text-white transition-all"
                >
                  Cerrar Sesión
                </button>
                <h2 className="text-6xl font-black text-green-900 uppercase italic">
                  Trabaja con <span className="text-yellow-500">Nosotros</span>
                </h2>
                <p className="text-slate-500 font-bold mt-6 uppercase tracking-[0.2em]">
                  Bienvenido,{" "}
                  <span className="text-green-700">{formData.nombre}</span>
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-12 bg-white p-8 md:p-14 rounded-[50px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-50">
                {/* INFO IZQUIERDA */}
                <div className="space-y-8">
                  <div className="bg-green-900 text-white p-10 rounded-[40px] shadow-xl">
                    <h3 className="text-3xl font-black mb-6 italic text-yellow-400">
                      ¿Qué buscamos?
                    </h3>
                    <p className="text-green-100 mb-8 leading-relaxed font-medium">
                      Buscamos personas comprometidas para nuestra
                      distribuidora.
                    </p>
                    <div className="space-y-4">
                      {[
                        "Crecimiento real",
                        "Sueldo competitivo",
                        "Ambiente profesional",
                      ].map((item) => (
                        <div key={item} className="flex items-center gap-3">
                          <div className="bg-yellow-400 rounded-full p-1 text-green-900 text-[10px]">
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
                    <h4 className="font-black text-green-900 text-[19px] uppercase mb-3 italic">
                      Instrucciones:
                    </h4>
                    <p className="text-green-800 font-semibold italic text-sm">
                      Completa los campos.{" "}
                      <span className="text-red-600">
                        El número debe empezar con 09 y tener 10 dígitos.
                      </span>
                    </p>
                  </div>
                </div>

                {/* FORMULARIO DERECHA */}
                {enviado ? (
                  <div className="flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-5xl">
                      ✓
                    </div>
                    <h3 className="text-3xl font-black text-green-900 italic uppercase">
                      ¡Recibido!
                    </h3>
                    <button
                      onClick={() => setEnviado(false)}
                      className="text-green-700 font-black uppercase text-[10px] border-b-2 border-yellow-400 pb-1"
                    >
                      Enviar otra respuesta
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="text-[12px] font-black uppercase text-slate-400 ml-2 mb-2 block tracking-widest italic">
                        WhatsApp (Ecuador)
                      </label>
                      <input
                        required
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleTelefonoChange}
                        type="text"
                        placeholder="0987654321"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:border-yellow-400 outline-none font-bold text-slate-700 shadow-inner"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        required
                        name="edad"
                        value={formData.edad}
                        onChange={handleChange}
                        type="number"
                        placeholder="Edad"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:border-yellow-400 outline-none font-bold"
                      />
                      <select
                        name="estudio"
                        value={formData.estudio}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:border-yellow-400 outline-none font-bold appearance-none"
                      >
                        <option value="Bachiller">Bachiller</option>
                        <option value="Universitario">Universitario</option>
                        <option value="Tecnólogo">Tecnólogo</option>
                      </select>
                    </div>
                    <textarea
                      required
                      name="experiencia"
                      value={formData.experiencia}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Experiencia..."
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:border-yellow-400 outline-none font-bold resize-none"
                    ></textarea>
                    <div>
                      <label className="text-[12px] font-black uppercase text-slate-400 ml-2 mb-2 block italic">
                        Hoja de Vida (PDF)
                      </label>
                      <input
                        required
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="w-full text-[12px] font-bold text-slate-400 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:bg-green-800 file:text-white cursor-pointer"
                      />
                    </div>
                    <button
                      disabled={cargando}
                      type="submit"
                      className={`w-full ${cargando ? "bg-slate-300" : "bg-yellow-400 hover:bg-green-800 hover:text-white"} text-green-900 font-black py-5 rounded-2xl uppercase text-[12px] tracking-[0.3em] shadow-xl transition-all`}
                    >
                      {cargando ? "Enviando..." : "Enviar mi perfil"}
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
