import express from "express";
import { db } from "./server/db.js"
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3000;
app.set("view engine", "ejs");
app.use(express.static("Public"));
app.use(express.urlencoded({ extended: true }));

// Generate date string
const date = new Date();
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const formatted = `${months[date.getMonth()]}-${date.getDate()}-${date.getFullYear()}`;

// Cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
        folder: "blog_uploads",
        allowed_formats: ["jpg", "jpeg", "png"],
        public_id: `blog_${Date.now()}_${Math.round(Math.random() * 1e6)}`,
        resource_type: "image"
    }),
    transformation: [
        { width: 800, height: 600, crop: "fill", gravity: "auto" }
    ]
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
    fileFilter: (req, file, cb) => {
        const ext = file.originalname.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png'].includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPG, JPEG, and PNG are allowed!'));
        }
    }
});

// Year for footer
app.use((req, res, next) => {
    res.locals.year = date.getFullYear();
    next();
});

async function get_post(id) {
    const result = await db.query(`SELECT * FROM public.blogs WHERE id = $1`, [id]);
    return result.rows[0];
}

// Middleware to handle file size and type errors
function handleUpload(req, res, next) {
    upload.single("image")(req, res, (err) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).send('File size should be less than or equal to 10 MB.');
            }
            return res.status(400).send(err.message);
        }
        next();
    });
}

// Home page
app.get('/', async (req, res) => {
    const result = await db.query(`SELECT * FROM public.blogs ORDER BY id`);
    res.render('home', { posts: result.rows });
});

// Create post page
app.get('/new', (req, res) => res.render('createPost'));

// Create post
app.post('/submit', handleUpload, async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!title || !description) {
            return res.status(400).send("Title and description are required.");
        }

        const imagePath = req.file ? req.file.path : "https://via.placeholder.com/400";
        await db.query(`
            INSERT INTO public.blogs (title, description, mondate, image)
            VALUES ($1, $2, $3, $4)
        `, [title, description, formatted, imagePath]);

        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

// View post
app.get("/post/:id", async (req, res) => {
    const post = await get_post(req.params.id);
    if (!post) return res.status(400).send('Post not found');
    res.render("post", { post });
});

// Edit page
app.get("/post/:id/edit", async (req, res) => {
    const post = await get_post(req.params.id);
    if (!post) return res.status(400).send('Post not found');
    res.render("edit", { post });
});

// Update post
app.post("/post/:id/update", handleUpload, async (req, res) => {
    try {
        const id = req.params.id;
        const { title, description } = req.body;
        const imagePath = req.file ? req.file.path : null;

        await db.query(`
            UPDATE public.blogs 
            SET title = $1, description = $2, mondate = $3, image = COALESCE($4, image)
            WHERE id = $5
        `, [title, description, `Edited ${formatted}`, imagePath, id]);

        res.redirect("/");
    } catch (err) {
        console.error("❌ Update Error:", err);
        res.status(500).send("Internal Server Error");
    }
});

// Delete post
app.post("/post/:id/delete", async (req, res) => {
    await db.query(`DELETE FROM public.blogs WHERE id = $1`, [req.params.id]);
    res.redirect("/");
});

app.listen(port, () => console.log(`Server running on port : ${port}`));
