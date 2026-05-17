"use client";
import { useState, useRef, useCallback } from "react";
import { Upload, Link2, X, CheckCircle, AlertCircle, Loader, Copy, ExternalLink, RefreshCw, CloudUpload } from "lucide-react";

const MAX_MB = 5;
const ALLOWED = ["image/jpeg","image/jpg","image/png","image/webp","image/gif"];

export default function ImageUploader({ value, onChange }) {
  const [mode, setMode]         = useState("upload");
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError]       = useState("");
  const [copied, setCopied]     = useState(false);
  const [urlInput, setUrlInput] = useState(value || "");
  const inputRef = useRef(null);

  const validate = (file) => {
    if (!ALLOWED.includes(file.type)) return "Sirf JPG, PNG, WEBP ya GIF allowed hai.";
    if (file.size > MAX_MB * 1024 * 1024) return `File bahut badi hai. Max ${MAX_MB}MB. Aapki: ${(file.size/1024/1024).toFixed(1)}MB`;
    return null;
  };

  const handleFile = useCallback(async (file) => {
    const err = validate(file);
    if (err) { setError(err); return; }
    setError("");
    setUploading(true);
    setProgress(10);

    try {
      const form = new FormData();
      form.append("file", file);

      // Simulate progress while waiting
      const interval = setInterval(() => setProgress((p) => Math.min(p + 15, 85)), 400);

      // Call our Next.js API route — server-side upload, no 401 ever
      const res = await fetch("/api/upload", { method: "POST", body: form });
      clearInterval(interval);
      setProgress(95);

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      onChange(data.url);
      setUrlInput(data.url);
      setProgress(100);
      setError("");
    } catch (e) {
      setError(e.message || "Upload failed. Check .env.local credentials.");
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 600);
    }
  }, [onChange]);

  const onDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const copyUrl = () => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const handleUrlSubmit = () => { if (urlInput.trim()) { onChange(urlInput.trim()); setError(""); } };
  const clearImage = () => { onChange(""); setUrlInput(""); setError(""); if (inputRef.current) inputRef.current.value = ""; };

  return (
    <div className="space-y-3">
      {/* Mode toggle */}
      <div className="flex gap-1 bg-stone-100 p-1 rounded-xl w-fit">
        {[{ id:"upload", label:"Upload File", icon:<Upload size={13}/> }, { id:"url", label:"Paste URL", icon:<Link2 size={13}/> }].map((m) => (
          <button key={m.id} type="button" onClick={() => { setMode(m.id); setError(""); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${mode===m.id ? "bg-white text-rose-600 shadow-sm" : "text-stone-500 hover:text-stone-700"}`}>
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      {/* Upload mode */}
      {mode === "upload" && (
        <div
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl transition-all duration-200 ${dragging ? "border-rose-400 bg-rose-50 scale-[1.01]" : uploading ? "border-stone-200 bg-stone-50" : "border-stone-200 hover:border-rose-300 hover:bg-rose-50/30 cursor-pointer"}`}
        >
          <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.webp,.gif" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

          <div className="p-8 text-center">
            {uploading ? (
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center mx-auto">
                  <Loader size={24} className="text-rose-600 animate-spin" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-700">Cloudinary pe upload ho raha hai…</p>
                  <p className="text-xs text-stone-400 mt-1">Band mat karo</p>
                </div>
                <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-rose-500 to-pink-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-xs text-stone-400">{progress}%</p>
              </div>
            ) : value ? (
              <div className="space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto">
                  <CheckCircle size={24} className="text-emerald-600" />
                </div>
                <p className="text-sm font-semibold text-emerald-700">Upload ho gaya! ✅</p>
                <button type="button" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                  className="text-xs text-stone-400 hover:text-rose-500 flex items-center gap-1 mx-auto transition-colors">
                  <RefreshCw size={11}/> Doosri image
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto">
                  <CloudUpload size={26} className="text-rose-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-700">
                    <span className="text-rose-600">Click karo</span> ya drag & drop karo
                  </p>
                  <p className="text-xs text-stone-400 mt-1">JPG, PNG, WEBP, GIF · Max {MAX_MB}MB</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* URL mode */}
      {mode === "url" && (
        <div className="flex gap-2">
          <input type="url" value={urlInput} onChange={(e) => { setUrlInput(e.target.value); setError(""); }}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleUrlSubmit(); } }}
            placeholder="https://images.unsplash.com/…" className="input-field flex-1 text-sm" />
          <button type="button" onClick={handleUrlSubmit} disabled={!urlInput.trim()}
            className="btn-primary px-4 py-2.5 text-sm disabled:opacity-40">Use</button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-2.5">
          <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-700">Upload Error</p>
            <p className="text-xs text-red-600 mt-1">{error}</p>
            {error.toLowerCase().includes(".env") && (
              <div className="mt-2 bg-red-100 rounded-lg p-2.5 font-mono text-[11px] text-red-800 space-y-1">
                <p>CLOUDINARY_API_SECRET=<span className="text-red-500">aapka_secret_yahan</span></p>
                <p className="text-red-600">→ cloudinary.com/console se copy karo</p>
              </div>
            )}
          </div>
          <button type="button" onClick={() => setError("")} className="text-red-300 hover:text-red-500"><X size={14}/></button>
        </div>
      )}

      {/* Preview */}
      {value && (
        <div className="flex gap-3 items-start bg-stone-50 border border-stone-200 rounded-2xl p-3">
          <img src={value} alt="Preview" className="w-16 h-20 object-cover rounded-xl border border-stone-200 flex-shrink-0 bg-stone-100"
            onError={(e) => { e.target.style.display="none"; }} />
          <div className="flex-1 min-w-0 space-y-2">
            <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">Generated URL</p>
            <p className="text-xs text-stone-600 break-all font-mono bg-white border border-stone-100 rounded-lg px-2.5 py-2 line-clamp-2">{value}</p>
            <div className="flex gap-3 flex-wrap">
              <button type="button" onClick={copyUrl} className="flex items-center gap-1 text-xs font-semibold text-stone-500 hover:text-rose-600 transition-colors">
                {copied ? <><CheckCircle size={12} className="text-emerald-500"/> Copied!</> : <><Copy size={12}/> Copy URL</>}
              </button>
              <span className="text-stone-200">|</span>
              <a href={value} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-semibold text-stone-500 hover:text-rose-600 transition-colors">
                <ExternalLink size={12}/> Open
              </a>
              <span className="text-stone-200">|</span>
              <button type="button" onClick={clearImage} className="flex items-center gap-1 text-xs font-semibold text-stone-400 hover:text-red-500 transition-colors">
                <X size={12}/> Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
