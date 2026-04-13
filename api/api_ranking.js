export default async function handler(req, res) {
  try {
    const { cliente } = req.query;
    if (!cliente) return res.status(400).json({ erro: "Informe o cliente" });

    const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vScBZdmEkhWYy_nvLQLQHQdESDZk1qOdaWMhzBKTtx_bliBVU6jCLYN2odvsYZ93RP0V89eRmkKvVp2/pub?gid=884279750&single=true&output=csv";
    
    // Usando o fetch nativo do Node.js (não precisa de import)
    const response = await fetch(url);
    const texto = await response.text();
    const linhas = texto.split(/\r?\n/);

    const busca = cliente.trim().toUpperCase();
    
    const linhaEncontrada = linhas.find(l => {
      const colunas = l.split(',');
      const nomeNaPlanilha = colunas[3] ? colunas[3].replace(/"/g, '').trim().toUpperCase() : "";
      return nomeNaPlanilha.includes(busca) || busca.includes(nomeNaPlanilha);
    });

    if (!linhaEncontrada) {
      return res.status(200).json({ msg: "Cliente não encontrado", buscado: busca });
    }

    const colunas = linhaEncontrada.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    const limpar = (txt) => txt ? txt.replace(/"/g, '').trim() : "---";

    return res.status(200).json({
      cliente: limpar(colunas[3]),
      filial: limpar(colunas[1]),
      vendas: "R$ " + limpar(colunas[4]),
      ranking_cliente: limpar(colunas[6]),
      ranking_filial: limpar(colunas[5])
    });

  } catch (e) {
    return res.status(500).json({ erro: "Erro no servidor", detalhe: e.message });
  }
}
