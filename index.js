import express from "express";
import serverless from "serverless-http";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import cookieParser from "cookie-parser";
import pkg from "cloudinary";
const { v2: cloudinary } = pkg;
import { CloudinaryStorage } from "multer-storage-cloudinary";
import connectDB from "../connect.js";

import authRoutes from "../routes/auth.js";
import userRoutes from "../routes/users.js";
import postRoutes from "../routes/posts.js";
import commentRoutes from "../routes/comments.js";
import likeRoutes from "../routes/likes.js";
import relationshipRoutes from "../routes/relationships.js";

dotenv.config();
connectDB();

const app = express();

app.use((req, res, next) => {
  console.log("Origin:", req.headers.origin);
  console.log("Method:", req.method);
  next();
});


app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:3000",
        "https://social-my-sql-client.vercel.app",
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.options("*", cors()); // Preflight

app.use(cookieParser());
app.use(express.json());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Social App",
    public_id: (req, file) => Date.now() + "-" + file.originalname,
  },
});

const upload = multer({ storage });

app.post("/api/upload", upload.single("file"), (req, res) => {
  res
    .status(200)
    .json({ message: "Upload successful!", fileUrl: req.file.path });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/relationships", relationshipRoutes);

app.get("/api", (req, res) => {
  res.send("API is running 🚀");
});

export default serverless(app);
