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
    const headers = linhas[0].split(",");

    const dados = linhas.slice(1).map(linha => {
      const valores = linha.split(",");
      let obj = {};

      headers.forEach((h, i) => {
        obj[h.trim()] = valores[i]?.trim();
      });

      return obj;
    });

    // 🔍 filtrar cliente (atenção no nome da coluna!)
    const resultado = dados.find(item =>
      item["cliente"]?.toLowerCase() === cliente.toLowerCase()
    );

    if (!resultado) {
      return res.status(204).end();
    }

    // 🎯 retornar só o necessário
    const resposta = {
      cliente: resultado["cliente"],
      filial: resultado["Filial"],
      ranking_cliente: resultado["posição do cliente dentro da Filial"],
      ranking_filial: resultado["posição Filial Rnk"],
      ultima_atualizacao: resultado["ultima_atualizacao"] || "Não informado"
    };

    return res.status(200).json(resposta);

  } catch (error) {
    return res.status(500).json({ erro: "Erro ao processar dados" });
  }
}