import dbConnect from "@/src/lib/dbConnect";
import UserModel from "@/src/model/User.model";
import  {z} from 'zod'
import { authOptions } from '../../auth/[...nextauth]/options'
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
export async function DELETE(request:Request){
    try {
        await dbConnect();
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
        const userId=LoggedInuser?._id
        const url = new URL(request.url);
        const pathname = url.pathname;
        const messageId=pathname.split('/').filter(Boolean).pop()
        console.log("message id is: ",messageId)
        const updateResult = await UserModel.updateOne(
            { _id: userId},
            { $pull: { messages: { _id: messageId } } }
        );
        if (updateResult.modifiedCount === 0) {
            return Response.json(
                { success: false, message: "Message not found or already deleted" },
                { status: 404 }
            );
        }
        return Response.json({
                success:true,
                message:'message deleted successfully'
            },{
                status:200
            })
    } catch (error) {
        return Response.json({
                success:false,
                message:'Unexpected Error occured while deleting message '+error
            },{
                status:500
            })
    }
}