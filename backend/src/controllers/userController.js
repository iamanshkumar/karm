import User from "../models/userModel.js";

export const getUserData = async(req,res)=>{
    try{
        const userId = req.user.id
        const user = await User.findById(userId)

        if(!user){
            return res.json({success : false , message : "User not found"})
        }

        return res.json({success : true , UserData : user})
    }catch(error){
        return res.json({success : false , message : error.message})
    }
}