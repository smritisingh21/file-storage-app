import express from "express";
import cors from "cors";
import fileRoutes from "./routes/fileRoutes.js"
import directoryRoutes from "./routes/directoryRoutes.js"

const app = express();

app.use(express.json()); //middleware to parse JSON bodies
app.use(cors()); //middleware to enable CORS

app.use("/file" , fileRoutes);
app.use("/directory" , directoryRoutes)


app.listen(4000, () =>{
  console.log("server is listening on port 4000");
})
