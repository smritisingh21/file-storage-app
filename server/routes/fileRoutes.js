import express from "express";
import { createWriteStream } from "fs";
import { rename, rm ,writeFile} from "fs/promises";
import path from "path";
import directoriesData from "../directoriesDB.json" with {type:"json"}
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

  const { parentDirId} = req.headers || directoriesData[0].id; //parentDirid is sent by the user || root directory 
  req.on("end", async () => {
    filesData.push({
      id,
      extension,
      name: filename,
      parentDirId 
    })
    //adding file id into directory data
    const parentDirdata = directoriesData.find((data ) =>{
      data.id === parentDirId;
    })
    parentDirdata.files.push(id);
    console.log(filesData);
    await writeFile('./filesDB.json', JSON.stringify(filesData))
    res.json({ message: "File Uploaded" });
  });
});

//Read
router.get ("/:id" ,(req,res,next) => {
  const {id}  = req.params;
  const fileData = filesData.find((file)=> file.id=== id);
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
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const fileIndex = filesData.findIndex((file)=> file.id === id); //find fileIndex in db, array returned
  const fileData = filesData[fileIndex]; //

  try {
  filesData.splice(file , 1);  //removing file

  const parentDir = directoriesData.find((directory) => directory.id === fileData.parentDirId ); //finding parent directory
  parentDir.files.filter((fileId) => fileId != id) //removing file from parent Directory
  
  //saving
  await writeFile('./directoriesDB.json', JSON.stringify(directoriesData));
  await writeFile('./filesDB.json', JSON.stringify(fileData));
    return res.json({message :"Deleted successfully"});
  } catch (err) {
    return res.json(err.message);
  }
});



export default router;