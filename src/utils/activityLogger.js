// Activity Logger Utility
// ใช้สำหรับบันทึกกิจกรรมทั้งหมดของผู้ใช้ในระบบ

import { createLog } from '../services/logs';
import { getCurrentUser } from './auth';

// Log types
export const LOG_TYPES = {
  CREATE: 'create',
  UPDATE: 'update', 
  DELETE: 'delete',
  VIEW: 'view',
  LOGIN: 'login',
  LOGOUT: 'logout',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Log categories
export const LOG_CATEGORIES = {
  SALES: 'sales',
  EXPENSES: 'expenses',
  USERS: 'users',
  PRODUCTS: 'products',
  SETTINGS: 'settings',
  SYSTEM: 'system',
  AUTH: 'auth'
};

/**
 * บันทึกกิจกรรมของผู้ใช้
 * @param {string} action - ชื่อการกระทำ (เช่น "เพิ่มรายการขาย", "แก้ไขข้อมูลผู้ใช้")
 * @param {string} category - หมวดหมู่ (ใช้ LOG_CATEGORIES)
 * @param {string} type - ประเภท (ใช้ LOG_TYPES)
 * @param {string} details - รายละเอียดเพิ่มเติม
 * @param {string} targetId - ID ของรายการที่กระทำ (ถ้ามี)
 */
export const logActivity = async (action, category, type, details = '', targetId = null) => {
  try {
    const user = getCurrentUser();
    const logData = {
      user: `${user?.name || 'Unknown User'} (${user?.email || 'unknown@example.com'})`,
      action: `${action} [${category}/${type}]`,
      detail: details || action,
      type: type,
      ip: window.location.hostname,
      user_agent: navigator.userAgent
    };

    // ส่งไปบันทึกที่ backend
    await createLog(logData);
    
    // แสดงใน console สำหรับ debugging
    console.log(`🔍 Activity Log: ${user?.name} - ${action} (${category}/${type})`);
    
  } catch (error) {
    console.error('❌ Error logging activity:', error);
    // ไม่ throw error เพราะไม่ต้องการให้ logging ขัดข้องการทำงานหลัก
  }
};

/**
 * บันทึกการเข้าสู่ระบบ
 */
export const logLogin = async (user) => {
  await logActivity(
    'เข้าสู่ระบบ',
    LOG_CATEGORIES.AUTH,
    LOG_TYPES.LOGIN,
    `ผู้ใช้ ${user.name} เข้าสู่ระบบสำเร็จ`,
    user.id
  );
};

/**
 * บันทึกการออกจากระบบ
 */
export const logLogout = async (user) => {
  await logActivity(
    'ออกจากระบบ',
    LOG_CATEGORIES.AUTH,
    LOG_TYPES.LOGOUT,
    `ผู้ใช้ ${user.name} ออกจากระบบ`,
    user.id
  );
};

/**
 * บันทึกการสร้างรายการขาย
 */
export const logSaleCreated = async (saleData) => {
  await logActivity(
    'เพิ่มรายการขาย',
    LOG_CATEGORIES.SALES,
    LOG_TYPES.CREATE,
    `เพิ่มรายการขาย: ${saleData.name} (${saleData.bill_number}) - จำนวนเงิน ${saleData.price} บาท`,
    saleData.id
  );
};

/**
 * บันทึกการแก้ไขรายการขาย
 */
export const logSaleUpdated = async (saleData) => {
  await logActivity(
    'แก้ไขรายการขาย',
    LOG_CATEGORIES.SALES,
    LOG_TYPES.UPDATE,
    `แก้ไขรายการขาย: ${saleData.name} (${saleData.bill_number})`,
    saleData.id
  );
};

/**
 * บันทึกการลบรายการขาย
 */
export const logSaleDeleted = async (saleData) => {
  await logActivity(
    'ลบรายการขาย',
    LOG_CATEGORIES.SALES,
    LOG_TYPES.DELETE,
    `ลบรายการขาย: ${saleData.name} (${saleData.bill_number})`,
    saleData.id
  );
};

/**
 * บันทึกการดูข้อมูล
 */
export const logView = async (category, details) => {
  await logActivity(
    'ดูข้อมูล',
    category,
    LOG_TYPES.VIEW,
    details
  );
};

/**
 * บันทึกการจัดการผู้ใช้
 */
export const logUserAction = async (action, userData, type) => {
  await logActivity(
    action,
    LOG_CATEGORIES.USERS,
    type,
    `${action}: ${userData.name} (${userData.email})`,
    userData.id
  );
};

/**
 * บันทึกการจัดการสินค้า/บริการ
 */
export const logProductAction = async (action, productName, type) => {
  await logActivity(
    action,
    LOG_CATEGORIES.PRODUCTS,
    type,
    `${action}: ${productName}`
  );
};

/**
 * บันทึกการจัดการค่าใช้จ่าย
 */
export const logExpenseAction = async (action, expenseName, type) => {
  await logActivity(
    action,
    LOG_CATEGORIES.EXPENSES,
    type,
    `${action}: ${expenseName}`
  );
};

/**
 * บันทึกการตั้งค่าระบบ
 */
export const logSettingsAction = async (action, details) => {
  await logActivity(
    action,
    LOG_CATEGORIES.SETTINGS,
    LOG_TYPES.UPDATE,
    details
  );
};

/**
 * บันทึกข้อผิดพลาด
 */
export const logError = async (error, context = '') => {
  await logActivity(
    'เกิดข้อผิดพลาด',
    LOG_CATEGORIES.SYSTEM,
    LOG_TYPES.ERROR,
    `${context}: ${error.message || error}`,
    null
  );
};

/**
 * บันทึกคำเตือน
 */
export const logWarning = async (message, context = '') => {
  await logActivity(
    'คำเตือน',
    LOG_CATEGORIES.SYSTEM,
    LOG_TYPES.WARNING,
    `${context}: ${message}`,
    null
  );
};
