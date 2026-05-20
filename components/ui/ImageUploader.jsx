"use client";
import { useState, useRef, useCallback } from "react";
import { Upload, X, CheckCircle, AlertCircle, Loader, CloudUpload, Star, GripVertical, Link2 } from "lucide-react";

const MAX_MB   = 5;
const MAX_IMGS = 8;
const ALLOWED  = ["image/jpeg","image/jpg","image/png","image/webp","image/gif"];

// ─── Single upload helper ───────────────────────────────────────────────────
async function uploadFile(file, onProgress) {
  const err = !ALLOWED.includes(file.type)  ? "Sirf JPG, PNG, WEBP ya GIF allowed hai."
            : file.size > MAX_MB*1024*1024   ? `File bahut badi. Max ${MAX_MB}MB. Aapki: ${(file.size/1024/1024).toFixed(1)}MB`
            : null;
  if (err) throw new Error(err);

  const form = new FormData();
  form.append("file", file);

  // Fake progress while waiting
  let p = 10;
  const iv = setInterval(() => { p = Math.min(p+10, 80); onProgress(p); }, 300);
  try {
    const res  = await fetch("/api/upload", { method:"POST", body:form });
    clearInterval(iv);
    onProgress(95);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    onProgress(100);
    return data.url;
  } catch(e) {
    clearInterval(iv);
    throw e;
  }
}

// ─── Thumb component ────────────────────────────────────────────────────────
function Thumb({ url, index, isPrimary, onRemove, onSetPrimary, onDragStart, onDragOver, onDrop }) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => { e.preventDefault(); onDragOver(index); }}
      onDrop={(e)    => { e.preventDefault(); onDrop(index); }}
      className={`relative group aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all cursor-grab active:cursor-grabbing ${isPrimary ? "border-rose-500 shadow-md" : "border-stone-200 hover:border-rose-300"}`}
    >
      <img src={url} alt={`Product image ${index+1}`}
        className="w-full h-full object-cover"
        onError={(e) => { e.target.src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&q=60"; }} />

      {/* Primary badge */}
      {isPrimary && (
        <div className="absolute top-1.5 left-1.5 bg-rose-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
          <Star size={8} className="fill-white"/> Main
        </div>
      )}

      {/* Drag handle */}
      <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-md p-0.5">
        <GripVertical size={12} className="text-white"/>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex flex-col items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
        {!isPrimary && (
          <button type="button" onClick={() => onSetPrimary(index)}
            className="bg-white text-rose-600 text-[10px] font-bold px-2.5 py-1.5 rounded-full shadow hover:bg-rose-50 transition-colors flex items-center gap-1">
            <Star size={10}/> Main Set
          </button>
        )}
        <button type="button" onClick={() => onRemove(index)}
          className="bg-white text-red-500 text-[10px] font-bold px-2.5 py-1.5 rounded-full shadow hover:bg-red-50 transition-colors flex items-center gap-1">
          <X size={10}/> Hatao
        </button>
      </div>

      {/* Index number */}
      <div className="absolute bottom-1.5 right-1.5 bg-black/50 text-white text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
        {index+1}
      </div>
    </div>
  );
}

// ─── Upload progress tile ───────────────────────────────────────────────────
function UploadingTile({ progress, filename }) {
  return (
    <div className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-dashed border-rose-300 bg-rose-50 flex flex-col items-center justify-center gap-2 p-2">
      <Loader size={20} className="text-rose-500 animate-spin"/>
      <p className="text-[9px] text-rose-600 font-semibold text-center line-clamp-1">{filename}</p>
      <div className="w-full h-1.5 bg-rose-100 rounded-full overflow-hidden">
        <div className="h-full bg-rose-500 rounded-full transition-all duration-300" style={{ width:`${progress}%` }}/>
      </div>
      <p className="text-[9px] text-rose-400">{progress}%</p>
    </div>
  );
}

