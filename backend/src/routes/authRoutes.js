import express from "express"
import { signup } from "../controllers/authController.js"
import { login } from "../controllers/authController.js"

const authRouter = express.Router()

authRouter.post("/signup", signup)
authRouter.post("/login", login)

export default authRouter