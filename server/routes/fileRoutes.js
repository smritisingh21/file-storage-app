import express from "express";
import { createWriteStream } from "fs";
import { rename, rm, writeFile } from "fs/promises";
import path from "path";
import directoriesData from '../directoriesDB.json' with {type: "json"}
import filesData from '../filesDB.json' with {type: "json"}


const router = express.Router();



// Read
router.get("/:id", (req, res) => {
  const {id} = req.params
  const fileData = filesData.find((file) => file.id === id)

  if(!fileData){
    return res.status(404).json({message :"file not found"})
  }
  if (req.query.action === "download") {
    res.set("Content-Disposition", `attachment; filename=${fileData.name}`);
  }
  res.sendFile(`${process.cwd()}/storage/${id}${fileData.extension}`, (err) => {
    // console.log(err);
    if (!res.headersSent) {
      res.json({ error: "File not found!" });
    }
  });
});

// Create
router.post("/:parentDirId?", (req, res) => {
  const parentDirId = req.params.parentDirId || directoriesData[0].id
  const filename = req.headers.filename || "untitled";
  const id = crypto.randomUUID();
  const extension = path.extname(filename);
  const fullFileName = `${id}${extension}`;
  const writeStream = createWriteStream(`./storage/${fullFileName}`);
  req.pipe(writeStream);
  req.on("end", async () => {
    filesData.push({
      id,
      extension,
      name: filename,
      parentDirId,
    })
    const parentDirData = directoriesData.find((directoryData) => directoryData.id === parentDirId)
    parentDirData.files.push(id);
    try{
    await writeFile('./filesDB.json', JSON.stringify(filesData, null, 2))
    await writeFile('./directoriesDB.json', JSON.stringify(directoriesData, null, 2))
    res.json({ message: "File Uploaded" });
    }catch(err){
      return res.json({message:"Something went wrong in uploading the file"})
    }
   
  });
});

// Update
router.patch("/:id", async (req, res) => {
  const {id} = req.params;
  const fileData = filesData.find((file) => file.id === id)
  fileData.name = req.body.newFilename ;

  if(!req.body.newFilename ) {
    return res.json({message :"Please enter a name."})
  }

  try{
    await writeFile('./filesDB.json', JSON.stringify(filesData, null, 2))
    res.json({ message: "Renamed" });
  }catch(err){
    res.status(500).json({ message: "Something went wrong in renaming the file" });
    next(err); //global middleware handles this
  }
  
});

// Delete
router.delete("/:id", async (req, res,next) => {
  const id = req.params.id;
  const fileIndex = filesData.findIndex((file) => file.id === id)
  console.log("file index: ",fileIndex);
  if(fileIndex == -1){
    return res.status(404).json({message :"File not found!!!"})
  }
  const fileData = filesData[fileIndex];
  
  console.log("file data: ", fileData);
  try {
    await rm(`./storage/${id}${fileData.extension}`, { recursive: true });
    filesData.splice(fileIndex, 1)
    const parentDirData = directoriesData.find((directoryData) => directoryData.id === fileData.parentDirId)
    parentDirData.files = parentDirData.files.filter((fileId) => fileId !== id)
    console.log(parentDirData.files);
    await writeFile('./filesDB.json', JSON.stringify(filesData, null, 2))
    await writeFile('./directoriesDB.json', JSON.stringify(directoriesData, null, 2))
    res.json({ message: "File Deleted Successfully" });
  } catch (err) {
    res.status(500).json({message : err.message});
  }
});

export default router;
