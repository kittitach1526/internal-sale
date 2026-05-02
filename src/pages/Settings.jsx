import { useEffect, useState } from "react";
import {
  HiOutlineUserGroup,
  HiOutlineCube,
  HiOutlineCash,
  HiOutlinePlus,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineShieldCheck,
  HiOutlineX,
} from "react-icons/hi";
import { useNavigate } from "react-router-dom";

import { getUsers, createUser, updateUser, deleteUser } from "../services/user_api";
import { getProductCategories, getProductCategories2, getFostecProducts, getMeasuringWorks, createFostecProduct, deleteFostecProduct, updateFostecProduct, createMeasuringWork, deleteMeasuringWork, updateMeasuringWork } from "../services/productService";
import { getGroupCost, createGroupCost, deleteGroupCost, updateGroupCost } from "../services/group_cost";
import { isAdminOrManager } from "../utils/auth";
import { logView, logUserAction, logProductAction, logExpenseAction, logSettingsAction, logError } from "../utils/activityLogger";



export default function Settings() {
  const navigate = useNavigate();
  
  // ตรวจสอบสิทธิ์ - เฉพาะ admin และ manager เท่านั้นที่เข้าได้
  useEffect(() => {
    if (!isAdminOrManager()) {
      alert('ไม่มีสิทธิ์เข้าถึงหน้า Settings\nต้องเป็น Admin หรือ Manager เท่านั้น');
      navigate('/home');
      return;
    }
  }, [navigate]);
  
  const [activeTab, setActiveTab] = useState("users");
  const [productCategories, setProductCategories] = useState({});
  const [productCategories2, setProductCategories2] = useState({});
  const [fostecProducts, setFostecProducts] = useState([]);
  const [measuringWorks, setMeasuringWorks] = useState([]);
  const [users, setUsers] = useState([]);
  // const [group_cost, setGroupCost] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [expenseForm, setExpenseForm] = useState({ id: "", name: "" });
  
  // Product Categories State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ id: "", name: "" });
  const [productType, setProductType] = useState("FOSTEC");
  
  // Users State
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({ id: "", name: "", email: "", role: "" });

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

    // ดึงข้อมูลสินค้าที่มี ID จริง
    getFostecProducts()
      .then((data) => setFostecProducts(data))
      .catch((err) => console.error(err));

    getMeasuringWorks()
      .then((data) => setMeasuringWorks(data))
      .catch((err) => console.error(err));

    getGroupCost()
      .then((res) => setExpenseCategories(res.data))
      .catch((err) => console.error(err));
  }, []);

  // --- Handler Functions ---
  const handleAddExpense = () => {
    setEditingExpense(null);
    setExpenseForm({ name: "" });
    setShowExpenseModal(true);
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setExpenseForm({ id: expense.id.toString(), name: expense.name });
    setShowExpenseModal(true);
  };

  const handleDeleteExpense = (expense) => {
    console.log('🔍 Debug: handleDeleteExpense called with:', expense);
    if (window.confirm(`คุณต้องการลบ "${expense.name}" ใช่หรือไม่?`)) {
      deleteGroupCost(expense.id)
        .then(() => {
          setExpenseCategories(expenseCategories.filter(cat => cat.id !== expense.id));
          
          console.log('🔍 Debug: About to log expense deletion');
          // Log the successful deletion
          logExpenseAction('ลบหมวดหมู่ค่าใช้จ่าย', expense.name, 'delete')
            .then(() => console.log('✅ Debug: Expense deletion logged successfully'))
            .catch(err => console.error('❌ Debug: Error logging expense deletion:', err));
        })
        .catch((err) => {
          console.error(err);
          logError(err, 'การลบหมวดหมู่ค่าใช้จ่าย');
        });
    }
  };

  const handleSaveExpense = () => {
    if (!expenseForm.name.trim()) return;

    if (editingExpense) {
      // Update existing expense
      updateGroupCost(editingExpense.id, expenseForm.name)
        .then(() => {
          setExpenseCategories(expenseCategories.map(cat => 
            cat.id === editingExpense.id ? { ...cat, name: expenseForm.name } : cat
          ));
          setShowExpenseModal(false);
          
          // Log the successful update
          logExpenseAction('แก้ไขหมวดหมู่ค่าใช้จ่าย', expenseForm.name, 'update');
        })
        .catch((err) => {
          console.error(err);
          logError(err, 'การแก้ไขหมวดหมู่ค่าใช้จ่าย');
        });
    } else {
      // Add new expense with auto-generated ID
      createGroupCost(expenseForm.name)
        .then((response) => {
          // Add the new expense with the ID returned from the server
          const newExpense = response.data || { id: Date.now(), name: expenseForm.name };
          setExpenseCategories([...expenseCategories, newExpense]);
          setShowExpenseModal(false);
          
          // Log the successful creation
          logExpenseAction('เพิ่มหมวดหมู่ค่าใช้จ่าย', expenseForm.name, 'create');
        })
        .catch((err) => {
          console.error(err);
          logError(err, 'การเพิ่มหมวดหมู่ค่าใช้จ่าย');
        });
    }
  };

  // Product Category Handlers
  const handleAddProduct = (type) => {
    setEditingProduct(null);
    setProductForm({ name: "" });
    setProductType(type);
    setShowProductModal(true);
  };

  const handleEditProduct = (product, type) => {
    setEditingProduct(product);
    setProductForm({ id: "", name: product }); // For products, we don't have ID in the display yet
    setProductType(type);
    setShowProductModal(true);
  };

  const handleDeleteProduct = (product, type) => {
    if (window.confirm(`คุณต้องการลบ "${product}" ใช่หรือไม่?`)) {
      console.log('🔍 Debug - Deleting product:', { product, type });
      console.log('🔍 Debug - Available fostecProducts:', fostecProducts);
      console.log('🔍 Debug - Available measuringWorks:', measuringWorks);
      
      if (type === "FOSTEC") {
        // Find the product with this name in the fostecProducts array
        const productToDelete = fostecProducts.find(p => p.name === product);
        console.log('🔍 Debug - FOSTEC product to delete:', productToDelete);
        
        if (productToDelete) {
          console.log('🔍 Debug - Calling deleteFostecProduct with ID:', productToDelete.id);
          deleteFostecProduct(productToDelete.id)
            .then((response) => {
              console.log('✅ Debug - Delete FOSTEC successful:', response);
              // Update both the full data and the display data
              setFostecProducts(fostecProducts.filter(p => p.id !== productToDelete.id));
              const updatedCategories = { ...productCategories };
              updatedCategories.FOSTEC = productCategories.FOSTEC.filter(item => item !== product);
              setProductCategories(updatedCategories);
              
              // Log the successful deletion
              console.log('🔍 Debug: About to log FOSTEC product deletion');
              logProductAction('ลบสินค้า Fostec', product, 'delete')
                .then(() => console.log('✅ Debug: FOSTEC product deletion logged successfully'))
                .catch(err => console.error('❌ Debug: Error logging FOSTEC product deletion:', err));
            })
            .catch((err) => {
              console.error('❌ Debug - Error deleting FOSTEC product:', err);
              console.error('❌ Debug - Error response:', err.response);
              alert('ไม่สามารถลบข้อมูลได้ กรุณาลองใหม่');
            });
        } else {
          console.log('❌ Debug - FOSTEC product not found with name:', product);
          alert('ไม่พบข้อมูลสินค้านี้');
        }
      } else {
        // Measuring Work - find the product with this name in the measuringWorks array
        const workToDelete = measuringWorks.find(w => w.name === product);
        console.log('🔍 Debug - Measuring work to delete:', workToDelete);
        
        if (workToDelete) {
          console.log('🔍 Debug - Calling deleteMeasuringWork with ID:', workToDelete.id);
          deleteMeasuringWork(workToDelete.id)
            .then((response) => {
              console.log('✅ Debug - Delete measuring work successful:', response);
              // Update both the full data and the display data
              setMeasuringWorks(measuringWorks.filter(w => w.id !== workToDelete.id));
              const updatedCategories = { ...productCategories2 };
              updatedCategories["งานตรวจรับ"] = productCategories2["งานตรวจรับ"].filter(item => item !== product);
              setProductCategories2(updatedCategories);
              
              // Log the successful deletion
              console.log('🔍 Debug: About to log measuring work deletion');
              logProductAction('ลบงานตรวจวัด', product, 'delete')
                .then(() => console.log('✅ Debug: Measuring work deletion logged successfully'))
                .catch(err => console.error('❌ Debug: Error logging measuring work deletion:', err));
            })
            .catch((err) => {
              console.error('❌ Debug - Error deleting measuring work:', err);
              console.error('❌ Debug - Error response:', err.response);
              alert('ไม่สามารถลบข้อมูลได้ กรุณาลองใหม่');
            });
        } else {
          console.log('❌ Debug - Measuring work not found with name:', product);
          alert('ไม่พบข้อมูลงานตรวจรับนี้');
        }
      }
    }
  };

  const handleSaveProduct = () => {
    if (!productForm.name.trim()) return;

    if (productType === "FOSTEC") {
      if (editingProduct) {
        // Update existing FOSTEC product
        const updatedCategories = { ...productCategories };
        updatedCategories.FOSTEC = updatedCategories.FOSTEC.map(item => 
          item === editingProduct ? productForm.name : item
        );
        setProductCategories(updatedCategories);
        setShowProductModal(false);
        
        // Log the successful update
        logProductAction('แก้ไขสินค้า Fostec', productForm.name, 'update');
      } else {
        // Add new FOSTEC product with auto-generated ID
        createFostecProduct(productForm.name)
          .then((response) => {
            const updatedCategories = { ...productCategories };
            updatedCategories.FOSTEC = [...(updatedCategories.FOSTEC || []), productForm.name];
            // Refresh the full product list to get the new item with ID
            getFostecProducts()
              .then((data) => setFostecProducts(data))
              .catch((err) => console.error(err));
            setProductCategories(updatedCategories);
            setShowProductModal(false);
            
            // Log the successful creation
            logProductAction('เพิ่มสินค้า Fostec', productForm.name, 'create');
          })
          .catch((err) => {
            console.error(err);
            logError(err, 'การเพิ่มสินค้า Fostec');
          });
      }
    } else {
      // Measuring Work
      if (editingProduct) {
        // Update existing measuring work
        const updatedCategories = { ...productCategories2 };
        updatedCategories["งานตรวจรับ"] = updatedCategories["งานตรวจรับ"].map(item => 
          item === editingProduct ? productForm.name : item
        );
        setProductCategories2(updatedCategories);
        setShowProductModal(false);
        
        // Log the successful update
        logProductAction('แก้ไขงานตรวจวัด', productForm.name, 'update');
      } else {
        // Add new measuring work with auto-generated ID
        createMeasuringWork(productForm.name)
          .then((response) => {
            const updatedCategories = { ...productCategories2 };
            updatedCategories["งานตรวจรับ"] = [...(updatedCategories["งานตรวจรับ"] || []), productForm.name];
            // Refresh the full work list to get the new item with ID
            getMeasuringWorks()
              .then((data) => setMeasuringWorks(data))
              .catch((err) => console.error(err));
            setProductCategories2(updatedCategories);
            setShowProductModal(false);
            
            // Log the successful creation
            logProductAction('เพิ่มงานตรวจวัด', productForm.name, 'create');
          })
          .catch((err) => {
            console.error(err);
            logError(err, 'การเพิ่มงานตรวจวัด');
          });
      }
    }
  };

  // User Management Handlers
  const handleAddUser = () => {
    navigate('/add-user');
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserForm({ name: user.name, email: user.email, role: user.role });
    setShowUserModal(true);
  };

  const handleDeleteUser = (user) => {
    console.log('🔍 Debug: handleDeleteUser called with:', user);
    if (window.confirm(`คุณต้องการลบผู้ใช้ "${user.name}" ใช่หรือไม่?`)) {
      deleteUser(user.id)
        .then(() => {
          setUsers(users.filter(u => u.id !== user.id));
          
          console.log('🔍 Debug: About to log user deletion');
          // Log the successful deletion
          logUserAction('ลบผู้ใช้', user, 'delete')
            .then(() => console.log('✅ Debug: User deletion logged successfully'))
            .catch(err => console.error('❌ Debug: Error logging user deletion:', err));
        })
        .catch((err) => {
          console.error(err);
          logError(err, 'การลบผู้ใช้');
        });
    }
  };

  const handleSaveUser = () => {
    if (!userForm.name.trim() || !userForm.email.trim() || !userForm.role.trim()) return;

    if (editingUser) {
      // Update existing user
      updateUser(editingUser.id, { name: userForm.name, email: userForm.email, role: userForm.role })
        .then(() => {
          setUsers(users.map(u => 
            u.id === editingUser.id ? { ...u, name: userForm.name, email: userForm.email, role: userForm.role } : u
          ));
          setShowUserModal(false);
          
          // Log the successful update
          logUserAction('แก้ไขผู้ใช้', { ...editingUser, name: userForm.name, email: userForm.email, role: userForm.role }, 'update');
        })
        .catch((err) => {
          console.error(err);
          logError(err, 'การแก้ไขผู้ใช้');
        });
    } else {
      // Add new user with auto-generated ID
      const userData = {
        name: userForm.name,
        email: userForm.email,
        role: userForm.role,
        username: userForm.email.split('@')[0], // Generate username from email
        password: 'default123' // Default password
      };
      createUser(userData)
        .then((res) => {
          setUsers([...users, res.data]);
          setShowUserModal(false);
          
          // Log the successful creation
          logUserAction('เพิ่มผู้ใช้', { ...userData, id: res.data.id }, 'create');
        })
        .catch((err) => {
          console.error(err);
          logError(err, 'การเพิ่มผู้ใช้');
        });
    }
  };

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
                onAdd={handleAddUser}
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
                          ID: {user.id} • {user.email} •{" "}
                          <span className="text-blue-400">{user.role}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEditUser(user)}
                        className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg"
                      >
                        <HiOutlinePencilAlt />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg"
                      >
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
                    onAdd={() => handleAddProduct(group)}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {items.map((item, index) => (
                      <div
                        key={`${group}-${item}-${index}`}
                        className="flex items-center justify-between px-5 py-3 bg-white/5 border border-white/10 rounded-xl"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm text-slate-300 font-medium">
                            {item}
                          </span>
                          <span className="text-xs text-slate-500">
                            ID: {index + 1}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => handleEditProduct(item, group)}
                            className="p-1.5 text-slate-500 hover:text-white"
                          >
                            <HiOutlinePencilAlt size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(item, group)}
                            className="p-1.5 text-slate-500 hover:text-red-400"
                          >
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
                    onAdd={() => handleAddProduct(group)}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {items.map((item, index) => (
                      <div
                        key={`${group}-${item}-${index}`}
                        className="flex items-center justify-between px-5 py-3 bg-white/5 border border-white/10 rounded-xl"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm text-slate-300 font-medium">
                            {item}
                          </span>
                          <span className="text-xs text-slate-500">
                            ID: {index + 1}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => handleEditProduct(item, group)}
                            className="p-1.5 text-slate-500 hover:text-white"
                          >
                            <HiOutlinePencilAlt size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(item, group)}
                            className="p-1.5 text-slate-500 hover:text-red-400"
                          >
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
                onAdd={handleAddExpense}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {expenseCategories.map((cat, index) => (
                  <div
                    key={`expense-${cat.id || index}`} // Ensure unique key with prefix
                    className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-200 font-bold">
                          {cat.name}
                        </span>
                        <span className="text-xs text-slate-500">
                          ID: {cat.id}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditExpense(cat)}
                        className="p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg"
                      >
                        <HiOutlinePencilAlt size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteExpense(cat)}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg"
                      >
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

      {/* Expense Category Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">
                {editingExpense ? "แก้ไขหมวดหมู่ค่าใช้จ่าย" : "เพิ่มหมวดหมู่ค่าใช้จ่าย"}
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
                  ชื่อหมวดหมู่
                </label>
                <input
                  type="text"
                  value={expenseForm.name}
                  onChange={(e) => setExpenseForm({ ...expenseForm, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:bg-white/10"
                  placeholder="กรอกชื่อหมวดหมู่ค่าใช้จ่าย"
                  autoFocus={!editingExpense}
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
                  {editingExpense ? "บันทึกการแก้ไข" : "เพิ่มหมวดหมู่"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Category Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">
                {editingProduct ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่"} {productType}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg"
              >
                <HiOutlineX size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  ชื่อหมวดหมู่
                </label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:bg-white/10"
                  placeholder={`กรอกชื่อหมวดหมู่${productType}`}
                  autoFocus={!editingProduct}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowProductModal(false)}
                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 text-slate-300 rounded-lg hover:bg-white/10 transition-all"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSaveProduct}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                >
                  {editingProduct ? "บันทึกการแก้ไข" : "เพิ่มหมวดหมู่"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Management Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">
                {editingUser ? "แก้ไขผู้ใช้งาน" : "เพิ่มผู้ใช้งาน"}
              </h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg"
              >
                <HiOutlineX size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  ชื่อผู้ใช้
                </label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:bg-white/10"
                  placeholder="กรอกชื่อผู้ใช้"
                  autoFocus={!editingUser}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  อีเมล
                </label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:bg-white/10"
                  placeholder="กรอกอีเมล"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  บทบาท
                </label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:bg-white/10"
                >
                  <option value="" className="bg-slate-800">เลือกบทบาท</option>
                  <option value="admin" className="bg-slate-800">Admin</option>
                  <option value="user" className="bg-slate-800">User</option>
                  <option value="manager" className="bg-slate-800">Manager</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 text-slate-300 rounded-lg hover:bg-white/10 transition-all"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSaveUser}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                >
                  {editingUser ? "บันทึกการแก้ไข" : "เพิ่มผู้ใช้"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
