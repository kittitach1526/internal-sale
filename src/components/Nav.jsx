import { useState, useEffect } from "react";
import { HiOutlineBell, HiOutlineChevronDown } from "react-icons/hi";

export default function Nav() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <nav className="border-b border-white/5 bg-slate-950/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/40">S</div>
            <span className="text-xl font-bold tracking-tight text-white">SALE<span className="text-blue-500">INSIGHT</span></span>
          </div>

          {/* Time Display */}
          <div className="hidden md:flex flex-col items-center bg-white/5 px-6 py-1.5 rounded-2xl border border-white/5">
            <span className="text-xl font-mono font-bold text-white tracking-widest leading-none">
              {time.toLocaleTimeString("th-TH", { hour12: false })}
            </span>
            <span className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mt-1">
              {time.toLocaleDateString("th-TH", { weekday: 'long', day: 'numeric', month: 'short' })}
            </span>
          </div>

          {/* Profile & Notify */}
          <div className="flex items-center gap-4">
            <button className="p-2.5 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-all relative">
              <HiOutlineBell size={20} className="text-slate-400" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#020617]"></span>
            </button>
            <div className="flex items-center gap-3 bg-white/5 p-1 rounded-full border border-white/10 hover:border-white/20 cursor-pointer transition-all">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">SS</div>
              <HiOutlineChevronDown size={14} className="text-slate-500 mr-2" />
            </div>
          </div>
        </div>

        {/* Sub Menu Tabs */}
        <div className="flex gap-2 pb-4 overflow-x-auto no-scrollbar">
          {["ภาพรวม", "ยอดขาย", "ค่าใช้จ่าย", "Log ระบบ", "ตั้งค่า"].map((menu, i) => (
            <button key={menu} className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${i === 0 ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"}`}>
              {menu}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}