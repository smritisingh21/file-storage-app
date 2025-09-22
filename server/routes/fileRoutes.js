import express from "express";
import { createWriteStream } from "fs";
import { rename, rm ,writeFile} from "fs/promises";
import path from "path";

import filesData from "../filesDB.json" with {type:"json"}

const router = express.Router();

// Create
router.post("/:filename",async (req, res) => {
  const { filename } = req.params;
  const id = crypto.randomUUID();
  const extension = path.extname(filename);
  const fullFileName = `${id}${extension}`;
  const writeStream = createWriteStream(`./storage/${fullFileName}`);
  req.pipe(writeStream);
  req.on("end", async () => {
    filesData.push({
      id,
      extension,
      name: filename
    })
    console.log(filesData);
    await writeFile('./filesDB.json', JSON.stringify(filesData))
    res.json({ message: "File Uploaded" });
  });
});

//Read
router.get ("/:id" ,(req,res,next) => {
  const {id}  = req.params;
  const fileData = filesData.find((file)=> file.id===id);
  if(req.query.action === "download") {
    res.set("Content-Disposition", `attachment; filename="${fileData.extension}"`);
  }

  res.sendFile(`${process.cwd()}/storage/${id}${fileData.extension}`,(err) =>{
    if(err){
      res.json({error : "File not found"})
    }
  })
 });

//Update
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const fileData = filesData.find((file)=> file.id===id);
  console.log(fileData);
   await writeFile('./filesDB.json', JSON.stringify(fileData))
  res.json({message : "renamed"});

});

//Delete
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



export default router;