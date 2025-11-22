import mongoose, { mongo } from "mongoose";
import List from "./listModel.js";
import User from "./userModel.js";

const commentSchema = new mongoose.Schema({
    text : {
        type : String,
        required : true
    },
    author : {
        type : mongoose.Schema.Types.ObjectId , ref : "User" , required : true
    },
    createdAt : {
        type:  Date,
        default : Date.now
    },
    updatedAt : {
        type : Date,
        default : Date.now
    }
})

const activitySchema = new mongoose.Schema({
    type : {
        type : String , required : true
    },
    user : {
        type : mongoose.Schema.Types.ObjectId , red : "User"
    },
    targetId : String,
    meta : mongoose.Schema.Types.Mixed,
    createdAt : {
        type: Date,
        default : Date.now
    }
})

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
        ref : "User"
    },
    position : {
        type : Number,
        required : true
    },
    comments : [commentSchema],
    assignees : [{type : mongoose.Schema.Types.ObjectId , ref : "User" , default : []}],
    attachments : [{url : String , filename : String , uploadedAt : Date}],
    activity : [activitySchema]
},
{
    timestamps : true
})

const Card = mongoose.model("Card",cardSchema)

export default Card