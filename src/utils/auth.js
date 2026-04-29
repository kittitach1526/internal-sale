// Authentication utilities
// ตรวจสอบสิทธิ์ผู้ใช้สำหรับการเข้าถึงหน้าต่างๆ

// ดึงข้อมูลผู้ใช้จาก localStorage
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// ตรวจสอบว่าผู้ใช้ล็อกอินอยู่หรือไม่
export const isAuthenticated = () => {
  const user = getCurrentUser();
  return user && user.id;
};

// ตรวจสอบว่าเป็น admin หรือ root หรือไม่ (เทียบกับตาราง group_user)
export const isAdminOrRoot = () => {
  const user = getCurrentUser();
  if (!user || !user.group_id) {
    return false;
  }
  
  // group_id 1 = admin, 0 = root (ถ้ามี)
  return user.group_id === 1 || user.group_id === 0;
};

// ตรวจสอบว่าเป็น admin เท่านั้น
export const isAdmin = () => {
  const user = getCurrentUser();
  if (!user || !user.group_id) {
    return false;
  }
  
  return user.group_id === 1;
};

// ตรวจสอบว่าเป็น root เท่านั้น
export const isRoot = () => {
  const user = getCurrentUser();
  if (!user || !user.group_id) {
    return false;
  }
  
  return user.group_id === 0;
};

// ตรวจสอบว่าเป็น admin หรือ manager หรือไม่
export const isAdminOrManager = () => {
  const user = getCurrentUser();
  if (!user || !user.group_id) {
    return false;
  }
  
  // group_id 1 = admin, 2 = manager (ตามตาราง group_user ที่ init_database.py สร้าง)
  return user.group_id === 1 || user.group_id === 2;
};

// ตรวจสอบว่าเป็น manager เท่านั้น
export const isManager = () => {
  const user = getCurrentUser();
  if (!user || !user.group_id) {
    return false;
  }
  
  return user.group_id === 2;
};

// ดึงชื่อกลุ่มผู้ใช้
export const getUserGroupName = () => {
  const user = getCurrentUser();
  if (!user || !user.group_id) {
    return 'Unknown';
  }
  
  const groups = {
    1: 'admin',
    2: 'root', 
    3: 'พนักงาน'
  };
  
  return groups[user.group_id] || 'Unknown';
};

// ตรวจสอบสิทธิ์การเข้าถึงหน้าต่างๆ
export const checkPageAccess = (pageName) => {
  const user = getCurrentUser();
  
  // ถ้าไม่ได้ล็อกอิน ไม่สามารถเข้าถึงได้
  if (!isAuthenticated()) {
    return { allowed: false, reason: 'not_authenticated' };
  }
  
  // หน้าที่ต้องการสิทธิ์ admin/root เท่านั้น
  const adminOnlyPages = ['ActivityLog', 'Settings', 'AddUser', 'AddSale', 'AddExpense'];
  const rootOnlyPages = []; // เผื่อมีหน้าที่ root เท่านั้น
  
  if (adminOnlyPages.includes(pageName)) {
    if (isAdminOrRoot()) {
      return { allowed: true, reason: 'access_granted' };
    } else {
      return { allowed: false, reason: 'insufficient_permissions' };
    }
  }
  
  if (rootOnlyPages.includes(pageName)) {
    if (isRoot()) {
      return { allowed: true, reason: 'access_granted' };
    } else {
      return { allowed: false, reason: 'insufficient_permissions' };
    }
  }
  
  // หน้าที่ผู้ใช้ที่ล็อกอินแล้วสามารถเข้าถึงได้ (Home, Sales, Expenses)
  const authenticatedPages = ['Home', 'Sales', 'Expenses'];
  
  if (authenticatedPages.includes(pageName)) {
    return { allowed: true, reason: 'access_granted' };
  }
  
  // หน้าอื่นๆ ผู้ใช้ทั่วไปสามารถเข้าถึงได้
  return { allowed: true, reason: 'access_granted' };
};
