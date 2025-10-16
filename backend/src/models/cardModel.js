import mongoose from "mongoose";
import List from "./listModel.js";
import User from "./userModel.js";

const cardSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true,
    },
    description : String,
    listID : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "List"
    },
    createdBy : {
        type : mongoose.Schema.Types.ObjectId,
        red : "User"
    },
    position : {
        type : Number,
        required : true
    },
},
{
    timestamps : true
})

const Card = mongoose.model("Card",cardSchema)

export default Card