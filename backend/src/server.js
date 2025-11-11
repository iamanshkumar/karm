import express from "express"
import dotenv from "dotenv"
import connectDB from "./config/db.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import authRouter from "./routes/authRoutes.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import boardRouter from "./routes/boardRoutes.js"
import listRouter from "./routes/listRoutes.js"
import cardRouter from "./routes/cardRoutes.js"
import userRouter from "./routes/userRoutes.js"

dotenv.config()
const app = express()

const port = process.env.PORT || 3000

connectDB()

app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL 
      : "http://localhost:5173",
    credentials: true
}))

app.use(express.json())
app.use(cookieParser())

app.get("/",(req,res)=>{
    res.send("Hello world")
})

app.use("/api/auth/",authRouter)
app.use("/api/boards/",boardRouter)
app.use("/api/lists/",listRouter)
app.use("/api/cards/",cardRouter)
app.use("/api/user",userRouter)

app.listen(port,()=>{
    console.log(`Server running on ${port}`)
})