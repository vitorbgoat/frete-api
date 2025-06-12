export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Método não permitido");
  }

  const { cep, peso, largura, altura, comprimento } = req.body;

  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiYTNjNjIxYWFjNWYxOTIxYzFlMDY3MzcxN2QwY2U3OGY4ZTgyMWJlMWI4YjI3MzNiYjQwMTllZDNjNjJhZDA4MTNiYmZkMmMzODE1YmU1ODEiLCJpYXQiOjE3NDk3NDg5OTIuMjQ2MDQ2LCJuYmYiOjE3NDk3NDg5OTIuMjQ2MDUsImV4cCI6MTc4MTI4NDk5Mi4yMjUyMiwic3ViIjoiNDAxZjJlNDgtZGQ0My00N2YxLTg0ODQtZTBkZDk5YjQ4M2NkIiwic2NvcGVzIjpbImNhcnQtcmVhZCIsImNhcnQtd3JpdGUiLCJjb21wYW5pZXMtcmVhZCIsImNvbXBhbmllcy13cml0ZSIsImNvdXBvbnMtcmVhZCIsImNvdXBvbnMtd3JpdGUiLCJub3RpZmljYXRpb25zLXJlYWQiLCJvcmRlcnMtcmVhZCIsInByb2R1Y3RzLXJlYWQiLCJwcm9kdWN0cy1kZXN0cm95IiwicHJvZHVjdHMtd3JpdGUiLCJwdXJjaGFzZXMtcmVhZCIsInNoaXBwaW5nLWNhbGN1bGF0ZSIsInNoaXBwaW5nLWNhbmNlbCIsInNoaXBwaW5nLWNoZWNrb3V0Iiwic2hpcHBpbmctY29tcGFuaWVzIiwic2hpcHBpbmctZ2VuZXJhdGUiLCJzaGlwcGluZy1wcmV2aWV3Iiwic2hpcHBpbmctcHJpbnQiLCJzaGlwcGluZy1zaGFyZSIsInNoaXBwaW5nLXRyYWNraW5nIiwiZWNvbW1lcmNlLXNoaXBwaW5nIiwidHJhbnNhY3Rpb25zLXJlYWQiLCJ1c2Vycy1yZWFkIiwidXNlcnMtd3JpdGUiLCJ3ZWJob29rcy1yZWFkIiwid2ViaG9va3Mtd3JpdGUiLCJ3ZWJob29rcy1kZWxldGUiLCJ0ZGVhbGVyLXdlYmhvb2siXX0.HhN3ufDbVuHVdtiK3_ZuXrdtiMLGIM2cPlFq6gOLpM0lrxewe18hEaS2sJcFB7dwnIr6TVw293X9Bs6BPpJk8duYcdl5RpU2-uaBBuHa7ox0y-l4EYR1F_0W5nR89B_itUuyFPzYgrcwaneq2rNYzRCka-ldBDoWbHr7y61Z_I-ELlj_8KIAQFDU6YvmI9nWvkSMlPRd9EAkZey1BSwysmK0jjNg1ZzEVU_eJVT2O-cT0s1QHN-kxFZZU1qadg7K6rAU6LGUJcaBbSDW8XPEG079W2O8cQSckbzszhoptyUaH_ZB0M3wjV4_FWyPkQZDPmX7z9IV_ojqstkuRcLuK5Zcw1lCDe-IWx0TqjzVSphP3JpQiS1vweA4xUagGs1vBl91HD8lYoicoRyZrD3DE8sNeX4_0cqNxV-xmlTnTzrcEDdaRLKLnlMnNBerEgQAnsauGCskuoOhmUkq9IKBvc4y7DCWieTYk08fgJok4pCqd_lx670-bAW3f6BS3u3MCLjbwZl9BBM6Ig-n09erIe4NA9IBelerqF5cE1C_28Dx0pDt30oG3_hKITSow9LDRP8GHyT1MSff9SZULME-OgKDvOWljEqZlzDI0Y5xt4IWrORaVbEfBESqMjXJShzTVACVVxMVo7jh2YucFixDrFIVcB36nEGHW1zCUV0f5Uk"
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
