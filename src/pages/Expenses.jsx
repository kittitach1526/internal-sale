import React, { useState, useEffect } from "react";
import { getCosts, createCost, updateCost, deleteCost } from "../services/cost";
import { getGroupCost } from "../services/group_cost";
import { HiOutlinePlus, HiOutlinePencilAlt, HiOutlineTrash, HiOutlineChevronDown } from "react-icons/hi";
import { isAdminOrRoot } from "../utils/auth";
import { useNavigate } from "react-router-dom";

export default function Expenses() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("รายเดือน");
  const [quarter, setQuarter] = useState("Q1");
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [expenseRecords, setExpenseRecords] = useState([]);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [expenseForm, setExpenseForm] = useState({
    group_cost_id: "",
    description: "",
    amount: "",
    date: "",
    note: ""
  });

  const periods = ["รายวัน", "รายเดือน", "รายไตรมาส", "รายปี"];
  
  // Color mapping for dynamic categories
  const colorMapping = [
    "bg-red-500",
    "bg-orange-500", 
    "bg-yellow-500",
    "bg-emerald-500",
    "bg-blue-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
    "bg-cyan-500"
  ];

  // Fetch expense categories from API
  useEffect(() => {
    getGroupCost()
      .then((res) => {
        const categories = res.data.map((cat, index) => ({
          id: cat.id,
          title: cat.name,
          color: colorMapping[index % colorMapping.length],
          total: "0.00"
        }));
        setExpenseCategories(categories);
      })
      .catch((err) => console.error(err));
  }, []);

  // Fetch expense records
  useEffect(() => {
    getCosts()
      .then((res) => {
        console.log('Expense records from API:', res.data);
        console.log('Sample record structure:', res.data[0]);
        setExpenseRecords(res.data);
        // Calculate totals for each category
        const categoryTotals = {};
        res.data.forEach(record => {
          if (!categoryTotals[record.group_cost_id]) {
            categoryTotals[record.group_cost_id] = 0;
          }
          categoryTotals[record.group_cost_id] += parseFloat(record.amount);
        });
        
        // Update category totals
        setExpenseCategories(prev => prev.map(cat => ({
          ...cat,
          total: (categoryTotals[cat.id] || 0).toFixed(2)
        })));
      })
      .catch((err) => console.error(err));
  }, []);

  // Handler functions
  const handleAddExpense = () => {
    // ตรวจสอบสิทธิ์ก่อนเพิ่มข้อมูล
    if (!isAdminOrRoot()) {
      alert('ไม่มีสิทธิ์เพิ่มรายการค่าใช้จ่าย\nต้องเป็นผู้ดูแลระบบเท่านั้น');
      return;
    }
    navigate('/add-expense');
  };

  const handleEditExpense = (record) => {
    setEditingExpense(record);
    setExpenseForm({
      group_cost_id: record.group_cost_id.toString(),
      description: record.description,
      amount: record.amount.toString(),
      date: record.date,
      note: record.note || ""
    });
    setShowExpenseModal(true);
  };

  const handleDeleteExpense = (record) => {
    if (window.confirm(`คุณต้องการลบรายการ "${record.description}" ใช่หรือไม่?`)) {
      deleteCost(record.id)
        .then(() => {
          setExpenseRecords(prev => prev.filter(r => r.id !== record.id));
          // Recalculate category totals
          const updatedRecords = expenseRecords.filter(r => r.id !== record.id);
          const categoryTotals = {};
          updatedRecords.forEach(r => {
            if (!categoryTotals[r.group_cost_id]) {
              categoryTotals[r.group_cost_id] = 0;
            }
            categoryTotals[r.group_cost_id] += parseFloat(r.amount);
          });
          setExpenseCategories(prev => prev.map(cat => ({
            ...cat,
            total: (categoryTotals[cat.id] || 0).toFixed(2)
          })));
        })
        .catch((err) => console.error(err));
    }
  };

  const handleSaveExpense = () => {
    if (!expenseForm.group_cost_id || !expenseForm.description || !expenseForm.amount || !expenseForm.date) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    const expenseData = {
      group_cost_id: parseInt(expenseForm.group_cost_id),
      description: expenseForm.description,
      amount: parseFloat(expenseForm.amount),
      date: expenseForm.date,
      note: expenseForm.note
    };

    if (editingExpense) {
      // Update existing expense
      updateCost(editingExpense.id, expenseData)
        .then(() => {
          setExpenseRecords(prev => prev.map(r => 
            r.id === editingExpense.id ? { ...r, ...expenseData } : r
          ));
          setShowExpenseModal(false);
          // Refresh data to recalculate totals
          getCosts().then((res) => {
            setExpenseRecords(res.data);
            const categoryTotals = {};
            res.data.forEach(record => {
              if (!categoryTotals[record.group_cost_id]) {
                categoryTotals[record.group_cost_id] = 0;
              }
              categoryTotals[record.group_cost_id] += parseFloat(record.amount);
            });
            setExpenseCategories(prev => prev.map(cat => ({
              ...cat,
              total: (categoryTotals[cat.id] || 0).toFixed(2)
            })));
          });
        })
        .catch((err) => console.error(err));
    } else {
      // Add new expense
      createCost(expenseData)
        .then(() => {
          setShowExpenseModal(false);
          // Refresh data to get the new record and recalculate totals
          getCosts().then((res) => {
            setExpenseRecords(res.data);
            const categoryTotals = {};
            res.data.forEach(record => {
              if (!categoryTotals[record.group_cost_id]) {
                categoryTotals[record.group_cost_id] = 0;
              }
              categoryTotals[record.group_cost_id] += parseFloat(record.amount);
            });
            setExpenseCategories(prev => prev.map(cat => ({
              ...cat,
              total: (categoryTotals[cat.id] || 0).toFixed(2)
            })));
          });
        })
        .catch((err) => console.error(err));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pt-6 animate-in fade-in duration-700">
      
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
        <button 
          onClick={handleAddExpense}
          className="flex items-center gap-2 w-fit px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg hover:bg-emerald-500/20 transition-all active:scale-95"
        >
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
                    <th className="px-6 py-3 font-medium text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {expenseRecords
                    .filter(record => record.group_cost_id === category.id)
                    .map((record) => {
                      console.log('Rendering record:', record);
                      return (
                      <tr key={record.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-3 text-sm text-slate-300">
                          {record.description || 'N/A'}
                        </td>
                        <td className="px-6 py-3 text-sm text-slate-400 text-center">
                          {record.date}
                        </td>
                        <td className="px-6 py-3 text-sm text-slate-300 text-right font-medium">
                          {parseFloat(record.amount).toFixed(2)}
                        </td>
                        <td className="px-6 py-3 text-sm text-slate-400 text-right">
                          {record.note || "-"}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex gap-2 justify-end">
                            <button 
                              onClick={() => handleEditExpense(record)}
                              className="p-1.5 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                            >
                              <HiOutlinePencilAlt size={14} />
                            </button>
                            <button 
                              onClick={() => handleDeleteExpense(record)}
                              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                            >
                              <HiOutlineTrash size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      );
                    })}
                  {expenseRecords.filter(record => record.group_cost_id === category.id).length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-10 text-center text-slate-600 text-sm italic font-medium">
                        ไม่มีข้อมูล
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">
                {editingExpense ? "แก้ไขรายการค่าใช้จ่าย" : "เพิ่มรายการค่าใช้จ่าย"}
              </h3>
              <button
                onClick={() => setShowExpenseModal(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg"
              >
                <HiOutlineX size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  หมวดหมู่
                </label>
                <select
                  value={expenseForm.group_cost_id}
                  onChange={(e) => setExpenseForm({ ...expenseForm, group_cost_id: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:bg-white/10"
                >
                  <option value="" className="bg-slate-800">เลือกหมวดหมู่</option>
                  {expenseCategories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-slate-800">
                      {cat.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  รายละเอียด
                </label>
                <input
                  type="text"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:bg-white/10"
                  placeholder="กรอกรายละเอียดค่าใช้จ่าย"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  จำนวนเงิน
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:bg-white/10"
                  placeholder="กรอกจำนวนเงิน"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  วันที่
                </label>
                <input
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:bg-white/10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  หมายเหตุ
                </label>
                <textarea
                  value={expenseForm.note}
                  onChange={(e) => setExpenseForm({ ...expenseForm, note: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:bg-white/10 resize-none"
                  placeholder="กรอกหมายเหตุ (ถ้ามี)"
                  rows="3"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowExpenseModal(false)}
                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 text-slate-300 rounded-lg hover:bg-white/10 transition-all"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSaveExpense}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                >
                  {editingExpense ? "บันทึกการแก้ไข" : "เพิ่มรายการ"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}