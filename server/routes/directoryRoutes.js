import express from "express";
import { writeFile } from "fs/promises";
import directoriesData from "../directoriesDB.json" with {type:"json"};
import filesData from "../filesDB.json" with {type:"json"};
import crypto from "node:crypto"

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
    const directories = directoryData.directories.map((dirId) =>  //populating directories to send in json to frontend
      directoriesData.find((dir) => dir.id === dirId)
    )
    res.json({...directoryData , files , directories})
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
router.post("/:parenDirId?",async (req, res) => {
  const parenDirId =req.params.parenDirId || directoriesData[0].id;
  const {dirname} = req.headers.dirname; //receiving name from header
  const id = crypto.randomUUID();
  console.log("directory name:", dirname);

  const parenDirectory = directoriesData.find((dir) => parenDirId === dir.id)  //find parentdir 
  parenDirectory.directories.push(id); //push the created directory id in its parentdirectory for reference

  directoriesData.push({
    dirname, 
    id, 
    parenDirId,
    files:[],
    directories:[]
  })

  try{
    await writeFile('./directoriesDB.json', JSON.stringify(directoriesData))
    res.status(200).json({message:"directory created"})
  }catch(err){
    res.status(404).json({message : "directory not created " })
  }
});

export default router;



