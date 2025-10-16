import mongoose from "mongoose";
import Board from "./boardModel.js";
import Card from "./cardModel.js";

const listSchema = new mongoose.Schema({
    title : {
        type: String,
        required : true,
    },
    boardId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Board",
        required : true
    },
    position : {
        type : Number,
        required : true
    },
    cards : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Card"
    }],
},
{
    timestamps : true,
})

const List = mongoose.model("List",listSchema)

export default List