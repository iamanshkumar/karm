import Board from "../models/boardModel.js";
import Card from "../models/cardModel.js";
import List from "../models/listModel.js";

export const createCardById = async(req,res)=>{
    try{
        const {title , description } = req.body
        const {listid} = req.params
        const list = await List.findById(listid)

        if(!list){
            return res.json({success : false , message : "List not found"})
        }

        const board = await Board.findById(list.boardId)

        if(board.createdBy.toString()!==req.user.id){
            return res.json({success : false , message : "You are not authorised"})
        }

        if(!title){
            return res.json({success : false , message : "Title is required"})
        }

        const card = new Card({
            title,
            description,
            listID : listid,
            createdBy : req.user.id,
            position : list.cards.length
        })

        await card.save();
        list.cards.push(card._id)
        await list.save()
        return res.json({success : true , message : "Card created successfully" , card})

    }catch(error){
        return res.json({success : false , message : error.message})
    }
}

export const getCardsByList = async(req,res)=>{
    try{
        const {listid} = req.params
        const list = await List.findById(listid)

        if(!list){
            return res.json({success : false ,message: "List not found"})
        }

        const cards = await Card.find({listID : listid}).populate("createdBy", "username email").sort({ position: 1 })

        return res.json(cards)
    }catch(error){
        return res.json({success : false, message : error.message})
    }
}

export const getCardById = async(req,res)=>{
    try{
        const {id} = req.params
        const card = await Card.findById(id).populate("createdBy", "username email").populate("listID");

        if(!card){
            return res.json({success : false , message : "Card not found"})
        }

        return res.json(card)
    }catch(error){
        return res.json({success : false , message : error.message})
    }
}

export const updateCard = async(req,res)=>{
    try{
        const {id} = req.params
        const {title , description} = req.body

        const card = await Card.findById(id)

        if(!card){
            return res.json({success : false, message : "Card not found"})
        }

        if(card.createdBy.toString() !== req.user.id){
            return res.json({success : false, message : "You are not authorised"})
        }

        card.title = title || card.title
        card.description = description || card.description

        await card.save();

        return res.json({success : true , message : "Card updated successfully"})
    }catch(error){
        return res.json({success : false , message : error.message})
    }
}

export const deleteCard = async(req,res)=>{
    try{
        const {id} = req.params
        const card = await Card.findById(id)

        if(!card){
            return res.json({success : false, message : "Card not found"})
        }

        if(card.createdBy.toString() !== req.user.id){
            return res.json({success : false, message : "You are not authorised"})
        }

        await List.findByIdAndUpdate(
            card.listID,
            {$pull : {cards : card._id}}
        )

        await Card.findByIdAndDelete(id)


        return res.json({success : true,  message : "Card deleted successfully"})
    }catch(error){
        return res.json({success : false , message : error.message})
    }
}

// Expected moveCard controller
export const moveCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { listID, position } = req.body;
    
    const card = await Card.findByIdAndUpdate(
      id,
      { 
        listID: listID,  // Update the list
        position: position // Update the position
      },
      { new: true }
    ).populate('createdBy', 'name email');
    
    if (!card) {
      return res.json({ success: false, message: "Card not found" });
    }
    
    res.json({ success: true, card });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};