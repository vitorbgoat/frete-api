export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Método não permitido");
  }

  const { cep, peso, largura, altura, comprimento } = req.body;

  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer SEU_TOKEN_AQUI"
  };

  const body = {
    from: {
      postal_code: "13457-074" // CEP da sua loja
    },
    to: {
      postal_code: cep
    },
    products: [
      {
        weight: parseFloat(peso),
        width: parseFloat(largura),
        height: parseFloat(altura),
        length: parseFloat(comprimento),
        quantity: 1
      }
    ],
    options: {
      insurance_value: 0,
      receipt: false,
      own_hand: false,
      reverse: false,
      non_commercial: true
    },
    services: [], // vazio retorna todos os disponíveis
    validate: true
  };

  try {
    const response = await fetch("https://www.melhorenvio.com.br/api/v2/me/shipment/calculate", {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });

    const fretes = await response.json();

    if (!Array.isArray(fretes)) {
      return res.status(400).json({ erro: "Erro ao calcular frete", detalhes: fretes });
    }

    // Retorna HTML direto
    const html = fretes
      .map(frete => `
        <div style="padding:10px;border:1px solid #ccc;margin-bottom:8px">
          <strong>${frete.name}</strong><br>
          Valor: R$ ${parseFloat(frete.price).toFixed(2)}<br>
          Prazo: ${frete.delivery_time} dia(s)
        </div>
      `)
      .join("");

    return res.status(200).send(html);

  } catch (error) {
    return res.status(500).json({ erro: "Erro interno", detalhes: error.message });
  }
}
