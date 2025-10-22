import express from "express"
import { isAuthenticated, signup } from "../controllers/authController.js"
import { login , logout } from "../controllers/authController.js"
import userAuth from "../middleware/userAuth.js"

const authRouter = express.Router()

authRouter.post("/signup", signup)
authRouter.post("/login", login)
authRouter.get("/is-auth",userAuth,isAuthenticated)
authRouter.post("/logout", logout)

export default authRouter