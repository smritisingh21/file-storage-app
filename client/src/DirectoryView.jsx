import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./App.css";

function DirectoryView() {
  const BASE_URL = "http://localhost:4000"; //server port
  const [directoryItems, setDirectoryItems] = useState([]);
  const [progress, setProgress] = useState(0);
  const [newFilename, setNewFilename] = useState("");
  const { "*": dirPath} = useParams(); //destructuring frontend path

    useEffect(() => { // on component mount
    getDirectoryItems(); 
    }, []);

  async function getDirectoryItems() {
    const response = await fetch(`${BASE_URL}/directory/${dirPath}`,{
      method : 'GET'
    });
    const data = await response.json();
    setDirectoryItems(data);
  }


  async function uploadFile(e) {
    const file = e.target.files[0]; //if user selects multiple files , then only firat file will be taken
    console.log("file name : ", file.name);
    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST", //method
     `${BASE_URL}/files/${file.name}`, //request BASE_URL
      true); //true for async
    xhr.setRequestHeader("filename", file.name); 

    xhr.addEventListener("load", () => {
      console.log("File uploaded successfully");
      console.log(xhr.response);
      getDirectoryItems();
    });
    xhr.upload.addEventListener("progress", (e) => {
      const totalProgress = (e.loaded / e.total) * 100;
      setProgress(totalProgress.toFixed(2));
    });
    xhr.send(file); //sending the actual file as request body
    e.target.value = null; //to allow uploading the same file again if needed

  }

  async function handleDelete(filename) {
    const response = await fetch(`${BASE_URL}/files/${filename}`, {
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

  return (
    <>
      <h1>My Files</h1>
      <input type="file" onChange={uploadFile} />
      <input
        type="text"
        onChange={(e) => setNewFilename(e.target.value)}
        value={newFilename}
      />
      <p>Progress: {progress}%</p>
        {
          directoryItems.map(({name , isDir}) => ( //destructuring name from backend
          <div key={name}>
          
          {name}{" "}
          
          { isDir &&  //go to /images on opening a folder
          <a href={`./${name}`}>Open</a>

          } 
          
          { !isDir &&  //remove download button for directories
          <a href={`${BASE_URL}/files/${name}?action=download`}>Open</a>
          } {" "}
          { !isDir &&  //remove download button for directories
          <a href={`${BASE_URL}/files/${name}?action=download`}>Download</a>
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
