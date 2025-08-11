import { Pool } from "pg";
import env from "dotenv";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

env.config({ path: path.join(__dirname, ".env") });

<<<<<<< HEAD
dotenv.config();

const isRender = process.env.DB_ENV === "render";
const connectionString = isRender
    ? process.env.RENDER_DB_URL
    : process.env.LOCAL_DB_URL;

export const db = new Pool({
    connectionString,
    ssl: isRender ? { rejectUnauthorized: false } : false
});
=======
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
>>>>>>> d52d4139272237aa5a218f3a68c9c19708bd879c
