import dbConnect from "@/src/lib/dbConnect";
import UserModel from "@/src/model/User.model";
import  {z} from 'zod'
import { usernameValidation } from "@/src/schema/SignUp.schema";

const UsernameQuerySchema= z.object({
    username:usernameValidation
})

export async function GET(request:Request){
    try {
        await dbConnect();
        const {searchParams}= new URL(request.url)
        const queryParam={
            username:searchParams.get('username')
        }
        const result=UsernameQuerySchema.safeParse(queryParam)
        console.log(result)
        if(!result.success){
            const usernameErrors=result.error.format().username?._errors || []
            return Response.json({
                success:false,
                message: usernameErrors.length? usernameErrors.join(', '):
                'Invalid query parameters'
            },{
                status:400
            })
        }
        const {username}=result.data
        const existingUser=await UserModel.findOne({
            username,isVerified:true
        })
        if(existingUser){
            return Response.json({
                success:false,
                message:'username is already taken'
            },{
                status:400
            })
        }
        return Response.json({
                success:true,
                message:'username is unique'
            },{
                status:200
            })
    } catch (error) {  
        console.error("Error while checking uniqueness of username", error)
        return Response.json({
            success:false, message:"Error while checking"
        },{
            status:500
        })
    }
}