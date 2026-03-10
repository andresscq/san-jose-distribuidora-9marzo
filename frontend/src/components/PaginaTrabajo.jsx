import { useState, useEffect } from "react";
import { AuthPostulante } from "./AuthPostulante";
import { FormularioTrabajo } from "./FormularioTrabajo"; // Tu componente .jsx de trabajo

export const PaginaTrabajoPrincipal = () => {
  const [estaLogueado, setEstaLogueado] = useState(false);

  useEffect(() => {
    // Al cargar, revisamos si ya hay un usuario guardado
    const usuario = localStorage.getItem("usuario_distribuidora");
    if (usuario) setEstaLogueado(true);
  }, []);

  return (
    <div className="min-h-screen bg-yellow-50 flex items-center justify-center p-4">
      {estaLogueado ? (
        <FormularioTrabajo />
      ) : (
        <AuthPostulante alEntrar={() => setEstaLogueado(true)} />
      )}
    </div>
  );
};
