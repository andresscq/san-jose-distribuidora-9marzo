import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminProductos = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSel, setCategoriaSel] = useState("Todas");
  const [editandoId, setEditandoId] = useState(null);
  const [seleccionados, setSeleccionados] = useState([]);

  // Estados para formularios
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [producto, setProducto] = useState({
    nombre: "",
    descripcion: "",
    stock: 0,
    stock_alerta: 5,
    categoria_id: "",
  });
  const [imagen, setImagen] = useState(null);
  const [preview, setPreview] = useState(null);

  const cargarDatos = async () => {
    try {
      const [resCats, resProds] = await Promise.all([
        axios.get("http://localhost:3000/api/productos/categorias"),
        axios.get("http://localhost:3000/api/productos"),
      ]);
      setCategorias(resCats.data);
      setProductos(resProds.data);
    } catch (err) {
      console.error("Error al cargar datos del servidor");
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // --- LÓGICA DE PRIORIDAD (ESTRELLA) ---
  const togglePrioridad = async (id, estadoActual) => {
    try {
      await axios.put(
        `http://localhost:3000/api/productos/categorias/${id}/prioridad`,
        {
          es_prioridad: !estadoActual,
        },
      );
      cargarDatos();
    } catch (err) {
      alert("Error al cambiar prioridad");
    }
  };

  // --- LÓGICA DE SELECCIÓN ---
  const toggleSeleccion = (id) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleEliminarMasivo = async () => {
    if (
      !window.confirm(
        `¿Eliminar ${seleccionados.length} productos seleccionados?`,
      )
    )
      return;
    try {
      await axios.post("http://localhost:3000/api/productos/delete-many", {
        ids: seleccionados,
      });
      setSeleccionados([]);
      cargarDatos();
      alert("¡Borrado masivo exitoso!");
    } catch (err) {
      alert("Error al eliminar múltiples productos");
    }
  };

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagen(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // --- GESTIÓN DE CATEGORÍAS ---
  const handleCrearCategoria = async () => {
    if (!nuevaCategoria) return;
    try {
      await axios.post("http://localhost:3000/api/productos/categorias", {
        nombre: nuevaCategoria,
      });
      setNuevaCategoria("");
      cargarDatos();
    } catch (err) {
      alert("Error al crear categoría o ya existe");
    }
  };

  const handleEditarCategoria = async (id, nombreActual) => {
    const nuevoNombre = window.prompt(
      "Editar nombre de categoría:",
      nombreActual,
    );
    if (!nuevoNombre || nuevoNombre === nombreActual) return;
    try {
      await axios.put(`http://localhost:3000/api/productos/categorias/${id}`, {
        nombre: nuevoNombre,
      });
      cargarDatos();
    } catch (err) {
      alert("Error al editar categoría");
    }
  };

  const handleEliminarCategoria = async (id) => {
    if (!window.confirm("¿Eliminar categoría?")) return;
    try {
      await axios.delete(
        `http://localhost:3000/api/productos/categorias/${id}`,
      );
      cargarDatos();
    } catch (err) {
      alert("No se puede eliminar: tiene productos vinculados.");
    }
  };

  // --- GESTIÓN DE PRODUCTOS ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(producto).forEach((key) => formData.append(key, producto[key]));
    if (imagen) formData.append("imagen", imagen);

    try {
      if (editandoId) {
        await axios.put(
          `http://localhost:3000/api/productos/${editandoId}`,
          formData,
        );
      } else {
        await axios.post("http://localhost:3000/api/productos", formData);
      }
      resetFormulario();
      cargarDatos();
      alert("¡Operación exitosa!");
    } catch (err) {
      alert("Error al guardar producto");
    }
  };

  const resetFormulario = () => {
    setProducto({
      nombre: "",
      descripcion: "",
      stock: 0,
      stock_alerta: 5,
      categoria_id: "",
    });
    setImagen(null);
    setPreview(null);
    setEditandoId(null);
  };

  const prepararEdicion = (prod) => {
    setEditandoId(prod.id);
    setProducto({
      nombre: prod.nombre,
      descripcion: prod.descripcion || "",
      stock: prod.stock,
      stock_alerta: prod.stock_alerta,
      categoria_id: prod.categoria_id,
    });
    setPreview(
      prod.imagen_url
        ? `http://localhost:3000/${prod.imagen_url.replace(/^\//, "")}`
        : null,
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 pt-10 px-4 md:px-10">
      {/* BARRA FLOTANTE DE ACCIONES MASIVAS */}
      {seleccionados.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-green-900 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-6 border border-white/20">
          <span className="text-[10px] font-black uppercase tracking-widest">
            {seleccionados.length} Productos marcados
          </span>
          <button
            onClick={handleEliminarMasivo}
            className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded-2xl text-[9px] font-black uppercase transition-all"
          >
            Eliminar Selección 🗑️
          </button>
          <button
            onClick={() => setSeleccionados([])}
            className="text-[9px] font-black uppercase opacity-60 hover:opacity-100"
          >
            Cancelar
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* SECCIÓN CATEGORÍAS (CON PRIORIDAD) */}
          <div className="lg:col-span-4 bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 italic">
              Panel / Categorías ⭐
            </h2>
            <div className="flex gap-2 mb-6">
              <input
                className="flex-grow p-4 bg-slate-50 rounded-2xl outline-none font-bold text-xs border-2 border-transparent focus:border-green-100"
                placeholder="Nueva categoría..."
                value={nuevaCategoria}
                onChange={(e) => setNuevaCategoria(e.target.value)}
              />
              <button
                onClick={handleCrearCategoria}
                className="bg-green-900 text-white p-4 rounded-2xl hover:bg-yellow-500 hover:text-green-900 transition-all shadow-md"
              >
                ➕
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {categorias.map((c) => (
                <div
                  key={c.id}
                  className="flex justify-between items-center bg-slate-50 p-3 px-5 rounded-2xl border border-white group"
                >
                  <div className="flex items-center gap-3">
                    {/* BOTÓN ESTRELLA DE PRIORIDAD */}
                    <button
                      onClick={() => togglePrioridad(c.id, c.es_prioridad)}
                      className={`text-lg transition-all transform hover:scale-125 ${c.es_prioridad ? "grayscale-0" : "grayscale opacity-20"}`}
                      title="Marcar como prioridad en Inicio"
                    >
                      ⭐
                    </button>
                    <span className="text-[10px] font-black text-slate-600 uppercase">
                      {c.nombre}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditarCategoria(c.id, c.nombre)}
                      className="text-[9px] font-black text-blue-400 hover:text-blue-600 uppercase"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminarCategoria(c.id)}
                      className="w-7 h-7 flex items-center justify-center bg-red-50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all text-xs"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECCIÓN FORMULARIO PRODUCTOS */}
          <div className="lg:col-span-8 bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
                Inventario / {editandoId ? "Editar Producto" : "Nuevo Producto"}
              </h2>
              {editandoId && (
                <button
                  onClick={resetFormulario}
                  className="text-[10px] font-black text-red-500 uppercase hover:underline"
                >
                  Cancelar Edición
                </button>
              )}
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              <div className="relative aspect-square md:aspect-auto bg-slate-50 rounded-[30px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden cursor-pointer group">
                {preview ? (
                  <img
                    src={preview}
                    className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
                    alt="Preview"
                  />
                ) : (
                  <div className="text-center">
                    <span className="text-3xl block mb-2">📸</span>
                    <p className="text-[9px] font-black text-slate-400 uppercase">
                      Cargar Imagen
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  onChange={handleImagenChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>

              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    required
                    className="p-4 bg-slate-50 rounded-2xl font-bold text-xs outline-none"
                    placeholder="Nombre..."
                    value={producto.nombre}
                    onChange={(e) =>
                      setProducto({ ...producto, nombre: e.target.value })
                    }
                  />
                  <select
                    required
                    className="p-4 bg-slate-50 rounded-2xl font-bold text-xs outline-none"
                    value={producto.categoria_id}
                    onChange={(e) =>
                      setProducto({ ...producto, categoria_id: e.target.value })
                    }
                  >
                    <option value="">Categoría...</option>
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <textarea
                  className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-xs outline-none h-20 resize-none"
                  placeholder="Descripción breve..."
                  value={producto.descripcion}
                  onChange={(e) =>
                    setProducto({ ...producto, descripcion: e.target.value })
                  }
                />
                <div className="grid grid-cols-3 gap-4">
                  <input
                    type="number"
                    placeholder="Stock"
                    className="p-4 bg-slate-50 rounded-2xl font-bold text-xs"
                    value={producto.stock}
                    onChange={(e) =>
                      setProducto({ ...producto, stock: e.target.value })
                    }
                  />
                  <input
                    type="number"
                    placeholder="Mínimo"
                    className="p-4 bg-slate-50 rounded-2xl font-bold text-xs text-red-500"
                    value={producto.stock_alerta}
                    onChange={(e) =>
                      setProducto({ ...producto, stock_alerta: e.target.value })
                    }
                  />
                  <button
                    type="submit"
                    className="bg-green-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-yellow-500 hover:text-green-900 transition-all shadow-lg"
                  >
                    {editandoId ? "Actualizar" : "Guardar"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* BUSCADOR Y FILTROS */}
        <div className="max-w-3xl mx-auto w-full text-center space-y-8">
          <div className="relative group">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl">
              🔍
            </span>
            <input
              className="w-full p-6 pl-16 bg-white rounded-[30px] shadow-xl shadow-slate-200/40 outline-none font-bold text-sm border-2 border-transparent focus:border-green-900/10 transition-all"
              placeholder="¿Qué producto buscas gestionar hoy?..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {["Todas", ...categorias.map((c) => c.nombre)].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaSel(cat)}
                className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${categoriaSel === cat ? "bg-green-900 text-white shadow-xl scale-105" : "bg-white text-slate-400 border border-slate-200"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* GRILLA DE PRODUCTOS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {productos
            .filter(
              (p) =>
                (categoriaSel === "Todas" ||
                  p.nombre_categoria === categoriaSel) &&
                p.nombre.toLowerCase().includes(busqueda.toLowerCase()),
            )
            .map((prod) => {
              const isSelected = seleccionados.includes(prod.id);
              return (
                <div
                  key={prod.id}
                  onClick={() => toggleSeleccion(prod.id)}
                  className={`bg-white rounded-[45px] overflow-hidden shadow-sm border-2 group hover:shadow-2xl transition-all duration-500 cursor-pointer relative ${isSelected ? "border-green-500 ring-4 ring-green-100" : "border-slate-100"}`}
                >
                  <div
                    className={`absolute top-6 right-6 z-10 w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center ${isSelected ? "bg-green-500 border-green-500" : "bg-white/50 border-white"}`}
                  >
                    {isSelected && (
                      <span className="text-white text-[10px]">✓</span>
                    )}
                  </div>

                  <div className="h-56 bg-slate-50 relative">
                    <img
                      src={
                        prod.imagen_url
                          ? `http://localhost:3000/${prod.imagen_url.replace(/^\//, "")}`
                          : "https://via.placeholder.com/400?text=Sin+Foto"
                      }
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      alt={prod.nombre}
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur-sm text-green-900 px-4 py-1.5 rounded-full text-[9px] font-black uppercase">
                        {prod.nombre_categoria}
                      </span>
                    </div>
                    <div
                      className={`absolute bottom-4 right-4 px-4 py-2 rounded-2xl text-[11px] font-black shadow-lg ${prod.stock <= prod.stock_alerta ? "bg-red-500 text-white animate-pulse" : "bg-green-500 text-white"}`}
                    >
                      {prod.stock} UNIDADES
                    </div>
                  </div>

                  <div className="p-8">
                    <h3 className="font-black text-green-950 uppercase text-xs mb-2 line-clamp-1">
                      {prod.nombre}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold italic line-clamp-2 min-h-[30px] mb-6">
                      {prod.descripcion || "Sin descripción registrada."}
                    </p>
                    <div className="flex gap-3 pt-6 border-t border-slate-50">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          prepararEdicion(prod);
                        }}
                        className="flex-grow bg-yellow-400 text-green-950 py-3.5 rounded-2xl text-[9px] font-black uppercase hover:bg-green-900 hover:text-white transition-all"
                      >
                        Editar Datos
                      </button>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (window.confirm("¿Eliminar este producto?")) {
                            await axios.delete(
                              `http://localhost:3000/api/productos/${prod.id}`,
                            );
                            cargarDatos();
                          }
                        }}
                        className="w-12 h-12 flex items-center justify-center bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default AdminProductos;