// ─── Add zone tile ──────────────────────────────────────────────────────────
function AddTile({ onClick, count, max, dragging }) {
  return (
    <div
      onClick={onClick}
      className={`aspect-[3/4] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all
        ${dragging ? "border-rose-400 bg-rose-50 scale-[1.02]" : "border-stone-200 hover:border-rose-300 hover:bg-rose-50/30"}`}
    >
      <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center">
        <CloudUpload size={20} className="text-rose-400"/>
      </div>
      <div className="text-center px-1">
        <p className="text-[10px] font-semibold text-stone-600">Add Image</p>
        <p className="text-[9px] text-stone-400 mt-0.5">{count}/{max}</p>
      </div>
    </div>
  );
}

// ─── Main MultiImageUploader ─────────────────────────────────────────────────
export default function ImageUploader({ value, onChange }) {
  // value = string[] (array of URLs)
  // onChange = (string[]) => void

  const images   = Array.isArray(value) ? value : (value && value.trim() ? [value] : []);
  const canAdd   = images.length < MAX_IMGS;

  const [uploading, setUploading] = useState([]);   // [{filename, progress}]
  const [error,     setError]     = useState("");
  const [dragging,  setDragging]  = useState(false);
  const [dragFrom,  setDragFrom]  = useState(null);
  const [urlInput,  setUrlInput]  = useState("");
  const [showUrl,   setShowUrl]   = useState(false);
  const inputRef = useRef(null);

  const update = useCallback((newImgs) => onChange(newImgs), [onChange]);

  // Upload one file → returns url
  const uploadOne = useCallback(async (file) => {
    const slot = { filename: file.name, progress: 0 };
    setUploading((p) => [...p, slot]);

    try {
      const url = await uploadFile(file, (pct) => {
        setUploading((p) => p.map((s) => s === slot ? {...s, progress:pct} : s));
      });
      return url;
    } finally {
      setUploading((p) => p.filter((s) => s !== slot));
    }
  }, []);

  const handleFiles = useCallback(async (files) => {
    setError("");
    const arr  = Array.from(files);
    const room = MAX_IMGS - images.length - uploading.length;
    if (room <= 0) { setError(`Max ${MAX_IMGS} images allowed.`); return; }
    const toProcess = arr.slice(0, room);
    if (arr.length > room) setError(`${arr.length - room} image${arr.length-room>1?"s":""} skip ki gayi — max ${MAX_IMGS} allowed.`);

    const results = await Promise.allSettled(toProcess.map((f) => uploadOne(f)));
    const urls = results.filter((r) => r.status === "fulfilled").map((r) => r.value);
    const errs = results.filter((r) => r.status === "rejected").map((r) => r.reason?.message);
    if (errs.length) setError(errs[0]);
    if (urls.length) update([...images, ...urls]);
  }, [images, uploading.length, update, uploadOne]);

  // Drop handler
  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    const files = e.dataTransfer.files;
    if (files?.length) handleFiles(files);
  }, [handleFiles]);

  // Remove image
  const remove = (i) => update(images.filter((_,idx) => idx !== i));

  // Set as primary (move to index 0)
  const setPrimary = (i) => {
    const next = [...images];
    const [item] = next.splice(i, 1);
    update([item, ...next]);
  };

  // Drag-to-reorder
  const onDragStart = (e, i)  => { setDragFrom(i); e.dataTransfer.effectAllowed="move"; };
  const onDragOver  = (i)      => {};
  const onDropThumb = (toIdx) => {
    if (dragFrom === null || dragFrom === toIdx) { setDragFrom(null); return; }
    const next = [...images];
    const [item] = next.splice(dragFrom, 1);
    next.splice(toIdx, 0, item);
    update(next);
    setDragFrom(null);
  };

  // URL input
  const addUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    if (images.length >= MAX_IMGS) { setError(`Max ${MAX_IMGS} images allowed.`); return; }
    update([...images, url]);
    setUrlInput("");
    setShowUrl(false);
    setError("");
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-stone-500">
          {images.length === 0
            ? "Koi image nahi — upload karo"
            : `${images.length} image${images.length>1?"s":""} · Pehli image main dikhai jaayegi`}
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={() => { setShowUrl((v)=>!v); setError(""); }}
            className="flex items-center gap-1 text-[10px] text-stone-400 hover:text-rose-500 transition-colors border border-stone-200 hover:border-rose-300 px-2 py-1 rounded-lg">
            <Link2 size={10}/> URL se
          </button>
          {canAdd && (
            <button type="button" onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1 text-[10px] text-rose-600 hover:text-rose-700 transition-colors border border-rose-200 hover:border-rose-400 bg-rose-50 px-2 py-1 rounded-lg font-semibold">
              <Upload size={10}/> Upload
            </button>
          )}
        </div>
      </div>

      {/* URL input */}
      {showUrl && (
        <div className="flex gap-2">
          <input type="url" value={urlInput} onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => { if (e.key==="Enter") { e.preventDefault(); addUrl(); }}}
            placeholder="https://..." className="input-field flex-1 text-xs" />
          <button type="button" onClick={addUrl} className="btn-primary px-3 py-2 text-xs">Add</button>
          <button type="button" onClick={() => setShowUrl(false)} className="text-stone-400 hover:text-stone-600"><X size={16}/></button>
        </div>
      )}

      {/* Hidden file input — multiple */}
      <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.webp,.gif"
        multiple className="hidden"
        onChange={(e) => { if (e.target.files?.length) { handleFiles(e.target.files); e.target.value=""; } }} />

      {/* Drop zone + grid */}
      <div
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        className={`border-2 border-dashed rounded-2xl transition-all duration-200 p-3 ${dragging ? "border-rose-400 bg-rose-50" : images.length===0 && uploading.length===0 ? "border-stone-200 hover:border-rose-300" : "border-stone-100"}`}
      >
        {images.length === 0 && uploading.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center py-10 gap-3 cursor-pointer" onClick={() => inputRef.current?.click()}>
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center">
              <CloudUpload size={28} className="text-rose-400"/>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-stone-700"><span className="text-rose-600">Click karo</span> ya drag & drop karo</p>
              <p className="text-xs text-stone-400 mt-1">JPG, PNG, WEBP, GIF · Max {MAX_MB}MB per image · Max {MAX_IMGS} images</p>
            </div>
          </div>
        ) : (
          /* Image grid */
          <div className="grid grid-cols-4 gap-2">
            {images.map((url, i) => (
              <Thumb key={url+i} url={url} index={i}
                isPrimary={i===0}
                onRemove={remove}
                onSetPrimary={setPrimary}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDrop={onDropThumb}
              />
            ))}
            {uploading.map((s, i) => <UploadingTile key={i} progress={s.progress} filename={s.filename}/>)}
            {canAdd && uploading.length === 0 && (
              <AddTile onClick={() => inputRef.current?.click()} count={images.length} max={MAX_IMGS} dragging={dragging}/>
            )}
          </div>
        )}
      </div>

      {/* Tips */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <p className="text-[10px] text-stone-400 flex items-center gap-1"><Star size={9} className="text-rose-400"/> Pehli image = main product image</p>
          <p className="text-[10px] text-stone-400">Drag karke order change karo · "Main Set" se primary badlo</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
          <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5"/>
          <p className="text-xs text-red-600 flex-1">{error}</p>
          <button type="button" onClick={() => setError("")}><X size={13} className="text-red-300 hover:text-red-500"/></button>
        </div>
      )}

      {/* Success count */}
      {images.length > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
          <CheckCircle size={13}/> {images.length} image{images.length>1?"s":""} ready
        </div>
      )}
    </div>
  );
}

