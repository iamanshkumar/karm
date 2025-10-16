import userAuth from "../middleware/userAuth.js";
import Board from "../models/boardModel.js";

export const createBoard = async (req,res)=>{
    const {title , description} = req.body

    try{
        if(!title){
            return res.json({success : false , message : "Title is required"})
        }

        const board = new Board({
            title , 
            description,
            createdBy : req.user._id
        })

        await board.save()

        return res.json({success : true , message : "Board created successfully"})
    }catch(error){
        return res.json({success : false , message : error.message})
    }
}

export const getBoards = async (req,res)=>{
    try{
        const allBoards = await Board.find().populate('createdBy','username')
        return res.json(allBoards)
    }catch(error){
        return res.json({success : false , message : error.message})
    }
}

export const updateBoard = async(req,res)=>{
    try{
        const board = await Board.findById(req.params.id)
        if(!board){
            return res.json({success : false , message : "Board not found"})
        }

        if(board.createdBy.toString() !== req.user.id){
            return res.json({success : false , message : "You are not authorised to update this board"})
        }

        board.title = req.body.title || board.title
        board.description = req.body.description || board.description

        await board.save()

        return res.json({success : true , message : "Board updated successfully !"})
    }catch(error){
        return res.json({success : false , message : error.message})
    }
}

export const deleteBoard = async(req,res)=>{
    try{
        const board = await Board.findById(req.params.id)

        if(!board){
            return res.json({success : false , message : "Board not found"})
        }

        if(board.createdBy.toString() !== req.user.id){
            return res.json({success : false , message : "You are not allowed to delete this board"})
        }

        await Board.findByIdAndDelete(req.params.id)

        return res.json({success : true , message : "Board deleted successfully"})
    }catch(error){
        return res.json({success : false , message : error.message})
    }
}