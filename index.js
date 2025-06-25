import express from "express";
import multer from "multer";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));

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

const formatted = `${monthName} ${day}`;
const year = date.getFullYear();

// Since, I don't use database , Whenever the serever restart the array will be empty so I add two post manually  
let posts = [{ id: 1, title: "One piece", description: "Eiichiro Oda’s One Piece is more than just an anime — it’s a generational legacy. Following Monkey D. Luffy on his journey to become the Pirate King, this series blends adventure, emotion, humor, and powerful world-building. With over 1000 episodes and counting, it has built a rich universe filled with unforgettable characters like Zoro, Nami, and Ace. It teaches us about dreams, friendship, and resilience.", monDate: "Apr 9", image: "/images/zoro.jpeg" },
{ id: 2, title: "Solo Leveling", description: "Originally a Korean webtoon, Solo Leveling stormed into the anime world with jaw-dropping animation and an intense storyline. It follows Sung Jin-Woo, the weakest hunter, who gains the power to level up without limit. Dark, stylish, and adrenaline-fueled — it’s a must-watch for fans of modern fantasy and action.", monDate: "Nov 12", image: "/images/solo.jpg" }
]


// Store the upload file in specfic path
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "public/uploads"));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
})
const upload = multer({ storage: storage })

app.use((req, res, next) => {
    res.locals.year = date.getFullYear();
    next();
});

// Home page
app.get('/', (req, res) => {
    res.render('home', { posts, year: year });
});

// post creation page
app.get('/new', (req, res) => {
    res.render('createPost');
});

// handling form submission   
app.post('/submit', upload.single("image"), (req, res) => {
    const { title, description } = req.body;
    if (!title || !description) {
        return res.status(400).send("Title and description are required.");
    }
    const imagePath = req.file ? `/uploads/${req.file.filename}` : '/images/default.jpg';
    const id = posts.length + 1;
    posts.push({ id, title, description, monDate: formatted, image: imagePath });
    res.redirect('/');
});

// go to view post
app.get("/post/:id", (req, res) => {
    const post = posts.find(p => p.id === parseInt(req.params.id));
    if (!post) return res.status(400).send('Post not found')
    res.render("post", { post })
})


// go to edit page
app.get("/post/:id/edit", (req, res) => {
    const post = posts.find(p => p.id === parseInt(req.params.id));
    if (!post) return res.status(400).send('Post not found')
    res.render("edit", { post })
})
// update handling
app.post("/post/:id/update", upload.single("image"), (req, res) => {
    const post = posts.find(p => p.id === parseInt(req.params.id));
    if (!post) return res.status(400).send('Post not found')
    post.title = req.body["title"];
    post.description = req.body["description"];
    if (req.file) {
        post.image = `/uploads/${req.file.filename}`;
    }
    res.redirect("/");
})
// delete post
app.post("/post/:id/delete", (req, res) => {
    posts = posts.filter(p => p.id !== parseInt(req.params.id));
    res.redirect("/");
})







app.listen(port, (req, res) => {
    console.log(`Server running on port : ${port}`);
})