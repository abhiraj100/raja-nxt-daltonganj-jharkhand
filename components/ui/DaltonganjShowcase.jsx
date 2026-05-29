"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { MapPin, Phone, Clock, Star, ArrowRight, Sparkles, Users, ShoppingBag, Award, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";

// ─── Store data ─────────────────────────────────────────────────────────────
const STORES = [
  {
    id: 1,
    name: "Raja Nxt — Main Bazaar",
    tag: "Flagship Store",
    address: "Main Bazaar, Daltonganj, Jharkhand 822101",
    phone: "+91 88770 85761",
    hours: "10:00 AM – 9:00 PM",
    days: "Mon – Sun (Open Daily)",
    specialty: "Bridal Lehengas, Designer Sarees",
    rating: 4.9,
    reviews: 840,
    color: "rose",
    img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80",
    features: ["Bridal Section", "Trial Room", "Gift Wrapping", "Home Delivery"],
  },
  {
    id: 2,
    name: "Raja Nxt — Station Road",
    tag: "2nd Store",
    address: "Station Road, Near Bus Stand, Daltonganj, Jharkhand",
    phone: "+91 88770 85762",
    hours: "10:00 AM – 8:30 PM",
    days: "Mon – Sat",
    specialty: "Kurtis, Suits, Western Wear",
    rating: 4.8,
    reviews: 612,
    color: "purple",
    img: "https://images.unsplash.com/photo-1583391733956-6c78276477e1?w=600&q=80",
    features: ["Daily Wear", "Casual Kurtis", "Party Wear", "Festive Collection"],
  },
  {
    id: 3,
    name: "Raja Nxt — Medininagar Mall",
    tag: "Premium Outlet",
    address: "Medininagar Shopping Complex, Daltonganj",
    phone: "+91 88770 85763",
    hours: "11:00 AM – 9:00 PM",
    days: "Mon – Sun",
    specialty: "Accessories, Footwear, Jewellery",
    rating: 4.7,
    reviews: 389,
    color: "amber",
    img: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80",
    features: ["Accessories", "Footwear", "Imitation Jewellery", "Handbags"],
  },
];

// ─── Category varieties ──────────────────────────────────────────────────────
const VARIETIES = [
  { label: "Sarees",          count: "200+",  icon: "🥻", desc: "Silk, Georgette, Chiffon, Cotton" },
  { label: "Lehengas",        count: "150+",  icon: "👗", desc: "Bridal, Party, Festive" },
  { label: "Kurtis & Suits",  count: "300+",  icon: "👘", desc: "Daily, Formal, Designer" },
  { label: "Western Wear",    count: "180+",  icon: "🛍️", desc: "Tops, Dresses, Co-ords" },
  { label: "Accessories",     count: "400+",  icon: "💍", desc: "Jewellery, Bags, Scarves" },
  { label: "Footwear",        count: "120+",  icon: "👡", desc: "Heels, Flats, Ethnic" },
];

const colorMap = {
  rose:   { pill: "bg-rose-100 text-rose-700",   border: "border-rose-200",   btn: "bg-rose-600 hover:bg-rose-700",   dot: "bg-rose-500",   badge: "bg-rose-600" },
  purple: { pill: "bg-purple-100 text-purple-700", border: "border-purple-200", btn: "bg-purple-600 hover:bg-purple-700", dot: "bg-purple-500", badge: "bg-purple-600" },
  amber:  { pill: "bg-amber-100 text-amber-700",  border: "border-amber-200",  btn: "bg-amber-600 hover:bg-amber-700",  dot: "bg-amber-500",  badge: "bg-amber-600" },
};

// ─── Stat counter ────────────────────────────────────────────────────────────
function Counter({ target, suffix = "", duration = 1800 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const num = parseInt(target.replace(/\D/g, "")) || 0;
        const step = Math.ceil(num / (duration / 16));
        let cur = 0;
        const iv = setInterval(() => {
          cur = Math.min(cur + step, num);
          setCount(cur);
          if (cur >= num) clearInterval(iv);
        }, 16);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count.toLocaleString("en-IN")}{suffix}</span>;
}

