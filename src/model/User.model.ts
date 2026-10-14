import mongoose,{Schema,Document} from 'mongoose'

export interface Message extends Document{
    content: string,
    createdAt: Date
}

const MessageSchema: Schema<Message>=new Schema({
    content:{
        type: String,
        required:true
    },
    createdAt:{
        type: Date,
        required: true,
        default: Date.now
    }
})
export interface User extends Document{
    username?: string,
    email:string,
    password?:string,
    googleId?:string,
    verificationCode?:string,
    isVerified:boolean,
    verificationCodeExpiry?: Date,
    isAccepting:boolean,
    messages:Message[],
    resetPasswordToken?:string,
    resetPasswordExpiry?:Date,
}
const UserSchema: Schema<User>=new Schema({
    username:{
        type:String,
        required:false,
        trim:true,
        unique:true,
        sparse:true,
        lowercase:true
    },
    email:{
        type:String,
        required:[true,'email is required'],
        trim:true,
        unique:true,
        match:[/^[a-zA-Z0-9!#\(%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#\)%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/,
        'Use a valid email']
    },
    password:{
        type:String,
        required:false
    },
    googleId:{
        type:String,
        sparse:true
    },
    isVerified:{
        type:Boolean
    },
    verificationCode:{
        type:String
    },
    verificationCodeExpiry:{
        type:Date
    },
    isAccepting:{
        type:Boolean,
        default:true
    },
    messages:{
        type: [MessageSchema]
    },
    resetPasswordToken:{
        type:String,
    },
    resetPasswordExpiry:{
        type:Date
    }
})

const UserModel= (mongoose.models.User as mongoose.Model<User>) || 
mongoose.model<User>("User",UserSchema)

export default UserModel;