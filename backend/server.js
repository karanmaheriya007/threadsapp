import express from 'express';
import dotenv from "dotenv";
import connectDB from './db/connectDB.js';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import {v2 as cloudinary} from "cloudinary";

dotenv.config()
connectDB();
//creating an express server
const app = express();

const PORT = process.env.PORT || 5000;

cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET
})

//Middlewares
app.use(express.json({limit:"50mb"})); //To parse JSON data in the req.body
app.use(express.urlencoded({extended:true}));
//To parse from data in the req.body
// To support URL-encoded data (a common type of submission when building web forms
app.use(cookieParser());
//Routes
app.use("/api/users",userRoutes);
app.use("/api/posts",postRoutes);

app.listen(5000,()=> console.log(`Server started at http://localhost:${PORT}`));