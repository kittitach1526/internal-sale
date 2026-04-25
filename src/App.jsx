import { Routes, Route } from "react-router-dom";
import Nav from "./components/Nav";
import Home from "./pages/Home";
import Sales from "./pages/Sales";
import Expenses from "./pages/Expenses";
export default function App() {
  return (
    <div className="bg-[#020617] text-slate-200 min-h-screen selection:bg-blue-500/30 font-sans">
      
      {/* Background Glow: แสงฟุ้งๆ ด้านหลังที่เป็นเอกลักษณ์ของดีไซน์นี้ */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-blue-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-indigo-900/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Navigation: ติดหนึบด้านบน */}
      <div className="sticky top-0 z-50">
        <Nav />
      </div>

      {/* Main Content */}
      <main className="relative z-10 pt-4 pb-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/expenses" element={<Expenses />} />
          {/* เพิ่มหน้าอื่นๆ ที่นี่ */}
        </Routes>
      </main>
    </div>
  );
}