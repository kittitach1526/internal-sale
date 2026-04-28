import { createLog } from '../services/logs';
import { getCurrentUser } from './auth';

// ประเภทของ log
export const LOG_TYPES = {
  SUCCESS: 'success',
  WARNING: 'warning', 
  ERROR: 'error',
  INFO: 'info'
};

// ประเภทของ action
export const LOG_ACTIONS = {
  LOGIN: 'เข้าสู่ระบบ',
  LOGOUT: 'ออกจากระบบ',
  CREATE_SALE: 'เพิ่มข้อมูล',
  UPDATE_SALE: 'แก้ไขข้อมูลขาย',
  DELETE_SALE: 'ลบข้อมูลขาย',
  CREATE_EXPENSE: 'เพิ่มค่าใช้จ่าย',
  UPDATE_EXPENSE: 'แก้ไขค่าใช้จ่าย',
  DELETE_EXPENSE: 'ลบค่าใช้จ่าย',
  CREATE_USER: 'เพิ่มผู้ใช้',
  UPDATE_USER: 'แก้ไขผู้ใช้',
  DELETE_USER: 'ลบผู้ใช้',
  VIEW_REPORT: 'ดูรายงาน',
  PRINT_REPORT: 'พิมพ์รายงาน',
  EXPORT_DATA: 'ส่งออกข้อมูล',
  SYSTEM_BACKUP: 'สำรองข้อมูล',
  SYSTEM_WARNING: 'แจ้งเตือนระบบ',
  FAILED_LOGIN: 'พยายามเข้าสู่ระบบ',
  ACCESS_DENIED: 'ถูกปฏิเสธการเข้าถึง',
  UNKNOWN: 'ไม่ทราบ'
};

// ฟังก์ชันหลักสำหรับบันทึก log
export const logActivity = async (action, details, type = LOG_TYPES.INFO, user = null) => {
  try {
    const currentUser = user || getCurrentUser();
    const now = new Date();
    
    // สร้างข้อมูล log entry ให้ตรงกับ API รูปแบบ
    const logEntry = {
      user: currentUser ? `${currentUser.firstname || ''} ${currentUser.lastname || ''}`.trim() || currentUser.username || 'Unknown User' : 'System',
      action: action,
      detail: details, // เปลี่ยนจาก details เป็น detail ให้ตรงกับ API
      type: type,
      ip: getClientIP(), // เปลี่ยนจาก ip_address เป็น ip
      user_agent: navigator.userAgent
    };

    // บันทึกลงฐานข้อมูล
    await createLog(logEntry);
    
    // แสดงใน console สำหรับ debugging
    console.log(`[LOG] ${type.toUpperCase()}: ${action} - ${details}`, logEntry);
    
  } catch (error) {
    console.error('Failed to log activity:', error);
    // ไม่ throw error เพราะไม่ต้องการให้ log error ทำหน้าอื่นหยุดทำงาน
  }
};

// ฟังก์ชันสำหรับบันทึกการเข้าสู่ระบบ
export const logLogin = async (user, success = true, details = '') => {
  const action = success ? LOG_ACTIONS.LOGIN : LOG_ACTIONS.FAILED_LOGIN;
  const type = success ? LOG_TYPES.SUCCESS : LOG_TYPES.WARNING;
  const logDetails = details || (success 
    ? `Login สำเร็จผ่าน ${getBrowserInfo()} (${getOSInfo()})`
    : 'รหัสผ่านไม่ถูกต้อง'
  );
  
  await logActivity(action, logDetails, type, user);
};

// ฟังก์ชันสำหรับบันทึกการออกจากระบบ
export const logLogout = async (user) => {
  await logActivity(LOG_ACTIONS.LOGOUT, 'ออกจากระบบสำเร็จ', LOG_TYPES.INFO, user);
};

