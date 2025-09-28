import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./App.css";

function DirectoryView() {
  const BASE_URL = "http://localhost:4000"; //server port
  const [directoryItems, setDirectoryItems] = useState([]);
  const [dirList, setDirList] = useState([]);
  const [fileList, setFilelist] = useState([]);
  const [progress, setProgress] = useState(0);
  const [newFilename, setNewFilename] = useState("");
  const [title, setTitle] = useState("");
  const [newDirname, setNewDirname] = useState("");
  const { "*": dirPath} = useParams(); //destructuring frontend path

   
  async function getDirectoryItems() {
    const response = await fetch(`${BASE_URL}/directory/${dirPath}`);
    const data = await response.json();
    setTitle(data.name)
    setDirList(data.directories);
    setFilelist(data.files)

  }

    useEffect(() => { 
    getDirectoryItems(); 
    }, [dirPath]);
     

  async function uploadFile(e) {
    const file = e.target.files[0]; //if user selects multiple files , then only firat file will be taken
    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST", //method
     `${BASE_URL}/file${dirPath}/${file.name}`, //request BASE_URL
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
    // getDirectoryItems();
    setDirList()
  }

  async function handleDelete(fileId) {
    const response = await fetch(`${BASE_URL}/file/${fileId}`, {
      method: "DELETE",
    });
    const data = await response.text(); //response from the server is in json format but here we are sending plain text
    console.log(data);
    getDirectoryItems();
  }

  async function renameFile(oldFilename) {
    console.log({ oldFilename, newFilename });
    setNewFilename(oldFilename);
  }

  async function saveFilename(fileId) {
    const response = await fetch(`${BASE_URL}/file/${fileId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" }, 
    });
    const data = await response.text();
    console.log(data);
    setNewFilename("");
    getDirectoryItems();
  }
  async function handleCreateDirectory(e){
    e.preventDefault();
    const url = `${BASE_URL}/directory/${dirPath || ""}`;
    console.log(url);
    const response = await fetch(url , {
        method : "POST",
        headers:{
          dirname : newDirname, //sending name in header
        }
      });
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
          fileList.map(({name , id}) => ( //destructuring from each item
          <div key={id}>
          {name}{" "}
          
          <a href={`${BASE_URL}/file/${dirPath}/${id}`}> Open</a>{" "}
          <a href={`${BASE_URL}/file/${dirPath}/${id}?action=download`}>Download</a>
          
          <button onClick={() => renameFile(name)}>Rename</button>
          <button onClick={() => saveFilename(id)}>Save</button>
          <button onClick={() => handleDelete(id)}>  Delete </button>
            
          <br/>
       
         </div>
          ))
       }
        {
          dirList.map(({name , id}) => ( //destructuring from each item
          <div key={id}>
          {name}{" "}
          
          <Link to={`${BASE_URL}/directory/${id}`}> Open</Link>{" "}
          <a href={`${BASE_URL}/directory/${id}?action=download`}>Download</a>
          
          <button onClick={() => renameFile(name)}>Rename</button>
          <button onClick={() => saveFilename(id)}>Save</button>
          <button onClick={() => handleDelete(id)}>  Delete </button>
            
          <br/>
       
         </div>
          ))
       }
      
    </>
  );
}

export default DirectoryView;
