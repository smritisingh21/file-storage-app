import express from "express";
import { createWriteStream } from "fs";
import { mkdir, readdir, rename, rm, stat } from "fs/promises";
import cors from "cors";
import path, { dirname } from "path";

const app = express();

app.use(express.json()); //middleware to parse JSON bodies
app.use(cors()); //middleware to enable CORS


// Serving Dir Content
app.get("/directory?/*", async (req, res) => { //multiple level
  const{ 0 : dirname}  = req.params;
  console.log("directory name:", dirname);

  try{ 
  const fullDirPath = `./storage/${dirname ? dirname : ""}`
  const filesList = await readdir(fullDirPath);
  const directoryItems = [];
    for(const item of filesList){
    const stats = await stat(`${fullDirPath}/${item}`) //to extract metadata of the file
    directoryItems.push(
       {name : item ,
       isDir : stats.isDirectory()
      })
  }
  res.json({dirname,directoryItems});
  
}catch(err){
  res.json({err : err.message})
}}); 

//serving dynamic files
app.get ("/files/?*" ,(req,res,next) => {
  const filename  = req.params[0];
  const filePath = path.join("/" , filename);
  console.log(("opened file : " , filename));

  if(req.query.action === "download") {
    res.set("Content-Disposition", `attachment; filename="${filename}"`);
  }
  res.sendFile(path.resolve(`${import.meta.dirname}/storage/${filePath}`));
 });

//directory creation
app.post("/directory/?*",async (req, res) => {
  const dirname = req.params[0];
  console.log("directory name:", dirname);
  const dirPath = path.join("/" , dirname);
  try{
    await mkdir(`./storage/${path.join("/" , dirname)}`);
    res.json({message:"directory created"})
  }catch(err){
    res.json({message : "directory not created " })
  }
  
});
//upload files
app.post ("/files/*", (req, res) => {
  try{
  const fileLocation= `./storage/${path.join("/" , req.params[0])}`; //defining the path where the file will be stored
  const writeStream = createWriteStream(fileLocation); //creating a writable stream to the specified file path
  req.pipe(writeStream); //piping the request data to the writable stream
  res.json({message :`uploaded file : ${req.params[0]}`})
  }catch(err){
    res.json({message : "upload failed"});
  }});

//delete file
app.delete("/files/*", async (req, res) => {
  const filename = req.params[0];
  console.log(`deleted file : ${filename}`);
  const filePath = `./storage/${filename}`;
  try {
    await rm(filePath  , {recursive:true}) //recursive: true is an option you can pass in some Node.js fs (filesystem) methods to tell them to work recursively through directories — meaning they will automatically create or delete parent folders as needed, or remove entire folder trees.
    return res.json({message :"Deleted successfully"});
  } catch (err) {
    return res.json(err.message);
  }
});

//rename
app.patch("/files/*", async (req, res) => {
  const { 0: filename } = req.params;
  const { newFilename } = req.body;
  try{
    await rename(`./storage/${filename}`,`./storage/${newFilename}`);
    return res.json({message: "File renamed successfully"});
  }catch(err){
    return res.json(err.message);
  }

});



app.listen(4000, () => {
  console.log(`Server started on http://localhost:4000`);
});
