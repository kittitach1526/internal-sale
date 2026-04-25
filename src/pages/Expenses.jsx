import React, { useState } from "react";
import { HiOutlinePlus, HiOutlineChevronDown } from "react-icons/hi2";

export default function Expenses() {
  const [timeRange, setTimeRange] = useState("รายเดือน");
  const [quarter, setQuarter] = useState("Q1");

  const periods = ["รายวัน", "รายเดือน", "รายไตรมาส", "รายปี"];
  
  // ข้อมูลหมวดหมู่ค่าใช้จ่ายตามรูป
  const expenseCategories = [
    { id: 1, title: "Fix cost", color: "bg-red-500", total: "0.00" },
    { id: 2, title: "ค่าใช้จ่ายสำนักงาน", color: "bg-orange-500", total: "0.00" },
    { id: 3, title: "ค่าเช่า", color: "bg-yellow-500", total: "0.00" },
    { id: 4, title: "ค่าน้ำมันในการทำงาน", color: "bg-emerald-500", total: "0.00" },
    { id: 5, title: "ค่าใช้จ่ายใน Job งาน", color: "bg-blue-500", total: "0.00" },
  ];

  return (
    <div className="max-w-[1600px] mx-auto px-6 pt-6 animate-in fade-in duration-700">
      
      {/* --- Header: Time Selection & Actions --- */}
      <div className="flex flex-col gap-6 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          {/* ส่วนเลือก รายวัน - รายปี */}
          <div className="flex p-1 bg-slate-900/60 border border-white/10 rounded-xl">
            {periods.map((period) => (
              <button
                key={period}
                onClick={() => setTimeRange(period)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all
                  ${timeRange === period 
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30" 
                    : "text-slate-500 hover:text-slate-300"}`}
              >
                {period}
              </button>
            ))}
          </div>

          {/* ปุ่มเลือก ไตรมาส (โผล่มาเมื่อเลือกรายไตรมาส) */}
          {timeRange === "รายไตรมาส" && (
            <div className="flex p-1 bg-slate-900/60 border border-white/10 rounded-xl animate-in zoom-in-95">
              {["Q1", "Q2", "Q3", "Q4"].map((q) => (
                <button
                  key={q}
                  onClick={() => setQuarter(q)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all
                    ${quarter === q ? "bg-slate-700 text-white" : "text-slate-500"}`}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* ส่วนเลือกเดือน/ปี */}
          <div className="flex items-center gap-2 bg-slate-900/60 border border-white/10 px-3 py-1.5 rounded-xl text-slate-300 text-xs font-bold cursor-pointer hover:bg-slate-800 transition-all">
            <span>2026-04</span>
            <HiOutlineChevronDown size={14} />
          </div>
        </div>

        {/* ปุ่มเพิ่มรายการ */}
        <button className="flex items-center gap-2 w-fit px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg hover:bg-emerald-500/20 transition-all active:scale-95">
          <HiOutlinePlus size={16} />
          เพิ่มรายการค่าใช้จ่าย
        </button>
      </div>

      {/* --- Expense Tables List --- */}
      <div className="space-y-4 mb-10">
        {expenseCategories.map((category) => (
          <div key={category.id} className="bg-[#0f172a]/40 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
            
            {/* Table Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${category.color} shadow-[0_0_8px_${category.color.replace('bg-', '')}]`}></div>
                <h3 className="text-sm font-bold text-slate-200">{category.title}</h3>
              </div>
              <div className="text-sm font-black text-slate-100">
                {category.total} <span className={category.color.replace('bg-', 'text-')}>฿</span>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[11px] text-slate-500 font-bold uppercase tracking-wider border-b border-white/5">
                    <th className="px-6 py-3 font-medium">รายละเอียด</th>
                    <th className="px-6 py-3 font-medium text-center">วันที่</th>
                    <th className="px-6 py-3 font-medium text-right">จำนวนเงิน (฿)</th>
                    <th className="px-6 py-3 font-medium text-right">หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody>
                  {/* สถานะไม่มีข้อมูลตามรูป */}
                  <tr>
                    <td colSpan="4" className="px-6 py-10 text-center text-slate-600 text-sm italic font-medium">
                      ไม่มีข้อมูล
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}