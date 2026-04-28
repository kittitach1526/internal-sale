import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { getSales } from "../services/sales";
import { getCosts } from "../services/cost";

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
function ChartCard({ title, income, expense, color = "#3b82f6", data = [] }) {
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
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`glow-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="glow-expense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
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
              formatter={(value, name) => [
                `฿ ${parseFloat(value || 0).toLocaleString()}`,
                name === 'income' ? 'รายรับ' : 'รายจ่าย'
              ]}
            />
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="name" 
              stroke="rgba(255,255,255,0.3)" 
              fontSize="10"
              tick={{ fill: "rgba(255,255,255,0.5)" }}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.3)" 
              fontSize="10"
              tick={{ fill: "rgba(255,255,255,0.5)" }}
            />
            <Area
              type="monotone"
              dataKey="income"
              stroke={color}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#glow-${color.replace("#", "")})`}
              dot={{ r: 0 }}
              activeDot={{ r: 4, strokeWidth: 0, fill: "#fff" }}
            />
            <Area
              type="monotone"
              dataKey="expense"
              stroke="#ef4444"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#glow-expense)"
              dot={{ r: 0 }}
              activeDot={{ r: 4, strokeWidth: 0, fill: "#fff" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex justify-between text-[9px] text-slate-600 font-bold px-1 uppercase tracking-tighter">
        {data.length > 0 ? (
          data.map((item, index) => (
            <span key={index} className={index === data.length - 1 ? "text-blue-400" : ""}>
              {item.name}
            </span>
          ))
        ) : (
          <>
            <span>-</span>
            <span>-</span>
            <span>-</span>
            <span>-</span>
          </>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  // State สำหรับจัดการช่วงเวลาและไตรมาส
  const [timeRange, setTimeRange] = useState("รายเดือน");
  const [quarter, setQuarter] = useState("Q1");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [salesData, setSalesData] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [costData, setCostData] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const periods = ["รายวัน", "รายเดือน", "รายไตรมาส", "รายปี"];
  const quarters = ["Q1", "Q2", "Q3", "Q4"];

  // แปลงช่วงเวลาเป็นภาษาอังกฤษสำหรับ API
  const getPeriodForAPI = (period) => {
    switch(period) {
      case "รายวัน": return "daily";
      case "รายเดือน": return "monthly";
      case "รายไตรมาส": return "quarterly";
      case "รายปี": return "yearly";
      default: return "monthly";
    }
  };

  // สร้างข้อมูลกราฟจากข้อมูลค่าใช้จ่ายจริง
  const generateChartData = (filteredCosts, filteredSales, timeRange) => {
    if (timeRange === "รายวัน") {
      // แสดงข้อมูล 7 วันล่าสุด
      const days = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
      const today = new Date();
      const chartData = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dayName = days[date.getDay()];
        
        // หาค่าใช้จ่ายในวันนั้น
        const dayExpenses = filteredCosts.filter(cost => {
          const costDate = new Date(cost.date);
          return costDate.toDateString() === date.toDateString();
        });
        
        // หายอดขายในวันนั้น
        const daySales = filteredSales.filter(sale => {
          const saleDate = new Date(sale.created_at);
          return saleDate.toDateString() === date.toDateString();
        });
        
        const totalExpense = dayExpenses.reduce((sum, cost) => sum + parseFloat(cost.amount || 0), 0);
        const totalRevenue = daySales.reduce((sum, sale) => sum + parseFloat(sale.price || 0), 0);
        
        chartData.push({
          name: dayName,
          expense: totalExpense,
          income: totalRevenue
        });
      }
      return chartData;
      
    } else if (timeRange === "รายเดือน") {
      // แสดงข้อมูลรายสัปดาห์ในเดือนที่เลือก
      const weekNames = ['สัปดาห์1', 'สัปดาห์2', 'สัปดาห์3', 'สัปดาห์4'];
      const chartData = [];
      
      for (let week = 0; week < 4; week++) {
        const weekStart = new Date(selectedYear, selectedMonth, week * 7 + 1);
        const weekEnd = new Date(selectedYear, selectedMonth, Math.min((week + 1) * 7, new Date(selectedYear, selectedMonth + 1, 0).getDate()));
        
        // หาค่าใช้จ่ายในสัปดาห์นั้น
        const weekExpenses = filteredCosts.filter(cost => {
          const costDate = new Date(cost.date);
          return costDate >= weekStart && costDate <= weekEnd;
        });
        
        // หายอดขายในสัปดาห์นั้น
        const weekSales = filteredSales.filter(sale => {
          const saleDate = new Date(sale.created_at);
          return saleDate >= weekStart && saleDate <= weekEnd;
        });
        
        const totalExpense = weekExpenses.reduce((sum, cost) => sum + parseFloat(cost.amount || 0), 0);
        const totalRevenue = weekSales.reduce((sum, sale) => sum + parseFloat(sale.price || 0), 0);
        
        chartData.push({
          name: weekNames[week],
          expense: totalExpense,
          income: totalRevenue
        });
      }
      return chartData;
      
    } else if (timeRange === "รายไตรมาส") {
      // แสดงข้อมูลรายเดือนในไตรมาส
      const quarterNum = parseInt(quarter.replace("Q", "")) - 1;
      const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
      const chartData = [];
      
      for (let month = quarterNum * 3; month < (quarterNum + 1) * 3 && month < 12; month++) {
        const monthStart = new Date(selectedYear, month, 1);
        const monthEnd = new Date(selectedYear, month + 1, 0);
        
        // หาค่าใช้จ่ายในเดือนนั้น
        const monthExpenses = filteredCosts.filter(cost => {
          const costDate = new Date(cost.date);
          return costDate >= monthStart && costDate <= monthEnd;
        });
        
        // หายอดขายในเดือนนั้น
        const monthSales = filteredSales.filter(sale => {
          const saleDate = new Date(sale.created_at);
          return saleDate >= monthStart && saleDate <= monthEnd;
        });
        
        const totalExpense = monthExpenses.reduce((sum, cost) => sum + parseFloat(cost.amount || 0), 0);
        const totalRevenue = monthSales.reduce((sum, sale) => sum + parseFloat(sale.price || 0), 0);
        
        chartData.push({
          name: months[month],
          expense: totalExpense,
          income: totalRevenue
        });
      }
      return chartData;
      
    } else if (timeRange === "รายปี") {
      // แสดงข้อมูลรายไตรมาสในปี
      const quarterNames = ['Q1', 'Q2', 'Q3', 'Q4'];
      const chartData = [];
      
      for (let q = 0; q < 4; q++) {
        const quarterStart = new Date(selectedYear, q * 3, 1);
        const quarterEnd = new Date(selectedYear, (q + 1) * 3, 0);
        
        // หาค่าใช้จ่ายในไตรมาสนั้น
        const quarterExpenses = filteredCosts.filter(cost => {
          const costDate = new Date(cost.date);
          return costDate >= quarterStart && costDate <= quarterEnd;
        });
        
        // หายอดขายในไตรมาสนั้น
        const quarterSales = filteredSales.filter(sale => {
          const saleDate = new Date(sale.created_at);
          return saleDate >= quarterStart && saleDate <= quarterEnd;
        });
        
        const totalExpense = quarterExpenses.reduce((sum, cost) => sum + parseFloat(cost.amount || 0), 0);
        const totalRevenue = quarterSales.reduce((sum, sale) => sum + parseFloat(sale.price || 0), 0);
        
        chartData.push({
          name: quarterNames[q],
          expense: totalExpense,
          income: totalRevenue
        });
      }
      return chartData;
    }
    
    return [];
  };

  // ดึงข้อมูล sales และ cost ตามช่วงเวลา
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // ดึงข้อมูล sales
        const salesResponse = await getSales();
        const allSales = salesResponse.data;
        
        // ดึงข้อมูล costs
        const costResponse = await getCosts();
        const allCosts = costResponse.data;
        
        // กรองข้อมูลตามช่วงเวลาที่เลือก
        const now = new Date();
        let filteredSales = [];
        let filteredCosts = [];
        
        if (timeRange === "รายวัน") {
          // 30 วันล่าสุด
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          filteredSales = allSales.filter(sale => 
            new Date(sale.created_at) >= thirtyDaysAgo
          );
          filteredCosts = allCosts.filter(cost => 
            new Date(cost.date) >= thirtyDaysAgo
          );
        } else if (timeRange === "รายเดือน") {
          // กรองตามเดือนและปีที่เลือก
          filteredSales = allSales.filter(sale => {
            const saleDate = new Date(sale.created_at);
            return saleDate.getMonth() === selectedMonth && saleDate.getFullYear() === selectedYear;
          });
          filteredCosts = allCosts.filter(cost => {
            const costDate = new Date(cost.date);
            return costDate.getMonth() === selectedMonth && costDate.getFullYear() === selectedYear;
          });
        } else if (timeRange === "รายไตรมาส") {
          // 2 ปีล่าสุด
          const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
          filteredSales = allSales.filter(sale => 
            new Date(sale.created_at) >= twoYearsAgo
          );
          filteredCosts = allCosts.filter(cost => 
            new Date(cost.date) >= twoYearsAgo
          );
        } else if (timeRange === "รายปี") {
          // 5 ปีล่าสุด
          const fiveYearsAgo = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
          filteredSales = allSales.filter(sale => 
            new Date(sale.created_at) >= fiveYearsAgo
          );
          filteredCosts = allCosts.filter(cost => 
            new Date(cost.date) >= fiveYearsAgo
          );
        }
        
        // คำนวณยอดขายรวม
        const salesTotal = filteredSales.reduce((sum, sale) => sum + parseFloat(sale.price || 0), 0);
        const salesCount = filteredSales.length;
        
        // คำนวณค่าใช้จ่ายรวม
        const expenseTotal = filteredCosts.reduce((sum, cost) => sum + parseFloat(cost.amount || 0), 0);
        
        // สร้างข้อมูลกราฟจากข้อมูลจริง
        const newChartData = generateChartData(filteredCosts, filteredSales, timeRange);
        
        setSalesData(filteredSales);
        setTotalRevenue(salesTotal);
        setTotalSales(salesCount);
        setCostData(filteredCosts);
        setTotalExpenses(expenseTotal);
        setChartData(newChartData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange, selectedMonth, selectedYear]);

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
                : timeRange === "รายเดือน"
                ? `${['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'][selectedMonth]} ${selectedYear}`
                : timeRange}
            </span>
          </p>
        </div>

        {/* ฝั่งขวา: ปุ่มเลือกช่วงเวลา */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* ถ้าเลือกรายเดือน ให้แสดงเลือกเดือนและปี */}
          {timeRange === "รายเดือน" && (
            <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl animate-in slide-in-from-right-4 duration-300 gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-3 py-1.5 text-[10px] font-black rounded-lg bg-slate-700 text-blue-400 border border-white/10 focus:outline-none focus:border-blue-500/50"
              >
                <option value="0">มกราคม</option>
                <option value="1">กุมภาพันธ์</option>
                <option value="2">มีนาคม</option>
                <option value="3">เมษายน</option>
                <option value="4">พฤษภาคม</option>
                <option value="5">มิถุนายน</option>
                <option value="6">กรกฎาคม</option>
                <option value="7">สิงหาคม</option>
                <option value="8">กันยายน</option>
                <option value="9">ตุลาคม</option>
                <option value="10">พฤศจิกายน</option>
                <option value="11">ธันวาคม</option>
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-1.5 text-[10px] font-black rounded-lg bg-slate-700 text-blue-400 border border-white/10 focus:outline-none focus:border-blue-500/50"
              >
                {[...Array(5)].map((_, i) => {
                  const year = new Date().getFullYear() - 2 + i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

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
        <StatCard 
          title="ยอดขายรวม" 
          value={loading ? "กำลังโหลด..." : `฿ ${totalRevenue.toLocaleString()}`} 
          trend="12.5%" 
        />
        <StatCard 
          title="ค่าใช้จ่าย" 
          value={loading ? "กำลังโหลด..." : `฿ ${totalExpenses.toLocaleString()}`} 
          trend="8.2%" 
          isPositive={false}
        />
        <StatCard
          title="กำไรสุทธิ"
          value={loading ? "กำลังโหลด..." : `฿ ${(totalRevenue - totalExpenses).toLocaleString()}`}
          trend="2.4%"
          isPositive={totalRevenue >= totalExpenses}
        />
        <StatCard 
          title="อัตรากำไร" 
          value={loading ? "กำลังโหลด..." : `${totalRevenue > 0 ? Math.round(((totalRevenue - totalExpenses) / totalRevenue) * 100) : 0}%`}
          trend={totalRevenue > 0 ? `${Math.abs(Math.round(((totalRevenue - totalExpenses) / totalRevenue) * 100))}%` : "0%"}
          isPositive={totalRevenue > totalExpenses}
        />
      </div>

      {/* 3 Chart Cards Row */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <ChartCard
          title="สรุปรายรับ-รายจ่าย"
          income={loading ? "กำลังโหลด..." : `฿ ${totalRevenue.toLocaleString()}`}
          expense={loading ? "กำลังโหลด..." : `฿ ${totalExpenses.toLocaleString()}`}
          color="#3b82f6"
          data={chartData}
        />
        <ChartCard
          title="แนวโน้มค่าใช้จ่าย"
          income={loading ? "กำลังโหลด..." : `฿ ${totalRevenue.toLocaleString()}`}
          expense={loading ? "กำลังโหลด..." : `฿ ${totalExpenses.toLocaleString()}`}
          color="#a855f7"
          data={chartData}
        />
        <ChartCard
          title="วิเคราะห์กำไรสุทธิ"
          income={loading ? "กำลังโหลด..." : `฿ ${(totalRevenue - totalExpenses).toLocaleString()}`}
          expense={loading ? "กำลังโหลด..." : `฿ ${totalExpenses.toLocaleString()}`}
          color="#10b981"
          data={chartData}
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