// "use client";
// import { useState, useRef, useCallback } from "react";
// import { Upload, Link2, X, CheckCircle, AlertCircle, Loader, Copy, ExternalLink, RefreshCw, CloudUpload } from "lucide-react";

// const MAX_MB = 5;
// const ALLOWED = ["image/jpeg","image/jpg","image/png","image/webp","image/gif"];

// export default function ImageUploader({ value, onChange }) {
//   const [mode, setMode]         = useState("upload");
//   const [dragging, setDragging] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [error, setError]       = useState("");
//   const [copied, setCopied]     = useState(false);
//   const [urlInput, setUrlInput] = useState(value || "");
//   const inputRef = useRef(null);

//   const validate = (file) => {
//     if (!ALLOWED.includes(file.type)) return "Sirf JPG, PNG, WEBP ya GIF allowed hai.";
//     if (file.size > MAX_MB * 1024 * 1024) return `File bahut badi hai. Max ${MAX_MB}MB. Aapki: ${(file.size/1024/1024).toFixed(1)}MB`;
//     return null;
//   };

//   const handleFile = useCallback(async (file) => {
//     const err = validate(file);
//     if (err) { setError(err); return; }
//     setError("");
//     setUploading(true);
//     setProgress(10);

//     try {
//       const form = new FormData();
//       form.append("file", file);

