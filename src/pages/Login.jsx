import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import { logLogin, logAccessDenied } from "../utils/logger";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

    try {
      // Import auth service dynamically to avoid circular dependency
      const { login } = await import("../services/auth");
      const response = await login(formData.username, formData.password);
      
      if (response.success) {
        // Store user info in localStorage
        localStorage.setItem("user", JSON.stringify(response.user));
        localStorage.setItem("token", response.token);
        
        // บันทึก log การเข้าสู่ระบบสำเร็จ
        await logLogin(response.user, true);
        
        // Navigate to home page
        navigate("/");
      } else {
        // บันทึก log การเข้าสู่ระบบล้มเหลว
        await logLogin(null, false, `Username: ${formData.username}`);
        setError(response.message || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      }
    } catch (err) {
      console.error("Login error:", err);
      // บันทึก log error ในการเข้าสู่ระบบ
      await logLogin(null, false, `System Error: ${err.message}`);
      setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4">
      {/* Background Glow */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-blue-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-indigo-900/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Login Container */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-8 backdrop-blur-md shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600/20 rounded-full mb-4">
              <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight uppercase mb-2">
              Internal Sale
            </h1>
            <p className="text-slate-500 font-medium">
              เข้าสู่ระบบจัดการขายภายใน
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                ชื่อผู้ใช้ <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-blue-500/50 focus:outline-none focus:bg-white/10 transition-all"
                placeholder="กรอกชื่อผู้ใช้ของคุณ"
                autoComplete="username"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                รหัสผ่าน <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-blue-500/50 focus:outline-none focus:bg-white/10 transition-all pr-12"
                  placeholder="กรอกรหัสผ่านของคุณ"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <HiOutlineEyeOff size={20} />
                  ) : (
                    <HiOutlineEye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              ลืมรหัสผ่าน?{" "}
              <button className="text-blue-400 hover:text-blue-300 transition-colors">
                ติดต่อผู้ดูแลระบบ
              </button>
            </p>
          </div>
        </div>

        {/* Demo Info */}
        <div className="mt-6 text-center">
          <p className="text-slate-600 text-xs">
            บัญชีทดสอบ: admin / admin1234
          </p>
        </div>
      </div>
    </div>
  );
}
