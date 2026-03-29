import { useState } from "react";
import api from "../api/axios";

const IconoOjo = ({ abierto }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={3}
    stroke="currentColor"
    className="w-5 h-5"
  >
    {abierto ? (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    ) : (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21"
      />
    )}
  </svg>
);

export const AuthProveedor = ({ alEntrar }) => {
  const [esRegistro, setEsRegistro] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");
  const [datos, setDatos] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmarPassword: "",
  });
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [verPass, setVerPass] = useState(false);
  const [verConfirm, setVerConfirm] = useState(false);

  const calcularProgreso = () => {
    const largo = datos.password.length;
    if (largo === 0) return 0;
    return Math.min((largo / 9) * 100, 100);
  };

  const handleChange = (e) =>
    setDatos({ ...datos, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensajeExito("");

    const emailLimpio = datos.email.trim().toLowerCase();
    const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!regexEmail.test(emailLimpio)) {
      return setError("Correo corporativo inválido");
    }

    if (esRegistro) {
      if (!datos.nombre.trim())
        return setError("El nombre de la empresa es obligatorio");
      if (datos.password.length < 9) return setError("Mínimo 9 caracteres");
      if (datos.password !== datos.confirmarPassword) {
        return setError("Las contraseñas no coinciden");
      }
    }

    setCargando(true);
    try {
      const payload = {
        email: emailLimpio,
        password: datos.password,
        rol: "proveedor",
      };
      if (esRegistro) payload.nombre = datos.nombre.trim();

      const res = await api.post(
        esRegistro ? "/api/registro" : "/api/login",
        payload,
      );

      if (esRegistro) {
        // --- FLUJO DE REGISTRO EXITOSO ---
        setMensajeExito(
          "¡Cuenta corporativa creada! Ya puedes iniciar sesión.",
        );
        setEsRegistro(false); // Cambia a vista de Login
        setDatos({
          nombre: "",
          email: emailLimpio,
          password: "",
          confirmarPassword: "",
        });
      } else {
        // --- FLUJO DE LOGIN EXITOSO ---
        localStorage.setItem("usuario_distribuidora", JSON.stringify(res.data));
        alEntrar();
      }
    } catch (err) {
      setError(err.response?.data?.error || "Error de acceso");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-md w-full relative mx-auto">
      <div className="absolute inset-0 bg-gradient-to-br from-green-900 to-green-600 rounded-[60px] transform rotate-2 blur-sm opacity-10"></div>

      <div className="relative bg-white p-10 md:p-12 rounded-[55px] shadow-[0_30px_80px_rgba(0,0,0,0.15)] border-t-[10px] border-green-600">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-black text-green-900 uppercase italic tracking-tighter leading-none">
            Portal de <br />
            <span className="text-yellow-500 text-5xl">Proveedores</span>
          </h2>
        </div>

        {error && (
          <div className="bg-red-600 text-white p-4 rounded-2xl mb-6 text-[11px] font-black uppercase text-center italic animate-bounce">
            ⚠️ {error}
          </div>
        )}

        {mensajeExito && (
          <div className="bg-green-100 text-green-700 border-2 border-green-200 p-4 rounded-2xl mb-6 text-[11px] font-black uppercase text-center italic animate-fade-in">
            ✅ {mensajeExito}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {esRegistro && (
            <div>
              <label className="text-[12px] font-black text-green-900 uppercase tracking-widest ml-4 mb-2 block italic">
                Nombre de la Empresa
              </label>
              <input
                required
                name="nombre"
                type="text"
                value={datos.nombre}
                placeholder="Distribuidora X"
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-[25px] px-7 py-4 outline-none font-bold text-slate-800 focus:border-green-600 transition-all shadow-inner"
                onChange={handleChange}
              />
            </div>
          )}

          <div>
            <label className="text-[12px] font-black text-green-900 uppercase tracking-widest ml-4 mb-2 block italic">
              Correo Corporativo
            </label>
            <input
              required
              name="email"
              type="email"
              value={datos.email}
              placeholder="contacto@empresa.com"
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-[25px] px-7 py-4 outline-none font-bold text-slate-800 focus:border-green-600 transition-all shadow-inner"
              onChange={handleChange}
            />
          </div>

          <div className="space-y-5">
            <div className="relative">
              <label className="text-[12px] font-black text-green-900 uppercase tracking-widest ml-4 mb-2 block italic">
                Contraseña
              </label>
              <div className="relative">
                <input
                  required
                  name="password"
                  type={verPass ? "text" : "password"}
                  value={datos.password}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-[25px] px-7 py-5 outline-none font-bold text-slate-800 focus:border-green-600 transition-all shadow-inner pr-16"
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setVerPass(!verPass)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-green-900"
                >
                  <IconoOjo abierto={verPass} />
                </button>
              </div>

              {esRegistro && (
                <div className="mt-4 px-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[12px] font-black text-slate-400 uppercase italic">
                      Seguridad
                    </span>
                    <span
                      className={`text-[12px] font-black uppercase italic ${datos.password.length >= 9 ? "text-green-600" : "text-red-500"}`}
                    >
                      {datos.password.length}/9 Caracteres
                    </span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200 shadow-inner">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${calcularProgreso() === 100 ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-red-500"}`}
                      style={{ width: `${calcularProgreso()}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {esRegistro && (
              <div className="relative">
                <label className="text-[12px] font-black text-green-900 uppercase tracking-widest ml-4 mb-2 block italic text-right mr-4">
                  Verificar Contraseña
                </label>
                <div className="relative">
                  <input
                    required
                    name="confirmarPassword"
                    type={verConfirm ? "text" : "password"}
                    value={datos.confirmarPassword}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-[25px] px-7 py-5 outline-none font-bold text-slate-800 focus:border-green-600 transition-all shadow-inner pr-16"
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setVerConfirm(!verConfirm)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-green-900"
                  >
                    <IconoOjo abierto={verConfirm} />
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            disabled={cargando}
            type="submit"
            className="w-full bg-green-900 text-white font-black py-6 rounded-[25px] uppercase text-[12px] tracking-[0.4em] shadow-lg hover:bg-yellow-400 hover:text-green-950 transition-all active:scale-95 disabled:bg-slate-300 mt-6 italic"
          >
            {cargando
              ? "Validando..."
              : esRegistro
                ? "Registrar Empresa"
                : "Entrar Ahora"}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t-2 border-dashed border-slate-100 text-center">
          <button
            type="button"
            onClick={() => {
              setEsRegistro(!esRegistro);
              setError("");
              setMensajeExito("");
            }}
            className="text-[12px] font-black uppercase text-green-900 hover:text-yellow-600 transition-all italic"
          >
            {esRegistro
              ? "¿Ya eres proveedor? Inicia Sesión"
              : "¿Quieres vender con nosotros? Regístrate"}
            <div className="h-1 w-12 bg-yellow-400 mx-auto mt-1 rounded-full"></div>
          </button>
        </div>
      </div>
    </div>
  );
};
