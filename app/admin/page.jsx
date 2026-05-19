"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, Package, TrendingUp, LogOut, Search, ToggleLeft, ToggleRight, X, Save, Tag, ChevronDown, Shield, AlertTriangle, CheckCircle, Download, Upload, RefreshCw, Boxes, PackageX, PackageCheck, BarChart2, Star } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { CATEGORIES, BADGES } from "@/data/products";
import ImageUploader from "@/components/ui/ImageUploader";

const EMPTY = { name:"", category:"Sarees", price:"", originalPrice:"", image:"", description:"", colors:"", sizes:"", badge:"", inStock:true, featured:false, rating:"", reviews:"" };
const TABS = [
  { id:"products",   label:"All Products",  icon:<Package size={15}/> },
  { id:"add",        label:"Add Product",   icon:<Plus size={15}/> },
  { id:"outofstock", label:"Out of Stock",  icon:<PackageX size={15}/> },
  { id:"analytics",  label:"Analytics",     icon:<BarChart2 size={15}/> },
];

export default function AdminPage() {
  const { products, addProduct, updateProduct, deleteProduct, toggleStock, markInStock, markAllInStock, removeOutOfStock, exportProducts, importProducts, resetProducts, isAdminLoggedIn, adminLogout } = useStore();
  const router = useRouter();
  const fileRef = useRef(null);

  const [tab,              setTab]              = useState("products");
  const [editId,           setEditId]           = useState(null);
  const [form,             setForm]             = useState(EMPTY);
  const [search,           setSearch]           = useState("");
  const [catFilter,        setCatFilter]        = useState("All");
  const [stockFilter,      setStockFilter]      = useState("all");
  const [sortBy,           setSortBy]           = useState("default");
  const [deleteConfirm,    setDeleteConfirm]    = useState(null);
  const [bulkConfirm,      setBulkConfirm]      = useState(false);
  const [formErrors,       setFormErrors]       = useState({});

    // Fix: router.replace render ke andar nahi — useEffect mein
  useEffect(() => { if (!isAdminLoggedIn) router.replace("/admin-login"); }, [isAdminLoggedIn, router]);
  if (!isAdminLoggedIn) return null;

  // Stats
  const total   = products.length;
  const inStk   = products.filter((p) => p.inStock).length;
  const outStk  = products.filter((p) => !p.inStock).length;
  const featCnt = products.filter((p) => p.featured).length;
  const avgPrc  = total > 0 ? Math.round(products.reduce((s,p) => s+p.price,0)/total) : 0;
  const catBreak = CATEGORIES.filter((c)=>c!=="All").map((c) => ({ name:c, count:products.filter((p)=>p.category===c).length })).filter((c)=>c.count>0).sort((a,b)=>b.count-a.count);

  // Filtered list
  let filtered = products.filter((p) => {
    const ms = p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    const mc = catFilter === "All" || p.category === catFilter;
    const mk = stockFilter === "all" ? true : stockFilter === "instock" ? p.inStock : !p.inStock;
    return ms && mc && mk;
  });
  if (sortBy === "price-asc")  filtered.sort((a,b) => a.price - b.price);
  if (sortBy === "price-desc") filtered.sort((a,b) => b.price - a.price);
  if (sortBy === "name")       filtered.sort((a,b) => a.name.localeCompare(b.name));

  const outOfStock = products.filter((p) => !p.inStock);

  // Form helpers
  const openAdd = () => { setForm(EMPTY); setEditId(null); setFormErrors({}); setTab("add"); };
  const openEdit = (p) => { setForm({ ...p, colors:p.colors?.join(", ")||"", sizes:p.sizes?.join(", ")||"", badge:p.badge||"", rating:p.rating?.toString()||"", reviews:p.reviews?.toString()||"" }); setEditId(p.id); setFormErrors({}); setTab("add"); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) e.price = "Valid price required";
    if (!form.image.trim()) e.image = "Image required";
    if (!form.description.trim()) e.description = "Required";
    if (form.originalPrice && Number(form.originalPrice) <= Number(form.price)) e.originalPrice = "MRP > selling price hona chahiye";
    return e;
  };

  const handleSave = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
    const data = { ...form, price:Number(form.price), originalPrice:form.originalPrice?Number(form.originalPrice):null, colors:form.colors?form.colors.split(",").map((c)=>c.trim()).filter(Boolean):[], sizes:form.sizes?form.sizes.split(",").map((s)=>s.trim()).filter(Boolean):[], badge:form.badge||null, rating:form.rating?parseFloat(form.rating):0, reviews:form.reviews?parseInt(form.reviews):0 };
    if (editId) updateProduct(editId, data); else addProduct(data);
    setTab("products"); setEditId(null);
  };

  const f = (key) => ({ value: form[key], onChange: (e) => { setForm({...form,[key]:e.target.value}); setFormErrors((p)=>({...p,[key]:""})); } });

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Admin header */}
      <div className="bg-charcoal text-white sticky top-[calc(4rem+28px)] z-30">
        <div className="container-xl h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-rose-600 rounded-lg flex items-center justify-center"><Shield size={16}/></div>
            <div>
              <p className="font-display text-base font-bold leading-tight">Raja Nxt <span className="text-rose-400">Admin</span></p>
              <p className="text-[10px] text-stone-400">Store Management</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportProducts} className="hidden sm:flex items-center gap-1.5 text-xs text-stone-300 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all"><Download size={13}/> Export</button>
            <button onClick={() => fileRef.current?.click()} className="hidden sm:flex items-center gap-1.5 text-xs text-stone-300 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all"><Upload size={13}/> Import</button>
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={(e) => { const f2 = e.target.files?.[0]; if(f2){const r=new FileReader();r.onload=(ev)=>importProducts(ev.target.result);r.readAsText(f2);e.target.value="";} }}/>
            <button onClick={() => { adminLogout(); router.push("/"); }} className="flex items-center gap-1.5 text-sm text-stone-300 hover:text-white transition-colors ml-2">
              <LogOut size={15}/> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container-xl py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label:"Total Products", value:total,   icon:<Boxes size={18}/>,       color:"text-blue-600 bg-blue-50",     click:() => { setTab("products"); setStockFilter("all"); } },
            { label:"In Stock",       value:inStk,   icon:<PackageCheck size={18}/>, color:"text-emerald-600 bg-emerald-50", click:() => { setTab("products"); setStockFilter("instock"); } },
            { label:"Out of Stock",   value:outStk,  icon:<PackageX size={18}/>,    color:outStk>0?"text-red-600 bg-red-50":"text-stone-400 bg-stone-50", click:() => setTab("outofstock") },
            { label:"Featured",       value:featCnt, icon:<Star size={18}/>,         color:"text-amber-600 bg-amber-50",   click:null },
            { label:"Avg. Price",     value:`₹${avgPrc.toLocaleString("en-IN")}`, icon:<TrendingUp size={18}/>, color:"text-rose-600 bg-rose-50", click:null },
          ].map((s) => (
            <div key={s.label} onClick={s.click||undefined} className={`bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3 ${s.click?"cursor-pointer hover:shadow-md transition-shadow":""}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>{s.icon}</div>
              <div><p className="font-display text-xl font-bold text-charcoal">{s.value}</p><p className="text-[10px] text-stone-400 leading-tight">{s.label}</p></div>
            </div>
          ))}
        </div>

        {/* Alert */}
        {outStk > 0 && tab !== "outofstock" && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <AlertTriangle size={18} className="text-amber-500 flex-shrink-0"/>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">{outStk} product{outStk!==1?"s":""} out of stock</p>
              <p className="text-xs text-amber-600 mt-0.5">Review and update stock or remove them.</p>
            </div>
            <button onClick={() => setTab("outofstock")} className="text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">Manage →</button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => { setTab(t.id); if(t.id==="add"&&editId){setForm(EMPTY);setEditId(null);} }}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all inline-flex items-center gap-2 ${tab===t.id ? (t.id==="outofstock"?"bg-amber-600 text-white shadow-md":"bg-charcoal text-white shadow-md") : "bg-white text-stone-600 border border-stone-200 hover:border-rose-300 hover:text-rose-600"}`}>
              {t.icon} {t.label}
              {t.id==="outofstock" && outStk>0 && <span className={`ml-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${tab==="outofstock"?"bg-white text-amber-600":"bg-amber-500 text-white"}`}>{outStk}</span>}
            </button>
          ))}
        </div>

        {/* ── PRODUCTS TAB ── */}
        {tab === "products" && (
          <div className="animate-fade-in">
            <div className="flex flex-wrap gap-3 mb-5">
              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"/>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…" className="input-field pl-9 py-2.5 text-sm"/>
                {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"><X size={14}/></button>}
              </div>
              {[{ val:catFilter, set:setCatFilter, opts:CATEGORIES, min:"140px" }, { val:stockFilter, set:setStockFilter, opts:[{v:"all",l:"All Stock"},{v:"instock",l:"In Stock"},{v:"outofstock",l:"Out of Stock"}].map((o)=>({value:o.v,label:o.l})), min:"140px", isObj:true }, { val:sortBy, set:setSortBy, opts:[{value:"default",label:"Default"},{value:"price-asc",label:"Price ↑"},{value:"price-desc",label:"Price ↓"},{value:"name",label:"Name A-Z"}], min:"130px", isObj:true }].map((s,i) => (
                <div key={i} className="relative">
                  <select value={s.val} onChange={(e) => s.set(e.target.value)} className="appearance-none input-field py-2.5 pr-8 text-sm cursor-pointer" style={{minWidth:s.min}}>
                    {s.isObj ? s.opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>) : s.opts.map((o) => <option key={o}>{o}</option>)}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"/>
                </div>
              ))}
              <div className="ml-auto flex items-center gap-2">
                <span className="text-sm text-stone-400">{filtered.length} products</span>
                <button onClick={openAdd} className="btn-primary py-2.5 text-sm"><Plus size={15}/> Add Product</button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-100 bg-stone-50/80">
                      {["Product","Category","Price","Stock","Actions"].map((h) => <th key={h} className="text-left p-4 text-[11px] font-semibold text-stone-500 uppercase tracking-widest first:table-cell">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-16 text-stone-400 text-sm"><Package size={32} className="mx-auto mb-3 text-stone-200"/>No products found</td></tr>
                    ) : filtered.map((p) => (
                      <tr key={p.id} className={`border-b border-stone-50 hover:bg-stone-50/60 transition-colors last:border-0 ${!p.inStock?"bg-red-50/20":""}`}>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={p.image} alt={p.name} className="w-10 h-12 object-cover rounded-lg flex-shrink-0 bg-stone-100" onError={(e)=>{e.target.src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=80&q=60";}}/>
                            <div>
                              <p className="font-semibold text-charcoal text-sm line-clamp-1">{p.name}</p>
                              <div className="flex gap-1 mt-0.5">
                                {p.badge && <span className="text-[9px] bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-full font-bold">{p.badge}</span>}
                                {!p.inStock && <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold">Out of Stock</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 hidden sm:table-cell"><span className="text-xs text-stone-500 bg-stone-100 px-2 py-1 rounded-full">{p.category}</span></td>
                        <td className="p-4"><p className="font-bold text-charcoal">₹{p.price.toLocaleString("en-IN")}</p>{p.originalPrice && <p className="text-[11px] text-stone-400 line-through">₹{p.originalPrice.toLocaleString("en-IN")}</p>}</td>
                        <td className="p-4">
                          <button onClick={() => toggleStock(p.id)} className="flex items-center gap-1.5 hover:opacity-80 transition-opacity" title="Toggle stock">
                            {p.inStock ? <><ToggleRight size={22} className="text-emerald-500"/><span className="text-xs text-emerald-600 font-medium hidden lg:inline">In Stock</span></> : <><ToggleLeft size={22} className="text-stone-300"/><span className="text-xs text-stone-400 hidden lg:inline">Out of Stock</span></>}
                          </button>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <button onClick={() => openEdit(p)} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors" title="Edit"><Edit2 size={13}/></button>
                            <button onClick={() => setDeleteConfirm(p.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors" title="Delete"><Trash2 size={13}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── ADD/EDIT TAB ── */}
        {tab === "add" && (
          <div className="animate-fade-in">
            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 max-w-3xl">
              <h2 className="font-display text-xl font-semibold text-charcoal mb-6 flex items-center gap-2">
                {editId ? <><Edit2 size={18} className="text-blue-500"/> Edit Product</> : <><Plus size={18} className="text-rose-500"/> Add New Product</>}
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="label-style">Product Name *</label>
                  <input {...f("name")} placeholder="e.g. Banarasi Silk Saree" className={`input-field ${formErrors.name?"border-red-300":""}`}/>
                  {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="label-style">Category *</label>
                    <select {...f("category")} className="input-field">{CATEGORIES.filter((c)=>c!=="All").map((c) => <option key={c}>{c}</option>)}</select>
                  </div>
                  <div>
                    <label className="label-style">Badge</label>
                    <select {...f("badge")} className="input-field"><option value="">None</option>{BADGES.map((b) => <option key={b}>{b}</option>)}</select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="label-style">Selling Price (₹) *</label>
                    <input {...f("price")} type="number" min={0} placeholder="2499" className={`input-field ${formErrors.price?"border-red-300":""}`}/>
                    {formErrors.price && <p className="text-xs text-red-500 mt-1">{formErrors.price}</p>}
                  </div>
                  <div>
                    <label className="label-style">Original / MRP (₹)</label>
                    <input {...f("originalPrice")} type="number" min={0} placeholder="3499 (optional)" className={`input-field ${formErrors.originalPrice?"border-red-300":""}`}/>
                    {formErrors.originalPrice && <p className="text-xs text-red-500 mt-1">{formErrors.originalPrice}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="label-style">Rating (0–5)</label>
                    <input {...f("rating")} type="number" min={0} max={5} step={0.1} placeholder="4.5" className="input-field"/>
                  </div>
                  <div>
                    <label className="label-style">Reviews Count</label>
                    <input {...f("reviews")} type="number" min={0} placeholder="120" className="input-field"/>
                  </div>
                </div>

                {/* Image Uploader — uses Next.js API route, no 401 */}
                <div>
                  <label className="label-style">Product Image *</label>
                  <ImageUploader value={form.image} onChange={(url) => { setForm((prev) => ({...prev, image:url})); setFormErrors((e) => ({...e, image:""})); }}/>
                  {formErrors.image && <p className="text-xs text-red-500 mt-1">{formErrors.image}</p>}
                </div>

                <div>
                  <label className="label-style">Description *</label>
                  <textarea {...f("description")} rows={3} placeholder="Product description…" className={`input-field resize-none ${formErrors.description?"border-red-300":""}`}/>
                  {formErrors.description && <p className="text-xs text-red-500 mt-1">{formErrors.description}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="label-style">Colors (comma separated)</label>
                    <input {...f("colors")} placeholder="Red, Blue, Green" className="input-field"/>
                    <p className="text-[10px] text-stone-400 mt-1">e.g. Red, Royal Blue, Emerald</p>
                  </div>
                  <div>
                    <label className="label-style">Sizes (comma separated)</label>
                    <input {...f("sizes")} placeholder="S, M, L, XL or Free Size" className="input-field"/>
                    <p className="text-[10px] text-stone-400 mt-1">e.g. S, M, L, XL or Free Size</p>
                  </div>
                </div>

                <div className="flex gap-6 flex-wrap p-4 bg-stone-50 rounded-xl">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={form.inStock} onChange={(e) => setForm({...form, inStock:e.target.checked})} className="w-4 h-4 accent-rose-600 rounded"/>
                    <span className="text-sm font-medium text-stone-700">In Stock</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={form.featured} onChange={(e) => setForm({...form, featured:e.target.checked})} className="w-4 h-4 accent-rose-600 rounded"/>
                    <span className="text-sm font-medium text-stone-700">Featured on Homepage</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={handleSave} className="btn-primary flex-1 py-3.5 text-base"><Save size={17}/> {editId ? "Update Product" : "Add Product"}</button>
                  <button onClick={() => { setTab("products"); setEditId(null); }} className="btn-outline px-6">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── OUT OF STOCK TAB ── */}
        {tab === "outofstock" && (
          <div className="animate-fade-in">
            {outOfStock.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={28} className="text-emerald-500"/></div>
                <h3 className="font-display text-xl font-semibold text-charcoal mb-2">Sab products in stock hain!</h3>
                <p className="text-stone-400 text-sm">Koi out-of-stock product nahi hai.</p>
              </div>
            ) : (
              <>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-900 flex items-center gap-2"><AlertTriangle size={16} className="text-amber-500"/>{outOfStock.length} out-of-stock products</h3>
                    <p className="text-xs text-amber-700 mt-0.5">Restock karo ya remove karo.</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={markAllInStock} className="flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors"><PackageCheck size={13}/> Mark All In Stock</button>
                    <button onClick={() => setBulkConfirm(true)} className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-red-700 transition-colors"><Trash2 size={13}/> Remove All ({outOfStock.length})</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {outOfStock.map((p) => (
                    <div key={p.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-red-100">
                      <div className="relative">
                        <img src={p.image} alt={p.name} className="w-full h-40 object-cover opacity-60" onError={(e)=>{e.target.src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=60";}}/>
                        <div className="absolute inset-0 flex items-center justify-center"><span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">Out of Stock</span></div>
                      </div>
                      <div className="p-4">
                        <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider mb-1">{p.category}</p>
                        <h4 className="font-display text-sm font-semibold text-charcoal line-clamp-1 mb-1">{p.name}</h4>
                        <p className="font-bold text-rose-600 text-sm mb-3">₹{p.price.toLocaleString("en-IN")}</p>
                        <div className="flex gap-2">
                          <button onClick={() => markInStock(p.id)} className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold py-2 rounded-xl hover:bg-emerald-100 transition-colors"><PackageCheck size={13}/> Restock</button>
                          <button onClick={() => openEdit(p)} className="flex items-center justify-center gap-1.5 bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-2 rounded-xl hover:bg-blue-100 transition-colors"><Edit2 size={13}/></button>
                          <button onClick={() => setDeleteConfirm(p.id)} className="flex items-center justify-center gap-1.5 bg-red-50 text-red-500 text-xs font-semibold px-3 py-2 rounded-xl hover:bg-red-100 transition-colors"><Trash2 size={13}/></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── ANALYTICS TAB ── */}
        {tab === "analytics" && (
          <div className="animate-fade-in space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-display text-lg font-semibold text-charcoal mb-5">Products by Category</h3>
              <div className="space-y-3">
                {catBreak.map((c) => (
                  <div key={c.name}>
                    <div className="flex justify-between text-sm mb-1"><span className="font-medium text-stone-700">{c.name}</span><span className="text-stone-400">{c.count} products</span></div>
                    <div className="h-2 bg-stone-100 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full transition-all duration-500" style={{width:`${(c.count/total)*100}%`}}/></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label:"Total Inventory Value", value:`₹${products.reduce((s,p)=>s+p.price,0).toLocaleString("en-IN")}`, sub:"At selling prices" },
                { label:"Stock Health", value:`${total>0?Math.round((inStk/total)*100):0}%`, sub:"Products in stock" },
                { label:"Featured Products", value:featCnt, sub:"Shown on homepage" },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-2xl shadow-sm p-5">
                  <p className="text-xs text-stone-400 font-semibold uppercase tracking-widest mb-2">{s.label}</p>
                  <p className="font-display text-2xl font-bold text-charcoal">{s.value}</p>
                  <p className="text-xs text-stone-400 mt-1">{s.sub}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-display text-lg font-semibold text-charcoal mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon:<Download size={18}/>, label:"Export Products", sub:"Download as JSON", fn:exportProducts },
                  { icon:<Upload size={18}/>,   label:"Import Products", sub:"Upload JSON file", fn:() => fileRef.current?.click() },
                  { icon:<PackageCheck size={18}/>, label:"Mark All In Stock", sub:"Restore all items", fn:markAllInStock },
                  { icon:<RefreshCw size={18}/>, label:"Reset to Defaults", sub:"Restore original list", fn:() => { if(window.confirm("Reset? This cannot be undone.")) resetProducts(); } },
                ].map((a) => (
                  <button key={a.label} onClick={a.fn} className="flex items-center gap-3 p-4 rounded-xl border border-stone-200 hover:border-rose-300 hover:bg-rose-50 transition-all text-left">
                    <div className="text-stone-400">{a.icon}</div>
                    <div><p className="text-sm font-semibold text-stone-700">{a.label}</p><p className="text-xs text-stone-400">{a.sub}</p></div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)}/>
          <div className="relative bg-white rounded-3xl shadow-2xl p-7 max-w-sm w-full animate-scale-in">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><Trash2 size={24} className="text-red-500"/></div>
            <h3 className="font-display text-xl font-semibold text-center text-charcoal mb-2">Delete Product?</h3>
            <p className="text-stone-400 text-sm text-center mb-6">Yeh action undo nahi ho sakta.</p>
            <div className="flex gap-3">
              <button onClick={() => { deleteProduct(deleteConfirm); setDeleteConfirm(null); }} className="flex-1 bg-red-600 text-white py-3 rounded-2xl font-semibold text-sm hover:bg-red-700 transition-colors">Delete</button>
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 border-2 border-stone-200 py-3 rounded-2xl font-semibold text-sm text-stone-600 hover:border-stone-300 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk delete modal */}
      {bulkConfirm && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setBulkConfirm(false)}/>
          <div className="relative bg-white rounded-3xl shadow-2xl p-7 max-w-sm w-full animate-scale-in">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><PackageX size={24} className="text-red-500"/></div>
            <h3 className="font-display text-xl font-semibold text-center text-charcoal mb-2">Remove All Out-of-Stock?</h3>
            <p className="text-stone-400 text-sm text-center mb-6"><strong className="text-red-600">{outOfStock.length} products</strong> permanently delete ho jayenge.</p>
            <div className="flex gap-3">
              <button onClick={() => { removeOutOfStock(); setBulkConfirm(false); setTab("products"); }} className="flex-1 bg-red-600 text-white py-3 rounded-2xl font-semibold text-sm hover:bg-red-700 transition-colors">Remove All</button>
              <button onClick={() => setBulkConfirm(false)} className="flex-1 border-2 border-stone-200 py-3 rounded-2xl font-semibold text-sm text-stone-600 hover:border-stone-300 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// "use client";
// import { useState, useRef } from "react";
// import { useRouter } from "next/navigation";
// import { Plus, Edit2, Trash2, Package, TrendingUp, LogOut, Search, ToggleLeft, ToggleRight, X, Save, Tag, ChevronDown, Shield, AlertTriangle, CheckCircle, Download, Upload, RefreshCw, Boxes, PackageX, PackageCheck, BarChart2, Star } from "lucide-react";
// import { useStore } from "@/context/StoreContext";
// import { CATEGORIES, BADGES } from "@/data/products";
// import ImageUploader from "@/components/ui/ImageUploader";

// const EMPTY = { name:"", category:"Sarees", price:"", originalPrice:"", image:"", description:"", colors:"", sizes:"", badge:"", inStock:true, featured:false, rating:"", reviews:"" };
// const TABS = [
//   { id:"products",   label:"All Products",  icon:<Package size={15}/> },
//   { id:"add",        label:"Add Product",   icon:<Plus size={15}/> },
//   { id:"outofstock", label:"Out of Stock",  icon:<PackageX size={15}/> },
//   { id:"analytics",  label:"Analytics",     icon:<BarChart2 size={15}/> },
// ];

// export default function AdminPage() {
//   const { products, addProduct, updateProduct, deleteProduct, toggleStock, markInStock, markAllInStock, removeOutOfStock, exportProducts, importProducts, resetProducts, isAdminLoggedIn, adminLogout } = useStore();
//   const router = useRouter();
//   const fileRef = useRef(null);

//   const [tab,              setTab]              = useState("products");
//   const [editId,           setEditId]           = useState(null);
//   const [form,             setForm]             = useState(EMPTY);
//   const [search,           setSearch]           = useState("");
//   const [catFilter,        setCatFilter]        = useState("All");
//   const [stockFilter,      setStockFilter]      = useState("all");
//   const [sortBy,           setSortBy]           = useState("default");
//   const [deleteConfirm,    setDeleteConfirm]    = useState(null);
//   const [bulkConfirm,      setBulkConfirm]      = useState(false);
//   const [formErrors,       setFormErrors]       = useState({});

//   if (!isAdminLoggedIn) { router.replace("/admin-login"); return null; }

//   // Stats
//   const total   = products.length;
//   const inStk   = products.filter((p) => p.inStock).length;
//   const outStk  = products.filter((p) => !p.inStock).length;
//   const featCnt = products.filter((p) => p.featured).length;
//   const avgPrc  = total > 0 ? Math.round(products.reduce((s,p) => s+p.price,0)/total) : 0;
//   const catBreak = CATEGORIES.filter((c)=>c!=="All").map((c) => ({ name:c, count:products.filter((p)=>p.category===c).length })).filter((c)=>c.count>0).sort((a,b)=>b.count-a.count);

//   // Filtered list
//   let filtered = products.filter((p) => {
//     const ms = p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
//     const mc = catFilter === "All" || p.category === catFilter;
//     const mk = stockFilter === "all" ? true : stockFilter === "instock" ? p.inStock : !p.inStock;
//     return ms && mc && mk;
//   });
//   if (sortBy === "price-asc")  filtered.sort((a,b) => a.price - b.price);
//   if (sortBy === "price-desc") filtered.sort((a,b) => b.price - a.price);
//   if (sortBy === "name")       filtered.sort((a,b) => a.name.localeCompare(b.name));

//   const outOfStock = products.filter((p) => !p.inStock);

//   // Form helpers
//   const openAdd = () => { setForm(EMPTY); setEditId(null); setFormErrors({}); setTab("add"); };
//   const openEdit = (p) => { setForm({ ...p, colors:p.colors?.join(", ")||"", sizes:p.sizes?.join(", ")||"", badge:p.badge||"", rating:p.rating?.toString()||"", reviews:p.reviews?.toString()||"" }); setEditId(p.id); setFormErrors({}); setTab("add"); };

//   const validate = () => {
//     const e = {};
//     if (!form.name.trim()) e.name = "Required";
//     if (!form.price || isNaN(form.price) || Number(form.price) <= 0) e.price = "Valid price required";
//     if (!form.image.trim()) e.image = "Image required";
//     if (!form.description.trim()) e.description = "Required";
//     if (form.originalPrice && Number(form.originalPrice) <= Number(form.price)) e.originalPrice = "MRP > selling price hona chahiye";
//     return e;
//   };

//   const handleSave = () => {
//     const errs = validate();
//     if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
//     const data = { ...form, price:Number(form.price), originalPrice:form.originalPrice?Number(form.originalPrice):null, colors:form.colors?form.colors.split(",").map((c)=>c.trim()).filter(Boolean):[], sizes:form.sizes?form.sizes.split(",").map((s)=>s.trim()).filter(Boolean):[], badge:form.badge||null, rating:form.rating?parseFloat(form.rating):0, reviews:form.reviews?parseInt(form.reviews):0 };
//     if (editId) updateProduct(editId, data); else addProduct(data);
//     setTab("products"); setEditId(null);
//   };

//   const f = (key) => ({ value: form[key], onChange: (e) => { setForm({...form,[key]:e.target.value}); setFormErrors((p)=>({...p,[key]:""})); } });

//   return (
//     <div className="min-h-screen bg-stone-50">
//       {/* Admin header */}
//       <div className="bg-charcoal text-white sticky top-[calc(4rem+28px)] z-30">
//         <div className="container-xl h-14 flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="w-8 h-8 bg-rose-600 rounded-lg flex items-center justify-center"><Shield size={16}/></div>
//             <div>
//               <p className="font-display text-base font-bold leading-tight">Raja Nxt <span className="text-rose-400">Admin</span></p>
//               <p className="text-[10px] text-stone-400">Store Management</p>
//             </div>
//           </div>
//           <div className="flex items-center gap-2">
//             <button onClick={exportProducts} className="hidden sm:flex items-center gap-1.5 text-xs text-stone-300 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all"><Download size={13}/> Export</button>
//             <button onClick={() => fileRef.current?.click()} className="hidden sm:flex items-center gap-1.5 text-xs text-stone-300 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all"><Upload size={13}/> Import</button>
//             <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={(e) => { const f2 = e.target.files?.[0]; if(f2){const r=new FileReader();r.onload=(ev)=>importProducts(ev.target.result);r.readAsText(f2);e.target.value="";} }}/>
//             <button onClick={() => { adminLogout(); router.push("/"); }} className="flex items-center gap-1.5 text-sm text-stone-300 hover:text-white transition-colors ml-2">
//               <LogOut size={15}/> <span className="hidden sm:inline">Logout</span>
//             </button>
//           </div>
//         </div>
//       </div>

//       <div className="container-xl py-8">
//         {/* Stats */}
//         <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
//           {[
//             { label:"Total Products", value:total,   icon:<Boxes size={18}/>,       color:"text-blue-600 bg-blue-50",     click:() => { setTab("products"); setStockFilter("all"); } },
//             { label:"In Stock",       value:inStk,   icon:<PackageCheck size={18}/>, color:"text-emerald-600 bg-emerald-50", click:() => { setTab("products"); setStockFilter("instock"); } },
//             { label:"Out of Stock",   value:outStk,  icon:<PackageX size={18}/>,    color:outStk>0?"text-red-600 bg-red-50":"text-stone-400 bg-stone-50", click:() => setTab("outofstock") },
//             { label:"Featured",       value:featCnt, icon:<Star size={18}/>,         color:"text-amber-600 bg-amber-50",   click:null },
//             { label:"Avg. Price",     value:`₹${avgPrc.toLocaleString("en-IN")}`, icon:<TrendingUp size={18}/>, color:"text-rose-600 bg-rose-50", click:null },
//           ].map((s) => (
//             <div key={s.label} onClick={s.click||undefined} className={`bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3 ${s.click?"cursor-pointer hover:shadow-md transition-shadow":""}`}>
//               <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>{s.icon}</div>
//               <div><p className="font-display text-xl font-bold text-charcoal">{s.value}</p><p className="text-[10px] text-stone-400 leading-tight">{s.label}</p></div>
//             </div>
//           ))}
//         </div>

//         {/* Alert */}
//         {outStk > 0 && tab !== "outofstock" && (
//           <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
//             <AlertTriangle size={18} className="text-amber-500 flex-shrink-0"/>
//             <div className="flex-1">
//               <p className="text-sm font-semibold text-amber-800">{outStk} product{outStk!==1?"s":""} out of stock</p>
//               <p className="text-xs text-amber-600 mt-0.5">Review and update stock or remove them.</p>
//             </div>
//             <button onClick={() => setTab("outofstock")} className="text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">Manage →</button>
//           </div>
//         )}

//         {/* Tabs */}
//         <div className="flex items-center gap-2 mb-6 flex-wrap">
//           {TABS.map((t) => (
//             <button key={t.id} onClick={() => { setTab(t.id); if(t.id==="add"&&editId){setForm(EMPTY);setEditId(null);} }}
//               className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all inline-flex items-center gap-2 ${tab===t.id ? (t.id==="outofstock"?"bg-amber-600 text-white shadow-md":"bg-charcoal text-white shadow-md") : "bg-white text-stone-600 border border-stone-200 hover:border-rose-300 hover:text-rose-600"}`}>
//               {t.icon} {t.label}
//               {t.id==="outofstock" && outStk>0 && <span className={`ml-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${tab==="outofstock"?"bg-white text-amber-600":"bg-amber-500 text-white"}`}>{outStk}</span>}
//             </button>
//           ))}
//         </div>

//         {/* ── PRODUCTS TAB ── */}
//         {tab === "products" && (
//           <div className="animate-fade-in">
//             <div className="flex flex-wrap gap-3 mb-5">
//               <div className="relative flex-1 min-w-[200px] max-w-xs">
//                 <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"/>
//                 <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…" className="input-field pl-9 py-2.5 text-sm"/>
//                 {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"><X size={14}/></button>}
//               </div>
//               {[{ val:catFilter, set:setCatFilter, opts:CATEGORIES, min:"140px" }, { val:stockFilter, set:setStockFilter, opts:[{v:"all",l:"All Stock"},{v:"instock",l:"In Stock"},{v:"outofstock",l:"Out of Stock"}].map((o)=>({value:o.v,label:o.l})), min:"140px", isObj:true }, { val:sortBy, set:setSortBy, opts:[{value:"default",label:"Default"},{value:"price-asc",label:"Price ↑"},{value:"price-desc",label:"Price ↓"},{value:"name",label:"Name A-Z"}], min:"130px", isObj:true }].map((s,i) => (
//                 <div key={i} className="relative">
//                   <select value={s.val} onChange={(e) => s.set(e.target.value)} className="appearance-none input-field py-2.5 pr-8 text-sm cursor-pointer" style={{minWidth:s.min}}>
//                     {s.isObj ? s.opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>) : s.opts.map((o) => <option key={o}>{o}</option>)}
//                   </select>
//                   <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"/>
//                 </div>
//               ))}
//               <div className="ml-auto flex items-center gap-2">
//                 <span className="text-sm text-stone-400">{filtered.length} products</span>
//                 <button onClick={openAdd} className="btn-primary py-2.5 text-sm"><Plus size={15}/> Add Product</button>
//               </div>
//             </div>

//             <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
//               <div className="overflow-x-auto">
//                 <table className="w-full text-sm">
//                   <thead>
//                     <tr className="border-b border-stone-100 bg-stone-50/80">
//                       {["Product","Category","Price","Stock","Actions"].map((h) => <th key={h} className="text-left p-4 text-[11px] font-semibold text-stone-500 uppercase tracking-widest first:table-cell">{h}</th>)}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {filtered.length === 0 ? (
//                       <tr><td colSpan={5} className="text-center py-16 text-stone-400 text-sm"><Package size={32} className="mx-auto mb-3 text-stone-200"/>No products found</td></tr>
//                     ) : filtered.map((p) => (
//                       <tr key={p.id} className={`border-b border-stone-50 hover:bg-stone-50/60 transition-colors last:border-0 ${!p.inStock?"bg-red-50/20":""}`}>
//                         <td className="p-4">
//                           <div className="flex items-center gap-3">
//                             <img src={p.image} alt={p.name} className="w-10 h-12 object-cover rounded-lg flex-shrink-0 bg-stone-100" onError={(e)=>{e.target.src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=80&q=60";}}/>
//                             <div>
//                               <p className="font-semibold text-charcoal text-sm line-clamp-1">{p.name}</p>
//                               <div className="flex gap-1 mt-0.5">
//                                 {p.badge && <span className="text-[9px] bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-full font-bold">{p.badge}</span>}
//                                 {!p.inStock && <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold">Out of Stock</span>}
//                               </div>
//                             </div>
//                           </div>
//                         </td>
//                         <td className="p-4 hidden sm:table-cell"><span className="text-xs text-stone-500 bg-stone-100 px-2 py-1 rounded-full">{p.category}</span></td>
//                         <td className="p-4"><p className="font-bold text-charcoal">₹{p.price.toLocaleString("en-IN")}</p>{p.originalPrice && <p className="text-[11px] text-stone-400 line-through">₹{p.originalPrice.toLocaleString("en-IN")}</p>}</td>
//                         <td className="p-4">
//                           <button onClick={() => toggleStock(p.id)} className="flex items-center gap-1.5 hover:opacity-80 transition-opacity" title="Toggle stock">
//                             {p.inStock ? <><ToggleRight size={22} className="text-emerald-500"/><span className="text-xs text-emerald-600 font-medium hidden lg:inline">In Stock</span></> : <><ToggleLeft size={22} className="text-stone-300"/><span className="text-xs text-stone-400 hidden lg:inline">Out of Stock</span></>}
//                           </button>
//                         </td>
//                         <td className="p-4">
//                           <div className="flex items-center justify-end gap-1.5">
//                             <button onClick={() => openEdit(p)} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors" title="Edit"><Edit2 size={13}/></button>
//                             <button onClick={() => setDeleteConfirm(p.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors" title="Delete"><Trash2 size={13}/></button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ── ADD/EDIT TAB ── */}
//         {tab === "add" && (
//           <div className="animate-fade-in">
//             <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 max-w-3xl">
//               <h2 className="font-display text-xl font-semibold text-charcoal mb-6 flex items-center gap-2">
//                 {editId ? <><Edit2 size={18} className="text-blue-500"/> Edit Product</> : <><Plus size={18} className="text-rose-500"/> Add New Product</>}
//               </h2>
//               <div className="space-y-5">
//                 <div>
//                   <label className="label-style">Product Name *</label>
//                   <input {...f("name")} placeholder="e.g. Banarasi Silk Saree" className={`input-field ${formErrors.name?"border-red-300":""}`}/>
//                   {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
//                 </div>

//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
//                   <div>
//                     <label className="label-style">Category *</label>
//                     <select {...f("category")} className="input-field">{CATEGORIES.filter((c)=>c!=="All").map((c) => <option key={c}>{c}</option>)}</select>
//                   </div>
//                   <div>
//                     <label className="label-style">Badge</label>
//                     <select {...f("badge")} className="input-field"><option value="">None</option>{BADGES.map((b) => <option key={b}>{b}</option>)}</select>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
//                   <div>
//                     <label className="label-style">Selling Price (₹) *</label>
//                     <input {...f("price")} type="number" min={0} placeholder="2499" className={`input-field ${formErrors.price?"border-red-300":""}`}/>
//                     {formErrors.price && <p className="text-xs text-red-500 mt-1">{formErrors.price}</p>}
//                   </div>
//                   <div>
//                     <label className="label-style">Original / MRP (₹)</label>
//                     <input {...f("originalPrice")} type="number" min={0} placeholder="3499 (optional)" className={`input-field ${formErrors.originalPrice?"border-red-300":""}`}/>
//                     {formErrors.originalPrice && <p className="text-xs text-red-500 mt-1">{formErrors.originalPrice}</p>}
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
//                   <div>
//                     <label className="label-style">Rating (0–5)</label>
//                     <input {...f("rating")} type="number" min={0} max={5} step={0.1} placeholder="4.5" className="input-field"/>
//                   </div>
//                   <div>
//                     <label className="label-style">Reviews Count</label>
//                     <input {...f("reviews")} type="number" min={0} placeholder="120" className="input-field"/>
//                   </div>
//                 </div>

//                 {/* Image Uploader — uses Next.js API route, no 401 */}
//                 <div>
//                   <label className="label-style">Product Image *</label>
//                   <ImageUploader value={form.image} onChange={(url) => { setForm((prev) => ({...prev, image:url})); setFormErrors((e) => ({...e, image:""})); }}/>
//                   {formErrors.image && <p className="text-xs text-red-500 mt-1">{formErrors.image}</p>}
//                 </div>

//                 <div>
//                   <label className="label-style">Description *</label>
//                   <textarea {...f("description")} rows={3} placeholder="Product description…" className={`input-field resize-none ${formErrors.description?"border-red-300":""}`}/>
//                   {formErrors.description && <p className="text-xs text-red-500 mt-1">{formErrors.description}</p>}
//                 </div>

//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
//                   <div>
//                     <label className="label-style">Colors (comma separated)</label>
//                     <input {...f("colors")} placeholder="Red, Blue, Green" className="input-field"/>
//                     <p className="text-[10px] text-stone-400 mt-1">e.g. Red, Royal Blue, Emerald</p>
//                   </div>
//                   <div>
//                     <label className="label-style">Sizes (comma separated)</label>
//                     <input {...f("sizes")} placeholder="S, M, L, XL or Free Size" className="input-field"/>
//                     <p className="text-[10px] text-stone-400 mt-1">e.g. S, M, L, XL or Free Size</p>
//                   </div>
//                 </div>

//                 <div className="flex gap-6 flex-wrap p-4 bg-stone-50 rounded-xl">
//                   <label className="flex items-center gap-2.5 cursor-pointer">
//                     <input type="checkbox" checked={form.inStock} onChange={(e) => setForm({...form, inStock:e.target.checked})} className="w-4 h-4 accent-rose-600 rounded"/>
//                     <span className="text-sm font-medium text-stone-700">In Stock</span>
//                   </label>
//                   <label className="flex items-center gap-2.5 cursor-pointer">
//                     <input type="checkbox" checked={form.featured} onChange={(e) => setForm({...form, featured:e.target.checked})} className="w-4 h-4 accent-rose-600 rounded"/>
//                     <span className="text-sm font-medium text-stone-700">Featured on Homepage</span>
//                   </label>
//                 </div>

//                 <div className="flex gap-3 pt-2">
//                   <button onClick={handleSave} className="btn-primary flex-1 py-3.5 text-base"><Save size={17}/> {editId ? "Update Product" : "Add Product"}</button>
//                   <button onClick={() => { setTab("products"); setEditId(null); }} className="btn-outline px-6">Cancel</button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ── OUT OF STOCK TAB ── */}
//         {tab === "outofstock" && (
//           <div className="animate-fade-in">
//             {outOfStock.length === 0 ? (
//               <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
//                 <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={28} className="text-emerald-500"/></div>
//                 <h3 className="font-display text-xl font-semibold text-charcoal mb-2">Sab products in stock hain!</h3>
//                 <p className="text-stone-400 text-sm">Koi out-of-stock product nahi hai.</p>
//               </div>
//             ) : (
//               <>
//                 <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
//                   <div className="flex-1">
//                     <h3 className="font-semibold text-amber-900 flex items-center gap-2"><AlertTriangle size={16} className="text-amber-500"/>{outOfStock.length} out-of-stock products</h3>
//                     <p className="text-xs text-amber-700 mt-0.5">Restock karo ya remove karo.</p>
//                   </div>
//                   <div className="flex gap-2 flex-wrap">
//                     <button onClick={markAllInStock} className="flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors"><PackageCheck size={13}/> Mark All In Stock</button>
//                     <button onClick={() => setBulkConfirm(true)} className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-red-700 transition-colors"><Trash2 size={13}/> Remove All ({outOfStock.length})</button>
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                   {outOfStock.map((p) => (
//                     <div key={p.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-red-100">
//                       <div className="relative">
//                         <img src={p.image} alt={p.name} className="w-full h-40 object-cover opacity-60" onError={(e)=>{e.target.src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=60";}}/>
//                         <div className="absolute inset-0 flex items-center justify-center"><span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">Out of Stock</span></div>
//                       </div>
//                       <div className="p-4">
//                         <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider mb-1">{p.category}</p>
//                         <h4 className="font-display text-sm font-semibold text-charcoal line-clamp-1 mb-1">{p.name}</h4>
//                         <p className="font-bold text-rose-600 text-sm mb-3">₹{p.price.toLocaleString("en-IN")}</p>
//                         <div className="flex gap-2">
//                           <button onClick={() => markInStock(p.id)} className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold py-2 rounded-xl hover:bg-emerald-100 transition-colors"><PackageCheck size={13}/> Restock</button>
//                           <button onClick={() => openEdit(p)} className="flex items-center justify-center gap-1.5 bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-2 rounded-xl hover:bg-blue-100 transition-colors"><Edit2 size={13}/></button>
//                           <button onClick={() => setDeleteConfirm(p.id)} className="flex items-center justify-center gap-1.5 bg-red-50 text-red-500 text-xs font-semibold px-3 py-2 rounded-xl hover:bg-red-100 transition-colors"><Trash2 size={13}/></button>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </>
//             )}
//           </div>
//         )}

//         {/* ── ANALYTICS TAB ── */}
//         {tab === "analytics" && (
//           <div className="animate-fade-in space-y-6">
//             <div className="bg-white rounded-2xl shadow-sm p-6">
//               <h3 className="font-display text-lg font-semibold text-charcoal mb-5">Products by Category</h3>
//               <div className="space-y-3">
//                 {catBreak.map((c) => (
//                   <div key={c.name}>
//                     <div className="flex justify-between text-sm mb-1"><span className="font-medium text-stone-700">{c.name}</span><span className="text-stone-400">{c.count} products</span></div>
//                     <div className="h-2 bg-stone-100 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full transition-all duration-500" style={{width:`${(c.count/total)*100}%`}}/></div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//               {[
//                 { label:"Total Inventory Value", value:`₹${products.reduce((s,p)=>s+p.price,0).toLocaleString("en-IN")}`, sub:"At selling prices" },
//                 { label:"Stock Health", value:`${total>0?Math.round((inStk/total)*100):0}%`, sub:"Products in stock" },
//                 { label:"Featured Products", value:featCnt, sub:"Shown on homepage" },
//               ].map((s) => (
//                 <div key={s.label} className="bg-white rounded-2xl shadow-sm p-5">
//                   <p className="text-xs text-stone-400 font-semibold uppercase tracking-widest mb-2">{s.label}</p>
//                   <p className="font-display text-2xl font-bold text-charcoal">{s.value}</p>
//                   <p className="text-xs text-stone-400 mt-1">{s.sub}</p>
//                 </div>
//               ))}
//             </div>
//             <div className="bg-white rounded-2xl shadow-sm p-6">
//               <h3 className="font-display text-lg font-semibold text-charcoal mb-4">Quick Actions</h3>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                 {[
//                   { icon:<Download size={18}/>, label:"Export Products", sub:"Download as JSON", fn:exportProducts },
//                   { icon:<Upload size={18}/>,   label:"Import Products", sub:"Upload JSON file", fn:() => fileRef.current?.click() },
//                   { icon:<PackageCheck size={18}/>, label:"Mark All In Stock", sub:"Restore all items", fn:markAllInStock },
//                   { icon:<RefreshCw size={18}/>, label:"Reset to Defaults", sub:"Restore original list", fn:() => { if(window.confirm("Reset? This cannot be undone.")) resetProducts(); } },
//                 ].map((a) => (
//                   <button key={a.label} onClick={a.fn} className="flex items-center gap-3 p-4 rounded-xl border border-stone-200 hover:border-rose-300 hover:bg-rose-50 transition-all text-left">
//                     <div className="text-stone-400">{a.icon}</div>
//                     <div><p className="text-sm font-semibold text-stone-700">{a.label}</p><p className="text-xs text-stone-400">{a.sub}</p></div>
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Delete modal */}
//       {deleteConfirm && (
//         <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
//           <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)}/>
//           <div className="relative bg-white rounded-3xl shadow-2xl p-7 max-w-sm w-full animate-scale-in">
//             <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><Trash2 size={24} className="text-red-500"/></div>
//             <h3 className="font-display text-xl font-semibold text-center text-charcoal mb-2">Delete Product?</h3>
//             <p className="text-stone-400 text-sm text-center mb-6">Yeh action undo nahi ho sakta.</p>
//             <div className="flex gap-3">
//               <button onClick={() => { deleteProduct(deleteConfirm); setDeleteConfirm(null); }} className="flex-1 bg-red-600 text-white py-3 rounded-2xl font-semibold text-sm hover:bg-red-700 transition-colors">Delete</button>
//               <button onClick={() => setDeleteConfirm(null)} className="flex-1 border-2 border-stone-200 py-3 rounded-2xl font-semibold text-sm text-stone-600 hover:border-stone-300 transition-colors">Cancel</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Bulk delete modal */}
//       {bulkConfirm && (
//         <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
//           <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setBulkConfirm(false)}/>
//           <div className="relative bg-white rounded-3xl shadow-2xl p-7 max-w-sm w-full animate-scale-in">
//             <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><PackageX size={24} className="text-red-500"/></div>
//             <h3 className="font-display text-xl font-semibold text-center text-charcoal mb-2">Remove All Out-of-Stock?</h3>
//             <p className="text-stone-400 text-sm text-center mb-6"><strong className="text-red-600">{outOfStock.length} products</strong> permanently delete ho jayenge.</p>
//             <div className="flex gap-3">
//               <button onClick={() => { removeOutOfStock(); setBulkConfirm(false); setTab("products"); }} className="flex-1 bg-red-600 text-white py-3 rounded-2xl font-semibold text-sm hover:bg-red-700 transition-colors">Remove All</button>
//               <button onClick={() => setBulkConfirm(false)} className="flex-1 border-2 border-stone-200 py-3 rounded-2xl font-semibold text-sm text-stone-600 hover:border-stone-300 transition-colors">Cancel</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
