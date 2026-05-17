"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { INITIAL_PRODUCTS } from "@/data/products";

const StoreContext = createContext(null);
const LS = { products: "rn_products_v3", admin: "rn_admin_v3", wishlist: "rn_wishlist_v3" };

function fromLS(key, fb) {
  if (typeof window === "undefined") return fb;
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : fb; } catch { return fb; }
}

export function StoreProvider({ children }) {
  const [products, setProducts]         = useState(INITIAL_PRODUCTS);
  const [cart, setCart]                 = useState([]);
  const [wishlist, setWishlist]         = useState([]);
  const [toast, setToast]               = useState(null);
  const [isAdminLoggedIn, setIsAdmin]   = useState(false);
  const [hydrated, setHydrated]         = useState(false);

  // Hydrate from localStorage after mount
  useEffect(() => {
    setProducts(fromLS(LS.products, INITIAL_PRODUCTS));
    setWishlist(fromLS(LS.wishlist, []));
    setIsAdmin(localStorage.getItem(LS.admin) === "true");
    setHydrated(true);
  }, []);

  useEffect(() => { if (hydrated) localStorage.setItem(LS.products, JSON.stringify(products)); }, [products, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem(LS.wishlist, JSON.stringify(wishlist)); }, [wishlist, hydrated]);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type, id: Date.now() });
    setTimeout(() => setToast(null), 3200);
  }, []);

  // Products
  const addProduct = useCallback((p) => {
    const np = { ...p, id: Date.now(), price: Number(p.price), originalPrice: p.originalPrice ? Number(p.originalPrice) : null, rating: parseFloat(p.rating) || 0, reviews: parseInt(p.reviews) || 0, inStock: p.inStock ?? true, featured: p.featured || false, badge: p.badge || null, createdAt: new Date().toISOString() };
    setProducts((prev) => [np, ...prev]);
    showToast(`"${p.name}" added!`);
    return np;
  }, [showToast]);

  const updateProduct = useCallback((id, data) => {
    setProducts((p) => p.map((x) => x.id === id ? { ...x, ...data } : x));
    showToast("Product updated!");
  }, [showToast]);

  const deleteProduct = useCallback((id) => {
    setProducts((p) => p.filter((x) => x.id !== id));
    showToast("Product deleted.", "error");
  }, [showToast]);

  const toggleStock = useCallback((id) => setProducts((p) => p.map((x) => x.id === id ? { ...x, inStock: !x.inStock } : x)), []);
  const markInStock = useCallback((id) => { setProducts((p) => p.map((x) => x.id === id ? { ...x, inStock: true } : x)); showToast("Marked in stock!"); }, [showToast]);
  const markAllInStock = useCallback(() => { setProducts((p) => p.map((x) => ({ ...x, inStock: true }))); showToast("All products in stock!"); }, [showToast]);

  const removeOutOfStock = useCallback(() => {
    const n = products.filter((p) => !p.inStock).length;
    setProducts((p) => p.filter((x) => x.inStock));
    showToast(`${n} product${n !== 1 ? "s" : ""} removed.`, "error");
  }, [products, showToast]);

  const exportProducts = useCallback(() => {
    const blob = new Blob([JSON.stringify(products, null, 2)], { type: "application/json" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `raja-nxt-products-${Date.now()}.json` });
    a.click(); URL.revokeObjectURL(a.href);
    showToast("Exported!");
  }, [products, showToast]);

  const importProducts = useCallback((json) => {
    try {
      const imp = JSON.parse(json);
      if (!Array.isArray(imp)) throw new Error();
      setProducts((p) => { const ids = new Set(p.map((x) => x.id)); const news = imp.filter((x) => !ids.has(x.id)); showToast(`${news.length} imported!`); return [...p, ...news]; });
    } catch { showToast("Invalid JSON.", "error"); }
  }, [showToast]);

  const resetProducts = useCallback(() => { setProducts(INITIAL_PRODUCTS); showToast("Reset to defaults."); }, [showToast]);

  // Cart
  const addToCart = useCallback((product, color, size) => {
    setCart((prev) => {
      const key = `${product.id}-${color}-${size}`;
      const ex = prev.find((i) => i._key === key);
      return ex ? prev.map((i) => i._key === key ? { ...i, qty: i.qty + 1 } : i) : [...prev, { ...product, selectedColor: color, selectedSize: size, qty: 1, _key: key }];
    });
    showToast("Added to bag! 🛍️");
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
    setWishlist((p) => { const isIn = p.includes(id); showToast(isIn ? "Removed from wishlist" : "Added to wishlist ❤️", isIn ? "info" : "success"); return isIn ? p.filter((x) => x !== id) : [...p, id]; });
  }, [showToast]);
  const isWishlisted = useCallback((id) => wishlist.includes(id), [wishlist]);

  // Admin
  const adminLogin = useCallback((pw) => {
    const correct = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin@raja123";
    if (pw === correct) { setIsAdmin(true); localStorage.setItem(LS.admin, "true"); showToast("Welcome, Admin! 👋"); return true; }
    showToast("Wrong password.", "error"); return false;
  }, [showToast]);

  const adminLogout = useCallback(() => { setIsAdmin(false); localStorage.removeItem(LS.admin); }, []);

  return (
    <StoreContext.Provider value={{
      products, addProduct, updateProduct, deleteProduct, toggleStock,
      markInStock, markAllInStock, removeOutOfStock, exportProducts, importProducts, resetProducts,
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
