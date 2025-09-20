import express from "express";
import { createWriteStream } from "fs";
import { rename, rm } from "fs/promises";
import path from "path";

const router = express.Router();

//serving dynamic files
router.get ("/*" ,(req,res,next) => {
  const filename  = req.params[0];
  const filePath = path.join("/" , filename);
  console.log(("opened file : " , filename));
  if(req.query.action === "download") {
    res.set("Content-Disposition", `attachment; filename="${filename}"`);
  }

  res.sendFile(path.resolve(`${process.cwd()}/storage/${filePath}`));
 });


//upload files
router.post ("/*", (req, res) => {
  try{
  const fileLocation= `./storage/${path.join("/" , req.params[0])}`; //defining the path where the file will be stored
  const writeStream = createWriteStream(fileLocation); //creating a writable stream to the specified file path
  req.pipe(writeStream); //piping the request data to the writable stream
  res.json({message :`uploaded file : ${req.params[0]}`})
  }catch(err){
    res.json({message : "upload failed"});
  }});

//delete file
router.delete("/*", async (req, res) => {
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
router.patch("/*", async (req, res) => {
  const { 0: filename } = req.params;
  const { newFilename } = req.body;
  try{
    await rename(`./storage/${filename}`,`./storage/${newFilename}`);
    return res.json({message: "File renamed successfully"});
  }catch(err){
    return res.json(err.message);
  }

});



export default router;