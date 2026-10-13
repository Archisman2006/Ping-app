import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/src/lib/dbConnect";
import UserModel from "@/src/model/User.model";
import mongoose from "mongoose";
import {Message} from "@/src/model/User.model";

export async function POST(request:Request){
    try {
        await dbConnect()
        const {username,content}=await request.json()
        const user=await UserModel.findOne({username})
        if(!user){
            return Response.json({
                success:false,
                message:'User not found'
            },{
                status:404
            })
        }
        if(!user.isAccepting){
            return Response.json({
                success:false,
                message:'User is not accepting Messages at this moment' 
            },{
                status:400
            })
        }
        const newMessage={content,createdAt:new Date()}
        user.messages.push(newMessage as Message)
        await user.save()
        return Response.json({
                success:true,
                message:'message sent successfully'
            },{
                status:200
            })
    } catch (error) {
        return Response.json({
                success:false,
                message:'Unexpected Error occured while sending message '+error
            },{
                status:500
            })
    }
}