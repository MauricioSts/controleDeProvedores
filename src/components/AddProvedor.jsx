function AddProvedor() {
  return (
    <div>
      <input type="text" placeholder="Razão Social" />
      <input type="number" placeholder="CNPJ" />
      <input type="text" placeholder="Regime Tributario" />
      <input type="number" placeholder="Nº Fistel" />
      <input type="number" placeholder="Nº SCM" />

      <select id="statusEmpresa">
        <option value="" disabled>
          Selecione a Situação
        </option>
        <option value="ativa">Ativa</option>
        <option value="inativa">Inativa</option>
        <option value="suspensa">Suspensa</option>
        <option value="em-analise">Em Análise</option>
      </select>
    </div>
  );
}

export default AddProvedor;
