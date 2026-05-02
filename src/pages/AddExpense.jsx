import React, { useState, useEffect } from "react";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { getGroupCost } from "../services/group_cost";
import { createCost } from "../services/cost";

export default function AddExpense() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    group_cost_id: '',
    name: '',
    amount: '',
    date: '',
    note: ''
  });
  
  const [groupCosts, setGroupCosts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch group cost options on component mount
  useEffect(() => {
    const fetchGroupCosts = async () => {
      try {
        const response = await getGroupCost();
        setGroupCosts(response.data);
      } catch (error) {
        console.error('Error fetching group costs:', error);
      }
    };

    fetchGroupCosts();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Validate form data before sending
    if (!formData.group_cost_id || !formData.name || !formData.amount || !formData.date) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      setLoading(false);
      return;
    }
    
    const costData = {
      group_cost_id: parseInt(formData.group_cost_id),
      description: formData.name, // API expects name in description field
      amount: parseFloat(formData.amount), // API expects 'amount' not 'price'
      date: formData.date, // Date picker already provides YYYY-MM-DD format
      note: formData.note || "" // API expects string, not null
    };
    
    console.log('Sending cost data:', costData);
    
    try {
      await createCost(costData);
      
      // Navigate back to Expenses page
      navigate('/expenses');
    } catch (error) {
      console.error('Error creating expense:', error);
      console.error('Error response:', error.response?.data);
      
      // Log the full error response for debugging
      if (error.response?.data) {
        console.log('Full error response:', JSON.stringify(error.response.data, null, 2));
      }
      
      // Show more specific error message
      if (error.response?.data?.detail) {
        const errors = error.response.data.detail;
        console.log('Errors array:', errors);
        
        if (Array.isArray(errors)) {
          const errorMessages = errors.map((err, index) => {
            console.log(`Error ${index}:`, err);
            if (typeof err === 'object' && err.msg) {
              return `${err.loc ? err.loc.join('.') + ': ' : ''}${err.msg}`;
            } else if (typeof err === 'object') {
              return JSON.stringify(err);
            }
            return String(err);
          }).join('\n');
          alert(`เกิดข้อผิดพลาดในการตรวจสอบข้อมูล:\n${errorMessages}`);
        } else {
          alert(`เกิดข้อผิดพลาด: ${JSON.stringify(errors)}`);
        }
      } else if (error.response?.data?.message) {
        alert(`เกิดข้อผิดพลาด: ${error.response.data.message}`);
      } else {
        alert(`เกิดข้อผิดพลาดในการเพิ่มข้อมูล: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/expenses');
  };

  return (
    <div className="max-w-4xl mx-auto px-6 pt-8 animate-in fade-in duration-1000">
      {/* Header */}
      <header className="mb-10">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleCancel}
            className="p-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all"
          >
            <HiOutlineArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight uppercase">
              เพิ่มรายการค่าใช้จ่าย
            </h1>
            <p className="text-slate-500 mt-1 font-medium text-sm">
              บันทึกข้อมูลค่าใช้จ่ายใหม่ลงในระบบ
            </p>
          </div>
        </div>
      </header>

      {/* Form */}
      <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* หมวดค่าใช้จ่าย */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                หมวดค่าใช้จ่าย <span className="text-red-400">*</span>
              </label>
              <select
                name="group_cost_id"
                value={formData.group_cost_id}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500/50 focus:outline-none transition-all"
              >
                <option value="">เลือกหมวดค่าใช้จ่าย</option>
                {(groupCosts || []).map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* วันที่ */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                วันที่ <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500/50 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ชื่อรายการ */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                ชื่อรายการ <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-blue-500/50 focus:outline-none transition-all"
                placeholder="กรอกชื่อรายการค่าใช้จ่าย"
              />
            </div>

            {/* จำนวนเงิน */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                จำนวนเงิน <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                required
                step="0.01"
                min="0"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-blue-500/50 focus:outline-none transition-all"
                placeholder="กรอกจำนวนเงิน"
              />
            </div>
          </div>

          {/* หมายเหตุ */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              หมายเหตุ (ไม่จำเป็น)
            </label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-blue-500/50 focus:outline-none transition-all resize-none"
              placeholder="กรอกหมายเหตุเพิ่มเติม"
            />
          </div>

          {/* ปุ่ม */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-slate-300 rounded-xl font-medium hover:bg-white/10 transition-all"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'กำลังบันทึก...' : 'เพิ่มรายการ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
