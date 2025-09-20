import express from "express";
import { mkdir, readdir,  stat } from "fs/promises";
import path from "path";


const router = express.Router();

// Serving Dir Content
router.get("/?*", async (req, res) => { //multiple level
  
  const{ 0 : dirname}  = req.params;
  console.log("directory name:", dirname);

  try{ 
  const fullDirPath = `./storage/${dirname ?  dirname : ""}`
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

//directory creation
router.post("/*",async (req, res) => {
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

export default router;



