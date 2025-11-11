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

// Add logging for debugging
app.use("/api/auth/", (req, res, next) => {
    console.log(`Auth route accessed: ${req.method} ${req.originalUrl}`)
    next()
}, authRouter)

app.use("/api/boards/", (req, res, next) => {
    console.log(`Boards route accessed: ${req.method} ${req.originalUrl}`)
    next()
}, boardRouter)

app.use("/api/lists/", (req, res, next) => {
    console.log(`Lists route accessed: ${req.method} ${req.originalUrl}`)
    next()
}, listRouter)

app.use("/api/cards/", (req, res, next) => {
    console.log(`Cards route accessed: ${req.method} ${req.originalUrl}`)
    next()
}, cardRouter)

app.use("/api/user", (req, res, next) => {
    console.log(`User route accessed: ${req.method} ${req.originalUrl}`)
    next()
}, userRouter)

app.listen(port,()=>{
    console.log(`Server running on ${port}`)
    console.log(`Frontend URL: ${process.env.FRONTEND_URL}`)
})