import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from "recharts";
import { HiOutlineDownload, HiOutlineSearch, HiOutlineFilter } from "react-icons/hi";

// ข้อมูลยอดขายรายเดือน
const salesData = [
  { month: "Jan", amount: 45000 },
  { month: "Feb", amount: 52000 },
  { month: "Mar", amount: 48000 },
  { month: "Apr", amount: 61000 },
  { month: "May", amount: 55000 },
  { month: "Jun", amount: 67000 },
];

export default function Sales() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="max-w-7xl mx-auto px-6 pt-8 animate-in fade-in duration-1000">
      
      {/* Header Section */}
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">
            Sales <span className="text-blue-500">Report</span>
          </h1>
          <p className="text-slate-500 mt-1 font-medium text-sm">
            จัดการและตรวจสอบข้อมูลการขายทั้งหมดในระบบ
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-bold hover:bg-white/10 transition-all">
            <HiOutlineDownload size={18} className="text-blue-500" />
            Export CSV
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        
        {/* กราฟแท่งแสดงยอดขาย */}
        <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-md">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-white tracking-tight">สถิติยอดขายรายเดือน</h3>
            <select className="bg-slate-900 border border-white/10 text-slate-400 text-xs rounded-lg px-3 py-1.5 outline-none focus:border-blue-500">
              <option>ปี 2026</option>
              <option>ปี 2025</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} 
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]} barSize={40}>
                  {salesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 5 ? '#3b82f6' : '#1e293b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ยอดขายรายประเภท / สรุปย่อ */}
        <div className="flex flex-col gap-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-500/20">
            <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-2">เป้าหมายเดือนนี้</p>
            <h2 className="text-4xl font-black mb-6">75%</h2>
            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
              <div className="bg-white h-full w-[75%] shadow-[0_0_15px_rgba(255,255,255,1)]"></div>
            </div>
            <p className="text-blue-100 text-[10px] mt-4 font-medium uppercase leading-relaxed">
              อีก ฿ 125,000 จะถึงเป้าที่ตั้งไว้
            </p>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-md flex-1">
            <h3 className="text-white font-bold mb-4">ช่องทางขายยอดนิยม</h3>
            <div className="space-y-4">
              {[
                { name: "Online Store", value: "฿ 450k", color: "bg-blue-500" },
                { name: "Direct Sales", value: "฿ 280k", color: "bg-purple-500" },
                { name: "Agent", value: "฿ 112k", color: "bg-emerald-500" },
              ].map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                    <span className="text-sm text-slate-400 font-medium">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ตารางรายการขายแบบพรีเมียม */}
      <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-md mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h3 className="text-lg font-bold text-white tracking-tight">รายการธุรกรรมล่าสุด</h3>
          
          <div className="relative">
            <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหาเลขที่บิล..."
              className="bg-white/5 border border-white/10 rounded-xl py-2 pl-12 pr-4 text-sm text-white outline-none focus:border-blue-500/50 w-full md:w-64 transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">เลขที่บิล</th>
                <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">ลูกค้า</th>
                <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">สถานะ</th>
                <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">จำนวนเงิน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="group hover:bg-white/[0.02] transition-all">
                  <td className="py-4 text-sm font-bold text-blue-400">#INV-2026-00{i}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-[10px] text-white">C{i}</div>
                      <span className="text-sm font-medium text-slate-200">Customer Name {i}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                      SUCCESS
                    </span>
                  </td>
                  <td className="py-4 text-right text-sm font-black text-white">฿ {(4500 * i).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}