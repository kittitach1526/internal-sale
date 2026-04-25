import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// ข้อมูลจำลองสำหรับกราฟ
const chartData = [
  { name: "Mon", income: 4500, expense: 2100 },
  { name: "Tue", income: 5200, expense: 3200 },
  { name: "Wed", income: 3800, expense: 4500 },
  { name: "Thu", income: 6500, expense: 2800 },
  { name: "Fri", income: 4800, expense: 3900 },
  { name: "Sat", income: 7200, expense: 2400 },
  { name: "Sun", income: 8100, expense: 3100 },
];

// --- Component ย่อย 1: StatCard (แถวบน) ---
function StatCard({ title, value, trend, isPositive = true }) {
  return (
    <div className="relative group isolate p-8 bg-blue-600/5 backdrop-blur-md border border-white/10 rounded-[2rem] shadow-2xl [clip-path:inset(0_round_2rem)] transition-all duration-300 hover:border-white/20">
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-[50px] group-hover:bg-blue-500/40 group-hover:scale-125 transition-all duration-700"></div>
      </div>
      <div className="relative z-10">
        <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-3">
          {title}
        </h3>
        <p className="text-3xl lg:text-4xl font-black text-white tracking-tight">
          {value}
        </p>
        <div className="mt-4 flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
              isPositive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
            }`}
          >
            {isPositive ? "↑" : "↓"} {trend}
          </span>
          <span className="text-slate-600 text-[10px] font-medium uppercase tracking-tighter">
            จากเดือนก่อน
          </span>
        </div>
      </div>
    </div>
  );
}

// --- Component ย่อย 2: ChartCard (แถวล่าง - กราฟเส้นเรืองแสง) ---
function ChartCard({ title, income, expense, color = "#3b82f6" }) {
  return (
    <div className="relative group isolate bg-white/[0.03] border border-white/5 rounded-[2rem] p-6 backdrop-blur-md shadow-2xl [clip-path:inset(0_round_2rem)] transition-all hover:border-white/10">
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3">
            {title}
          </h3>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div
                className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                style={{ backgroundColor: color }}
              ></div>
              <span className="text-[11px] text-slate-500 font-medium">รายรับ:</span>
              <span className="text-sm font-bold text-white">{income}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
              <span className="text-[11px] text-slate-500 font-medium">รายจ่าย:</span>
              <span className="text-sm font-bold text-slate-400">{expense}</span>
            </div>
          </div>
        </div>
        <div className="text-[10px] bg-white/5 border border-white/10 text-slate-500 px-2 py-1 rounded-lg">
          Real-time
        </div>
      </div>

      <div className="relative h-48 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`glow-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                fontSize: "12px",
              }}
              itemStyle={{ color: "#fff" }}
              cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="income"
              stroke={color}
              strokeWidth={3}
              fillOpacity={1}
              fill={`url(#glow-${color.replace("#", "")})`}
              dot={{ r: 0 }}
              activeDot={{ r: 5, strokeWidth: 0, fill: "#fff" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex justify-between text-[9px] text-slate-600 font-bold px-1 uppercase tracking-tighter">
        <span>Mon</span>
        <span>Wed</span>
        <span>Fri</span>
        <span>Sun</span>
      </div>
    </div>
  );
}

export default function Home() {
  // เพิ่ม State สำหรับจัดการช่วงเวลาและไตรมาส
  const [timeRange, setTimeRange] = useState("รายเดือน");
  const [quarter, setQuarter] = useState("Q1"); // แก้ไข: เพิ่ม State นี้เพื่อให้โค้ดไม่ Error

  const periods = ["รายวัน", "รายเดือน", "รายไตรมาส", "รายปี"];
  const quarters = ["Q1", "Q2", "Q3", "Q4"];

  return (
    <div className="max-w-7xl mx-auto px-6 pt-8 animate-in fade-in duration-1000">
      {/* Page Header */}
      <header className="mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* ฝั่งซ้าย: หัวข้อ */}
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">
            Dashboard <span className="text-blue-500">Insight</span>
          </h1>
          <p className="text-slate-500 mt-1 font-medium text-sm flex items-center gap-2">
            <span>กำลังแสดงข้อมูล</span>
            <span className="text-blue-400 font-bold bg-blue-400/10 px-2 py-0.5 rounded">
              {timeRange === "รายไตรมาส"
                ? `ไตรมาสที่ ${quarter.replace("Q", "")}`
                : timeRange}
            </span>
          </p>
        </div>

        {/* ฝั่งขวา: ปุ่มเลือกช่วงเวลา */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* ถ้าเลือกรายไตรมาส ให้แสดงปุ่ม Q1-Q4 เพิ่มขึ้นมา */}
          {timeRange === "รายไตรมาส" && (
            <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl animate-in slide-in-from-right-4 duration-300">
              {quarters.map((q) => (
                <button
                  key={q}
                  onClick={() => setQuarter(q)}
                  className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all
                    ${
                      quarter === q
                        ? "bg-slate-700 text-blue-400 shadow-inner"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* เมนูหลัก: รายวัน, เดือน, ไตรมาส, ปี */}
          <div className="flex p-1.5 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl">
            {periods.map((period) => (
              <button
                key={period}
                onClick={() => setTimeRange(period)}
                className={`px-5 py-2 text-[11px] uppercase tracking-wider font-black rounded-[0.9rem] transition-all duration-300
                  ${
                    timeRange === period
                      ? "bg-blue-600 text-white shadow-[0_8px_15px_-4px_rgba(37,99,235,0.5)]"
                      : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                  }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 4 Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="ยอดขายรวม" value="฿ 842,500" trend="12.5%" />
        <StatCard title="ผู้ใช้งานใหม่" value="1,240" trend="8.2%" />
        <StatCard
          title="ออเดอร์ทั้งหมด"
          value="456"
          trend="2.4%"
          isPositive={false}
        />
        <StatCard title="กำไรสุทธิ" value="฿ 124,000" trend="14.1%" />
      </div>

      {/* 3 Chart Cards Row */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <ChartCard
          title="วิเคราะห์รายได้รายสัปดาห์"
          income="฿ 154,000"
          expense="฿ 42,000"
          color="#3b82f6"
        />
        <ChartCard
          title="กำไรจากการดำเนินงาน"
          income="฿ 89,200"
          expense="฿ 15,500"
          color="#a855f7"
        />
        <ChartCard
          title="ภาษีและค่าธรรมเนียม"
          income="฿ 12,400"
          expense="฿ 3,200"
          color="#10b981"
        />
      </div>

      {/* Footer Table Section */}
      <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-sm transition-all hover:bg-white/[0.04]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white tracking-tight">
            รายการล่าสุด
          </h3>
          <button className="text-xs text-blue-500 font-bold hover:underline">
            ดูทั้งหมด
          </button>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="group flex justify-between items-center p-4 bg-white/[0.03] rounded-2xl border border-white/5 hover:border-white/10 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 font-bold border border-blue-500/20 group-hover:scale-110 transition-transform">
                  #
                </div>
                <div>
                  <p className="text-sm font-bold text-white">
                    รายการสั่งซื้อ #INV-00{i}
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase mt-0.5">
                    25 เมษายน 2026 • 14:30
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-white">฿ 4,500.00</p>
                <p className="text-[10px] text-green-400 font-bold uppercase tracking-tighter">
                  สำเร็จแล้ว
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}