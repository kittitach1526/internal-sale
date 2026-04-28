import { useState, useEffect, useRef } from "react";
// ใช้ไอคอนที่มีชัวร์ๆ ในชุด hi
import { HiOutlineBell, HiOutlineChevronDown, HiOutlineUser, HiOutlineLogout, HiOutlineAdjustments } from "react-icons/hi";
import logo from '../assets/logo.png'
import { Link, useLocation, useNavigate } from "react-router-dom";
import { isAdminOrRoot, getCurrentUser } from '../utils/auth';
import { logLogout } from '../utils/logger';

export default function Nav() {

  const location = useLocation();
  const navigate = useNavigate();

  // กรองเมนูตามสิทธิ์ผู้ใช้
  const allMenuItems = [
    { name: "ภาพรวม", path: "/", adminOnly: false },
    { name: "ยอดขาย", path: "/sales", adminOnly: false },
    { name: "ค่าใช้จ่าย", path: "/expenses", adminOnly: false },
    { name: "Log ระบบ", path: "/logs", adminOnly: true },
    { name: "ตั้งค่า", path: "/settings", adminOnly: true },
  ];

  const menuItems = allMenuItems.filter(item => {
    // ถ้าไม่ต้องการสิทธิ์ admin ให้แสดงเสมอ
    if (!item.adminOnly) return true;
    // ถ้าต้องการสิทธิ์ admin ให้ตรวจสอบว่าเป็น admin/root หรือไม่
    return isAdminOrRoot();
  });

  const [time, setTime] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false); // State สำหรับเปิด-ปิดเมนู
  const menuRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // คลิกข้างนอกแล้วให้ปิดเมนู
  useEffect(() => {
    const closeMenu = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  // ฟังก์ชันออกจากระบบ
  const handleLogout = async () => {
    // ดึงข้อมูลผู้ใช้ก่อนลบ
    const currentUser = getCurrentUser();
    
    // บันทึก log การออกจากระบบ
    await logLogout(currentUser);
    
    // ลบข้อมูลผู้ใช้จาก localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // ปิดเมนู dropdown
    setIsOpen(false);
    
    // ไปหน้า login
    navigate('/login');
  };

  return (
    <nav className="border-b border-white/5 bg-slate-950/60 backdrop-blur-xl relative z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src={logo} alt="" className="w-16 h-auto" />
            <span className="text-xl font-bold tracking-tight text-white uppercase">BEST<span className="text-blue-500">ENERGY</span></span>
          </div>

          {/* Time Display */}
          <div className="hidden md:flex flex-col items-center bg-white/5 px-6 py-1.5 rounded-2xl border border-white/5">
            <span className="text-xl font-mono font-bold text-white tracking-widest leading-none">
              {time.toLocaleTimeString("th-TH", { hour12: false })}
            </span>
            <span className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mt-1 font-bold">
              {time.toLocaleDateString("th-TH", { weekday: 'long', day: 'numeric', month: 'short' })}
            </span>
          </div>

          {/* Profile & Notify */}
          <div className="flex items-center gap-4">
            <button className="p-2.5 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-all relative">
              <HiOutlineBell size={20} className="text-slate-400" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#020617]"></span>
            </button>

            {/* --- ส่วนที่ปรับ: กดแล้วเมนูเด้ง --- */}
            <div className="relative" ref={menuRef}>
              <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-3 p-1 rounded-full border transition-all cursor-pointer select-none
                  ${isOpen ? 'bg-white/15 border-white/30' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-lg">SS</div>
                <HiOutlineChevronDown size={14} className={`text-slate-500 mr-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>

              {/* Dropdown Menu - แสดงผลเมื่อ isOpen เป็น true */}
              {isOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                  <div className="p-4 border-b border-white/5">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Administrator</p>
                    <p className="text-sm text-white font-medium truncate">somchai.s@energy.com</p>
                  </div>
                  <div className="p-2">
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 rounded-xl transition-all">
                      <HiOutlineUser size={18} /> โปรไฟล์
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 rounded-xl transition-all">
                      <HiOutlineAdjustments size={18} /> ตั้งค่า
                    </button>
                    <div className="h-px bg-white/5 my-1" />
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-bold"
                    >
                      <HiOutlineLogout size={18} /> ออกจากระบบ
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* --- จบส่วนที่ปรับ --- */}
          </div>
        </div>

        {/* Sub Menu Tabs */}
        <div className="flex gap-2 pb-4 overflow-x-auto no-scrollbar scroll-smooth">
          {menuItems.map((menu) => (
            <Link 
              key={menu.path} 
              to={menu.path}
              className={`px-6 py-2 rounded-xl text-sm font-black whitespace-nowrap transition-all duration-300
                ${location.pathname === menu.path 
                  ? "bg-blue-600 text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.6)]" 
                  : "text-slate-500 hover:bg-white/5 hover:text-slate-200 border border-transparent hover:border-white/5"
                }`}
            >
              {menu.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}