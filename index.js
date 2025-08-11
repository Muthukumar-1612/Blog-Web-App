import express from "express";
import { db } from "./server/db.js"
import multer from "multer";

// import path from 'path';
// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
// const __dirname = dirname(fileURLToPath(import.meta.url));

import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3000;
app.set("view engine", "ejs");
app.use(express.static("Public"));
app.use(express.urlencoded({ extended: true }));

// generate date and day
const date = new Date();

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const monthName = months[date.getMonth()];
const day = date.getDate();
const year = date.getFullYear();
const formatted = `${monthName}-${day}-${year}`;

// // Store the upload file in specfic path
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, path.join(__dirname, "Public/uploads"));
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
//         cb(null, uniqueSuffix + path.extname(file.originalname));
//     }
// })


// Cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary storage for multer
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "blog_uploads",
        allowed_formats: ["jpg", "jpeg", "png"],
        public_id: (req, file) => Date.now()
    }
});

const upload = multer({ storage: storage })

app.use((req, res, next) => {
    res.locals.year = date.getFullYear();
    next();
});

async function get_post(id) {
    const result = await db.query(`
        SELECT * FROM blogs WHERE id = $1
        `, [id])
    const post = result.rows[0];
    return post;
}

// Home page
app.get('/', async (req, res) => {

    const result = await db.query(`
        SELECT * FROM blogs ORDER BY id
        `)
    const posts = result.rows

    res.render('home', { posts });
});

// post creation page
app.get('/new', (req, res) => {
    res.render('createPost');
});

// handling form submission   
app.post('/submit', upload.single("image"), async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!title || !description) {
            return res.status(400).send("Title and description are required.");
        }

        console.log("File received:", req.file);

        const imagePath = req.file ? req.file.path : "https://via.placeholder.com/400";

        await db.query(`
            INSERT INTO blogs (title, description, mondate, image)
            VALUES ($1, $2, $3, $4)
            `, [title, description, formatted, imagePath])

        res.redirect('/');
    } catch (err) {
        console.error("❌ Upload Error:", err);
        res.status(500).send("Internal Server Error");
    }
});

// go to view post
app.get("/post/:id", async (req, res) => {

    const post = await get_post(req.params.id);
    if (!post) return res.status(400).send('Post not found')
    res.render("post", { post })
})


// go to edit page
app.get("/post/:id/edit", async (req, res) => {

    const post = await get_post(req.params.id);
    if (!post) return res.status(400).send('Post not found')
    res.render("edit", { post })
})
// update handling
app.post("/post/:id/update", upload.single("image"), async (req, res) => {
    const id = req.params.id
    const { title, description } = req.body;

    let imagePath = req.file ? req.file.path : null;

    await db.query(`
            UPDATE blogs 
            SET title = $1, description = $2, mondate = $3, image = COALESCE($4, image)
            WHERE id = $5
            `, [title, description, `Edited ${formatted}`, imagePath, id])

    res.redirect("/");
})
// delete post
app.post("/post/:id/delete", async (req, res) => {

    await db.query(`
        DELETE FROM blogs
        WHERE id = $1
        `, [req.params.id])

    res.redirect("/");
})

app.listen(port, () => {
    console.log(`Server running on port : ${port}`);
})