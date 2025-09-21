import paymongo from 'paymongo-node';
import dotenv from "dotenv";

dotenv.config();

export const paymongoClient = paymongo(process.env.PAYMONGO_SECRET_KEY);
