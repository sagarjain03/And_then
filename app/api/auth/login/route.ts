import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import {DecodedToken} from "@/types/decodedToken"
import {connectDB} from "@/db/dbconfig"

// Move connection inside POST handler
export async function POST(request: NextRequest){
    try {
        await connectDB() // Wait for connection
        
        const reqBody = await request.json()
        const {email, password} = reqBody

        if(!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" }, 
                { status: 400 }
            )
        }

        //check if user exists
        const user = await User.findOne({email})

        if(!user){
            return NextResponse.json({error: "Invalid credentials"}, {status: 400})
        }

        //check if password is correct
        const isMatch = await bcryptjs.compare(password, user.password)

        if(!isMatch){
            return NextResponse.json({error: "Invalid credentials"}, {status: 400})
        }

        const tokendata : DecodedToken= {
          id:user._id,
          username:user.username,
          email:user.email,
        }

      
    const token = jwt.sign(tokendata, process.env.JWT_SECRET!, { expiresIn: "1d" });

        
console.log("Gemini key last chars:", process.env.GOOGLE_GENERATIVE_AI_API_KEY ?.slice(-6));

       const response =  NextResponse.json({
            message: "Login successful",
            success: true,
            user
        })

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 86400, 
            path: '/'
        })

        return response
        


    } catch (error: any) {
        console.error("Login error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" }, 
            { status: 500 }
        )
    }
}