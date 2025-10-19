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

dotenv.config()
const app = express()

const port = process.env.PORT || 3000

connectDB()

app.use(express.json())
app.use(cookieParser())

app.get("/",(req,res)=>{
    res.send("Hello world")
})

app.use("/api/auth/",authRouter)
app.use("/api/board/",boardRouter)
app.use("/api/lists/",listRouter)
app.use("/api/cards/",cardRouter)

app.listen(port,()=>{
    console.log(`Server running on ${port}`)
})