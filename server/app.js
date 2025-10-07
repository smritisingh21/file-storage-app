import express from "express";
import cors from "cors";
import fileRoutes from "./routes/fileRoutes.js"
import directoryRoutes from "./routes/directoryRoutes.js"
import userRoutes from "./routes/userRoutes.js"

const app = express();

app.use(express.json()); //middleware to parse JSON bodies
app.use(cors()); //middleware to enable CORS

app.use("/file" , fileRoutes);
app.use("/directory" , directoryRoutes)
app.use("/user" , userRoutes)

//global error handler
app.use((err , req, res ,next) =>{ 
  res.status(400).json("error occured") 
})


app.listen(4000, () =>{
  console.log("server is listening on port 4000");
})
