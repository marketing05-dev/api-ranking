export default async function handler(req, res) {
  try {
    const { cliente } = req.query;
    const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vScBZdmEkhWYy_nvLQLQHQdESDZk1qOdaWMhzBKTtx_bliBVU6jCLYN2odvsYZ93RP0V89eRmkKvVp2/pub?gid=884279750&single=true&output=csv";
    
    const response = await fetch(url);
    const texto = await response.text();
    const linhas = texto.split('\n');

    // Procura a linha que contém o nome do cliente
    const linhaAlvo = linhas.find(l => l.toUpperCase().includes(cliente.toUpperCase()));

    if (!linhaAlvo) {
      return res.status(200).json({ 
        msg: "Não achei o cliente", 
        cliente_buscado: cliente,
        total_de_linhas_na_planilha: linhas.length 
      });
    }

    const colunas = linhaAlvo.split(',');

    return res.status(200).json({
      cliente: colunas[3], // Coluna D
      vendas: colunas[4],  // Coluna E
      ranking: colunas[6]  // Coluna G
    });

  } catch (e) {
    return res.status(500).json({ erro: e.message });
  }
}
