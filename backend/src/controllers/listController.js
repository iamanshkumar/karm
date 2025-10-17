import userAuth from "../middleware/userAuth.js";
import List from "../models/listModel.js";
import Board from "../models/boardModel.js";
import Card from "../models/cardModel.js";

export const createList = async (req,res)=>{
    try{
        const {title} = req.body
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

        const lists = await List.find({ boardId })
            .populate("cards")
            .sort({ position: 1 });

        return res.json(lists)
    }catch(error){
        return res.json({success : false , message : error.message})
    }
}

export const getListById = async (req,res)=>{
    try{
        const {id} = req.params
        const list = await List.findById(id)

        if(!list){
            return res.json({success : false , message : "List not found"})
        }

        return res.json(list)

    }catch(error){
        return res.json({success : false, message : error.message})
    }
}

export const updateList = async (req,res)=>{
    try{
        const {id} = req.params
        const {title} = req.body
        const list = await List.findById(id)

        if(!list){
            return res.json({success : false , message : "List not found"})
        }

        const board = await Board.findById(list.boardId)

        if(board.createdBy.toString() !== req.user.id){
            return res.json({success : false , message : "You are not authorised"})
        }

        list.title = title || list.title
        await list.save()

        return res.json({success : true , menubar : "List updated successfully"})
    }catch(error){
        return res.json({success : false , message : error.message})
    }
}

export const deleteList = async (req,res)=>{
    try{
        const {id} = req.params

        const list = await List.findById(id)

        if(!list){
            return res.json({success : false , message : "List not found"})
        }

        const board = await Board.findById(list.boardId)

        if(board.createdBy.toString() !== req.user.id){
            return res.json({success : false ,message : "You are not authorised"})
        }

        await Board.findByIdAndUpdate(list.boardId , {$pull : {list : id}})

        await Card.deleteMany({listId : id})

        await List.findByIdAndDelete(id)

        return res.json({success : true , message : "List deleted successfully"})

    }catch(error){
        return res.json({success : false , message : error.message})
    }
}


