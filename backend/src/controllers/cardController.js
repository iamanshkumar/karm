import Board from "../models/boardModel.js";
import Card from "../models/cardModel.js";
import List from "../models/listModel.js";

export const createCardById = async (req, res) => {
  try {
    const { title, description } = req.body;
    const { listid } = req.params;

    const list = await List.findById(listid);
    if (!list) return res.json({ success: false, message: "List not found" });

    const board = await Board.findById(list.boardId);
    if (board.createdBy.toString() !== req.user.id)
      return res.json({ success: false, message: "You are not authorised" });

    if (!title) return res.json({ success: false, message: "Title is required" });

    const card = new Card({
      title,
      description,
      listID: listid,
      createdBy: req.user.id,
      position: list.cards.length,
    });

    await card.save();

    list.cards.push(card._id);
    await list.save();

    return res.json({
      success: true,
      message: "Card created successfully",
      card,
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};


export const getCardsByList = async (req, res) => {
  try {
    const { listid } = req.params;

    const list = await List.findById(listid);
    if (!list) return res.json({ success: false, message: "List not found" });

    const cards = await Card.find({ listID: listid })
      .populate("createdBy", "username email")
      .sort({ position: 1 });

    return res.json(cards);
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};


export const getCardById = async (req, res) => {
  try {
    const { id } = req.params;

    const card = await Card.findById(id)
      .populate("createdBy", "username email")
      .populate("listID")
      .populate("comments.author", "username")
      .populate("activity.user", "username");

    if (!card) return res.json({ success: false, message: "Card not found" });

    return res.json({ success: true, card });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};


export const updateCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const card = await Card.findById(id);
    if (!card) return res.json({ success: false, message: "Card not found" });

    if (card.createdBy.toString() !== req.user.id)
      return res.json({ success: false, message: "You are not authorised" });

    card.title = title || card.title;
    card.description = description || card.description;

    card.activity.push({
      type: "edit",
      user: req.user.id,
      targetId: id,
      meta: { title, description },
    });

    await card.save();

    return res.json({ success: true, message: "Card updated successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};


export const deleteCard = async (req, res) => {
  try {
    const { id } = req.params;

    const card = await Card.findById(id);
    if (!card) return res.json({ success: false, message: "Card not found" });

    if (card.createdBy.toString() !== req.user.id)
      return res.json({ success: false, message: "You are not authorised" });

    await List.findByIdAndUpdate(card.listID, { $pull: { cards: card._id } });
    await Card.findByIdAndDelete(id);

    return res.json({ success: true, message: "Card deleted successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};


export const moveCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { listID, position } = req.body;

    const card = await Card.findByIdAndUpdate(
      id,
      { listID, position },
      { new: true }
    ).populate("createdBy", "username email");

    if (!card) return res.json({ success: false, message: "Card not found" });

    // Log activity
    card.activity.push({
      type: "move",
      user: req.user.id,
      targetId: id,
      meta: { listID, position },
    });

    await card.save();

    res.json({ success: true, card });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


export const addComments = async (req, res) => {
  try {
    const { id } = req.params; // card ID
    const { text } = req.body;

    if (!text || !text.trim())
      return res.json({ success: false, message: "Comment cannot be empty" });

    const card = await Card.findById(id);
    if (!card) return res.json({ success: false, message: "Card not found" });

    const comment = {
      text,
      author: req.user.id, // REQUIRED
      createdAt: new Date(),
    };

    card.comments.push(comment);

    card.activity.push({
      type: "comment",
      user: req.user.id,
      targetId: id,
      meta: { text },
    });

    await card.save();

    const populated = await card.populate("comments.author", "username");

    return res.json({
      success: true,
      comment: populated.comments[populated.comments.length - 1],
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};


export const getComments = async (req, res) => {
  try {
    const { id } = req.params;

    const card = await Card.findById(id).populate("comments.author", "username");

    if (!card) return res.json([]);

    return res.json(card.comments || []);
  } catch (error) {
    return res.json([]);
  }
};

export const updateComment = async(req,res)=>{
  try{
    const {id , commentId} = req.params;
    const {text} = req.body;

    if(!text || !text.trim()){
      return res.json ({success : false, message : "Comment text cannot be empty"})
    }

    const card = await Card.findById(id);
    if(!card){
      return res.json({success:  false , message : "Card not found"})
    }

    const comment = card.comments.find(c=>c._id.toString() === commentId)
    if(!comment){
      return res.json({success : false , message : "Comment not found"})
    }

    if(comment.author.toString() !==req.user._id.toString()){
      return res.json({success : false , message : "You can only edit your own comments"})
    }

    comment.text = text.trim()
    comment.updatedAt = new Date();

    card.activity.push({
      type : "edit_comment",
      user : req.user.id,
      targetId : id,
      meta : {commentId , text}
    })

    await card.save();

    const populated = await card.populate("comments.author", "username");
    const updatedComment = populated.comments.find(c=>c._id.toString() === commentId);


    return res.json({
      success : true,
      message : "Comment updated successfully",
      comment : updatedComment
    })
  }catch(error){
    return res.json({success : false , message : error.message})
  }
}


export const deleteComment = async (req,res)=>{
  try{
    const {id , commentId } = req.params;

    const card = await Card.findById(id);
    if(!card){
      return res.josn({success : false, message : "Card not found"})
    }

    const comment = card.comments.find(c=>c._id.toString() === commentId)
    if(!comment){
      return res.json({success : false, message: "Comment not found"})
    }

    if(comment.author.toString() !== req.user.id.toString()){
      return res.json({success : false, message:"You can only delete your own comments"})
    }

    card.comments = card.comments.filter(c=>c._id.toString() !== commentId)

    card.activity.push({
      type : "delete_comment",
      user: req.user.id,
      targetId : id,
      meta : {commentId}
    })

    await card.save();
    
    return res.json({success : true , message : "Comment deleted successfully"})
  }catch(error){
    return res.json({success : false, message : error.message})
  }
}

export const assignUserToCard = async (req, res) => {
  try {
    const { id } = req.params; // card ID
    const { userId } = req.body;

    const card = await Card.findById(id);
    if (!card)
      return res.json({ success: false, message: "Card not found" });

    if (!card.assignees.includes(userId)) {
      card.assignees.push(userId);
    }

    card.activity.push({
      type: "assign",
      user: req.user.id,
      targetId: id,
      meta: { assignee: userId },
    });

    await card.save();

    return res.json({ success: true, assignees: card.assignees });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const getActivity = async (req, res) => {
  try {
    const { id } = req.params; // card ID

    const card = await Card.findById(id)
      .populate("activity.user", "username email")
      .lean();

    if (!card)
      return res.json({ success: false, message: "Card not found" });

    return res.json({
      success: true,
      activity: card.activity || []
    });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
