import mongoose from "mongoose";


const ConnectDB=async()=>{
    try{
       const connect=await mongoose.connect(process.env.MONGO_URI as string)
       console.log(`MongoDB Connected: ${connect.connection.host}`);
    }
    catch(error){
        console.log(error)
        process.exit(1)
    }
}
export {ConnectDB}