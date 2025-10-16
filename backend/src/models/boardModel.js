import mongoose, { Schema } from "mongoose"
import User from "./userModel.js"
import List from "./listModel.js"

const boardSchema = new mongoose.Schema({
    title : {
        type : String ,
        required : true,
    },
    description : String,
    createdBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    lists : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "List"
        }
    ]
},{
    timestamps : true
})

const Board = mongoose.model("Board",boardSchema)

export default Board