import { useEffect, useState } from "react";
import {
  HiOutlineUserGroup,
  HiOutlineCube,
  HiOutlineCash,
  HiOutlinePlus,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineShieldCheck,
} from "react-icons/hi";

import { getUsers } from "../services/user_api";
import { getProductCategories } from "../services/productService";
import { getProductCategories2 } from "../services/productService";
import { getGroupCost } from "../services/group_cost";



export default function Settings() {
  const [activeTab, setActiveTab] = useState("users");
  const [productCategories, setProductCategories] = useState({});
  const [productCategories2, setProductCategories2] = useState({});
  const [users, setUsers] = useState([]);
  // const [group_cost, setGroupCost] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);

  // --- Mock Data States (ในงานจริงส่วนนี้จะมาจาก API) ---
  useEffect(() => {
    getUsers()
      .then((res) => setUsers(res.data))
      .catch((err) => console.error(err));

    getProductCategories()
      .then((data) => setProductCategories(data))
      .catch((err) => console.error(err));

    getProductCategories2()
      .then((data) => setProductCategories2(data))
      .catch((err) => console.error(err));

    getGroupCost()
      .then((res) => setExpenseCategories(res.data))
      .catch((err) => console.error(err));
  }, []);

  // const [productCategories, setProductCategories] = useState({
  //   FOSTEC: ["Fiber Optic", "Splicing", "OTDR Test"],
  //   งานตรวจวัด: ["ตู้โหลด", "ความร้อน", "แสงสว่าง"],
  // });



  // --- UI Components ---
  const SectionHeader = ({ title, onAdd, icon: Icon }) => (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
          <Icon size={20} />
        </div>
        <h2 className="text-xl font-bold text-white">{title}</h2>
      </div>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl hover:bg-emerald-500/20 transition-all"
      >
        <HiOutlinePlus size={16} /> เพิ่มใหม่
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 pt-8 pb-20">
      <h1 className="text-3xl font-black text-white tracking-tight uppercase mb-8">
        System <span className="text-blue-500">Settings</span>
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* --- Navigation Sidebar --- */}
        <div className="lg:w-64 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0">
          {[
            { id: "users", label: "จัดการผู้ใช้งาน", icon: HiOutlineUserGroup },
            {
              id: "products",
              label: "หมวดหมู่สินค้า/งาน",
              icon: HiOutlineCube,
            },
            {
              id: "expenses",
              label: "หมวดหมู่ค่าใช้จ่าย",
              icon: HiOutlineCash,
            },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap
                ${activeTab === item.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </div>

        {/* --- Content Area --- */}
        <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-xl">
          {/* 1. จัดการ User */}
          {activeTab === "users" && (
            <div className="animate-in fade-in duration-500">
              <SectionHeader
                title="จัดการสิทธิ์การเข้าใช้งาน"
                icon={HiOutlineShieldCheck}
                onAdd={() => { }}
              />
              <div className="grid gap-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl group hover:border-blue-500/30 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-blue-400 font-bold">
                        {user.name[0]}
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">
                          {user.name}
                        </p>
                        <p className="text-slate-500 text-xs">
                          {user.email} •{" "}
                          <span className="text-blue-400">{user.role}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">

                      <button className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg">
                        <HiOutlinePencilAlt />
                      </button>

                      <button className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg">
                        <HiOutlineTrash />
                      </button>

                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. จัดการ Product (FOSTEC & งานตรวจวัด) */}
          {activeTab === "products" && (
            <div className="animate-in fade-in duration-500 space-y-10">
              {Object.entries(productCategories).map(([group, items]) => (
                <div key={group}>
                  <SectionHeader
                    title={`หมวดหมู่ ${group}`}
                    icon={HiOutlineCube}
                    onAdd={() => { }}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between px-5 py-3 bg-white/5 border border-white/10 rounded-xl"
                      >
                        <span className="text-sm text-slate-300 font-medium">
                          {item}
                        </span>
                        <div className="flex gap-1">
                          <button className="p-1.5 text-slate-500 hover:text-white">
                            <HiOutlinePencilAlt size={14} />
                          </button>
                          <button className="p-1.5 text-slate-500 hover:text-red-400">
                            <HiOutlineTrash size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              ))}
            </div>
          )}

          {activeTab === "products" && (
            <div className="animate-in fade-in duration-500 space-y-10 mt-10">
              {Object.entries(productCategories2).map(([group, items]) => (
                <div key={group}>
                  <SectionHeader
                    title={`หมวดหมู่ ${group}`}
                    icon={HiOutlineCube}
                    onAdd={() => { }}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between px-5 py-3 bg-white/5 border border-white/10 rounded-xl"
                      >
                        <span className="text-sm text-slate-300 font-medium">
                          {item}
                        </span>
                        <div className="flex gap-1">
                          <button className="p-1.5 text-slate-500 hover:text-white">
                            <HiOutlinePencilAlt size={14} />
                          </button>
                          <button className="p-1.5 text-slate-500 hover:text-red-400">
                            <HiOutlineTrash size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              ))}
            </div>
          )}

          {/* 3. จัดการ Expense */}
          {activeTab === "expenses" && (
            <div className="animate-in fade-in duration-500">
              <SectionHeader
                title="จัดการหมวดหมู่ค่าใช้จ่าย"
                icon={HiOutlineCash}
                onAdd={() => { }}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {expenseCategories.map((cat, index) => (
                  <div
                    key={cat.id || index} // แนะนำให้ใช้ cat.id เป็น key แทน index เพื่อ Performance ที่ดีกว่า
                    className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-sm text-slate-200 font-bold">
                        {/* แก้จาก {cat} เป็น {cat.name} */}
                        {cat.name}
                      </span>
                    </div>

                    {/* ... ส่วนปุ่มแก้ไข/ลบ เหมือนเดิม ... */}
                    <div className="flex gap-2">
                      <button className="p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg">
                        <HiOutlinePencilAlt size={16} />
                      </button>
                      <button className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg">
                        <HiOutlineTrash size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
