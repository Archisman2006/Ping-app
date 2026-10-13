import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/src/lib/dbConnect";
import UserModel from "@/src/model/User.model";
import mongoose from "mongoose";
export async function GET(request:Request){
    try {
        await dbConnect()
        const session= await getServerSession(authOptions)
        const LoggedInuser=session?.user
        if(!session || !LoggedInuser){
            return Response.json({
                success:false,
                message:'Not Authenticated'
            },{
                status:401
            })
        }
        const userId=new mongoose.Types.ObjectId(LoggedInuser._id)
        //console.log(userId)
        const user=await UserModel.aggregate([
            {
                $match:{
                    _id:userId
                }
            },{
                $unwind:'$messages'
            },{
                $sort:{
                    'messages.createdAt':-1
                }
            },{
                $group:{
                    _id:'$_id',
                    messages:{
                        $push:'$messages'
                    }
                }
            }
        ])
        //console.log("user is: ",user)
        // if(!user || user.length==0){
        //     return Response.json({
        //         success:false,
        //         message:'user not found test'
        //     },{
        //         status:404
        //     })
        // }
        return Response.json({
                success:true,
                messages:user[0]?.messages || []
            },{
                status:200
            })
    } catch (error) {
        return Response.json({
                success:false,
                message:'An Unexpected Error occured while retrieving messages'
            },{
                status:500
            })
    }
}