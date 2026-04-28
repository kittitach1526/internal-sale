import React, { useState, useEffect } from "react";
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
import { HiOutlineDownload, HiOutlineSearch, HiOutlineFilter, HiOutlinePlus, HiOutlinePencilAlt, HiOutlineTrash, HiOutlineX } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { getSales, getMonthlySalesData, getSalesStatistics, deleteSale, updateSale } from "../services/sales";
import { getFostecProducts } from "../services/fostec_product";
import { getMeasuringWorks } from "../services/measuring_work";
import { isAdminOrRoot } from "../utils/auth";

// ข้อมูลยอดขายรายเดือน (fallback data)
const fallbackSalesData = [
  { month: "Jan", amount: 45000 },
  { month: "Feb", amount: 52000 },
  { month: "Mar", amount: 48000 },
  { month: "Apr", amount: 61000 },
  { month: "May", amount: 55000 },
  { month: "Jun", amount: 67000 },
];

export default function Sales() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [salesData, setSalesData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [salesStats, setSalesStats] = useState({
    total_sales: 0,
    total_orders: 0,
    avg_order_value: 0,
    monthly_trend: []
  });
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [formData, setFormData] = useState({
    group_type: '',
    group_id: '',
    name: '',
    price: '',
    description: ''
  });
  
  // Group options state
  const [fostecProducts, setFostecProducts] = useState([]);
  const [measuringWorks, setMeasuringWorks] = useState([]);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch monthly sales data for chart
        const monthlyResponse = await getMonthlySalesData();
        setMonthlyData(monthlyResponse.data);
        
        // Fetch all sales data for table
        const salesResponse = await getSales();
        setSalesData(salesResponse.data);
        
        // Fetch sales statistics
        const statsResponse = await getSalesStatistics();
        setSalesStats(statsResponse.data);
        
        // Fetch group options
        const productsResponse = await getFostecProducts();
        setFostecProducts(productsResponse.data);
        
        const worksResponse = await getMeasuringWorks();
        setMeasuringWorks(worksResponse.data);
      } catch (error) {
        console.error('Error fetching sales data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter sales data based on search term
  const filteredSales = salesData.filter(sale => 
    sale.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.group_work_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // CRUD Handler functions
  const handleAddSale = () => {
    // ตรวจสอบสิทธิ์ก่อนเพิ่มข้อมูล
    if (!isAdminOrRoot()) {
      alert('ไม่มีสิทธิ์เพิ่มรายการขาย\nต้องเป็นผู้ดูแลระบบเท่านั้น');
      return;
    }
    navigate('/add-sale');
  };

  const handleEditSale = (sale) => {
    setEditingSale(sale);
    setFormData({
      group_type: sale.group_work_id <= 100 ? 'measuring_work' : 'fostec_product', 
      group_id: sale.group_work_id.toString(),
      name: sale.name,
      price: sale.price.toString(),
      description: sale.description || ''
    });
    setShowModal(true);
  };

  const handleDeleteSale = async (saleId) => {
    if (window.confirm('คุณต้องการลบรายการขายนี้ใช่หรือไม่?')) {
      try {
        const { deleteSale } = await import('../services/sales');
        await deleteSale(saleId);
        // Refresh data
        const salesResponse = await getSales();
        setSalesData(salesResponse.data);
        const statsResponse = await getSalesStatistics();
        setSalesStats(statsResponse.data);
      } catch (error) {
        console.error('Error deleting sale:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { createSale, updateSale } = await import('../services/sales');
      
      if (editingSale) {
        await updateSale(editingSale.id, {
          group_work_id: parseInt(formData.group_id),
          name: formData.name,
          price: parseFloat(formData.price),
          description: formData.description
        });
      } else {
        await createSale({
          group_work_id: parseInt(formData.group_id),
          name: formData.name,
          price: parseFloat(formData.price),
          description: formData.description
        });
      }
      
      // Refresh data
      const salesResponse = await getSales();
      setSalesData(salesResponse.data);
      const statsResponse = await getSalesStatistics();
      setSalesStats(statsResponse.data);
      
      setShowModal(false);
    } catch (error) {
      console.error('Error saving sale:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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

      {/* ตารางรายการขายแบบพรีเมียม */}
      <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-md mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h3 className="text-lg font-bold text-white tracking-tight">รายการธุรกรรมล่าสุด</h3>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="ค้นหาเลขที่บิล..."
                className="bg-white/5 border border-white/10 rounded-xl py-2 pl-12 pr-4 text-sm text-white outline-none focus:border-blue-500/50 w-full md:w-64 transition-all"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={handleAddSale}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all"
            >
              <HiOutlinePlus size={16} />
              เพิ่มรายการ
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">เลขที่บิล</th>
                <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">ลูกค้า</th>
                <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">วันที่/เวลา</th>
                <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">สถานะ</th>
                <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">จำนวนเงิน</th>
                <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {loading ? (
                // Loading skeleton
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4">
                      <div className="h-4 w-24 bg-white/10 rounded"></div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/10 rounded-lg"></div>
                        <div className="h-4 w-32 bg-white/10 rounded"></div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="h-4 w-28 bg-white/10 rounded"></div>
                    </td>
                    <td className="py-4">
                      <div className="h-6 w-20 bg-white/10 rounded-full"></div>
                    </td>
                    <td className="py-4 text-right">
                      <div className="h-4 w-20 bg-white/10 rounded ml-auto"></div>
                    </td>
                    <td className="py-4 text-right">
                      <div className="h-8 w-16 bg-white/10 rounded ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : filteredSales.length > 0 ? (
                // Real data
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="group hover:bg-white/[0.02] transition-all">
                    <td className="py-4 text-sm font-bold text-blue-400">#SALE-{sale.id}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-[10px] text-white">
                          {sale.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-slate-200">{sale.name}</span>
                          <p className="text-[10px] text-slate-500 mt-0.5">{sale.group_work_name || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-slate-200">
                          {sale.created_at ? new Date(sale.created_at).toLocaleDateString('th-TH', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          }) : 'N/A'}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {sale.created_at ? new Date(sale.created_at).toLocaleTimeString('th-TH', {
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                        SUCCESS
                      </span>
                    </td>
                    <td className="py-4 text-right text-sm font-black text-white">฿ {parseFloat(sale.price).toLocaleString()}</td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditSale(sale)}
                          className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                          title="แก้ไข"
                        >
                          <HiOutlinePencilAlt size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteSale(sale.id)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                          title="ลบ"
                        >
                          <HiOutlineTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                // No data state
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <p className="text-slate-500 text-sm">
                      {searchTerm ? 'ไม่พบข้อมูลที่ค้นหา' : 'ไม่มีข้อมูลการขาย'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
          <div className="h-[300px] w-full min-h-[300px] min-w-[200px]">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-pulse text-slate-500">กำลังโหลดข้อมูล...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData.length > 0 ? monthlyData : fallbackSalesData}>
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
                    {(monthlyData.length > 0 ? monthlyData : fallbackSalesData).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === (monthlyData.length > 0 ? monthlyData.length - 1 : 5) ? '#3b82f6' : '#1e293b'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-slate-900 border border-white/10 rounded-[2rem] p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingSale ? 'แก้ไขรายการขาย' : 'เพิ่มรายการขาย'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <HiOutlineX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  ชื่อรายการ
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-blue-500/50 focus:outline-none transition-all"
                  placeholder="กรอกชื่อรายการขาย"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  ประเภทกลุ่ม
                </label>
                <select
                  name="group_type"
                  value={formData.group_type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500/50 focus:outline-none transition-all"
                >
                  <option value="" className="text-black">เลือกประเภทกลุ่ม</option>
                  <option value="fostec_product" className="text-black">Fostec Product</option>
                  <option value="measuring_work" className="text-black">Measuring Work</option>
                </select>
              </div>

              {formData.group_type && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {formData.group_type === 'fostec_product' ? 'สินค้า Fostec' : 'งานตรวจวัด'}
                  </label>
                  <select
                    name="group_id"
                    value={formData.group_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500/50 focus:outline-none transition-all h-32"
                  >
                    <option value="" className="text-slate-600">เลือกรายการ</option>
                    {formData.group_type === 'fostec_product' 
                      ? (fostecProducts || []).map(product => (
                          <option key={product.id} value={product.id} className="text-slate-800">
                            {product.name}
                          </option>
                        ))
                      : (measuringWorks || []).map(work => (
                          <option key={work.id} value={work.id} className="text-slate-800">
                            {work.name}
                          </option>
                        ))
                    }
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  ราคา
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-blue-500/50 focus:outline-none transition-all"
                  placeholder="กรอกราคา"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  รายละเอียด (ไม่จำเป็น)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-blue-500/50 focus:outline-none transition-all resize-none"
                  placeholder="กรอกรายละเอียดเพิ่มเติม"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-slate-300 rounded-xl font-medium hover:bg-white/10 transition-all"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all"
                >
                  {editingSale ? 'บันทึกการแก้ไข' : 'เพิ่มรายการ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}