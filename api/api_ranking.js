export default async function handler(req, res) {
  const { cliente } = req.query;
  if (!cliente) return res.status(400).json({ erro: "Cliente não informado" });

  try {
    const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vScBZdmEkhWYy_nvLQLQHQdESDZk1qOdaWMhzBKTtx_bliBVU6jCLYN2odvsYZ93RP0V89eRmkKvVp2/pub?gid=884279750&single=true&output=csv";
    const response = await fetch(url);
    const csv = await response.text();

    // Divide as linhas e remove aspas chatas que o Google Sheets coloca
    const linhas = csv.split(/\r?\n/).map(linha => {
        // Esta regra separa por vírgula mas ignora vírgulas dentro de valores como "77,00"
        return linha.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(campo => campo.replace(/"/g, '').trim());
    });

    // O cabeçalho real está na linha 0
    const headers = linhas[0];
    const idxCliente = headers.indexOf("Cliente");
    const idxFilial = headers.indexOf("Filial");
    const idxVenda = headers.indexOf("SUM de Venda");
    const idxRankCli = headers.indexOf("POSIÇÃO DO CLIENTE DENTRO DA FILIAL");
    const idxRankFil = headers.indexOf("POSIÇÃO FILIAL RNK PABU");

    // Procura o cliente (ignora maiúsculas e espaços extras)
    const busca = cliente.trim().toLowerCase();
    const dados = linhas.slice(1); // Pula o cabeçalho
    const resultado = dados.find(colunas => colunas[idxCliente]?.toLowerCase() === busca);

    if (!resultado) {
      return res.status(200).json({ 
        mensagem: "Cliente não encontrado", 
        cliente_tentado: cliente 
      });
    }

    return res.status(200).json({
      cliente: resultado[idxCliente],
      filial: resultado[idxFilial] || "Verificar linha acima na planilha",
      vendas: "R$ " + resultado[idxVenda],
      ranking_no_pabu: resultado[idxRankCli],
      ranking_da_filial: resultado[idxRankFil]
    });

  } catch (error) {
    return res.status(500).json({ erro: "Erro no servidor", detalhe: error.message });
  }
}