//       // Simulate progress while waiting
//       const interval = setInterval(() => setProgress((p) => Math.min(p + 15, 85)), 400);

//       // Call our Next.js API route — server-side upload, no 401 ever
//       const res = await fetch("/api/upload", { method: "POST", body: form });
//       clearInterval(interval);
//       setProgress(95);

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Upload failed");

//       onChange(data.url);
//       setUrlInput(data.url);
//       setProgress(100);
//       setError("");
//     } catch (e) {
//       setError(e.message || "Upload failed. Check .env.local credentials.");
//     } finally {
//       setUploading(false);
//       setTimeout(() => setProgress(0), 600);
//     }
//   }, [onChange]);

//   const onDrop = (e) => {
//     e.preventDefault(); setDragging(false);
//     const file = e.dataTransfer.files?.[0];
//     if (file) handleFile(file);
//   };

//   const copyUrl = () => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000); };
//   const handleUrlSubmit = () => { if (urlInput.trim()) { onChange(urlInput.trim()); setError(""); } };
//   const clearImage = () => { onChange(""); setUrlInput(""); setError(""); if (inputRef.current) inputRef.current.value = ""; };

//   return (
//     <div className="space-y-3">
//       {/* Mode toggle */}
//       <div className="flex gap-1 bg-stone-100 p-1 rounded-xl w-fit">
//         {[{ id:"upload", label:"Upload File", icon:<Upload size={13}/> }, { id:"url", label:"Paste URL", icon:<Link2 size={13}/> }].map((m) => (
//           <button key={m.id} type="button" onClick={() => { setMode(m.id); setError(""); }}
//             className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${mode===m.id ? "bg-white text-rose-600 shadow-sm" : "text-stone-500 hover:text-stone-700"}`}>
//             {m.icon} {m.label}
//           </button>
//         ))}
//       </div>

//       {/* Upload mode */}
//       {mode === "upload" && (
//         <div
//           onDrop={onDrop}
//           onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
//           onDragLeave={() => setDragging(false)}
//           onClick={() => !uploading && inputRef.current?.click()}
//           className={`border-2 border-dashed rounded-2xl transition-all duration-200 ${dragging ? "border-rose-400 bg-rose-50 scale-[1.01]" : uploading ? "border-stone-200 bg-stone-50" : "border-stone-200 hover:border-rose-300 hover:bg-rose-50/30 cursor-pointer"}`}
//         >
//           <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.webp,.gif" className="hidden"
//             onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

