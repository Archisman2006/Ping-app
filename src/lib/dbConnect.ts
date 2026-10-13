import mongoose from 'mongoose'

type connectionObject={
    isConnected?: number
}

const connection: connectionObject ={}

async function dbConnect(): Promise<void> { 
    if(connection.isConnected && mongoose.connection.readyState === 1){
        console.log("Already Connected to Database")
        return
    }
    try{
        const db= await mongoose.connect(process.env.MONGODB_URI || '',{})
        
        connection.isConnected=db.connections[0].readyState
        console.log("DB connected Successfully")
    }
    catch(error){
        console.log("Database connection failed ",error)
        throw error
    }
}
export default dbConnect