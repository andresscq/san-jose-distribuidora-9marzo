import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { SeccionPostulantes } from "../components/SeccionPostulantes";
import { SeccionProveedores } from "../components/SeccionProveedores";
import AdminProductos from "../components/AdminProductos";
import { AdminSedes } from "../components/AdminSedes"; // ✅ Importación correcta

export const Admin = () => {
  const [pestana, setPestana] = useState("productos");

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="pt-28 pb-20 px-6 max-w-7xl mx-auto">
        {/* ENCABEZADO */}
        <div className="mb-10 animate-fadeIn">
          <h2 className="text-5xl font-black text-green-900 uppercase italic tracking-tighter leading-none">
            Panel de <span className="text-yellow-500">Administración</span>
          </h2>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-3 ml-1">
            Distribuidora San José • Gestión de Contenido Corporativo
          </p>
        </div>

        {/* NAVEGADOR DE SECCIONES (TABS) */}
        <div className="flex flex-wrap gap-3 mb-12 bg-white p-2 rounded-[30px] shadow-sm inline-flex border border-slate-100">
          <button
            onClick={() => setPestana("productos")}
            className={`px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all duration-300 ${
              pestana === "productos"
                ? "bg-green-900 text-white shadow-xl scale-105"
                : "text-slate-400 hover:bg-slate-50 hover:text-green-900"
            }`}
          >
            📦 Inventario
          </button>

          <button
            onClick={() => setPestana("sedes")}
            className={`px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all duration-300 ${
              pestana === "sedes"
                ? "bg-green-900 text-white shadow-xl scale-105"
                : "text-slate-400 hover:bg-slate-50 hover:text-green-900"
            }`}
          >
            📍 Sedes / Locales
          </button>

          <button
            onClick={() => setPestana("postulantes")}
            className={`px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all duration-300 ${
              pestana === "postulantes"
                ? "bg-green-900 text-white shadow-xl scale-105"
                : "text-slate-400 hover:bg-slate-50 hover:text-green-900"
            }`}
          >
            👥 RRHH / Candidatos
          </button>

          <button
            onClick={() => setPestana("proveedores")}
            className={`px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all duration-300 ${
              pestana === "proveedores"
                ? "bg-green-900 text-white shadow-xl scale-105"
                : "text-slate-400 hover:bg-slate-50 hover:text-green-900"
            }`}
          >
            🚚 Proveedores
          </button>
        </div>

        {/* ÁREA DE CONTENIDO DINÁMICO */}
        <div className="transition-all duration-500 min-h-[400px]">
          {/* 1. PRODUCTOS */}
          {pestana === "productos" && (
            <div className="animate-fadeIn">
              <AdminProductos />
            </div>
          )}

          {/* 2. SEDES (Panel de Gestión) */}
          {pestana === "sedes" && (
            <div className="animate-fadeIn">
              <AdminSedes />
            </div>
          )}

          {/* 3. POSTULANTES */}
          {pestana === "postulantes" && (
            <div className="animate-fadeIn">
              <SeccionPostulantes />
            </div>
          )}

          {/* 4. PROVEEDORES */}
          {pestana === "proveedores" && (
            <div className="animate-fadeIn">
              <SeccionProveedores />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
