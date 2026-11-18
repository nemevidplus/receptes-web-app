const express = require("express");
const cors = require('cors');
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/users");
const postRoute = require("./routes/posts");
const catRoute = require("./routes/categories");
const recipeRoute = require("./routes/recipes");
const mealPlanRoute = require("./routes/mealplans");
const upload = require('./cloudinaryUpload');
const path = require("path");


dotenv.config();

// app.use(cors({
//     origin: ['https://www.milegyenavacsora.hu', 'http://localhost:3000'], 
//     credentials: true
//   }));

const allowedOrigins = [
    'https://www.milegyenavacsora.hu',
    'http://localhost:3000',
    'http://localhost:5173'
  ];
  
  app.use(cors({
    origin: function (origin, callback) {
     
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('CORS policy violation'));
      }
    },
    credentials: true
  }));

app.use(express.json());

app.use("/images", express.static(path.join(__dirname, "/images")))

mongoose.connect(process.env.MONGO_URL
)
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));



app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
      
      if (!req.file) {
          return res.status(400).json({ error: "Nem érkezett fájl!" });
      }
      
      res.status(200).json({
          message: "File has been uploaded to Cloudinary",
          url: req.file.path 
      });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
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



