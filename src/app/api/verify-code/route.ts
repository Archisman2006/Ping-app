import dbConnect from "@/src/lib/dbConnect";
import UserModel from "@/src/model/User.model";

export async function POST(request:Request){
    try {
        await dbConnect()
        const {username,code}=await request.json()
        const decodedUsername=decodeURIComponent(username)
        const user= await UserModel.findOne({username:decodedUsername})
        if(!user){
            return Response.json({
                success:false,
                message:'No user exists with the given username'
            },{
                status:400
            })
        }
        const isCodeValid = user.verificationCode === code;
        const isCodeExpired = !user.verificationCodeExpiry || new Date() > user.verificationCodeExpiry;
        if(isCodeExpired || !isCodeValid){
            return Response.json({
                success:false,
                message:'Invalid Verification Code'
            },{
                status:400
            })
        }
        user.isVerified=true
        user.verificationCode=undefined
        user.verificationCodeExpiry=undefined
        await user.save()
        return Response.json({
            success:true,
            message:'User verified successfully'
        },{
            status:200
        })

    } catch (error) {
        console.error("Error while verifying code", error)
        return Response.json({
            success:false, message:"Error while verifying code"
        },{
            status:500
        })
    }
}