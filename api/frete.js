export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { cep } = req.body;

  if (!cep) {
    return res.status(400).json({ error: 'CEP de destino é obrigatório' });
  }

  try {
    const response = await fetch('https://www.melhorenvio.com.br/api/v2/me/shipment/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`
      },
      body: JSON.stringify([
        {
          from: {
            postal_code: '13457-074'
          },
          to: {
            postal_code: cep
          },
          package: {
            weight: 0.1,
            width: 16,
            height: 11,
            length: 7
          },
          services: ['1'],
          options: {
            receipt: false,
            own_hand: false,
            insurance_value: 0,
            reverse: false,
            non_commercial: true
          }
        }
      ])
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao calcular o frete');
    }

    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Erro interno do servidor' });
  }
}
