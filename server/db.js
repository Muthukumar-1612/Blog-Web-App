import { Pool } from "pg";
import env from "dotenv";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

env.config({ path: path.join(__dirname, ".env") });

dotenv.config();

const isRender = process.env.DB_ENV === "render";
const connectionString = isRender
    ? process.env.RENDER_DB_URL
    : process.env.LOCAL_DB_URL;

export const db = new Pool({
    connectionString,
    ssl: isRender ? { rejectUnauthorized: false } : false
});

