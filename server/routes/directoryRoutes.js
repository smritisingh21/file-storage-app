import express from "express";
import { mkdir } from "fs/promises";
import path from "path";
import directoriesData from "../directoriesDB.json" with {type:"json"};
import filesData from "../filesDB.json" with {type:"json"};


const router = express.Router();

// Serving Dir Content
router.get("/:id?", async (req, res) => { //using id 
  const{ id } = req.params;
  try{
    if(!id){
    const directoryData = directoriesData[0];
    const files = directoryData.files.map((fileId) => 
      filesData.find((file) => file.id === fileId)
    )
    res.json({...directoryData , files})
  }
  else{
    const directoryData = directoriesData.find((dir) =>dir.id === id ); //find directory 
    res.json(directoryData);
  }
  }catch(err){
     return res.status(500).json({ error: err.message }); 

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



