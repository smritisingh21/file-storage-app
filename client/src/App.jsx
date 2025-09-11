import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const URL = "http://localhost:4000"; //server port
  const [directoryItems, setDirectoryItems] = useState([]);
  const [progress, setProgress] = useState(0);
  const [newFilename, setNewFilename] = useState("");

    useEffect(() => { // on component mount
    getDirectoryItems(); 
    }, []);

  async function getDirectoryItems() {
    const response = await fetch(URL);
    const data = await response.json();
    setDirectoryItems(data);
  }


  async function uploadFile(e) {
    const file = e.target.files[0];
    const xhr = new XMLHttpRequest();
    xhr.open("POST", URL, true); //true for async
    xhr.setRequestHeader("filename", file.name); 
    xhr.addEventListener("load", () => {
      console.log(xhr.response);
      getDirectoryItems();
    });
    xhr.upload.addEventListener("progress", (e) => {
      const totalProgress = (e.loaded / e.total) * 100;
      setProgress(totalProgress.toFixed(2));
    });

    xhr.send(file);
    e.target.value = null; //to allow uploading the same file again if needed
  }

  async function handleDelete(filename) {
    const response = await fetch(URL, {
      method: "DELETE",
      body: filename,
    });
    const data = await response.text();
    console.log(data);
    getDirectoryItems();
  }

  async function renameFile(oldFilename) {
    console.log({ oldFilename, newFilename });
    setNewFilename(oldFilename);
  }

  async function saveFilename(oldFilename) {
    setNewFilename(oldFilename);
    const response = await fetch(URL, {
      method: "PATCH",
      body: JSON.stringify({ oldFilename, newFilename }),
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
          directoryItems.map((item, i) => (
          <div key={i}>
          {item} <a href={`${URL}${item}?action=open`}>Open</a>{" "}
          <a href={`${URL}${item}?action=download`}>Download</a>
          <button onClick={() => renameFile(item)}>Rename</button>
          <button onClick={() => saveFilename(item)}>Save</button>
          <button onClick={() => {handleDelete(item)}}>  Delete </button>
          <br />
         </div>
          ))
       }
      
    </>
  );
}

export default App;
