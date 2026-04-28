import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { checkPageAccess, isAuthenticated } from '../utils/auth';
import { logAccessDenied } from '../utils/logger';

// Component สำหรับป้องกันการเข้าถึงหน้าต่างๆ ตามสิทธิ์ผู้ใช้
function ProtectedRoute({ children, pageName }) {
  const location = useLocation();
  
  // ตรวจสอบสิทธิ์การเข้าถึง
  const access = checkPageAccess(pageName);
  
  // ถ้าไม่ได้ล็อกอิน ให้ redirect ไปหน้า login
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // ถ้าไม่มีสิทธิ์เพียงพอ ให้ redirect ไปหน้า home พร้อมแสดงข้อความ
  if (!access.allowed) {
    // บันทึก log การพยายามเข้าถึงที่ไม่ได้รับอนุญาต
    logAccessDenied(pageName);
    
    // เก็บข้อความ error ไว้ใน sessionStorage เพื่อแสดงในหน้า home
    sessionStorage.setItem('accessError', access.reason);
    return <Navigate to="/" replace />;
  }
  
  // ถ้ามีสิทธิ์เพียงพอ ให้แสดง component ที่ลูกๆ
  return children;
}

// Component สำหรับแสดงข้อความแจ้งเตือนเมื่อไม่มีสิทธิ์
export function AccessDeniedMessage() {
  const location = useLocation();
  
  // ตรวจสอบว่ามี error จากการ redirect หรือไม่
  const errorReason = sessionStorage.getItem('accessError');
  
  if (errorReason === 'insufficient_permissions') {
    // ลบข้อความ error หลังแสดงแล้ว
    setTimeout(() => sessionStorage.removeItem('accessError'), 100);
    
    return (
      <div className="fixed top-4 right-4 z-50 max-w-sm">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-red-400 font-semibold text-sm">ไม่มีสิทธิ์เข้าถึง</h3>
              <p className="text-red-300 text-xs mt-1">
                หน้านี้สำหรับผู้ดูแลระบบเท่านั้น
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return null;
}

export default ProtectedRoute;
