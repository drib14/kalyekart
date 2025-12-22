import app from "./server.js";
import { connectDB } from "./lib/db.js";

// Vercel Serverless Function Wrapper
export default async function handler(req, res) {
    // Ensure DB is connected for every request
    await connectDB();

    // Pass the request to the Express app
    return app(req, res);
}
