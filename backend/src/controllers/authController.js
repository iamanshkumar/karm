import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"

export const signup = async (req,res)=>{

    const {username , email , password} = req.body

    if(!username || !email || !password){
        return res.json({success : false , message : "Missing details"})
    }

    try{
        const existingUser = await User.findOne({email})
        if(existingUser){
            return res.json({success : false , message : "User already exists"})
        }

        const hashedPassword = await bcrypt.hash(password,10)
        const user = new User({username , email , password : hashedPassword})
        await user.save()

        const token = jwt.sign({id : user._id} , process.env.JWT_SECRET , {expiresIn : "7d"})

        res.cookie("token",token , {
            httpOnly : true,
            secure : process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax",
            maxAge: 7*24*60*60*1000,
            path: '/'
        })

        return res.json({success : true , message : "User created successfully"})
    }catch(error){
        return res.send({success : false , message : error.message})
    }
}

export const login = async (req,res)=>{
    const {email , password} = req.body
    
    if(!email || !password){
        return res.json({success : false , message : "Details missing"})    
    }

    try{
        const user = await User.findOne({email})

        if(!user){
            return res.json({success : false , message : "Invalid email"})
        }

        const isMatch = await bcrypt.compare(password , user.password)

        if(!isMatch){
            return res.json({success : false , message : "Invalid password"})       
        }

        const token = jwt.sign({id : user._id} , process.env.JWT_SECRET , {expiresIn : "7d"} )


        res.cookie("token" , token , {
            httpOnly : true,
            secure : process.env.NODE_ENV === 'production',
            sameSite : process.env.NODE_ENV === 'production' ? "none" : "lax",
            maxAge : 7*24*60*60*1000,
            path: '/'
        })

        return res.json({success : true , message : "Logged in"})
    }catch(error){
        return res.json({success : false , message : error.message})
    }
}


export const logout = async (req,res)=>{
    try{
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            path: '/'
        })

        return res.json({success : true , message : "Logged out"})
    }catch(error){
        return res.send({success : false , message : error.message})
    }
}

export const isAuthenticated = async(req,res)=>{
    try{
        return res.json({success : true})
    }catch(error){
        return res.json({success : false, message :error.message})
    }
}