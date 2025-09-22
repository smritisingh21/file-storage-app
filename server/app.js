import express from "express";
import cors from "cors";
import fileRoutes from "./routes/fileRoutes.js"
import folderRoutes from "./routes/folderRoutes.js"

const app = express();

app.use(express.json()); //middleware to parse JSON bodies
app.use(cors()); //middleware to enable CORS

app.use("/file" , fileRoutes);
app.use("/directory" , folderRoutes)


app.listen(8080 , () =>{
  console.log("server is listening on port 8080");
})
