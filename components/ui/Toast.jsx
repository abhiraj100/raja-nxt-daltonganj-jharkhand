"use client";
import { CheckCircle, XCircle, Info, AlertCircle } from "lucide-react";
import { useStore } from "@/context/StoreContext";

const STYLES = {
  success: { icon: <CheckCircle size={16} className="text-emerald-400" /> },
  error:   { icon: <XCircle size={16} className="text-rose-400" /> },
  info:    { icon: <Info size={16} className="text-sky-400" /> },
  warning: { icon: <AlertCircle size={16} className="text-amber-400" /> },
};

export default function Toast() {
  const { toast } = useStore();
  if (!toast) return null;
  const s = STYLES[toast.type] || STYLES.success;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] animate-slide-up pointer-events-none">
      <div className="bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[240px] max-w-sm">
        {s.icon}
        <span className="text-sm font-medium">{toast.msg}</span>
      </div>
    </div>
  );
}
