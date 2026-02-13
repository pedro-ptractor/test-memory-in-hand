import { env } from '../env/index.js';

export const abacatePay = {
  async createPix(data: {
    customer: {
      name: string;
      email: string;
      cellphone: string;
      cpf: string;
    };
    amount: number;
    externalReference: string;
  }) {
    console.log(data);
    try {
      const response = await fetch(
        'https://api.abacatepay.com/v1/pixQrCode/create',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.ABACATEPAY_SECRET}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: data.amount,
            expiresIn: 3600, // 1 hora
            description: 'Assinatura do plano',
            customer: {
              name: data.customer.name,
              cellphone: data.customer.cellphone,
              email: data.customer.email,
              taxId: data.customer.cpf,
            },
            metadata: {
              externalId: data.externalReference, // IMPORTANTE
            },
          }),
        },
      );

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`AbacatePay error: ${errorBody}`);
      }

      const result = await response.json();

      return result;
    } catch (error) {
      console.error('Erro ao criar PIX:', error);
      throw error;
    }
  },
  async simulatePayment({ pixQrCodeId }: { pixQrCodeId: string }) {
    const response = await fetch(
      `https://api.abacatepay.com/v1/pixQrCode/simulate-payment?id=${pixQrCodeId}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.ABACATEPAY_SECRET}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metadata: {},
        }),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(JSON.stringify(error));
    }

    return await response.json();
  },
};
