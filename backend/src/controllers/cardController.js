import Board from "../models/boardModel.js";
import Card from "../models/cardModel.js";
import List from "../models/listModel.js";

/* ======================================================
    📌 CREATE CARD
======================================================= */
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

/* ======================================================
    📌 GET CARDS BY LIST
======================================================= */
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

/* ======================================================
    📌 GET SINGLE CARD
======================================================= */
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

/* ======================================================
    📌 UPDATE CARD
======================================================= */
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

/* ======================================================
    📌 DELETE CARD
======================================================= */
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

/* ======================================================
    📌 MOVE CARD (Drag and Drop)
======================================================= */
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

/* ======================================================
    📌 ADD COMMENT
======================================================= */
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

/* ======================================================
    📌 GET COMMENTS
======================================================= */
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

/* ======================================================
    📌 ASSIGN USER TO CARD
======================================================= */
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
