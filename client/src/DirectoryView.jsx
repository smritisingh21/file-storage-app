import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DirectoryHeader from "./components/DirectoryHeader";
import CreateDirectoryModal from "./components/CreateDirectoryModal";
import RenameModal from "./components/RenameModal";
import DirectoryList from "./components/DirectoryList";

function DirectoryView() {
  const BASE_URL = "http://localhost:8000";
  const { dirId } = useParams();
  const navigate = useNavigate();

  const [directoryName, setDirectoryName] = useState("My Drive");
  const [directoriesList, setDirectoriesList] = useState([]);
  const [filesList, setFilesList] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [showCreateDirModal, setShowCreateDirModal] = useState(false);
  const [newDirname, setNewDirname] = useState("New Folder");
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameType, setRenameType] = useState(null); 
  const [renameId, setRenameId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const fileInputRef = useRef(null);
  const [uploadQueue, setUploadQueue] = useState([]); 
  const [uploadXhrMap, setUploadXhrMap] = useState({}); 
  const [progressMap, setProgressMap] = useState({}); 
  const [isUploading, setIsUploading] = useState(false); 
  const [activeContextMenu, setActiveContextMenu] = useState(null);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });

  async function handleFetchErrors(response) {
    if (!response.ok) {
      let errMsg = `Request failed with status ${response.status}`;
      try {
        const data = await response.json();
        if (data.error) errMsg = data.error;
      } catch (_) {}
      throw new Error(errMsg);
    }
    return response;
  }

  async function getDirectoryItems() {
    setErrorMessage("");
    try {
      const response = await fetch(`${BASE_URL}/directory/${dirId || ""}`, {
        credentials: "include",
      });
      if (response.status === 401) { navigate("/login"); return; }
      await handleFetchErrors(response);
      const data = await response.json();
      setDirectoryName(dirId ? data.name : "My Drive");
      setDirectoriesList([...data.directories].reverse());
      setFilesList([...data.files].reverse());
    } catch (error) { setErrorMessage(error.message); }
  }

  useEffect(() => {
    getDirectoryItems();
    setActiveContextMenu(null);
  }, [dirId]);

  function getFileIcon(filename) {
    const ext = filename.split(".").pop().toLowerCase();
    switch (ext) {
      case "pdf": return "pdf";
      case "png": case "jpg": case "jpeg": case "gif": return "image";
      case "mp4": case "mov": case "avi": return "video";
      case "zip": case "rar": case "tar": case "gz": return "archive";
      case "js": case "jsx": case "ts": case "tsx": case "html": case "css": case "py": case "java": return "code";
      default: return "alt";
    }
  }

  function handleRowClick(type, id) {
    if (type === "directory") { navigate(`/directory/${id}`); } 
    else { window.location.href = `${BASE_URL}/file/${id}`; }
  }

  function handleFileSelect(e) {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;
    const newItems = selectedFiles.map((file) => {
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      return { file, name: file.name, id: tempId, isUploading: false };
    });
    setFilesList((prev) => [...newItems, ...prev]);
    newItems.forEach((item) => { setProgressMap((prev) => ({ ...prev, [item.id]: 0 })); });
    setUploadQueue((prev) => [...prev, ...newItems]);
    e.target.value = "";
    if (!isUploading) {
      setIsUploading(true);
      processUploadQueue([...uploadQueue, ...newItems.reverse()]);
    }
  }

  function processUploadQueue(queue) {
    if (queue.length === 0) {
      setIsUploading(false);
      setUploadQueue([]);
      setTimeout(() => { getDirectoryItems(); }, 1000);
      return;
    }
    const [currentItem, ...restQueue] = queue;
    setFilesList((prev) => prev.map((f) => f.id === currentItem.id ? { ...f, isUploading: true } : f ));
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE_URL}/file/${dirId || ""}`, true);
    xhr.withCredentials = true;
    xhr.setRequestHeader("filename", currentItem.name);
    xhr.upload.addEventListener("progress", (evt) => {
      if (evt.lengthComputable) {
        const progress = (evt.loaded / evt.total) * 100;
        setProgressMap((prev) => ({ ...prev, [currentItem.id]: progress }));
      }
    });
    xhr.addEventListener("load", () => { processUploadQueue(restQueue); });
    setUploadXhrMap((prev) => ({ ...prev, [currentItem.id]: xhr }));
    xhr.send(currentItem.file);
  }

  function handleCancelUpload(tempId) {
    const xhr = uploadXhrMap[tempId];
    if (xhr) xhr.abort();
    setUploadQueue((prev) => prev.filter((item) => item.id !== tempId));
    setFilesList((prev) => prev.filter((f) => f.id !== tempId));
    setProgressMap((prev) => { const { [tempId]: _, ...rest } = prev; return rest; });
    setUploadXhrMap((prev) => { const copy = { ...prev }; delete copy[tempId]; return copy; });
  }

  async function handleDeleteFile(id) {
    setErrorMessage("");
    try {
      const response = await fetch(`${BASE_URL}/file/${id}`, { method: "DELETE", credentials: "include" });
      await handleFetchErrors(response);
      getDirectoryItems();
    } catch (error) { setErrorMessage(error.message); }
  }

  async function handleDeleteDirectory(id) {
    setErrorMessage("");
    try {
      const response = await fetch(`${BASE_URL}/directory/${id}`, { method: "DELETE", credentials: "include" });
      await handleFetchErrors(response);
      getDirectoryItems();
    } catch (error) { setErrorMessage(error.message); }
  }

  async function handleCreateDirectory(e) {
    e.preventDefault();
    setErrorMessage("");
    try {
      const response = await fetch(`${BASE_URL}/directory/${dirId || ""}`, {
        method: "POST",
        headers: { dirname: newDirname },
        credentials: "include",
      });
      await handleFetchErrors(response);
      setNewDirname("New Folder");
      setShowCreateDirModal(false);
      getDirectoryItems();
    } catch (error) { setErrorMessage(error.message); }
  }

  function openRenameModal(type, id, currentName) {
    setRenameType(type);
    setRenameId(id);
    setRenameValue(currentName);
    setShowRenameModal(true);
  }

  async function handleRenameSubmit(e) {
    e.preventDefault();
    setErrorMessage("");
    try {
      const url = renameType === "file" ? `${BASE_URL}/file/${renameId}` : `${BASE_URL}/directory/${renameId}`;
      const response = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(renameType === "file" ? { newFilename: renameValue } : { newDirName: renameValue }),
        credentials: "include",
      });
      await handleFetchErrors(response);
      setShowRenameModal(false);
      setRenameValue("");
      setRenameType(null);
      setRenameId(null);
      getDirectoryItems();
    } catch (error) { setErrorMessage(error.message); }
  }

  function handleContextMenu(e, id) {
    e.stopPropagation(); e.preventDefault();
    if (activeContextMenu === id) { setActiveContextMenu(null); } 
    else { setActiveContextMenu(id); setContextMenuPos({ x: e.clientX - 110, y: e.clientY }); }
  }

  useEffect(() => {
    const handleDocumentClick = () => setActiveContextMenu(null);
    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, []);

  const combinedItems = [
    ...directoriesList.map((d) => ({ ...d, isDirectory: true })),
    ...filesList.map((f) => ({ ...f, isDirectory: false })),
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8">
        
        {/* Error Alert */}
        {errorMessage && errorMessage !== "Directory not found or you do not have access to it!" && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm animate-in fade-in slide-in-from-top-2">
            <span className="text-xl font-bold">⚠️</span>
            <p className="text-sm font-medium">{errorMessage}</p>
          </div>
        )}

        {/* Dynamic Header Component */}
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <DirectoryHeader
            directoryName={directoryName}
            onCreateFolderClick={() => setShowCreateDirModal(true)}
            onUploadFilesClick={() => fileInputRef.current.click()}
            fileInputRef={fileInputRef}
            handleFileSelect={handleFileSelect}
            disabled={errorMessage === "Directory not found or you do not have access to it!"}
          />
        </div>

        {/* Content Section */}
        <main className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
          {combinedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-4 text-6xl opacity-20">📂</div>
              <p className="text-lg font-medium text-slate-400">
                {errorMessage === "Directory not found or you do not have access to it!" 
                  ? "Access Denied or Directory Missing" 
                  : "This folder is empty"}
              </p>
              <p className="text-sm text-slate-400">Upload files to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <DirectoryList
                items={combinedItems}
                handleRowClick={handleRowClick}
                activeContextMenu={activeContextMenu}
                contextMenuPos={contextMenuPos}
                handleContextMenu={handleContextMenu}
                getFileIcon={getFileIcon}
                isUploading={isUploading}
                progressMap={progressMap}
                handleCancelUpload={handleCancelUpload}
                handleDeleteFile={handleDeleteFile}
                handleDeleteDirectory={handleDeleteDirectory}
                openRenameModal={openRenameModal}
                BASE_URL={BASE_URL}
              />
            </div>
          )}
        </main>
      </div>

      {/* Modals (Logic triggers remains same) */}
      {showCreateDirModal && (
        <CreateDirectoryModal
          newDirname={newDirname}
          setNewDirname={setNewDirname}
          onClose={() => setShowCreateDirModal(false)}
          onCreateDirectory={handleCreateDirectory}
        />
      )}

      {showRenameModal && (
        <RenameModal
          renameType={renameType}
          renameValue={renameValue}
          setRenameValue={setRenameValue}
          onClose={() => setShowRenameModal(false)}
          onRenameSubmit={handleRenameSubmit}
        />
      )}
    </div>
  );
}

export default DirectoryView;