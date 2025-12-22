import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve .env path relative to this file (backend/lib/env.js -> backend/.env)
// Since this file is in backend/lib, we go up one level to backend/
const envPath = path.resolve(__dirname, "../.env");

console.log(`[env.js] Loading environment variables from: ${envPath}`);
dotenv.config({ path: envPath });
