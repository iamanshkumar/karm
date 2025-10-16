import express from "express"
import { createBoard , getBoards , updateBoard , deleteBoard } from "../controllers/boardController.js"
import userAuth from "../middleware/userAuth.js"

const boardRouter = express.Router()

boardRouter.post("/",userAuth,createBoard)
boardRouter.get("/",userAuth,getBoards)
boardRouter.put('/:id', userAuth, updateBoard);
boardRouter.delete('/:id', userAuth, deleteBoard);

export default boardRouter