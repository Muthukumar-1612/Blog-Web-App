import { Pool } from "pg";
import env from "dotenv";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

env.config({ path: path.join(__dirname, ".env") });

// Pick which DB config to use
const isRender = process.env.DB_ENV === "render";

export const db = new Pool({
    user: isRender ? process.env.RENDER_PG_USER : process.env.LOCAL_PG_USER,
    host: isRender ? process.env.RENDER_PG_HOST : process.env.LOCAL_PG_HOST,
    database: isRender ? process.env.RENDER_PG_DATABASE : process.env.LOCAL_PG_DATABASE,
    password: isRender ? process.env.RENDER_PG_PASSWORD : process.env.LOCAL_PG_PASSWORD,
    port: isRender ? process.env.RENDER_PG_PORT : process.env.LOCAL_PG_PORT,
    ssl: isRender ? { rejectUnauthorized: false } : false // SSL only for Render
});
