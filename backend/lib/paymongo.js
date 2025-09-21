import Paymongo from "paymongo-node";

export const paymongo = new Paymongo(process.env.PAYMONGO_SECRET_KEY);
