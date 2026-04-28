import React, { useState, useEffect } from "react";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { createUser } from "../services/user_api";
import { getGroupUsers } from "../services/group_user";

export default function AddUser() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [groupUsers, setGroupUsers] = useState([]);

  // Fetch group users on component mount
  useEffect(() => {
    const fetchGroupUsers = async () => {
      try {
        const response = await getGroupUsers();
        setGroupUsers(response.data);
        // Set default role to the first available group (excluding 'root')
        const nonRootGroups = response.data.filter(group => group.name !== 'root');
        if (nonRootGroups.length > 0) {
          setFormData(prev => ({ ...prev, role: nonRootGroups[0].id }));
        }
      } catch (error) {
        console.error('Error fetching group users:', error);
      }
    };

    fetchGroupUsers();
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
    setError("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      setLoading(false);
      return;
    }

    // Validate required fields
    if (!formData.name || !formData.username || !formData.password) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      setLoading(false);
      return;
    }

    try {
      const response = await createUser({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        role: formData.role,
        password: formData.password
      });
      
      if (response.data === false) {
        setError("ไม่สามารถสร้างผู้ใช้ได้ อาจเกิดจาก username ซ้ำกัน");
      } else {
        // Navigate back to Settings page
        navigate("/settings");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else {
        setError("เกิดข้อผิดพลาดในการเพิ่มผู้ใช้ กรุณาลองใหม่");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/settings");
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
              เพิ่มผู้ใช้ใหม่
            </h1>
            <p className="text-slate-500 mt-1 font-medium text-sm">
              สร้างบัญชีผู้ใช้ใหม่สำหรับระบบ
            </p>
          </div>
        </div>
      </header>

      {/* Form */}
      <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ชื่อผู้ใช้ */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                ชื่อผู้ใช้ <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-blue-500/50 focus:outline-none transition-all"
                placeholder="กรอกชื่อผู้ใช้"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Username <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-blue-500/50 focus:outline-none transition-all"
                placeholder="กรอก username"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* อีเมล */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                อีเมล (ไม่จำเป็น)
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-blue-500/50 focus:outline-none transition-all"
                placeholder="กรอกอีเมล (ถ้ามี)"
              />
            </div>

            {/* บทบาท */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                บทบาท <span className="text-red-400">*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500/50 focus:outline-none transition-all"
              >
                <option value="">เลือกบทบาท</option>
                {groupUsers
                  .filter(group => group.name !== 'root') // Exclude 'root' group
                  .map(group => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* รหัสผ่าน */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                รหัสผ่าน <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-blue-500/50 focus:outline-none transition-all"
                placeholder="กรอกรหัสผ่าน"
              />
            </div>

            {/* ยืนยันรหัสผ่าน */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                ยืนยันรหัสผ่าน <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                minLength={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-blue-500/50 focus:outline-none transition-all"
                placeholder="ยืนยันรหัสผ่าน"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

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
              {loading ? "กำลังสร้างผู้ใช้..." : "สร้างผู้ใช้"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
