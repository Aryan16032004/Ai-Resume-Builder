import mongoose from "mongoose";

const connnectDB=async()=>{
    try {
      const connectionInstance=  await mongoose.connect(`${process.env.MONGODB_URI}`);
    //   console.log(connectionInstance);
      
      console.log(`\n MOngodb connected.`);
      
    } catch (error) {
        console.log("MONGODB connection error",error);
        process.exit(1)
    }
}

export default connnectDB