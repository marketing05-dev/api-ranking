export default async function handler(req, res) {
  try {
    const { cliente } = req.query;
    if (!cliente) return res.status(400).json({ erro: "Informe o cliente" });

    // Link direto para exportação em CSV (mais estável para servidores)
    const spreadsheetId = "1ScBZdmEkhWYy_nvLQLQHQdESDZk1qOdaWMhzBKTtx_bliBVU6jCLYN2odvsYZ93RP0V89eRmkKvVp2";
    const gid = "884279750";
    const url = `https://docs.google.com/spreadsheets/d/e/2PACX-1vScBZdmEkhWYy_nvLQLQHQdESDZk1qOdaWMhzBKTtx_bliBVU6jCLYN2odvsYZ93RP0V89eRmkKvVp2/pub?gid=884279750&single=true&output=csv`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error("Não consegui acessar a planilha");
    
    const texto = await response.text();
    const linhas = texto.split(/\r?\n/);

    const busca = cliente.trim().toUpperCase();
    
    // Procura a linha (Coluna D é índice 3)
    const linhaEncontrada = linhas.find(l => {
      const col = l.split(',');
      const nome = col[3] ? col[3].replace(/"/g, '').trim().toUpperCase() : "";
      return nome.includes(busca) || busca.includes(nome);
    });

    if (!linhaEncontrada) {
      return res.status(200).json({ msg: "Cliente não encontrado", buscado: busca });
    }

    // Separa as colunas respeitando as vírgulas dentro de aspas
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
    return res.status(500).json({ erro: "Erro ao ler planilha", detalhe: e.message });
  }
}
