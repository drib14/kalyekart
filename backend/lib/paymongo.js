import Paymongo from "paymongo";

export const paymongo = new Paymongo(process.env.PAYMONGO_SECRET_KEY);