"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { INITIAL_PRODUCTS } from "@/data/products";

const StoreContext = createContext(null);
const LS = { admin: "rn_admin_v3", wishlist: "rn_wishlist_v3" };

function fromLS(key, fb) {
  if (typeof window === "undefined") return fb;
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : fb; } catch { return fb; }
}

export function StoreProvider({ children }) {
  const [products, setProducts]       = useState([]);
  const [cart, setCart]               = useState([]);
  const [wishlist, setWishlist]       = useState([]);
  const [toast, setToast]             = useState(null);
  const [isAdminLoggedIn, setIsAdmin] = useState(false);
  const [hydrated, setHydrated]       = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // FIX: Products ab database se fetch hote hain (localStorage se nahi)
  const fetchProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const res = await fetch("/api/products", { cache: "no-store" });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setProducts(data.products || INITIAL_PRODUCTS);
    } catch (err) {
      console.error("Products fetch failed:", err);
      setProducts(INITIAL_PRODUCTS);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    setWishlist(fromLS(LS.wishlist, []));
    setIsAdmin(localStorage.getItem(LS.admin) === "true");
    setHydrated(true);
  }, [fetchProducts]);

  useEffect(() => { if (hydrated) localStorage.setItem(LS.wishlist, JSON.stringify(wishlist)); }, [wishlist, hydrated]);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type, id: Date.now() });
    setTimeout(() => setToast(null), 3200);
  }, []);

  const addProduct = useCallback(async (p) => {
    try {
      const res = await fetch("/api/products", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(p),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Add failed");
      setProducts((prev) => [data.product, ...prev]);
      showToast(`"${p.name}" add ho gaya!`);
      return data.product;
    } catch (err) {
      showToast(err.message || "Product add nahi ho saka.", "error");
    }
  }, [showToast]);

  const updateProduct = useCallback(async (id, updatedData) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(updatedData),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setProducts((p) => p.map((x) => x.id === id ? { ...x, ...updatedData } : x));
      showToast("Product update ho gaya!");
    } catch (err) {
      showToast(err.message || "Update nahi ho saka.", "error");
    }
  }, [showToast]);

  const deleteProduct = useCallback(async (id) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setProducts((p) => p.filter((x) => x.id !== id));
      showToast("Product delete ho gaya.", "error");
    } catch (err) {
      showToast(err.message || "Delete nahi ho saka.", "error");
    }
  }, [showToast]);

  const toggleStock = useCallback(async (id) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    const newStock = !product.inStock;
    try {
      await fetch(`/api/products/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ inStock: newStock }),
      });
      setProducts((p) => p.map((x) => x.id === id ? { ...x, inStock: newStock } : x));
    } catch {
      showToast("Stock toggle nahi ho saka.", "error");
    }
  }, [products, showToast]);

  const markInStock = useCallback(async (id) => {
    try {
      await fetch(`/api/products/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ inStock: true }),
      });
      setProducts((p) => p.map((x) => x.id === id ? { ...x, inStock: true } : x));
      showToast("In Stock mark ho gaya!");
    } catch {
      showToast("Error.", "error");
    }
  }, [showToast]);

  const markAllInStock = useCallback(async () => {
    try {
      await Promise.all(products.map((p) =>
        fetch(`/api/products/${p.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inStock: true }),
        })
      ));
      setProducts((p) => p.map((x) => ({ ...x, inStock: true })));
      showToast("Sab products in stock!");
    } catch {
      showToast("Kuch products update nahi hue.", "error");
    }
  }, [products, showToast]);

  const removeOutOfStock = useCallback(async () => {
    const outOfStock = products.filter((p) => !p.inStock);
    try {
      await Promise.all(outOfStock.map((p) => fetch(`/api/products/${p.id}`, { method: "DELETE" })));
      setProducts((p) => p.filter((x) => x.inStock));
      showToast(`${outOfStock.length} product${outOfStock.length !== 1 ? "s" : ""} remove ho gaye.`, "error");
    } catch {
      showToast("Kuch delete nahi hue.", "error");
    }
  }, [products, showToast]);

  const exportProducts = useCallback(() => {
    const blob = new Blob([JSON.stringify(products, null, 2)], { type: "application/json" });
    const a = Object.assign(document.createElement("a"), {
      href:     URL.createObjectURL(blob),
      download: `raja-nxt-products-${Date.now()}.json`,
    });
    a.click(); URL.revokeObjectURL(a.href);
    showToast("Export ho gaya!");
  }, [products, showToast]);

  const importProducts = useCallback(async (json) => {
    try {
      const imp = JSON.parse(json);
      if (!Array.isArray(imp)) throw new Error();
      const existing = new Set(products.map((x) => x.id));
      const newOnes  = imp.filter((x) => !existing.has(x.id));
      const adds = newOnes.map((p) =>
        fetch("/api/products", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(p),
        }).then((r) => r.json()).then((d) => d.product)
      );
      const added = (await Promise.all(adds)).filter(Boolean);
      setProducts((p) => [...p, ...added]);
      showToast(`${added.length} import ho gaye!`);
    } catch {
      showToast("Invalid JSON file.", "error");
    }
  }, [products, showToast]);

  const resetProducts = useCallback(async () => {
    showToast("Reset ho raha hai...");
    try {
      await Promise.all(products.map((p) => fetch(`/api/products/${p.id}`, { method: "DELETE" })));
      const adds = INITIAL_PRODUCTS.map((p) =>
        fetch("/api/products", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(p),
        }).then((r) => r.json()).then((d) => d.product)
      );
      const added = (await Promise.all(adds)).filter(Boolean);
      setProducts(added.length ? added : INITIAL_PRODUCTS);
      showToast("Reset ho gaya!");
    } catch {
      showToast("Reset mein error.", "error");
    }
  }, [products, showToast]);

  // Cart
  const addToCart = useCallback((product, color, size) => {
    setCart((prev) => {
      const key = `${product.id}-${color}-${size}`;
      const ex  = prev.find((i) => i._key === key);
      return ex
        ? prev.map((i) => i._key === key ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { ...product, selectedColor: color, selectedSize: size, qty: 1, _key: key }];
    });
    showToast("Added to bag!");
  }, [showToast]);

  const updateCartQty = useCallback((key, qty) => {
    if (qty < 1) { setCart((p) => p.filter((i) => i._key !== key)); return; }
    setCart((p) => p.map((i) => i._key === key ? { ...i, qty } : i));
  }, []);

  const removeFromCart = useCallback((key) => setCart((p) => p.filter((i) => i._key !== key)), []);
  const clearCart      = useCallback(() => setCart([]), []);
  const cartTotal      = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount      = cart.reduce((s, i) => s + i.qty, 0);

  // Wishlist
  const toggleWishlist = useCallback((id) => {
    setWishlist((p) => {
      const isIn = p.includes(id);
      showToast(isIn ? "Wishlist se remove kiya" : "Wishlist mein add!", isIn ? "info" : "success");
      return isIn ? p.filter((x) => x !== id) : [...p, id];
    });
  }, [showToast]);

  const isWishlisted = useCallback((id) => wishlist.includes(id), [wishlist]);

  // Admin Auth
  const adminLogin = useCallback((pw) => {
    const correct = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin@raja123";
    if (pw === correct) {
      setIsAdmin(true);
      localStorage.setItem(LS.admin, "true");
      showToast("Welcome, Admin!");
      return true;
    }
    showToast("Wrong password.", "error");
    return false;
  }, [showToast]);

  const adminLogout = useCallback(() => {
    setIsAdmin(false);
    localStorage.removeItem(LS.admin);
  }, []);

  return (
    <StoreContext.Provider value={{
      products, addProduct, updateProduct, deleteProduct, toggleStock,
      markInStock, markAllInStock, removeOutOfStock, exportProducts, importProducts, resetProducts,
      fetchProducts, loadingProducts,
      cart, addToCart, updateCartQty, removeFromCart, clearCart, cartTotal, cartCount,
      wishlist, toggleWishlist, isWishlisted,
      isAdminLoggedIn, adminLogin, adminLogout,
      toast, hydrated,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be inside StoreProvider");
  return ctx;
}


// "use client";
// import { createContext, useContext, useState, useEffect, useCallback } from "react";
// import { INITIAL_PRODUCTS } from "@/data/products";

// const StoreContext = createContext(null);
// const LS = { products: "rn_products_v3", admin: "rn_admin_v3", wishlist: "rn_wishlist_v3" };

// function fromLS(key, fb) {
//   if (typeof window === "undefined") return fb;
//   try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : fb; } catch { return fb; }
// }

// export function StoreProvider({ children }) {
//   const [products, setProducts]         = useState(INITIAL_PRODUCTS);
//   const [cart, setCart]                 = useState([]);
//   const [wishlist, setWishlist]         = useState([]);
//   const [toast, setToast]               = useState(null);
//   const [isAdminLoggedIn, setIsAdmin]   = useState(false);
//   const [hydrated, setHydrated]         = useState(false);

//   // Hydrate from localStorage after mount
//   useEffect(() => {
//     setProducts(fromLS(LS.products, INITIAL_PRODUCTS));
//     setWishlist(fromLS(LS.wishlist, []));
//     setIsAdmin(localStorage.getItem(LS.admin) === "true");
//     setHydrated(true);
//   }, []);

//   useEffect(() => { if (hydrated) localStorage.setItem(LS.products, JSON.stringify(products)); }, [products, hydrated]);
//   useEffect(() => { if (hydrated) localStorage.setItem(LS.wishlist, JSON.stringify(wishlist)); }, [wishlist, hydrated]);

//   const showToast = useCallback((msg, type = "success") => {
//     setToast({ msg, type, id: Date.now() });
//     setTimeout(() => setToast(null), 3200);
//   }, []);

//   // Products
//   const addProduct = useCallback((p) => {
//     const np = { ...p, id: Date.now(), price: Number(p.price), originalPrice: p.originalPrice ? Number(p.originalPrice) : null, rating: parseFloat(p.rating) || 0, reviews: parseInt(p.reviews) || 0, inStock: p.inStock ?? true, featured: p.featured || false, badge: p.badge || null, createdAt: new Date().toISOString() };
//     setProducts((prev) => [np, ...prev]);
//     showToast(`"${p.name}" added!`);
//     return np;
//   }, [showToast]);

//   const updateProduct = useCallback((id, data) => {
//     setProducts((p) => p.map((x) => x.id === id ? { ...x, ...data } : x));
//     showToast("Product updated!");
//   }, [showToast]);

//   const deleteProduct = useCallback((id) => {
//     setProducts((p) => p.filter((x) => x.id !== id));
//     showToast("Product deleted.", "error");
//   }, [showToast]);

//   const toggleStock = useCallback((id) => setProducts((p) => p.map((x) => x.id === id ? { ...x, inStock: !x.inStock } : x)), []);
//   const markInStock = useCallback((id) => { setProducts((p) => p.map((x) => x.id === id ? { ...x, inStock: true } : x)); showToast("Marked in stock!"); }, [showToast]);
//   const markAllInStock = useCallback(() => { setProducts((p) => p.map((x) => ({ ...x, inStock: true }))); showToast("All products in stock!"); }, [showToast]);

//   const removeOutOfStock = useCallback(() => {
//     const n = products.filter((p) => !p.inStock).length;
//     setProducts((p) => p.filter((x) => x.inStock));
//     showToast(`${n} product${n !== 1 ? "s" : ""} removed.`, "error");
//   }, [products, showToast]);

//   const exportProducts = useCallback(() => {
//     const blob = new Blob([JSON.stringify(products, null, 2)], { type: "application/json" });
//     const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `raja-nxt-products-${Date.now()}.json` });
//     a.click(); URL.revokeObjectURL(a.href);
//     showToast("Exported!");
//   }, [products, showToast]);

//   const importProducts = useCallback((json) => {
//     try {
//       const imp = JSON.parse(json);
//       if (!Array.isArray(imp)) throw new Error();
//       setProducts((p) => { const ids = new Set(p.map((x) => x.id)); const news = imp.filter((x) => !ids.has(x.id)); showToast(`${news.length} imported!`); return [...p, ...news]; });
//     } catch { showToast("Invalid JSON.", "error"); }
//   }, [showToast]);

//   const resetProducts = useCallback(() => { setProducts(INITIAL_PRODUCTS); showToast("Reset to defaults."); }, [showToast]);

//   // Cart
//   const addToCart = useCallback((product, color, size) => {
//     setCart((prev) => {
//       const key = `${product.id}-${color}-${size}`;
//       const ex = prev.find((i) => i._key === key);
//       return ex ? prev.map((i) => i._key === key ? { ...i, qty: i.qty + 1 } : i) : [...prev, { ...product, selectedColor: color, selectedSize: size, qty: 1, _key: key }];
//     });
//     showToast("Added to bag! 🛍️");
//   }, [showToast]);

//   const updateCartQty = useCallback((key, qty) => {
//     if (qty < 1) { setCart((p) => p.filter((i) => i._key !== key)); return; }
//     setCart((p) => p.map((i) => i._key === key ? { ...i, qty } : i));
//   }, []);

//   const removeFromCart = useCallback((key) => setCart((p) => p.filter((i) => i._key !== key)), []);
//   const clearCart      = useCallback(() => setCart([]), []);
//   const cartTotal      = cart.reduce((s, i) => s + i.price * i.qty, 0);
//   const cartCount      = cart.reduce((s, i) => s + i.qty, 0);

//   // Wishlist
//   const toggleWishlist = useCallback((id) => {
//     setWishlist((p) => { const isIn = p.includes(id); showToast(isIn ? "Removed from wishlist" : "Added to wishlist ❤️", isIn ? "info" : "success"); return isIn ? p.filter((x) => x !== id) : [...p, id]; });
//   }, [showToast]);
//   const isWishlisted = useCallback((id) => wishlist.includes(id), [wishlist]);

//   // Admin
//   const adminLogin = useCallback((pw) => {
//     const correct = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin@raja123";
//     if (pw === correct) { setIsAdmin(true); localStorage.setItem(LS.admin, "true"); showToast("Welcome, Admin! 👋"); return true; }
//     showToast("Wrong password.", "error"); return false;
//   }, [showToast]);

//   const adminLogout = useCallback(() => { setIsAdmin(false); localStorage.removeItem(LS.admin); }, []);

//   return (
//     <StoreContext.Provider value={{
//       products, addProduct, updateProduct, deleteProduct, toggleStock,
//       markInStock, markAllInStock, removeOutOfStock, exportProducts, importProducts, resetProducts,
//       cart, addToCart, updateCartQty, removeFromCart, clearCart, cartTotal, cartCount,
//       wishlist, toggleWishlist, isWishlisted,
//       isAdminLoggedIn, adminLogin, adminLogout,
//       toast, hydrated,
//     }}>
//       {children}
//     </StoreContext.Provider>
//   );
// }

// export function useStore() {
//   const ctx = useContext(StoreContext);
//   if (!ctx) throw new Error("useStore must be inside StoreProvider");
//   return ctx;
// }
