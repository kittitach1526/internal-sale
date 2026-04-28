import React, { useState, useEffect } from "react";
import { 
  HiOutlineSearch, 
  HiOutlineFilter, 
  HiDatabase, 
  HiOutlineUserCircle,
  HiOutlineExclamation, 
  HiOutlineCheckCircle,
  HiOutlineInformationCircle 
} from "react-icons/hi";
import { getLogs, getLogsWithPagination } from "../services/logs";

export default function ActivityLog() {
  // --- States ---
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 4; // จำนวนรายการต่อ 1 หน้า
  const [allLogs, setAllLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fallback data สำหรับกรณี server ไม่ทำงาน
  const fallbackLogs = [
    { id: 1, type: "info", user: "System", action: "ระบบ", detail: "กำลังเชื่อมต่อกับเซิร์ฟเวอร์ logs...", time: new Date().toLocaleTimeString('th-TH', { hour12: false }), date: new Date().toLocaleDateString('th-TH') },
    { id: 2, type: "warning", user: "System", action: "แจ้งเตือน", detail: "เซิร์ฟเวอร์ยังไม่พร้อมใช้งาน (localhost:5000)", time: new Date().toLocaleTimeString('th-TH', { hour12: false }), date: new Date().toLocaleDateString('th-TH') },
    { id: 3, type: "info", user: "System", action: "ข้อมูล", detail: "ระบบจะแสดงข้อมูลจริงเมื่อเซิร์ฟเวอร์เริ่มทำงาน", time: new Date().toLocaleTimeString('th-TH', { hour12: false }), date: new Date().toLocaleDateString('th-TH') }
  ];

  // Mock data สำหรับทดสอบ UI ชั่วคราว
  const mockLogs = [
    { id: 1, type: "success", user: "Somchai S.", action: "เข้าสู่ระบบ", detail: "Login สำเร็จผ่าน Chrome (Windows)", time: "14:30:25", date: "28 เม.ย. 2569" },
    { id: 2, type: "warning", user: "Admin", action: "แก้ไขค่าใช้จ่าย", detail: "แก้ไขรายการในหมวดค่าใช้จ่าย (#EX-123)", time: "13:15:10", date: "28 เม.ย. 2569" },
    { id: 3, type: "info", user: "System", action: "สำรองข้อมูล", detail: "ระบบทำการ Backup Database อัตโนมัติสำเร็จ", time: "12:00:00", date: "28 เม.ย. 2569" },
    { id: 4, type: "error", user: "Unknown", action: "พยายามเข้าสู่ระบบ", detail: "รหัสผ่านไม่ถูกต้อง 3 ครั้งต่อเนื่อง (IP: 192.168.1.50)", time: "11:45:22", date: "28 เม.ย. 2569" },
    { id: 5, type: "success", user: "Somchai S.", action: "เพิ่มข้อมูล", detail: "เพิ่มรายการยอดขายใหม่ (#INV-2026-005)", time: "10:20:05", date: "28 เม.ย. 2569" },
    { id: 6, type: "info", user: "Admin", action: "พิมพ์รายงาน", detail: "ส่งออกรายงานยอดขายประจำเดือนเมษายน (PDF)", time: "09:45:12", date: "28 เม.ย. 2569" },
    { id: 7, type: "warning", user: "System", action: "แจ้งเตือนพื้นที่", detail: "พื้นที่จัดเก็บข้อมูลใกล้เต็ม (85%)", time: "08:30:00", date: "28 เม.ย. 2569" },
    { id: 8, type: "success", user: "Wichai K.", action: "เข้าสู่ระบบ", detail: "Login สำเร็จผ่าน Mobile App (iOS)", time: "07:15:44", date: "28 เม.ย. 2569" },
    { id: 9, type: "error", user: "Unknown", action: "ถูกปฏิเสธการเข้าถึง", detail: "พยายามเข้าถึงหน้า /logs โดยไม่มีสิทธิ (IP: 192.168.1.100)", time: "06:30:15", date: "28 เม.ย. 2569" },
    { id: 10, type: "info", user: "System", action: "รีสตาร์ทระบบ", detail: "ระบบทำการรีสตาร์ทเพื่ออัปเดต", time: "02:00:00", date: "28 เม.ย. 2569" }
  ];

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const response = await getLogs();
        setAllLogs(response.data || []);
        setError("");
      } catch (err) {
        console.error('Error fetching logs:', err);
        // ถ้าเป็น Network Error ให้ใช้ fallback data แทน
        const isNetworkError = err.code === 'NETWORK_ERROR' || 
                              err.message?.includes('Network Error') || 
                              err.code === 'ERR_CONNECTION_REFUSED' || 
                              err.name === 'AxiosError' ||
                              err.message?.includes('ERR_CONNECTION_REFUSED') ||
                              !err.response; // ถ้าไม่มี response แสดงว่าเป็น network error
        
        if (isNetworkError) {
          setAllLogs(fallbackLogs);
          setError("เซิร์ฟเวอร์ logs ยังไม่พร้อม - แสดงข้อมูลตัวอย่าง");
        } else {
          setError("ไม่สามารถดึงข้อมูล logs ได้");
          setAllLogs([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // --- Logic 1: การค้นหา (Filtering) ---
  const filteredLogs = allLogs.filter(log => 
    log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.detail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Logic 2: การแบ่งหน้า (Pagination) ---
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  // ฟังก์ชันเปลี่ยนหน้า (เลื่อนขึ้นไปบนสุดอัตโนมัติเมื่อเปลี่ยนหน้า)
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- UI Helper: เลือกสีตามสถานะ ---
  const getLogStyle = (type) => {
    switch (type) {
      case "success":
        return { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", icon: <HiOutlineCheckCircle /> };
      case "warning":
        return { bg: "bg-orange-500/10", border: "border-orange-500/20", text: "text-orange-400", icon: <HiOutlineExclamation /> };
      case "error":
        return { bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-400", icon: <HiOutlineExclamation /> };
      default: // info
        return { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400", icon: <HiOutlineInformationCircle /> };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pt-8 pb-20 text-slate-200">
      
      {/* --- Header & Search Bar --- */}
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <HiDatabase className="text-blue-500" size={32} />
            <h1 className="text-3xl font-black text-white tracking-tight uppercase">
              Activity <span className="text-blue-500">Log</span>
            </h1>
          </div>
          <p className="text-slate-500 font-medium text-sm">
            แสดงผลรายการที่ {indexOfFirstLog + 1} - {Math.min(indexOfLastLog, filteredLogs.length)} จากทั้งหมด {filteredLogs.length} รายการ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อผู้ใช้ การกระทำ..."
              className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white outline-none focus:border-blue-500/50 w-full md:w-80 transition-all shadow-2xl"
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // รีเซ็ตไปหน้า 1 เมื่อมีการค้นหา
              }}
            />
          </div>
          <button className="flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-slate-300 text-sm font-bold hover:bg-white/10 transition-all">
            <HiOutlineFilter size={18} />
            ตัวกรอง
          </button>
          {error && (
            <button 
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-5 py-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl text-sm font-bold hover:bg-blue-500/20 transition-all"
            >
              <HiOutlineSearch size={18} />
              รีเฟรชข้อมูล
            </button>
          )}
        </div>
      </header>

      {/* --- Log Items List --- */}
      <div className="space-y-4 mb-12">
        {loading ? (
          // Loading skeleton
          Array.from({ length: logsPerPage }).map((_, index) => (
            <div key={`skeleton-${index}`} className="animate-pulse">
              <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-[2rem]">
                <div className="flex items-center gap-5">
                  <div className="w-10 h-10 bg-white/10 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-16 bg-white/10 rounded"></div>
                      <div className="h-4 w-24 bg-white/10 rounded"></div>
                    </div>
                    <div className="h-4 w-48 bg-white/10 rounded"></div>
                  </div>
                </div>
                <div className="mt-5 md:mt-0 pt-4 md:pt-0 border-t md:border-none border-white/5 text-left md:text-right shrink-0">
                  <div className="h-4 w-20 bg-white/10 rounded ml-auto"></div>
                  <div className="h-3 w-16 bg-white/10 rounded ml-auto mt-1"></div>
                </div>
              </div>
            </div>
          ))
        ) : error ? (
          // Error state
          <div className="py-20 text-center bg-red-500/5 border border-red-500/20 rounded-[2rem]">
            <HiOutlineExclamation className="text-red-400 mx-auto mb-4" size={48} />
            <p className="text-red-400 font-bold">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-sm font-bold hover:bg-red-500/30 transition-all"
            >
              ลองใหม่
            </button>
          </div>
        ) : currentLogs.length > 0 ? (
          // Real data
          currentLogs.map((log) => {
            const style = getLogStyle(log.type);
            return (
              <div 
                key={log.id} 
                className={`flex flex-col md:flex-row md:items-center justify-between p-6 ${style.bg} border ${style.border} rounded-[2rem] transition-all hover:scale-[1.01] duration-300 group`}
              >
                <div className="flex items-center gap-5">
                  <div className="text-4xl shrink-0 group-hover:rotate-12 transition-transform duration-300">
                    {React.cloneElement(style.icon, { className: style.text })}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`text-[10px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-lg bg-white/5 ${style.text}`}>
                        {log.type}
                      </span>
                      <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                        <HiOutlineUserCircle size={16} /> {log.user}
                      </span>
                    </div>
                    <div className="mt-1">
                      <span className="text-base font-bold text-white mr-2">{log.action}:</span>
                      <span className="text-sm text-slate-400 font-medium leading-relaxed">
                        {log.detail}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 md:mt-0 pt-4 md:pt-0 border-t md:border-none border-white/5 text-left md:text-right shrink-0">
                  <p className="text-base font-black text-white tracking-wider">{log.time}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                    {log.date}
                  </p>
                </div>
              </div>
            )
          })
        ) : (
          // No data state
          <div className="py-20 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-[2rem]">
            <HiDatabase className="text-slate-500 mx-auto mb-4" size={48} />
            <p className="text-slate-500 font-bold italic">
              {searchTerm ? 'ไม่พบข้อมูลที่คุณค้นหา...' : 'ยังไม่มีข้อมูล logs ในระบบ'}
            </p>
          </div>
        )}
      </div>

      {/* --- Pagination Controls --- */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3">
          <button 
            onClick={() => paginate(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className={`px-6 py-2.5 rounded-2xl text-xs font-bold border transition-all
              ${currentPage === 1 
                ? "border-white/5 text-slate-600 cursor-not-allowed" 
                : "border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20"}`}
          >
            ย้อนกลับ
          </button>

          <div className="flex gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => paginate(i + 1)}
                className={`w-10 h-10 rounded-xl text-xs font-black transition-all
                  ${currentPage === i + 1 
                    ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]" 
                    : "bg-white/5 text-slate-500 border border-white/10 hover:text-slate-200"}`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button 
            onClick={() => paginate(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-6 py-2.5 rounded-2xl text-xs font-bold border transition-all
              ${currentPage === totalPages 
                ? "border-white/5 text-slate-600 cursor-not-allowed" 
                : "border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20"}`}
          >
            ถัดไป
          </button>
        </div>
      )}
    </div>
  );
}