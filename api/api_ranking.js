export default async function handler(req, res) {
  try {
    const { cliente } = req.query;
    if (!cliente) return res.status(400).json({ erro: "Informe o cliente" });

    const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vScBZdmEkhWYy_nvLQLQHQdESDZk1qOdaWMhzBKTtx_bliBVU6jCLYN2odvsYZ93RP0V89eRmkKvVp2/pub?gid=884279750&single=true&output=csv";
    
    const response = await fetch(url);
    const texto = await response.text();
    
    // Divide por linhas
    const linhas = texto.split(/\r?\n/);
    
    // Busca a linha que contém o nome do cliente
    const busca = cliente.trim().toUpperCase();
    const linhaEncontrada = linhas.find(l => l.toUpperCase().includes(busca));

    if (!linhaEncontrada) {
      return res.status(200).json({ msg: "Cliente não encontrado", busca });
    }

    // O truque para não quebrar com a vírgula do "77,00":
    // Vamos trocar as vírgulas que estão entre aspas por um ponto temporário
    const linhaTratada = linhaEncontrada.replace(/"([^"]*)"/g, (m, c) => c.replace(/,/g, '.'));
    const colunas = linhaTratada.split(',');

    return res.status(200).json({
      cliente: colunas[3] ? colunas[3].trim() : "---",
      filial: colunas[1] ? colunas[1].trim() : "---",
      vendas: "R$ " + (colunas[4] ? colunas[4].trim() : "0.00"),
      ranking_cliente: colunas[6] ? colunas[6].trim() : "---",
      ranking_filial: colunas[5] ? colunas[5].trim() : "---"
    });

  } catch (e) {
    return res.status(500).json({ erro: "Erro de processamento", detalhe: e.message });
  }
}
