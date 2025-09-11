import express from "express";
import { createWriteStream } from "fs";
import { rename } from "fs/promises";
import { readdir ,rm  } from "fs/promises";

const app = express();

// Enabling CORS
app.use((req, res, next) => {
  res.set({
    "Access-Control-Allow-Origin" : "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH ,DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, filename",
  });
  // if (req.method === "OPTIONS") {
  //   return res.sendStatus(200).json({ message: "OK" }); //res.sendStatus(200) sends the response immediately and returns the response object, but it ends the response.
  // }
  next();
});
app.use(express.json()); //middleware to parse JSON bodies

// Serving Dir Content
app.get("/", async (req, res) => {
  const filesList = await readdir("./storage");
  console.log(filesList);
  res.json(filesList);
});

//serving dynamic files
app.get ("/:filename" ,(req,res,next) => {
  const { filename } = req.params; //here req.params contains the dynamic segments of the URL after the /
  if(req.query.action === "download") {
    res.set("Content-Disposition", `attachment; filename="${filename}"`);
  }
  res.sendFile(`./storage/${filename}`); //method to send files as response to the client 
});


//upload 
app.post ("/:filename", (req, res) => {
  const { filename } = req.params;
  const filePath = `./storage/${filename}`;
  const writeStream = createWriteStream(filePath);
  req.pipe(writeStream);

  req.on("end", () => {
    res.json({ message: "File uploaded successfully" });
  });

});

//delete file
app.delete("/:filename", async (req, res) => {
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
app.patch("/:filename", async (req, res) => {
  const { filename } = req.params;
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
