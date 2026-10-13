import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/src/lib/dbConnect";
import UserModel from "@/src/model/User.model";

export async function POST(request:Request){
    try {
        await dbConnect()

        const session= await getServerSession(authOptions)
        const user=session?.user
        if(!session || !user){
            return Response.json({
                success:false,
                message:'Not Authenticated'
            },{
                status:401
            })
        }
        const userId=user._id
        const {acceptMessages}=await request.json()
        const updatedUser= await UserModel.findByIdAndUpdate(userId,{isAccepting:acceptMessages})
        if(!updatedUser){
            return Response.json({
                success:false,
                message:'updating status failed'
            },{
                status:506
            })
        }
        return Response.json({
                success:true,
                message:'status updated successfully'
            },{
                status:200
            })
    } catch (error) {
        console.log("failed to update status of accepting messages of user")
        return Response.json({
            success:false,
            message:"failed to update status of accepting messages of user"+error
        },{
            status:500
        })
    }
}
export async function GET(request:Request){
    try {
        await dbConnect()

        const session= await getServerSession(authOptions)
        const user=session?.user
        if(!session || !user){
            return Response.json({
                success:false,
                message:'Not Authenticated'
            },{
                status:401
            })
        }
        const userId=user._id
        console.log(userId)
        const requestedUser=await UserModel.findById(userId)
        if(!requestedUser){
            return Response.json({
                success:false,
                message:'User not found'
            },{
                status:404
            })
        }
        return Response.json({
            success:true,
            isAccepting:requestedUser.isAccepting
        },{
            status:200
        })
    } catch (error) {
        console.log("failed to get status of accepting messages of user")
        return Response.json({
            success:false,
            message:"failed to get status of accepting messages of user"+error
        },{
            status:500
        })
    }
}