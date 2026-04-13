export default async function handler(req, res) {
  try {
    const { cliente } = req.query;
    if (!cliente) return res.status(400).json({ erro: "Informe o cliente" });

    const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vScBZdmEkhWYy_nvLQLQHQdESDZk1qOdaWMhzBKTtx_bliBVU6jCLYN2odvsYZ93RP0V89eRmkKvVp2/pub?gid=884279750&single=true&output=csv";
    
    const response = await fetch(url);
    const texto = await response.text();
    
    // Divide as linhas corretamente
    const linhas = texto.split(/\r?\n/);
    
    // Procura a linha que contém o nome do cliente (sem ser sensível a maiúsculas/minúsculas)
    const busca = cliente.trim().toUpperCase();
    const linhaAlvo = linhas.find(l => l.toUpperCase().includes(busca));

    if (!linhaAlvo) {
      return res.status(200).json({ msg: "Cliente não encontrado", busca });
    }

    // Separa as colunas respeitando as aspas do CSV (para não quebrar no 77,00)
    const colunas = linhaAlvo.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
    const limpar = (txt) => txt ? txt.replace(/"/g, '').trim() : "---";

    return res.status(200).json({
      cliente: limpar(colunas[3]), // Coluna D
      filial: limpar(colunas[1]),  // Coluna B
      vendas: "R$ " + limpar(colunas[4]), // Coluna E
      ranking_cliente: limpar(colunas[6]), // Coluna G
      ranking_filial: limpar(colunas[5])  // Coluna F
    });

  } catch (e) {
    return res.status(500).json({ erro: "Erro interno", detalhe: e.message });
  }
}
