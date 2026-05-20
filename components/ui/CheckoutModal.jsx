"use client";
import { useState, useEffect, useRef } from "react";
import { X, MessageCircle, User, Phone, MapPin, Home, ChevronRight, ShoppingBag, CheckCircle, AlertCircle } from "lucide-react";

const WA_NUMBER = "918877085761";

function buildWAMessage(cart, cartTotal, customer) {
  const lines = [
    "🛍️ *New Order — Raja Nxt, Daltonganj*",
    "━━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "👤 *Customer Details*",
    `Name: ${customer.name}`,
    `Phone: ${customer.phone}`,
    `Address: ${customer.address}`,
    customer.landmark ? `Landmark: ${customer.landmark}` : null,
    "",
    "📦 *Order Items*",
    "━━━━━━━━━━━━━━━━━━━━━━━",
    ...cart.map((item, i) =>
      `${i + 1}. *${item.name}*\n` +
      `   Color: ${item.selectedColor || "—"} | Size: ${item.selectedSize || "—"}\n` +
      `   Qty: ${item.qty} × ₹${item.price.toLocaleString("en-IN")} = *₹${(item.price * item.qty).toLocaleString("en-IN")}*`
    ),
    "━━━━━━━━━━━━━━━━━━━━━━━",
    `💰 *Order Total: ₹${cartTotal.toLocaleString("en-IN")}*`,
    "",
    "Please confirm my order. Thank you! 🙏",
  ].filter(Boolean);

  return encodeURIComponent(lines.join("\n"));
}

// ─── Input field component ──────────────────────────────────────────────────
function Field({ icon: Icon, label, required, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 uppercase tracking-widest">
        <Icon size={11} className="text-rose-400"/>
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-red-500 font-medium">
          <AlertCircle size={10}/> {error}
        </p>
      )}
    </div>
  );
}

