import React from "react";

export const ProductoCard = ({
  nombre,
  categoria,
  imagen,
  telefono,
  descripcion, // Propiedad clave del Admin
  stock,
  stock_alerta,
}) => {
  // 1. Configuración de la imagen con fallback
  const urlImagen = imagen
    ? `http://localhost:3000/${imagen.replace(/^\//, "")}`
    : "https://via.placeholder.com/400?text=Sin+Foto";

  // 2. Configuración de WhatsApp
  const mensaje = `¡Hola! Vengo de la web de San José. Me interesa información sobre: ${nombre} (${categoria}).`;
  const numeroDestino = telefono || "593987654321";
  const urlWa = `https://wa.me/${numeroDestino}?text=${encodeURIComponent(mensaje)}`;

  // 3. Lógica de Stock
  const tieneStockInfo = stock !== undefined && stock !== null;
  const nStock = parseInt(stock);
  const nAlerta = parseInt(stock_alerta) || 5;

  return (
    <div className="bg-white p-5 rounded-[35px] shadow-md border border-gray-100 flex flex-col hover:shadow-2xl transition-all duration-500 h-full group">
      {/* IMAGEN Y BADGE DE STOCK */}
      <div className="w-full h-48 rounded-[25px] overflow-hidden mb-4 bg-gray-50 relative">
        <img
          src={urlImagen}
          alt={nombre}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />

        {tieneStockInfo && (
          <div
            className={`absolute top-3 right-3 px-3 py-1.5 rounded-xl text-[10px] font-black shadow-lg text-white backdrop-blur-sm ${
              nStock <= 0
                ? "bg-gray-500/90"
                : nStock <= nAlerta
                  ? "bg-red-600 animate-pulse"
                  : "bg-green-600/90"
            }`}
          >
            {nStock <= 0
              ? "AGOTADO"
              : nStock <= nAlerta
                ? `¡ÚLTIMOS ${nStock}!`
                : `${nStock} DISPONIBLES`}
          </div>
        )}
      </div>

      <div className="flex-grow flex flex-col px-1">
        {/* CATEGORÍA */}
        <span className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.2em] mb-1">
          {categoria || "General"}
        </span>

        {/* TÍTULO DEL PRODUCTO */}
        <h3 className="text-base font-black text-green-950 uppercase leading-tight mb-2 group-hover:text-green-700 transition-colors">
          {nombre}
        </h3>

        {/* DESCRIPCIÓN DINÁMICA */}
        <p className="text-[12px] text-gray-500 font-medium italic line-clamp-3 mb-5 leading-relaxed flex-grow">
          {descripcion && descripcion.trim() !== ""
            ? descripcion
            : "Calidad premium seleccionada para tu hogar."}
        </p>

        {/* BOTÓN DE ACCIÓN */}
        <a
          href={urlWa}
          target="_blank"
          rel="noreferrer"
          className="block w-full bg-green-900 text-white text-center py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-yellow-500 hover:text-green-900 shadow-lg hover:shadow-yellow-200/50 transition-all duration-300 active:scale-95"
        >
          Consultar Stock
        </a>
      </div>
    </div>
  );
};
