const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/users");
const postRoute = require("./routes/posts");
const catRoute = require("./routes/categories");
const recipeRoute = require("./routes/recipes");
const mealPlanRoute = require("./routes/mealplans");
const multer = require("multer")
const path = require("path")

dotenv.config();
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "/images")))

mongoose.connect(process.env.MONGO_URL
)
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "images");
    },
    filename: (req, file, cb) => {
        cb(null, req.body.name);
        // cb(null, "hello.jpg");
    }
});

const upload = multer({storage:storage});
app.post("/api/upload", upload.single("file"), (req,res) =>{
    res.status(200).json("File has been uploaded");
});

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/categories", catRoute);
app.use("/api/recipes", recipeRoute);
app.use("/api/mealplans", mealPlanRoute);

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
    console.log("backend is running.")
})