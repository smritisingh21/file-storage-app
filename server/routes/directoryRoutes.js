import express from "express";
import { mkdir, readdir,  stat } from "fs/promises";
import path from "path";
import directoriesData from "../directoriesDB.json" with {type:"json"};


const router = express.Router();

// Serving Dir Content
router.get("/:id", async (req, res) => { //using id 
  const{ id } = req.params;
  if(!id){
    const dirData = directoriesData[0];
    
    const files = dirData.files.map((fileID) =>{
      filesData.find((file) =>  { file.id === fileID });
    })
    console.log(dirData);
    res.json({...dirData , files})
  }else{
    const directoryData = directoriesData.find((dir) => { dir.id === id} ); //find directory 
    res.json(directoryData);
  }


  
}); 

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



