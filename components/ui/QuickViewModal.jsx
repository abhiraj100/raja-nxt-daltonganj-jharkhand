"use client";
import { useState, useEffect } from "react";
import { X, ShoppingBag, Heart, Star, Truck, RotateCcw, Shield, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { useStore } from "@/context/StoreContext";

export default function QuickViewModal({ product, onClose, onCheckout }) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || "");
  const [selectedSize,  setSelectedSize]  = useState(product.sizes?.[0] || "");
  const [phase,         setPhase]         = useState("idle"); // idle | added
  const [imgIdx,        setImgIdx]        = useState(0);

  const wishlisted = isWishlisted(product.id);
  const discount   = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  const images = Array.isArray(product.images) && product.images.length
    ? product.images : product.image ? [product.image] : [];
  const currentImg = images[imgIdx] || "";

  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape")     onClose();
      if (e.key === "ArrowRight") setImgIdx((i) => Math.min(i+1, images.length-1));
      if (e.key === "ArrowLeft")  setImgIdx((i) => Math.max(i-1, 0));
    };
    document.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", fn); document.body.style.overflow = ""; };
  }, [onClose, images.length]);

  const handleAdd = () => {
    if (phase === "added") return;
    addToCart(product, selectedColor, selectedSize);
    setPhase("added");
    // Auto reset after 6s
    setTimeout(() => setPhase("idle"), 6000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <button onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-stone-100 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center transition-colors">
          <X size={18}/>
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2">
          {/* ── Image gallery ──────────────────────────────── */}
          <div className="flex flex-col">
            <div className="relative aspect-[3/4] sm:aspect-auto sm:min-h-[380px] bg-stone-50 rounded-t-3xl sm:rounded-l-3xl sm:rounded-tr-none overflow-hidden">
              <img src={currentImg} alt={product.name} className="w-full h-full object-cover"/>

              {images.length > 1 && (
                <>
                  <button onClick={() => setImgIdx((i) => Math.max(i-1, 0))} disabled={imgIdx===0}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow disabled:opacity-30 transition-all">
                    <ChevronLeft size={16}/>
                  </button>
                  <button onClick={() => setImgIdx((i) => Math.min(i+1, images.length-1))} disabled={imgIdx===images.length-1}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow disabled:opacity-30 transition-all">
                    <ChevronRight size={16}/>
                  </button>
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                    {images.map((_,i) => (
                      <button key={i} onClick={() => setImgIdx(i)}
                        className={`h-1.5 rounded-full transition-all ${i===imgIdx ? "bg-white w-4" : "bg-white/50 w-1.5"}`}/>
                    ))}
                  </div>
                </>
              )}

              {!product.inStock && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                  <span className="text-sm font-semibold text-stone-500 bg-white px-4 py-2 rounded-full border border-stone-200">Out of Stock</span>
                </div>
              )}
              {discount >= 10 && (
                <div className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">-{discount}% OFF</div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto bg-stone-50/50 sm:rounded-bl-3xl">
                {images.map((url,i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`flex-shrink-0 w-14 rounded-lg overflow-hidden border-2 transition-all ${i===imgIdx ? "border-rose-500 scale-105 shadow-md" : "border-transparent hover:border-stone-300"}`}
                    style={{ height:"4.5rem" }}>
                    <img src={url} alt={`View ${i+1}`} className="w-full h-full object-cover"/>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Details ────────────────────────────────────── */}
          <div className="p-6 sm:p-7 flex flex-col">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="text-xs text-rose-500 font-bold tracking-widest uppercase mb-1">{product.category}</p>
                <h2 className="font-display text-xl font-bold text-charcoal leading-tight">{product.name}</h2>
              </div>
              <button onClick={() => toggleWishlist(product.id)}
                className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all ${wishlisted ? "border-rose-600 bg-rose-600 text-white" : "border-stone-200 text-stone-400 hover:border-rose-400"}`}>
                <Heart size={15} className={wishlisted ? "fill-white" : ""}/>
              </button>
            </div>

            {product.rating > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-0.5">{Array.from({length:5}).map((_,i) => <Star key={i} size={13} className={i < Math.floor(product.rating) ? "text-amber-400 fill-amber-400" : "text-stone-200 fill-stone-200"}/>)}</div>
                <span className="text-sm text-stone-400">{product.rating} · {product.reviews} reviews</span>
              </div>
            )}

            <div className="flex items-baseline gap-3 mb-5">
              <span className="font-display text-2xl font-bold text-charcoal">₹{product.price.toLocaleString("en-IN")}</span>
              {product.originalPrice && <>
                <span className="text-sm text-stone-400 line-through">₹{product.originalPrice.toLocaleString("en-IN")}</span>
                <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">Save {discount}%</span>
              </>}
            </div>

            <p className="text-stone-500 text-sm leading-relaxed mb-5 line-clamp-3">{product.description}</p>

            {product.colors?.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-stone-600 uppercase tracking-widest mb-2">
                  Color: <span className="text-rose-600 normal-case font-bold">{selectedColor}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button key={c} onClick={() => setSelectedColor(c)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${selectedColor===c ? "border-rose-600 bg-rose-50 text-rose-700" : "border-stone-200 text-stone-600 hover:border-rose-300"}`}>{c}</button>
                  ))}
                </div>
              </div>
            )}

            {product.sizes?.length > 0 && product.sizes[0] !== "Free Size" && (
              <div className="mb-5">
                <p className="text-xs font-semibold text-stone-600 uppercase tracking-widest mb-2">Size</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button key={s} onClick={() => setSelectedSize(s)}
                      className={`w-10 h-10 rounded-xl text-xs font-bold border transition-all ${selectedSize===s ? "border-rose-600 bg-rose-600 text-white" : "border-stone-200 text-stone-600 hover:border-rose-300"}`}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-auto space-y-2.5">
              {/* ── "Added" state — show WhatsApp CTA ── */}
              {phase === "added" ? (
                <div className="rounded-2xl overflow-hidden border border-emerald-200 bg-emerald-50">
                  <div className="px-4 py-3 flex items-center gap-2">
                    <span className="text-lg">🎉</span>
                    <div>
                      <p className="text-sm font-semibold text-emerald-800">Bag mein add ho gaya!</p>
                      <p className="text-xs text-emerald-600">Order karne ke liye WhatsApp pe checkout karo</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { onCheckout?.(); onClose(); }}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors">
                    <MessageCircle size={16}/> Checkout on WhatsApp →
                  </button>
                  {/* onCheckout opens CheckoutModal with details form */}
                </div>
              ) : (
                <button onClick={handleAdd} disabled={!product.inStock}
                  className={`w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${!product.inStock ? "bg-stone-100 text-stone-400 cursor-not-allowed" : "bg-rose-600 text-white hover:bg-rose-700 shadow-md hover:shadow-lg active:scale-95"}`}>
                  <ShoppingBag size={16}/>
                  {!product.inStock ? "Out of Stock" : "Add to Bag"}
                </button>
              )}

              {/* Continue shopping link when added */}
              {phase === "added" && (
                <button onClick={() => setPhase("idle")} className="w-full text-xs text-stone-400 hover:text-stone-600 transition-colors py-1">
                  ← Continue shopping
                </button>
              )}
            </div>

            <div className="flex justify-between mt-4 pt-4 border-t border-stone-100">
              {[{icon:<Truck size={12}/>,label:"Free Shipping"},{icon:<RotateCcw size={12}/>,label:"7-Day Return"},{icon:<Shield size={12}/>,label:"Secure Pay"}].map((t) => (
                <div key={t.label} className="flex items-center gap-1.5 text-stone-400">
                  {t.icon}<span className="text-[10px] font-medium">{t.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// "use client";
// import { useState, useEffect } from "react";
// import { X, ShoppingBag, Heart, Star, Truck, RotateCcw, Shield, ChevronLeft, ChevronRight } from "lucide-react";
// import { useStore } from "@/context/StoreContext";

// export default function QuickViewModal({ product, onClose }) {
//   const { addToCart, toggleWishlist, isWishlisted } = useStore();
//   const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || "");
//   const [selectedSize,  setSelectedSize]  = useState(product.sizes?.[0] || "");
//   const [adding,        setAdding]        = useState(false);
//   const [imgIdx,        setImgIdx]        = useState(0);

//   const wishlisted = isWishlisted(product.id);
//   const discount   = product.originalPrice
//     ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
//     : 0;

//   // Support both images[] and legacy image string
//   const images = Array.isArray(product.images) && product.images.length
//     ? product.images
//     : product.image ? [product.image] : [];
//   const currentImg = images[imgIdx] || "";

//   useEffect(() => {
//     const fn = (e) => {
//       if (e.key === "Escape")     onClose();
//       if (e.key === "ArrowRight") setImgIdx((i) => Math.min(i+1, images.length-1));
//       if (e.key === "ArrowLeft")  setImgIdx((i) => Math.max(i-1, 0));
//     };
//     document.addEventListener("keydown", fn);
//     document.body.style.overflow = "hidden";
//     return () => { document.removeEventListener("keydown", fn); document.body.style.overflow = ""; };
//   }, [onClose, images.length]);

//   const handleAdd = () => {
//     if (!product.inStock || adding) return;
//     setAdding(true);
//     addToCart(product, selectedColor, selectedSize);
//     setTimeout(() => setAdding(false), 1400);
//   };

//   return (
//     <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
//       <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}/>
//       <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
//         <button onClick={onClose}
//           className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-stone-100 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center transition-colors">
//           <X size={18}/>
//         </button>

//         <div className="grid grid-cols-1 sm:grid-cols-2">
//           {/* ── Image gallery ─────────────────────────────── */}
//           <div className="flex flex-col gap-0">
//             {/* Main image */}
//             <div className="relative aspect-[3/4] sm:aspect-auto sm:min-h-[380px] bg-stone-50 rounded-t-3xl sm:rounded-l-3xl sm:rounded-tr-none overflow-hidden">
//               <img src={currentImg} alt={product.name} className="w-full h-full object-cover"/>

//               {/* Prev / Next arrows */}
//               {images.length > 1 && (
//                 <>
//                   <button onClick={() => setImgIdx((i) => Math.max(i-1, 0))}
//                     disabled={imgIdx === 0}
//                     className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow disabled:opacity-30 transition-all">
//                     <ChevronLeft size={16}/>
//                   </button>
//                   <button onClick={() => setImgIdx((i) => Math.min(i+1, images.length-1))}
//                     disabled={imgIdx === images.length-1}
//                     className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow disabled:opacity-30 transition-all">
//                     <ChevronRight size={16}/>
//                   </button>

//                   {/* Dot indicator */}
//                   <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
//                     {images.map((_, i) => (
//                       <button key={i} onClick={() => setImgIdx(i)}
//                         className={`w-1.5 h-1.5 rounded-full transition-all ${i===imgIdx ? "bg-white w-4" : "bg-white/50"}`}/>
//                     ))}
//                   </div>
//                 </>
//               )}

//               {/* Overlays */}
//               {!product.inStock && (
//                 <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
//                   <span className="text-sm font-semibold text-stone-500 bg-white px-4 py-2 rounded-full border border-stone-200">Out of Stock</span>
//                 </div>
//               )}
//               {discount >= 10 && (
//                 <div className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
//                   -{discount}% OFF
//                 </div>
//               )}
//             </div>

//             {/* Thumbnails row */}
//             {images.length > 1 && (
//               <div className="flex gap-2 p-3 overflow-x-auto sm:rounded-bl-3xl bg-stone-50/50">
//                 {images.map((url, i) => (
//                   <button key={i} onClick={() => setImgIdx(i)}
//                     className={`flex-shrink-0 w-14 h-18 rounded-lg overflow-hidden border-2 transition-all ${i===imgIdx ? "border-rose-500 scale-105 shadow-md" : "border-transparent hover:border-stone-300"}`}
//                     style={{ height: "4.5rem" }}>
//                     <img src={url} alt={`View ${i+1}`} className="w-full h-full object-cover"
//                       onError={(e) => { e.target.src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=80&q=60"; }}/>
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* ── Details ───────────────────────────────────── */}
//           <div className="p-6 sm:p-7 flex flex-col">
//             <div className="flex items-start justify-between gap-3 mb-3">
//               <div>
//                 <p className="text-xs text-rose-500 font-bold tracking-widest uppercase mb-1">{product.category}</p>
//                 <h2 className="font-display text-xl font-bold text-charcoal leading-tight">{product.name}</h2>
//               </div>
//               <button onClick={() => toggleWishlist(product.id)}
//                 className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all ${wishlisted ? "border-rose-600 bg-rose-600 text-white" : "border-stone-200 text-stone-400 hover:border-rose-400"}`}>
//                 <Heart size={15} className={wishlisted ? "fill-white" : ""}/>
//               </button>
//             </div>

//             {product.rating > 0 && (
//               <div className="flex items-center gap-2 mb-4">
//                 <div className="flex gap-0.5">
//                   {Array.from({length:5}).map((_,i) => (
//                     <Star key={i} size={13} className={i < Math.floor(product.rating) ? "text-amber-400 fill-amber-400" : "text-stone-200 fill-stone-200"}/>
//                   ))}
//                 </div>
//                 <span className="text-sm text-stone-400">{product.rating} · {product.reviews} reviews</span>
//               </div>
//             )}

//             <div className="flex items-baseline gap-3 mb-5">
//               <span className="font-display text-2xl font-bold text-charcoal">₹{product.price.toLocaleString("en-IN")}</span>
//               {product.originalPrice && <>
//                 <span className="text-sm text-stone-400 line-through">₹{product.originalPrice.toLocaleString("en-IN")}</span>
//                 <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">Save {discount}%</span>
//               </>}
//             </div>

//             <p className="text-stone-500 text-sm leading-relaxed mb-5 line-clamp-3">{product.description}</p>

//             {product.colors?.length > 0 && (
//               <div className="mb-4">
//                 <p className="text-xs font-semibold text-stone-600 uppercase tracking-widest mb-2">
//                   Color: <span className="text-rose-600 normal-case font-bold">{selectedColor}</span>
//                 </p>
//                 <div className="flex flex-wrap gap-2">
//                   {product.colors.map((c) => (
//                     <button key={c} onClick={() => setSelectedColor(c)}
//                       className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${selectedColor===c ? "border-rose-600 bg-rose-50 text-rose-700" : "border-stone-200 text-stone-600 hover:border-rose-300"}`}>
//                       {c}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {product.sizes?.length > 0 && product.sizes[0] !== "Free Size" && (
//               <div className="mb-5">
//                 <p className="text-xs font-semibold text-stone-600 uppercase tracking-widest mb-2">Size</p>
//                 <div className="flex flex-wrap gap-2">
//                   {product.sizes.map((s) => (
//                     <button key={s} onClick={() => setSelectedSize(s)}
//                       className={`w-10 h-10 rounded-xl text-xs font-bold border transition-all ${selectedSize===s ? "border-rose-600 bg-rose-600 text-white" : "border-stone-200 text-stone-600 hover:border-rose-300"}`}>
//                       {s}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {images.length > 1 && (
//               <p className="text-xs text-stone-400 mb-3">{images.length} photos available · Arrow keys se navigate karo</p>
//             )}

//             <button onClick={handleAdd} disabled={!product.inStock || adding}
//               className={`w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 mt-auto ${!product.inStock ? "bg-stone-100 text-stone-400 cursor-not-allowed" : adding ? "bg-emerald-500 text-white" : "bg-rose-600 text-white hover:bg-rose-700 shadow-md hover:shadow-lg active:scale-95"}`}>
//               <ShoppingBag size={16}/>
//               {!product.inStock ? "Out of Stock" : adding ? "Added! ✓" : "Add to Bag"}
//             </button>

//             <div className="flex justify-between mt-4 pt-4 border-t border-stone-100">
//               {[{icon:<Truck size={12}/>,label:"Free Shipping"},{icon:<RotateCcw size={12}/>,label:"7-Day Return"},{icon:<Shield size={12}/>,label:"Secure Pay"}].map((t) => (
//                 <div key={t.label} className="flex items-center gap-1.5 text-stone-400">
//                   {t.icon}<span className="text-[10px] font-medium">{t.label}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }