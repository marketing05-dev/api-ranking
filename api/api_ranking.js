export default async function handler(req, res) {
  const { cliente } = req.query;
  if (!cliente) return res.status(400).json({ erro: "Cliente não informado" });

  try {
    const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vScBZdmEkhWYy_nvLQLQHQdESDZk1qOdaWMhzBKTtx_bliBVU6jCLYN2odvsYZ93RP0V89eRmkKvVp2/pub?gid=884279750&single=true&output=csv";
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const decoder = new TextDecoder('utf-8'); // Força a leitura correta de acentos
    const csv = decoder.decode(buffer);

    const linhas = csv.split(/\r?\n/).map(linha => {
        return linha.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(campo => campo.replace(/"/g, '').trim());
    });

    const headers = linhas[0];
    
    // Busca os índices das colunas de forma inteligente (ignora acentos e caixa alta)
    const acharIndice = (nome) => headers.findIndex(h => 
        h.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(nome.toLowerCase())
    );

    const idxCliente = acharIndice("cliente");
    const idxVenda = acharIndice("venda");
    const idxRankCli = acharIndice("dentro da filial"); // Busca por parte do nome
    const idxRankFil = acharIndice("rnk pabu");

    const busca = cliente.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    // Procura o cliente limpando acentos de ambos os lados
    const resultado = linhas.slice(1).find(colunas => {
        const nomePlanilha = (colunas[idxCliente] || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return nomePlanilha === busca;
    });

    if (!resultado) {
      return res.status(200).json({ 
        mensagem: "Cliente não encontrado", 
        dica: "Verifique se o nome no Sheets é exatamente: " + cliente.toUpperCase()
      });
    }

    return res.status(200).json({
      cliente: resultado[idxCliente],
      vendas: "R$ " + resultado[idxVenda],
      ranking_no_pabu: resultado[idxRankCli],
      ranking_da_filial: resultado[idxRankFil]
    });

  } catch (error) {
    return res.status(500).json({ erro: "Erro no servidor", detalhe: error.message });
  }
}
