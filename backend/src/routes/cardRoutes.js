import express from "express"
import userAuth from "../middleware/userAuth.js"
import { createCardById, deleteCard, getCardById, getCardsByList, updateCard } from "../controllers/cardController.js"

const cardRouter = express()

cardRouter.post("/lists/:listid",userAuth,createCardById)
cardRouter.get("/lists/:listid",getCardsByList)
cardRouter.get("/:id",getCardById)
cardRouter.put("/:id",userAuth,updateCard)
cardRouter.delete("/:id",userAuth,deleteCard)

export default cardRouter