// ฟังก์ชันสำหรับบันทึกการเพิ่ม/แก้ไข/ลบข้อมูลขาย
export const logSaleAction = async (action, saleData, user = null) => {
  let details = '';
  
  switch (action) {
    case LOG_ACTIONS.CREATE_SALE:
      details = `เพิ่มรายการยอดขายใหม่ (#INV-${saleData.id || 'NEW'}) - ${saleData.name}`;
      break;
    case LOG_ACTIONS.UPDATE_SALE:
      details = `แก้ไขรายการขาย (#INV-${saleData.id}) - ${saleData.name}`;
      break;
    case LOG_ACTIONS.DELETE_SALE:
      details = `ลบรายการขาย (#INV-${saleData.id}) - ${saleData.name}`;
      break;
    default:
      details = `ดำเนินการกับรายการขาย: ${JSON.stringify(saleData)}`;
  }
  
  await logActivity(action, details, LOG_TYPES.SUCCESS, user);
};

// ฟังก์ชันสำหรับบันทึกการเพิ่ม/แก้ไข/ลบค่าใช้จ่าย
export const logExpenseAction = async (action, expenseData, user = null) => {
  let details = '';
  
  switch (action) {
    case LOG_ACTIONS.CREATE_EXPENSE:
      details = `เพิ่มรายการค่าใช้จ่ายใหม่ (#EX-${expenseData.id || 'NEW'}) - ${expenseData.description}`;
      break;
    case LOG_ACTIONS.UPDATE_EXPENSE:
      details = `แก้ไขรายการค่าใช้จ่าย (#EX-${expenseData.id}) - ${expenseData.description}`;
      break;
    case LOG_ACTIONS.DELETE_EXPENSE:
      details = `ลบรายการค่าใช้จ่าย (#EX-${expenseData.id}) - ${expenseData.description}`;
      break;
    default:
      details = `ดำเนินการกับรายการค่าใช้จ่าย: ${JSON.stringify(expenseData)}`;
  }
  
  await logActivity(action, details, LOG_TYPES.SUCCESS, user);
};

// ฟังก์ชันสำหรับบันทึกการจัดการผู้ใช้
export const logUserAction = async (action, userData, user = null) => {
  let details = '';
  
  switch (action) {
    case LOG_ACTIONS.CREATE_USER:
      details = `เพิ่มผู้ใช้ใหม่ (${userData.username}) - ${userData.firstname} ${userData.lastname}`;
      break;
    case LOG_ACTIONS.UPDATE_USER:
      details = `แก้ไขข้อมูลผู้ใช้ (${userData.username})`;
      break;
    case LOG_ACTIONS.DELETE_USER:
      details = `ลบผู้ใช้ (${userData.username})`;
      break;
    default:
      details = `ดำเนินการกับผู้ใช้: ${JSON.stringify(userData)}`;
  }
  
  await logActivity(action, details, LOG_TYPES.SUCCESS, user);
};

// ฟังก์ชันสำหรับบันทึกการเข้าถึงหน้าที่ไม่ได้รับอนุญาต
export const logAccessDenied = async (pageName, user = null) => {
  const details = `พยายามเข้าถึงหน้า ${pageName} โดยไม่มีสิทธิ์`;
  await logActivity(LOG_ACTIONS.ACCESS_DENIED, details, LOG_TYPES.WARNING, user);
};

// ฟังก์ชันสำหรับบันทึกการดูรายงาน
export const logReportAction = async (reportType, details = '') => {
  const action = details ? LOG_ACTIONS.PRINT_REPORT : LOG_ACTIONS.VIEW_REPORT;
  const logDetails = details || `ดูรายงาน${reportType}`;
  await logActivity(action, logDetails, LOG_TYPES.INFO);
};

// ฟังก์ชันสำหรับบันทึกเหตุการณ์ระบบ
export const logSystemEvent = async (action, details, type = LOG_TYPES.INFO) => {
  await logActivity(action, details, type, null); // user = null สำหรับ system events
};

// Helper functions
const getClientIP = () => {
  // ใน production ควรดึงจาก server-side
  // ตอนนี้ใช้ค่าจำลอง
  return '192.168.1.100'; // หรือดึงจาก req.ip ถ้ามี server-side
};

const getBrowserInfo = () => {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Unknown Browser';
};

const getOSInfo = () => {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac')) return 'Mac OS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS')) return 'iOS';
  return 'Unknown OS';
};
