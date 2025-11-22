import express from "express"
import userAuth from "../middleware/userAuth.js"
import { addComments, createCardById, deleteCard, getCardById, getCardsByList, getComments, moveCard, updateCard ,getActivity, deleteComment, updateComment, assignUser, removeAssignee } from "../controllers/cardController.js"

const cardRouter = express()

cardRouter.post("/lists/:listid",userAuth,createCardById)
cardRouter.get("/lists/:listid",getCardsByList)
cardRouter.get("/:id",getCardById)
cardRouter.put("/:id",userAuth,updateCard)
cardRouter.delete("/:id",userAuth,deleteCard)
cardRouter.put("/:id/move",userAuth , moveCard)
cardRouter.post("/:id/comments",userAuth, addComments)
cardRouter.get("/:id/comments" , userAuth , getComments)
cardRouter.put("/:id/comments/:commentId" , userAuth , updateComment)
cardRouter.delete("/:id/comments/:commentId" , userAuth , deleteComment)
cardRouter.get("/:id/activity" , getActivity)
cardRouter.get("/:id/assign" ,userAuth, assignUser);
cardRouter.get("/:id/removeAssignee" , userAuth , removeAssignee)

export default cardRouter