"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Upload, Folder, Home, ArrowLeft, Search, Image as ImageIcon, FileIcon, CheckCircle, Sparkles } from "lucide-react";

function getThumbnailUrl(url) {
  if (!url) return url;
  if (url.includes("res.cloudinary.com")) {
    return url.replace("/upload/", "/upload/c_fill,w_200,h_200,g_auto,q_auto,f_auto/");
  }
  if (url.startsWith("/")) {
    return url;
  }
  return `/api/media/proxy?url=${encodeURIComponent(url)}`;
}

const PRESET_SAMPLE_IMAGES = [
  { id: "sample-1", fileName: "Nature & Exercise", url: "/images/hero_exercise.png", mimeType: "image/png" },
  { id: "sample-2", fileName: "Ayurveda Wellness", url: "/images/ayurveda.png", mimeType: "image/png" },
  { id: "sample-3", fileName: "ISSN Publication", url: "/images/ISSN_BARCODE.png", mimeType: "image/png" },
  { id: "sample-4", fileName: "AHP Brand Logo", url: "/images/AHP_LOGOV3.png", mimeType: "image/png" },
];

export default function MediaPickerModal({ onSelect, onClose, title = "Select from Media Library", filter = "images", siteId }) {
  const effectiveSiteId = siteId || (typeof window !== "undefined" ? localStorage.getItem("x-site-id") : "") || process.env.NEXT_PUBLIC_SITE_ID || "AHP";
  
  const [currentFolderId, setCurrentFolderId] = useState("root");
  const [folderHistory, setFolderHistory] = useState([{ id: "root", name: "Media Library" }]);

  const [media, setMedia] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState([]);

  const [search, setSearch] = useState("");
  const [hoveredId, setHoveredId] = useState(null);

  const [page, setPage] = useState(1);
  const [totalMedia, setTotalMedia] = useState(0);

  const loadContents = useCallback(async (pageNum = 1) => {
    if (pageNum === 1) setLoading(true);
    try {
      const fetchPromises = [
        fetch(`/api/media?folderId=${currentFolderId}&limit=50&page=${pageNum}`, {
          headers: {
            "x-site-id": effectiveSiteId,
          },
        }),
      ];

      if (pageNum === 1) {
        fetchPromises.push(
          fetch(`/api/media/folders?parentId=${currentFolderId}`, {
            headers: {
              "x-site-id": effectiveSiteId,
            },
          })
        );
      }

      const responses = await Promise.all(fetchPromises);
      const mediaRes = responses[0];
      const foldersRes = responses.length > 1 ? responses[1] : null;

      const mediaData = await mediaRes.json();
      setTotalMedia(mediaData.total || 0);

      let items = mediaData.data ?? (Array.isArray(mediaData) ? mediaData : []);

      if (filter === "images") {
        items = items.filter((m) => m.mimeType?.startsWith("image/"));
      }

      if (pageNum === 1) {
        setMedia(items);
        if (foldersRes) {
          const foldersData = await foldersRes.json();
          setFolders(foldersData.folders || []);
        }
      } else {
        setMedia((prev) => [...prev, ...items]);
      }
    } catch (err) {
      console.error("MediaPickerModal load error:", err);
    } finally {
      if (pageNum === 1) setLoading(false);
    }
  }, [currentFolderId, filter, effectiveSiteId]);

  useEffect(() => {
    setPage(1);
    loadContents(1);
  }, [loadContents]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadContents(nextPage);
  };

  const navigateToFolder = (folder) => {
    setCurrentFolderId(folder.id);
    setFolderHistory((prev) => [...prev, { id: folder.id, name: folder.name }]);
  };

  const navigateToBreadcrumb = (index) => {
    const target = folderHistory[index];
    setCurrentFolderId(target.id);
    setFolderHistory((prev) => prev.slice(0, index + 1));
  };

  const navigateBack = () => {
    if (folderHistory.length <= 1) return;
    navigateToBreadcrumb(folderHistory.length - 2);
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);
    setUploadProgress(files.map((f) => ({ name: f.name, status: "pending" })));

    const folderIdVal = currentFolderId === "root" ? null : currentFolderId;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress((prev) =>
        prev.map((p, idx) => (idx === i ? { ...p, status: "uploading" } : p))
      );

      try {
        const formData = new FormData();
        formData.append("file", file);
        if (folderIdVal) formData.append("folderId", folderIdVal);

        const res = await fetch("/api/media/upload", {
          method: "POST",
          headers: {
            "x-site-id": effectiveSiteId,
          },
          body: formData,
        });
        if (!res.ok) throw new Error("Upload failed");

        setUploadProgress((prev) =>
          prev.map((p, idx) => (idx === i ? { ...p, status: "done" } : p))
        );
      } catch {
        setUploadProgress((prev) =>
          prev.map((p, idx) => (idx === i ? { ...p, status: "error" } : p))
        );
      }
    }

    e.target.value = "";
    setUploading(false);
    setUploadProgress([]);
    await loadContents(1);
  };

  const filteredMedia = media.filter((m) =>
    !search.trim() || m.fileName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[88vh] flex flex-col z-10 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <ImageIcon size={18} className="text-[#0f7c85]" />
            <h3 className="text-sm font-extrabold text-slate-800">{title}</h3>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0f7c85] hover:bg-[#0c6b73] text-white text-xs font-extrabold rounded-xl transition cursor-pointer shadow-sm">
              <Upload size={14} />
              <span>{uploading ? "Uploading..." : "Upload New Image"}</span>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
              />
            </label>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-900 rounded-xl transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Upload progress strip */}
        {uploadProgress.length > 0 && (
          <div className="px-5 py-2 bg-teal-50 border-b border-teal-100 flex gap-3 flex-wrap shrink-0">
            {uploadProgress.map((p, i) => (
              <span key={i} className={`text-2xs font-semibold px-2 py-0.5 rounded-full border ${
                p.status === "done" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                p.status === "error" ? "bg-rose-50 text-rose-700 border-rose-200" :
                p.status === "uploading" ? "bg-teal-100 text-teal-700 border-teal-300 animate-pulse" :
                "bg-slate-100 text-slate-500 border-slate-200"
              }`}>
                {p.status === "done" ? "✓ " : p.status === "error" ? "✗ " : ""}{p.name}
              </span>
            ))}
          </div>
        )}

        {/* Breadcrumb + Search bar */}
        <div className="px-5 py-2.5 flex items-center gap-3 border-b bg-white shrink-0">
          {currentFolderId !== "root" && (
            <button onClick={navigateBack} className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
              <ArrowLeft size={14} />
            </button>
          )}

          <div className="flex items-center gap-1 flex-wrap text-xs min-w-0 flex-1">
            {folderHistory.map((f, idx) => (
              <span key={f.id} className="flex items-center gap-1">
                {idx > 0 && <span className="text-slate-300">/</span>}
                <button
                  onClick={() => navigateToBreadcrumb(idx)}
                  className={`font-bold hover:text-[#0f7c85] transition-colors ${
                    idx === folderHistory.length - 1 ? "text-slate-800 pointer-events-none" : "text-slate-400"
                  }`}
                >
                  {f.id === "root" ? <span className="flex items-center gap-1"><Home size={12} /> Root</span> : f.name}
                </button>
              </span>
            ))}
          </div>

          <div className="relative shrink-0">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search images..."
              className="pl-7 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#0f7c85] w-40"
            />
          </div>
        </div>

        {/* Stock Sample Presets Bar */}
        <div className="px-5 py-2.5 bg-slate-100/70 border-b border-slate-200 flex items-center gap-3 overflow-x-auto shrink-0">
          <span className="text-[10px] font-extrabold text-[#0f7c85] uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
            <Sparkles size={12} /> Stock Banner Presets:
          </span>
          <div className="flex items-center gap-2">
            {PRESET_SAMPLE_IMAGES.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelect(preset)}
                className="px-2.5 py-1 bg-white hover:bg-[#0f7c85] hover:text-white border border-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition-all shadow-2xs whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
              >
                <img src={preset.url} alt={preset.fileName} className="w-4 h-4 rounded object-cover" />
                {preset.fileName}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 bg-slate-50">
          {loading ? (
            <div className="py-20 text-center text-xs font-bold text-slate-400">Loading media library...</div>
          ) : (
            <div className="space-y-6">
              {folders.length > 0 && !search && (
                <div className="space-y-2">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Folders</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {folders.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => navigateToFolder(f)}
                        className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-xl hover:border-[#0f7c85] hover:shadow-xs text-left transition-all group"
                      >
                        <Folder className="h-6 w-6 text-amber-500 fill-amber-400 shrink-0" />
                        <div className="min-w-0">
                          <span className="block text-xs font-extrabold text-slate-800 truncate">{f.name}</span>
                          <span className="block text-[10px] text-slate-400">{f._count?.media || 0} files</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Media Grid */}
              <div className="space-y-2">
                {folders.length > 0 && !search && (
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Files</p>
                )}
                {filteredMedia.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-500 border-2 border-dashed border-slate-200 rounded-2xl bg-white space-y-3">
                    <p className="font-bold">No custom uploads found in this folder.</p>
                    <p className="text-[11px] text-slate-400">Click <strong>&quot;Upload New Image&quot;</strong> above or select one of the Stock Banner Presets.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {filteredMedia.map((m) => {
                      const isImage = m.mimeType?.startsWith("image/");
                      const isHovered = hoveredId === m.id;
                      return (
                        <button
                          key={m.id}
                          onClick={() => onSelect(m)}
                          onMouseEnter={() => setHoveredId(m.id)}
                          onMouseLeave={() => setHoveredId(null)}
                          className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-slate-200 hover:border-[#0f7c85] bg-white transition-all hover:shadow-md focus:outline-none cursor-pointer"
                          title={m.fileName}
                        >
                          {isImage ? (
                            <img
                              src={getThumbnailUrl(m.secureUrl || m.url)}
                              alt={m.altText || m.fileName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-100">
                              <FileIcon className="h-8 w-8 text-slate-400" />
                            </div>
                          )}

                          <div className={`absolute inset-0 bg-[#0f7c85]/80 flex flex-col items-center justify-center transition-opacity ${isHovered ? "opacity-100" : "opacity-0"}`}>
                            <CheckCircle className="h-6 w-6 text-white mb-1" />
                            <span className="text-[10px] text-white font-extrabold uppercase">Select</span>
                          </div>

                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="block text-[10px] text-white truncate font-medium">{m.fileName}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {media.length < totalMedia && !loading && !search && (
                  <div className="mt-6 flex justify-center pb-4">
                    <button
                      onClick={loadMore}
                      className="rounded-full bg-[#0f7c85] px-6 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-[#0c6b73] transition-all cursor-pointer"
                    >
                      Load More Items
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t bg-white flex items-center justify-between shrink-0">
          <p className="text-[11px] font-bold text-slate-400">
            {filteredMedia.length} {filter === "images" ? "image" : "file"}{filteredMedia.length !== 1 ? "s" : ""} available
          </p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-extrabold border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
