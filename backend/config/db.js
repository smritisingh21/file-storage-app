import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config(); 

const connectDB = async () =>{
    try{
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to database successfully");
    }catch(error){
        console.error("Could not connect to database" ,error);
        process.exit(1);

    }
}
process.on("SIGINT", async () => {
  await client.close();
  console.log("Database Disconnected!");
  process.exit(0);
});

export default connectDB;
