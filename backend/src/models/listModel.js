import mongoose from "mongoose";
import Board from "./boardModel";
import Card from "./cardModel";

const listSchema = new mongoose.Schema({
    title : {
        type: String,
        required : true,
    },
    boardId : {
        type : Schema.type.ObjectId,
        ref : Board,
        required : true
    },
    position : {
        type : Number,
        required : true
    },
    cards : [{
        type : Schema.type.ObjectId,
        ref : Card
    }],
    timestamps : true
})

const List = mongoose.model("List",listSchema)

export default List