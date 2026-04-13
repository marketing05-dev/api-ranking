export default async function handler(req, res) {
  const { cliente } = req.query;

  if (!cliente) {
    return res.status(400).json({ erro: "Cliente não informado" });
  }

  try {
    // URL da sua planilha
    const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vScBZdmEkhWYy_nvLQLQHQdESDZk1qOdaWMhzBKTtx_bliBVU6jCLYN2odvsYZ93RP0V89eRmkKvVp2/pub?gid=884279750&single=true&output=csv";

    const response = await fetch(url);
    const csv = await response.text();

    // Divide as linhas
    const linhas = csv.split(/\r?\n/);
    
    // Pega os títulos na Linha 2 (índice 1) e limpa aspas extras
    const headers = linhas[1].split(",").map(h => h.replace(/"/g, '').trim()); 

    const dados = linhas.slice(2).map(linha => {
      // Regex para separar por vírgula mas ignorar vírgulas dentro de aspas (se houver)
      const valores = linha.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      let obj = {};
      headers.forEach((h, i) => {
        let valor = valores[i] ? valores[i].replace(/"/g, '').trim() : "";
        obj[h] = valor;
      });
      return obj;
    });

    // Busca ignorando espaços extras no início/fim e diferenças de maiúsculas
    const busca = cliente.trim().toLowerCase();
    const resultado = dados.find(item => 
      item["Cliente"] && item["Cliente"].trim().toLowerCase() === busca
    );

    if (!resultado) {
      return res.status(200).json({ 
        mensagem: "Cliente não encontrado na lista",
        sugestao: "Verifique se o nome está idêntico ao da planilha",
        cliente_tentado: cliente 
      });
    }

    return res.status(200).json({
      cliente: resultado["Cliente"],
      filial: resultado["Filial"],
      vendas: resultado["SUM de Venda"],
      ranking_cliente: resultado["POSIÇÃO DO CLIENTE DENTRO DA FILIAL"] || "N/A",
      ranking_filial: resultado["POSIÇÃO FILIAL RNK PABU"] || "N/A"
    });

  } catch (error) {
    return res.status(500).json({ erro: "Erro no servidor", detalhe: error.message });
  }
}