//           <div className="p-8 text-center">
//             {uploading ? (
//               <div className="space-y-4">
//                 <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center mx-auto">
//                   <Loader size={24} className="text-rose-600 animate-spin" />
//                 </div>
//                 <div>
//                   <p className="text-sm font-semibold text-stone-700">Cloudinary pe upload ho raha hai…</p>
//                   <p className="text-xs text-stone-400 mt-1">Band mat karo</p>
//                 </div>
//                 <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
//                   <div className="h-full bg-gradient-to-r from-rose-500 to-pink-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
//                 </div>
//                 <p className="text-xs text-stone-400">{progress}%</p>
//               </div>
//             ) : value ? (
//               <div className="space-y-2">
//                 <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto">
//                   <CheckCircle size={24} className="text-emerald-600" />
//                 </div>
//                 <p className="text-sm font-semibold text-emerald-700">Upload ho gaya! ✅</p>
//                 <button type="button" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
//                   className="text-xs text-stone-400 hover:text-rose-500 flex items-center gap-1 mx-auto transition-colors">
//                   <RefreshCw size={11}/> Doosri image
//                 </button>
//               </div>
//             ) : (
//               <div className="space-y-3">
//                 <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto">
//                   <CloudUpload size={26} className="text-rose-400" />
//                 </div>
//                 <div>
//                   <p className="text-sm font-semibold text-stone-700">
//                     <span className="text-rose-600">Click karo</span> ya drag & drop karo
//                   </p>
//                   <p className="text-xs text-stone-400 mt-1">JPG, PNG, WEBP, GIF · Max {MAX_MB}MB</p>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* URL mode */}
//       {mode === "url" && (
//         <div className="flex gap-2">
//           <input type="url" value={urlInput} onChange={(e) => { setUrlInput(e.target.value); setError(""); }}
//             onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleUrlSubmit(); } }}
//             placeholder="https://images.unsplash.com/…" className="input-field flex-1 text-sm" />
//           <button type="button" onClick={handleUrlSubmit} disabled={!urlInput.trim()}
//             className="btn-primary px-4 py-2.5 text-sm disabled:opacity-40">Use</button>
//         </div>
//       )}

//       {/* Error */}
//       {error && (
//         <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-2.5">
//           <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
//           <div className="flex-1">
//             <p className="text-sm font-semibold text-red-700">Upload Error</p>
//             <p className="text-xs text-red-600 mt-1">{error}</p>
//             {error.toLowerCase().includes(".env") && (
//               <div className="mt-2 bg-red-100 rounded-lg p-2.5 font-mono text-[11px] text-red-800 space-y-1">
//                 <p>CLOUDINARY_API_SECRET=<span className="text-red-500">aapka_secret_yahan</span></p>
//                 <p className="text-red-600">→ cloudinary.com/console se copy karo</p>
//               </div>
//             )}
//           </div>
//           <button type="button" onClick={() => setError("")} className="text-red-300 hover:text-red-500"><X size={14}/></button>
//         </div>
//       )}

//       {/* Preview */}
//       {value && (
//         <div className="flex gap-3 items-start bg-stone-50 border border-stone-200 rounded-2xl p-3">
//           <img src={value} alt="Preview" className="w-16 h-20 object-cover rounded-xl border border-stone-200 flex-shrink-0 bg-stone-100"
//             onError={(e) => { e.target.style.display="none"; }} />
//           <div className="flex-1 min-w-0 space-y-2">
//             <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">Generated URL</p>
//             <p className="text-xs text-stone-600 break-all font-mono bg-white border border-stone-100 rounded-lg px-2.5 py-2 line-clamp-2">{value}</p>
//             <div className="flex gap-3 flex-wrap">
//               <button type="button" onClick={copyUrl} className="flex items-center gap-1 text-xs font-semibold text-stone-500 hover:text-rose-600 transition-colors">
//                 {copied ? <><CheckCircle size={12} className="text-emerald-500"/> Copied!</> : <><Copy size={12}/> Copy URL</>}
//               </button>
//               <span className="text-stone-200">|</span>
//               <a href={value} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-semibold text-stone-500 hover:text-rose-600 transition-colors">
//                 <ExternalLink size={12}/> Open
//               </a>
//               <span className="text-stone-200">|</span>
//               <button type="button" onClick={clearImage} className="flex items-center gap-1 text-xs font-semibold text-stone-400 hover:text-red-500 transition-colors">
//                 <X size={12}/> Remove
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