// ─── Order summary row ──────────────────────────────────────────────────────
function OrderRow({ item }) {
  const img = item.images?.[0] || item.image || "";
  return (
    <div className="flex gap-3 items-center py-2.5 border-b border-stone-50 last:border-0">
      {img && (
        <img src={img} alt={item.name}
          className="w-12 h-14 object-cover rounded-xl flex-shrink-0 bg-stone-100"
          onError={(e) => { e.target.style.display = "none"; }}
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-charcoal line-clamp-1">{item.name}</p>
        <p className="text-xs text-stone-400 mt-0.5">
          {item.selectedColor && <span>{item.selectedColor}</span>}
          {item.selectedColor && item.selectedSize && item.selectedSize !== "Free Size" && <span> · </span>}
          {item.selectedSize && item.selectedSize !== "Free Size" && <span>{item.selectedSize}</span>}
        </p>
        <p className="text-xs text-stone-500 mt-0.5">Qty: {item.qty}</p>
      </div>
      <p className="text-sm font-bold text-rose-600 flex-shrink-0">
        ₹{(item.price * item.qty).toLocaleString("en-IN")}
      </p>
    </div>
  );
}

// ─── Main CheckoutModal ─────────────────────────────────────────────────────
export default function CheckoutModal({ cart, cartTotal, onClose }) {
  const [step,      setStep]    = useState(1); // 1=details, 2=confirm
  const [sent,      setSent]    = useState(false);
  const [errors,    setErrors]  = useState({});
  const [form,      setForm]    = useState({
    name:     "",
    phone:    "",
    address:  "",
    landmark: "",
  });
  const nameRef = useRef(null);

  // Auto-focus name on open
  useEffect(() => { nameRef.current?.focus(); }, []);

  // Close on Escape
  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", fn); document.body.style.overflow = ""; };
  }, [onClose]);

  const set = (key) => (e) => {
    setForm((p) => ({ ...p, [key]: e.target.value }));
    setErrors((p) => ({ ...p, [key]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = "Naam required hai";
    if (!form.phone.trim())   e.phone   = "Phone number required hai";
    else if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, "")))
                               e.phone   = "Valid 10-digit mobile number daalo";
    if (!form.address.trim()) e.address = "Address required hai";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goToConfirm = () => { if (validate()) setStep(2); };

  const sendToWhatsApp = () => {
    const msg = buildWAMessage(cart, cartTotal, form);
    window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, "_blank");
    setSent(true);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}/>

      <div className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl animate-slide-up sm:animate-scale-in overflow-hidden max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center">
              <MessageCircle size={18} className="text-emerald-600"/>
            </div>
            <div>
              <p className="text-sm font-bold text-charcoal">
                {sent ? "Order Sent! 🎉" : step === 1 ? "Delivery Details" : "Order Confirm Karo"}
              </p>
              <p className="text-[11px] text-stone-400">
                {sent ? "WhatsApp pe confirm karo" : `${cart.length} item${cart.length > 1 ? "s" : ""} · ₹${cartTotal.toLocaleString("en-IN")}`}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center transition-colors">
            <X size={16}/>
          </button>
        </div>

        {/* Step dots */}
        {!sent && (
          <div className="flex items-center justify-center gap-2 py-3 flex-shrink-0">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all
                  ${step >= s ? "bg-rose-600 text-white" : "bg-stone-100 text-stone-400"}`}>
                  {step > s ? <CheckCircle size={13} className="fill-white"/> : s}
                </div>
                <span className={`text-[11px] font-medium ${step >= s ? "text-rose-600" : "text-stone-400"}`}>
                  {s === 1 ? "Details" : "Confirm"}
                </span>
                {s < 2 && <div className={`w-8 h-0.5 ${step > s ? "bg-rose-400" : "bg-stone-200"}`}/>}
              </div>
            ))}
          </div>
        )}

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1">

          {/* ── STEP 1 — Details form ──────────────────────── */}
          {!sent && step === 1 && (
            <div className="px-5 pb-5 space-y-4">
              <Field icon={User} label="Name" required error={errors.name}>
                <input
                  ref={nameRef}
                  type="text"
                  value={form.name}
                  onChange={set("name")}
                  placeholder="Enter Your Name"
                  className={`input-field w-full text-sm ${errors.name ? "border-red-400 focus:ring-red-200" : ""}`}
                />
              </Field>

              <Field icon={Phone} label="Phone Number" required error={errors.phone}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-stone-500">+91</span>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={set("phone")}
                    placeholder="98765 43210"
                    maxLength={10}
                    className={`input-field w-full text-sm pl-12 ${errors.phone ? "border-red-400 focus:ring-red-200" : ""}`}
                  />
                </div>
              </Field>

              <Field icon={MapPin} label="Complete Address" required error={errors.address}>
                <textarea
                  value={form.address}
                  onChange={set("address")}
                  placeholder="Ghar/flat no., gali, mohalla, shahar, pin code..."
                  rows={3}
                  className={`input-field w-full text-sm resize-none ${errors.address ? "border-red-400 focus:ring-red-200" : ""}`}
                />
              </Field>

              <Field icon={Home} label="Landmark (optional)" error={errors.landmark}>
                <input
                  type="text"
                  value={form.landmark}
                  onChange={set("landmark")}
                  placeholder="Enter Your Landmark Here"
                  className="input-field w-full text-sm"
                />
              </Field>
            </div>
          )}

          {/* ── STEP 2 — Review + confirm ──────────────────── */}
          {!sent && step === 2 && (
            <div className="px-5 pb-5 space-y-4">
              {/* Customer info card */}
              <div className="bg-stone-50 rounded-2xl p-4 space-y-2.5">
                <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">Delivery Details</p>
                <div className="flex gap-2.5 items-start">
                  <User size={14} className="text-rose-400 flex-shrink-0 mt-0.5"/>
                  <div>
                    <p className="text-sm font-semibold text-charcoal">{form.name}</p>
                    <p className="text-xs text-stone-500">+91 {form.phone}</p>
                  </div>
                  <button onClick={() => setStep(1)}
                    className="ml-auto text-[11px] text-rose-500 hover:text-rose-700 font-semibold border border-rose-200 hover:border-rose-400 px-2 py-1 rounded-lg transition-colors">
                    Edit
                  </button>
                </div>
                <div className="flex gap-2.5 items-start">
                  <MapPin size={14} className="text-rose-400 flex-shrink-0 mt-0.5"/>
                  <div>
                    <p className="text-sm text-charcoal">{form.address}</p>
                    {form.landmark && <p className="text-xs text-stone-400 mt-0.5">Landmark: {form.landmark}</p>}
                  </div>
                </div>
              </div>

              {/* Order items */}
              <div className="bg-white border border-stone-100 rounded-2xl px-4 py-1">
                <p className="text-xs font-bold text-stone-500 uppercase tracking-widest pt-3 pb-2">Order Summary</p>
                {cart.map((item) => <OrderRow key={item._key} item={item}/>)}
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm font-bold text-charcoal">Total</span>
                  <span className="font-display text-xl font-bold text-rose-600">₹{cartTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <p className="text-[11px] text-stone-400 text-center px-2">
                WhatsApp pe order bhejne ke baad Raja Nxt confirm karega 📞
              </p>
            </div>
          )}

          {/* ── SENT state ─────────────────────────────────── */}
          {sent && (
            <div className="px-5 pb-8 flex flex-col items-center text-center gap-4 pt-4">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle size={40} className="text-emerald-500"/>
              </div>
              <div>
                <p className="font-display text-xl font-bold text-charcoal">Order Bhej Diya! 🎉</p>
                <p className="text-stone-500 text-sm mt-1">WhatsApp pe Raja Nxt se confirm karo</p>
              </div>
              <div className="bg-stone-50 rounded-2xl p-4 w-full text-left space-y-2">
                <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Order Summary</p>
                <p className="text-sm text-charcoal"><span className="text-stone-400">Name: </span>{form.name}</p>
                <p className="text-sm text-charcoal"><span className="text-stone-400">Phone: </span>+91 {form.phone}</p>
                <p className="text-sm text-charcoal"><span className="text-stone-400">Address: </span>{form.address}</p>
                {form.landmark && <p className="text-sm text-charcoal"><span className="text-stone-400">Landmark: </span>{form.landmark}</p>}
                <div className="border-t border-stone-200 pt-2 mt-2">
                  <p className="text-sm font-bold text-rose-600">Total: ₹{cartTotal.toLocaleString("en-IN")}</p>
                </div>
              </div>
              <button onClick={onClose}
                className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-600 font-semibold text-sm rounded-2xl transition-colors">
                Close
              </button>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        {!sent && (
          <div className="px-5 py-4 border-t border-stone-100 flex-shrink-0 space-y-2.5">
            {step === 1 ? (
              <button
                onClick={goToConfirm}
                className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-md active:scale-95">
                Next — Review Order <ChevronRight size={16}/>
              </button>
            ) : (
              <button
                onClick={sendToWhatsApp}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-md active:scale-95">
                <MessageCircle size={17}/>
                Send Order on WhatsApp
              </button>
            )}
            {step === 2 && (
              <button onClick={() => setStep(1)} className="w-full text-xs text-stone-400 hover:text-stone-600 transition-colors py-1">
                ← Back to edit details
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}