// ─── Store card ──────────────────────────────────────────────────────────────
function StoreCard({ store, active, onClick }) {
  const c = colorMap[store.color];
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-2xl border-2 transition-all duration-300 overflow-hidden
        ${active ? `${c.border} shadow-xl scale-[1.02]` : "border-stone-100 hover:border-stone-200 hover:shadow-md"}`}
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <img src={store.img} alt={store.name}
          className={`w-full h-full object-cover transition-transform duration-500 ${active ? "scale-110" : "scale-100 hover:scale-105"}`}/>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"/>
        <span className={`absolute top-3 left-3 ${c.badge} text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider`}>
          {store.tag}
        </span>
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
          <Star size={12} className="text-amber-400 fill-amber-400"/>
          <span className="text-white text-xs font-bold">{store.rating}</span>
          <span className="text-white/70 text-xs">({store.reviews})</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 bg-white">
        <p className="font-display text-base font-bold text-charcoal leading-tight mb-1">{store.name}</p>
        <p className={`text-[11px] font-semibold mb-3 ${c.pill.split(" ")[1]}`}>{store.specialty}</p>

        <div className="space-y-1.5">
          <div className="flex items-start gap-2">
            <MapPin size={12} className="text-stone-400 flex-shrink-0 mt-0.5"/>
            <p className="text-xs text-stone-500 leading-relaxed">{store.address}</p>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={12} className="text-stone-400 flex-shrink-0"/>
            <p className="text-xs text-stone-500">{store.hours}</p>
          </div>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {store.features.map((f) => (
            <span key={f} className={`${c.pill} text-[10px] font-medium px-2 py-0.5 rounded-full`}>{f}</span>
          ))}
        </div>

        {/* CTA */}
        <a href={`https://wa.me/918877085761?text=Hello! I want to visit your ${store.name} store.`}
          target="_blank" rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className={`mt-4 w-full py-2.5 ${c.btn} text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors`}>
          <MessageCircle size={13}/> Get Directions on WhatsApp
        </a>
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function DaltonganjShowcase() {
  const [activeStore, setActiveStore] = useState(0);
  const [varIdx, setVarIdx]           = useState(0);
  const varRef = useRef(null);

  // Auto-rotate variety cards
  useEffect(() => {
    const iv = setInterval(() => setVarIdx((i) => (i + 1) % VARIETIES.length), 2800);
    return () => clearInterval(iv);
  }, []);

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="container-xl">

        {/* ── Section header ──────────────────────────────── */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-flex items-center gap-2 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 px-4 py-2 rounded-full mb-5 tracking-widest uppercase">
            <MapPin size={12}/> Daltonganj, Jharkhand
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-charcoal leading-tight mb-4">
            Jharkhand Ka Sabse Bada<br/>
            <span className="text-rose-600">Women's Fashion Destination</span>
          </h2>
          <p className="text-stone-500 text-base leading-relaxed">
            Daltonganj mein hamare <strong className="text-charcoal">3 showrooms</strong> hain — hazaron styles, sabse acche daam, aur woh personal touch jo sirf Raja Nxt deta hai.
          </p>
        </div>

        {/* ── Stats row ────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-14">
          {[
            { value: "3",     suffix: "",    label: "Showrooms", sub: "Daltonganj mein",   icon: <ShoppingBag size={20} className="text-rose-600"/> },
            { value: "2000",  suffix: "+",   label: "Customers", sub: "Monthly visits",    icon: <Users size={20} className="text-purple-600"/> },
            { value: "1200",  suffix: "+",   label: "Varieties",  sub: "Female fashion",   icon: <Sparkles size={20} className="text-amber-500"/> },
            { value: "12",    suffix: "",    label: "Years",      sub: "Trusted since 2013", icon: <Award size={20} className="text-emerald-600"/> },
          ].map((s) => (
            <div key={s.label}
              className="bg-stone-50 hover:bg-rose-50 transition-colors rounded-2xl p-5 text-center border border-stone-100 hover:border-rose-100 group">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                {s.icon}
              </div>
              <p className="font-display text-3xl font-bold text-charcoal">
                <Counter target={s.value} suffix={s.suffix}/>
              </p>
              <p className="text-sm font-semibold text-charcoal mt-0.5">{s.label}</p>
              <p className="text-[11px] text-stone-400 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Store cards ──────────────────────────────────── */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-2xl font-bold text-charcoal">Hamare Stores</h3>
            <div className="flex items-center gap-2">
              {STORES.map((_, i) => (
                <button key={i} onClick={() => setActiveStore(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === activeStore ? "bg-rose-600 w-8" : "bg-stone-200 w-3"}`}/>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {STORES.map((store, i) => (
              <StoreCard key={store.id} store={store} active={activeStore === i} onClick={() => setActiveStore(i)}/>
            ))}
          </div>
        </div>

        {/* ── Varieties showcase ────────────────────────────── */}
        <div className="rounded-3xl bg-gradient-to-br from-rose-600 via-rose-500 to-pink-600 p-8 sm:p-12 relative overflow-hidden mb-14">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4"/>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4"/>

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-bold text-rose-200 bg-white/10 px-3 py-1.5 rounded-full mb-4 tracking-widest uppercase">
                <Sparkles size={11}/> Large Variety Available
              </span>
              <h3 className="font-display text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">
                1,200+ Styles —<br/>
                <span className="text-rose-200">Sirf Women's Fashion</span>
              </h3>
              <p className="text-rose-100 leading-relaxed text-sm mb-6">
                Casual wear se lekar bridal collection tak — Raja Nxt mein har occasion ke liye perfect outfit milega. Regularly naye designs aate hain taaki aap hamesha trendy rahen.
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {["New Stock Weekly", "All Sizes Available", "Budget Friendly", "Premium Quality"].map((t) => (
                  <span key={t} className="text-[11px] font-semibold text-white bg-white/15 border border-white/20 px-3 py-1.5 rounded-full">{t}</span>
                ))}
              </div>
              <Link href="/products"
                className="inline-flex items-center gap-2.5 bg-white text-rose-600 font-bold text-sm px-6 py-3.5 rounded-2xl hover:bg-rose-50 transition-colors shadow-lg shadow-rose-900/30 active:scale-95">
                Browse Collection <ArrowRight size={16}/>
              </Link>
            </div>

            {/* Animated variety ticker */}
            <div className="grid grid-cols-2 gap-3">
              {VARIETIES.map((v, i) => (
                <div key={v.label}
                  style={{ animationDelay: `${i * 100}ms` }}
                  className={`bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl p-4 transition-all duration-300 cursor-default
                    ${i === varIdx ? "bg-white/20 border-white/40 scale-[1.03] shadow-lg" : ""}`}>
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="text-2xl">{v.icon}</span>
                    <span className="font-display text-xl font-bold text-white">{v.count}</span>
                  </div>
                  <p className="text-white text-xs font-semibold">{v.label}</p>
                  <p className="text-rose-200 text-[10px] mt-0.5">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── "Visit us" CTA strip ─────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5 bg-stone-50 rounded-2xl p-6 border border-stone-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <MapPin size={22} className="text-rose-600"/>
            </div>
            <div>
              <p className="font-display text-lg font-bold text-charcoal">Aaj Hi Visit Karein</p>
              <p className="text-stone-500 text-sm">Daltonganj, Jharkhand · 3 convenient locations</p>
            </div>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <a href="https://wa.me/918877085761?text=Hello Raja Nxt! I want to visit your store."
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm px-5 py-3 rounded-xl transition-colors shadow-sm">
              <MessageCircle size={15}/> WhatsApp
            </a>
            <a href="tel:+918877085761"
              className="flex items-center gap-2 bg-white border border-stone-200 hover:border-rose-300 text-charcoal font-semibold text-sm px-5 py-3 rounded-xl transition-colors">
              <Phone size={15}/> Call Now
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
