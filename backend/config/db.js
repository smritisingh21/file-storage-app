import mongoose from "mongoose";

const connectDB = async () =>{
    try{
        await mongoose.connect(
            "mongodb+srv://smritiiisinghh_db_user:URaScLhSLmd4IQiD@cluster0.24iuytj.mongodb.net/?appName=Cluster0");
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
