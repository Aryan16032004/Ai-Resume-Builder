import express from "express";
import cookieParser from "cookie-parser"
import cors from "cors";
import dotenv from "dotenv"
import connnectDB from "./db/index.js";
import userRouter from "./Routes/user.route.js"
import resumeRouter from "./Routes/resume.route.js"
import fs from 'fs';
import path from 'path';



const app = express();

app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true,              
}));

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.static("public"))

const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use("/api/users", userRouter)
app.use("/api/resume", resumeRouter)

dotenv.config(
    {path:'.env'}
)

connnectDB()
.then(()=>{
    app.on("error",(error)=>{
        console.log("ERROR: ",error );
        throw error
    })
})
.then(()=>{
    const port=process.env.PORT || 8000
    app.listen(port,()=>{
        console.log(`Server is running at port: ${port}`);
        
    })
})
.catch((error)=>{
    console.log("Mongo db connection fail");    
})


