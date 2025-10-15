import mongoose, { Schema } from "mongoose"
import User from "./userModel"
import List from "./listModel"

const boardSchema = new mongoose.Schema({
    title : {
        type : String ,
        required : true,
    },
    description : String,
    createdBy : {
        type : Schema.type.ObjectId,
        ref : User
    },
    timpestamps : true,
    lists : [
        {
            type : Schema.type.ObjectId,
            ref : List
        }
    ]
})

const Board = mongoose.model("Board",boardSchema)

export default Board