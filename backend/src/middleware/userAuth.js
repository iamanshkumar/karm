import jwt from "jsonwebtoken"
import User from "../models/userModel.js"

const userAuth = async(req , res , next)=>{
    const {token} = req.cookie

    if(!token){
        return res.json({success : false , message : "Not authorised , login again"})
    }

    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET)

        const user = await User.findById(decoded.id)
        if(!user){
            return res.json({success : false , message : "User not found"})
        }

        req.user = user

        next()
    }catch(error){
        return res.json({success : false , message : error.message})
    }
}

export default userAuth