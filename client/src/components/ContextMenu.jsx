import { FaDownload, FaEdit, FaTrash, FaTimesCircle } from "react-icons/fa";

function ContextMenu({
  item,
  contextMenuPos,
  isUploadingItem,
  handleCancelUpload,
  handleDeleteFile,
  handleDeleteDirectory,
  openRenameModal,
  BASE_URL,
}) {
  // Common styles for all menu variations
  const menuStyles = {
    top: contextMenuPos.y,
    left: contextMenuPos.x,
  };

  // Tailwind Class Groups
  const containerClasses = "fixed z-[100] min-w-[180px] bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 animate-in fade-in zoom-in-95 duration-100";
  const itemClasses = "flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer transition-all font-medium";
  const dangerClasses = "flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 cursor-pointer transition-all font-medium";

  // 1. Directory context menu
  if (item.isDirectory) {
    return (
      <div className={containerClasses} style={menuStyles}>
        <div
          className={itemClasses}
          onClick={() => openRenameModal("directory", item.id, item.name)}
        >
          <FaEdit className="opacity-70" />
          Rename
        </div>
        <div className="my-1 border-t border-slate-100" />
        <div
          className={dangerClasses}
          onClick={() => handleDeleteDirectory(item.id)}
        >
          <FaTrash className="opacity-70" />
          Delete
        </div>
      </div>
    );
  }

  // 2. Uploading state (Limited Actions)
  if (isUploadingItem && item.isUploading) {
    return (
      <div className={containerClasses} style={menuStyles}>
        <div
          className={dangerClasses}
          onClick={() => handleCancelUpload(item.id)}
        >
          <FaTimesCircle className="opacity-70" />
          Cancel Upload
        </div>
      </div>
    );
  }

  // 3. Normal File context menu
  return (
    <div className={containerClasses} style={menuStyles}>
      <div
        className={itemClasses}
        onClick={() =>
          (window.location.href = `${BASE_URL}/file/${item.id}?action=download`)
        }
      >
        <FaDownload className="opacity-70" />
        Download
      </div>
      <div
        className={itemClasses}
        onClick={() => openRenameModal("file", item.id, item.name)}
      >
        <FaEdit className="opacity-70" />
        Rename
      </div>
      <div className="my-1 border-t border-slate-100" />
      <div
        className={dangerClasses}
        onClick={() => handleDeleteFile(item.id)}
      >
        <FaTrash className="opacity-70" />
        Delete
      </div>
    </div>
  );
}

export default ContextMenu;