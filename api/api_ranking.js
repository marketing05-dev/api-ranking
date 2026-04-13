export default async function handler(req, res) {
  const { cliente } = req.query;

  if (!cliente) {
    return res.status(400).json({ erro: "Cliente não informado" });
  }

  try {
    const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vScBZdmEkhWYy_nvLQLQHQdESDZk1qOdaWMhzBKTtx_bliBVU6jCLYN2odvsYZ93RP0V89eRmkKvVp2/pub?gid=884279750&single=true&output=csv";

    const response = await fetch(url);
    const csv = await response.text();

    const linhas = csv.split("\n").map(l => l.trim());
    
    // Mudamos para linhas[1] porque seus títulos estão na segunda linha da planilha
    const headers = linhas[1].split(","); 

    const dados = linhas.slice(2).map(linha => {
      const valores = linha.split(",");
      let obj = {};
      headers.forEach((h, i) => {
        obj[h.trim()] = valores[i]?.trim();
      });
      return obj;
    });

    // Buscando por "Cliente" (com C maiúsculo como no seu print)
    const resultado = dados.find(item =>
      item["Cliente"]?.toLowerCase() === cliente.toLowerCase()
    );

    if (!resultado) {
      return res.status(200).json({ mensagem: "Cliente não encontrado na lista" });
    }

    const resposta = {
      cliente: resultado["Cliente"],
      filial: resultado["Filial"],
      ranking_cliente: resultado["posição do cliente dentro da Filial"] || "N/A",
      ranking_filial: resultado["POSIÇÃO FILIAL RNK PABU"] || "N/A", // Nome exato da coluna F
      vendas: resultado["SUM de Venda"]
    };

    return res.status(200).json(resposta);

  } catch (error) {
    return res.status(500).json({ erro: "Erro ao processar dados", detalhe: error.message });
  }
}
