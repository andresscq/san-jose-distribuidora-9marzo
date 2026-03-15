import React, { useState, useEffect } from "react";
import api from "../api/axios";

export const AdminSedes = () => {
  const [sedes, setSedes] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const [formData, setFormData] = useState({
    nombre_sede: "",
    ubicacion: "",
    horario: "08:00 - 19:00",
    telefono_vendedor: "",
    google_maps_link: "",
    imagen: null,
  });

  const cargarSedes = async () => {
    try {
      const res = await api.get("/api/sedes");
      setSedes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error al cargar sedes", err);
    }
  };

  useEffect(() => {
    cargarSedes();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, imagen: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Creamos el contenedor para archivos
    const data = new FormData();

    // 2. Agregamos los textos uno por uno (Ojo: que los nombres coincidan con el backend)
    data.append("nombre_sede", formData.nombre_sede);
    data.append("ubicacion", formData.ubicacion);
    data.append("horario", formData.horario);
    data.append("telefono_vendedor", formData.telefono_vendedor);
    data.append("google_maps_link", formData.google_maps_link);

    // 3. Agregamos el archivo (Debe llamarse "imagen" como en el backend)
    if (formData.imagen) {
      data.append("imagen", formData.imagen);
      console.log("Archivo listo para enviar:", formData.imagen.name);
    } else {
      console.warn("No se ha seleccionado ninguna imagen");
    }

    try {
      // 4. Enviamos con el header correcto
      const config = {
        headers: { "Content-Type": "multipart/form-data" },
      };

      if (editandoId) {
        await api.put(`/api/sedes/${editandoId}`, data, config);
      } else {
        await api.post("/api/sedes", data, config);
      }

      cerrarModal();
      cargarSedes();
    } catch (error) {
      console.error("Error al enviar:", error.response?.data || error.message);
      alert("Error al procesar la sede");
    }
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setEditandoId(null);
    setPreviewImage(null);
    setFormData({
      nombre_sede: "",
      ubicacion: "",
      horario: "08:00 - 19:00",
      telefono_vendedor: "",
      google_maps_link: "",
      imagen: null,
    });
  };

  const prepararEdicion = (sede) => {
    setEditandoId(sede.id);
    setFormData({ ...sede, imagen: null });
    setPreviewImage(
      sede.imagen_url ? `http://localhost:3000${sede.imagen_url}` : null,
    );
    setModalAbierto(true);
  };

  const eliminarSede = async (id) => {
    if (window.confirm("¿Eliminar esta sede definitivamente?")) {
      try {
        await api.delete(`/api/sedes/${id}`);
        cargarSedes();
      } catch (error) {
        alert("Error al eliminar");
      }
    }
  };

  return (
    <div className="p-8 bg-white rounded-[40px] shadow-sm border border-slate-100 animate-fadeIn">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black text-green-900 uppercase italic">
            Gestión de Sedes
          </h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
            Panel de control de locales corporativos
          </p>
        </div>
        <button
          onClick={() => setModalAbierto(true)}
          className="bg-green-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase hover:bg-yellow-500 hover:text-green-900 transition-all shadow-lg shadow-green-100"
        >
          + Nueva Sede
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sedes.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between p-5 bg-slate-50 rounded-[30px] border border-slate-100 group"
          >
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-200 border-2 border-white shadow-sm">
                <img
                  src={
                    s.imagen_url
                      ? `http://localhost:3000${s.imagen_url}`
                      : "https://via.placeholder.com/150"
                  }
                  className="w-full h-full object-cover"
                  alt="sede"
                />
              </div>
              <div>
                <h4 className="font-black text-green-900 uppercase text-sm">
                  {s.nombre_sede}
                </h4>
                <p className="text-slate-400 text-[9px] font-bold uppercase">
                  {s.ubicacion}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => prepararEdicion(s)}
                className="p-3 text-blue-600 font-bold text-[10px] uppercase hover:bg-blue-50 rounded-xl transition-all"
              >
                Editar
              </button>
              <button
                onClick={() => eliminarSede(s.id)}
                className="p-3 text-red-600 font-bold text-[10px] uppercase hover:bg-red-50 rounded-xl transition-all"
              >
                Borrar
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 bg-green-950/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white w-full max-w-lg p-10 rounded-[50px] shadow-2xl relative animate-scaleIn"
          >
            <h3 className="text-2xl font-black text-green-900 mb-8 uppercase italic">
              Configurar Local
            </h3>

            <div className="space-y-4">
              <div className="flex justify-center mb-6">
                <label className="relative w-32 h-32 rounded-[30px] overflow-hidden bg-slate-100 border-2 border-dashed border-slate-200 cursor-pointer flex items-center justify-center">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[8px] font-black text-slate-400 uppercase">
                      Subir Foto
                    </span>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nombre Sede"
                  required
                  className="w-full p-4 bg-slate-100 rounded-2xl text-xs outline-none"
                  value={formData.nombre_sede}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre_sede: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="WhatsApp (Ej: 593...)"
                  required
                  className="w-full p-4 bg-slate-100 rounded-2xl text-xs outline-none"
                  value={formData.telefono_vendedor}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      telefono_vendedor: e.target.value,
                    })
                  }
                />
              </div>

              <input
                type="text"
                placeholder="Dirección Exacta"
                required
                className="w-full p-4 bg-slate-100 rounded-2xl text-xs outline-none"
                value={formData.ubicacion}
                onChange={(e) =>
                  setFormData({ ...formData, ubicacion: e.target.value })
                }
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Horario"
                  className="w-full p-4 bg-slate-100 rounded-2xl text-xs outline-none"
                  value={formData.horario}
                  onChange={(e) =>
                    setFormData({ ...formData, horario: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Link Google Maps"
                  className="w-full p-4 bg-slate-100 rounded-2xl text-xs outline-none"
                  value={formData.google_maps_link}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      google_maps_link: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="mt-10 flex gap-4">
              <button
                type="button"
                onClick={cerrarModal}
                className="flex-1 py-4 font-black text-slate-400 uppercase text-[10px]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 bg-green-900 text-white py-4 rounded-[20px] font-black uppercase text-[10px] shadow-xl hover:bg-yellow-500 hover:text-green-900 transition-all"
              >
                {editandoId ? "Actualizar" : "Guardar Sede"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
