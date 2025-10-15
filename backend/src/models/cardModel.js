import mongoose from "mongoose";
import List from "./listModel";
import User from "./userModel";

const cardSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true,
    },
    description : String,
    listID : {
        type : Schema.type.ObjectId,
        ref : List
    },
    createdBy : {
        type : Schema.type.ObjectId,
        red : User
    },
    position : {
        type : Number,
        required : true
    },
    timestamp : true
})

const Card = mongoose.model("Card",cardSchema)

export default Card