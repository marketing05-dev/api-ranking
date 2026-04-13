export default async function handler(req, res) {
  const { cliente } = req.query;
  
  return res.status(200).json({ 
    status: "API Online", 
    mensagem: "O servidor está funcionando!",
    voce_digitou: cliente 
  });
}
