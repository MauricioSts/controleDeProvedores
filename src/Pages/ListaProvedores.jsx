import React from "react";
import Provedores from "../components/Provedores";

function ListaProvedores({ lista }) {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">📋 Lista de Provedores</h2>
      {lista && lista.length > 0 ? (
        <Provedores listaProvedores={lista} />
      ) : (
        <p className="text-gray-500">Nenhum provedor cadastrado.</p>
      )}
    </div>
  );
}

export default ListaProvedores;
