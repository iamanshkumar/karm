import userAuth from "../middleware/userAuth.js";
import List from "../models/listModel.js";
import Board from "../models/boardModel.js";

export const createList = async (req,res)=>{
    try{
        const {title} = req.body.title
        const {boardId} = req.params
        
        const board = await Board.findById(boardId)

        if(!board){
            return res.json({success : false, message : "Board not found"})
        }

        if(board.createdBy.toString() !== req.user.id){
            return res.json({success : false, message : "You are not authorised"})
        }

        if(!title){
            return res.json({success : false , message : "Title is required"})
        }

        const list = new List({
            title,
            boardId,
            card : [],
            position : board.lists.length
        })

        await list.save()

        return res.json({success : true, message : "List created successfully"})

    }catch(error){
        return res.json({success : false , message : error.message})
    }
}

export const getListsByBoard = async (req,res)=>{
    try{
        const {boardId} = req.params

        const board = await Board.findById(boardId)

        if(!board){
            return res.json({success : false , message : "Board not found"})
        }

        const lists = (await List.find({boardId}).populate("cards")).toSorted({position : 1})

        return res.json(lists)
    }catch(error){
        return res.json({success : false , message : error.message})
    }
}


