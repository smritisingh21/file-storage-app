import express from "express";
import { createWriteStream } from "fs";
import { rename } from "fs/promises";
import { readdir ,rm , stat  } from "fs/promises";
import cors from "cors";
import path from "path";

const app = express();

app.use(express.json()); //middleware to parse JSON bodies
app.use(cors()); //middleware to enable CORS


// Serving Dir Content
app.get("/directory/:dirname?", async (req, res) => {
  const {dirname} = req.params;
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
  res.json(directoryItems);
});

//serving dynamic files
app.get ("/files/:filename" ,(req,res,next) => {
  const { filename } = req.params; //here req.params contains the dynamic segments of the URL after the /
  if(req.query.action === "download") {
    res.set("Content-Disposition", `attachment; filename="${filename}"`);
  }
  const filePath = path.resolve(`./storage/${filename}`);
  res.sendFile(filePath)
 });
//upload 
app.post ("/files/:filename", (req, res) => {
  const {filename }= req.params; //getting the filename from the request headers
  console.log("file name : ", filename);
  const filePath = `./storage/${filename}`; //defining the path where the file will be stored
  const writeStream = createWriteStream(filePath); //creating a writable stream to the specified file path
  req.pipe(writeStream); //piping the request data to the writable stream

  req.on("end", () => {
    res.json({ message: "File uploaded successfully" });
  });

    req.on("error", (err) => {
    console.error(err);
    res.status(500).json({ error: "File upload failed" });
  });
});

//delete file
app.delete("/files/:filename", async (req, res) => {
  const { filename } = req.params;
  console.log(filename);
  const filePath = `./storage/${filename}`;
  try {
    await rm(filePath);
    return res.json({message :"File deleted successfully"});
  } catch (err) {
    return res.json(err.message);
  }
});

//rename
app.patch("/files/:filename", async (req, res) => {
  const { filename } = req.params;
  const { newFilename } = req.body;
  try{
    await rename(`./storage/${filename}`,`./storage/${newFilename}`);
    return res.json({message: "File renamed successfully"});
  }catch(err){
    return res.json(err.message);
  }

});

//directory creation
app.post("/:directory", (req, res) => {
  const dirName = req.query.dirname;
  console.log(dirName);
});

app.listen(4000, () => {
  console.log(`Server started on http://localhost:4000`);
});
