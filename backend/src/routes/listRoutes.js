import express from "express"
import userAuth from "../middleware/userAuth.js"
import { createList, deleteList, getListById, getListsByBoard, updateList } from "../controllers/listController.js"

const listRouter = express()

listRouter.post("/boards/:boardId",userAuth,createList)
listRouter.get("/boards/:boardId",getListsByBoard)
listRouter.get("/:id",getListById)
listRouter.put("/:id",userAuth,updateList)
listRouter.delete("/:id",userAuth,deleteList)

export default listRouter