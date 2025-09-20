import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./App.css";
import { get } from "mongoose";

function DirectoryView() {
  const BASE_URL = "http://localhost:4000"; //server port
  const [directoryItems, setDirectoryItems] = useState([]);
  const [progress, setProgress] = useState(0);
  const [newFilename, setNewFilename] = useState("");
  const [title, setTitle] = useState("");
  const [newDirname, setNewDirname] = useState("");
  const { "*": dirPath} = useParams(); //destructuring frontend path

   
  
  async function getDirectoryItems() {
    const response = await fetch(`${BASE_URL}/directory/${dirPath}`);
    const {dirname , directoryItems} = await response.json()
    setTitle(dirname);
    setDirectoryItems(directoryItems);
  }

    useEffect(() => { 
    getDirectoryItems(); 
    }, [dirPath]);
     

  async function uploadFile(e) {
    const file = e.target.files[0]; //if user selects multiple files , then only firat file will be taken
    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST", //method
     `${BASE_URL}/files/${dirPath}/${file.name}`, //request BASE_URL
      true); //true for async

    xhr.addEventListener("load", () => {
      console.log(xhr.response);
      getDirectoryItems();
    });
    xhr.upload.addEventListener("progress", (e) => {
      const totalProgress = (e.loaded / e.total) * 100;
      setProgress(totalProgress.toFixed(2));
    });
    xhr.send(file); //sending the actual file as request body
    e.target.value = null; //to allow uploading the same file again if needed
    getDirectoryItems();
  }

  async function handleDelete(filename) {
    const response = await fetch(`${BASE_URL}/files/${filename}`, {
      method: "DELETE",
    });
    const data = await response.json(); //response from the server is in json format but here we are sending plain text
    getDirectoryItems();
  }

  async function renameFile(oldFilename) {
    console.log({ oldFilename, newFilename });
    setNewFilename(oldFilename);
  }

  async function saveFilename(oldFilename) {
    setNewFilename(oldFilename);
    const response = await fetch(`${BASE_URL}/files/${oldFilename}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" }, //only now express.json() middleware will work on the server
      body: JSON.stringify({ newFilename }),
    });
    const data = await response.text();
    console.log(data);
    setNewFilename("");
    getDirectoryItems();
  }
  async function handleCreateDirectory(e){
    e.preventDefault();
    const url = `${BASE_URL}/directory${dirPath ? "/" + dirPath : ""}/${newDirname}`;
    console.log(url);
    const response = await fetch(url , {
        method : "POST"
      })
      const data= await response.json();
      console.log(data);
      setNewDirname("");
      getDirectoryItems();
  }

  return (
    <>
     
      <p>Progress: {progress}%</p>
      <br/>
      
      <b>Upload your files</b>
      <br/>
      <br/>
      <input type="file" onChange={uploadFile}/>
      <br/>
      <br/>
      <form onSubmit={handleCreateDirectory}  >
        <input 
        placeholder="New Folder" 
        type="text" 
        onChange = {(e) => setNewDirname(e.target.value)} 
        value= {newDirname} >
      </input>
      <button>Create</button>
      </form>
      <br/>
       <input
             type="text"
             onChange={(e) => setNewFilename(e.target.value)}
              value={newFilename}
              />
          <h3>{ title }</h3>
        {
          directoryItems.map(({ name, isDir}) => ( //destructuring name from backend
          <div key={name}>
          
          {name}{" "}
          
          {isDir && <Link to={`./${name}`}>Open</Link>}
          { !isDir &&  
          <a href={`${BASE_URL}/files/${dirPath}/${name}?action=open`}>
              Open
            </a>}{" "}
          { !isDir &&  //remove download button for directories
          <a href={`${BASE_URL}/files/${dirPath}/${name}?action=download`}>
              Download
            </a>
          } 
          <button onClick={() => renameFile(name)}>Rename</button>
          <button onClick={() => saveFilename(name)}>Save</button>
          <button onClick={() => handleDelete(name)}>  Delete </button>
            
          <br/>
       
         </div>
          ))
       }
      
    </>
  );
}

export default DirectoryView;
