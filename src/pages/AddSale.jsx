import React, { useState, useEffect } from "react";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { getSales, getSalesStatistics, createSale } from "../services/sales";
import { getFostecProducts } from "../services/fostec_product";
import { getMeasuringWorks } from "../services/measuring_work";
import { getProductCategories } from "../services/product_category";
import { getProductTypes, getProductTypesByCategory } from "../services/product_type";
import { logSaleCreated, logView, logError } from "../utils/activityLogger";

export default function AddSale() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    bill_number: '',
    group_type: '',
    group_id: '',
    category_id: '',
    type_id: '',
    name: '',
    price: '',
    description: ''
  });
  
  const [fostecProducts, setFostecProducts] = useState([]);
  const [measuringWorks, setMeasuringWorks] = useState([]);
  const [productCategories, setProductCategories] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch group options on component mount
  useEffect(() => {
    const fetchGroupOptions = async () => {
      try {
        // Fetch Fostec Products (this should work)
        const productsResponse = await getFostecProducts();
        console.log('Fostec Products Response:', productsResponse);
        console.log('Fostec Products Data:', productsResponse.data);
        console.log('Direct Response:', productsResponse);
        
        // Check if response has data property or is direct data
        const productsData = productsResponse.data || productsResponse;
        console.log('Final Products Data:', productsData);
        setFostecProducts(productsData);
        
        // Fetch Measuring Works
        try {
          const worksResponse = await getMeasuringWorks();
          setMeasuringWorks(worksResponse.data);
        } catch (error) {
          console.warn('Error fetching measuring works:', error);
          setMeasuringWorks([]);
        }
        
        // Fetch Product Categories
        try {
          const productCategoriesResponse = await getProductCategories();
          setProductCategories(productCategoriesResponse.data);
        } catch (error) {
          console.warn('Error fetching product categories:', error);
          setProductCategories([]);
        }
        
        // Fetch Product Types
        try {
          const typesResponse = await getProductTypes();
          setProductTypes(typesResponse.data);
        } catch (error) {
          console.warn('Error fetching product types:', error);
          setProductTypes([]);
        }
      } catch (error) {
        console.error('Error fetching group options:', error);
      }
    };

    fetchGroupOptions();
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
    
    console.log('=== ADD SALE DEBUG ===');
    console.log('FormData:', formData);
    
    // Form validation
    if (!formData.bill_number.trim()) {
      alert('กรุณากรอกเลขที่บิล');
      setLoading(false);
      return;
    }
    
    if (!formData.group_type) {
      alert('กรุณาเลือกประเภทกลุ่ม');
      setLoading(false);
      return;
    }
    
    if (!formData.group_id) {
      alert('กรุณาเลือกรายการในกลุ่ม');
      setLoading(false);
      return;
    }
    
    if (!formData.name.trim()) {
      alert('กรุณากรอกชื่อรายการ');
      setLoading(false);
      return;
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      alert('กรุณากรอกราคาให้ถูกต้อง');
      setLoading(false);
      return;
    }
    
    // IMPORTANT: group_work_id must reference group_work table
    // Only measuring_work IDs are valid for group_work_id
    let validGroupWorkId;
    if (formData.group_type === 'measuring_work') {
      validGroupWorkId = parseInt(formData.group_id);
    } else if (formData.group_type === 'fostec_product') {
      // For fostec_product, we need to map to a valid group_work_id
      // Use the first measuring_work ID as fallback (id: 1)
      validGroupWorkId = 1;
      console.log('Using fallback group_work_id for fostec_product:', validGroupWorkId);
    } else {
      alert('ประเภทกลุ่มไม่ถูกต้อง');
      setLoading(false);
      return;
    }
    
    const parsedPrice = parseFloat(formData.price);
    
    console.log('Final group_work_id:', validGroupWorkId);
    console.log('Parsed price:', parsedPrice);
    
    try {
      const saleData = {
        bill_number: formData.bill_number.trim(),
        group_work_id: validGroupWorkId,
        name: formData.name.trim(),
        price: parsedPrice,
        description: formData.description.trim()
      };
      
      console.log('Sending data:', saleData);
      const result = await createSale(saleData);
      console.log('Create sale result:', result);
      
      alert('เพิ่มรายการขายสำเร็จ!');
      
      // Log the successful sale creation
      const saleLogData = {
        id: Date.now(), // temporary ID, will be replaced with real ID from server
        name: formData.name,
        bill_number: formData.bill_number,
        price: formData.price
      };
      logSaleCreated(saleLogData);
      
      // Navigate back to Sales page
      navigate('/sales');
    } catch (error) {
      console.error('Error creating sale:', error);
      
      // Log the error
      logError(error, 'การเพิ่มรายการขาย');
      
      alert('เกิดข้อผิดพลาดในการเพิ่มข้อมูล: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/sales');
  };

  console.log('Current fostecProducts state:', fostecProducts);
  console.log('Current formData.group_type:', formData.group_type);

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
              เพิ่มรายการขาย
            </h1>
            <p className="text-slate-500 mt-1 font-medium text-sm">
              บันทึกข้อมูลการขายใหม่ลงในระบบ
            </p>
          </div>
        </div>
      </header>

      {/* Form */}
      <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* เลขที่บิล */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              เลขที่บิล <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="bill_number"
              value={formData.bill_number}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-blue-500/50 focus:outline-none transition-all"
              placeholder="กรอกเลขที่บิล"
            />
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
                placeholder="กรอกชื่อรายการขาย"
              />
            </div>

            {/* ราคา */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                ราคา <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                step="0.01"
                min="0"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-blue-500/50 focus:outline-none transition-all"
                placeholder="กรอกราคา"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ประเภทกลุ่ม */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                ประเภทกลุ่ม <span className="text-red-400">*</span>
              </label>
              <select
                name="group_type"
                value={formData.group_type}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500/50 focus:outline-none transition-all"
              >
                <option value="">เลือกประเภทกลุ่ม</option>
                <option value="fostec_product">Fostec Product</option>
                <option value="measuring_work">Measuring Work</option>
                {/* <option value="product_category">Product Category</option> */}
              </select>
            </div>

            {/* รายการในกลุ่ม */}
            {formData.group_type && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {formData.group_type === 'fostec_product' ? 'สินค้า Fostec' : 
                   formData.group_type === 'measuring_work' ? 'งานตรวจวัด' : 'หมวดหมู่สินค้า'} <span className="text-red-400">*</span>
                </label>
                <select
                  name="group_id"
                  value={formData.group_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500/50 focus:outline-none transition-all"
                >
                  <option value="">เลือกรายการ</option>
                  {console.log('Rendering dropdown - group_type:', formData.group_type, 'fostecProducts:', fostecProducts)}
                  {formData.group_type === 'fostec_product' 
                    ? (fostecProducts || []).map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))
                    : formData.group_type === 'measuring_work' 
                    ? (measuringWorks || []).map(work => (
                        <option key={work.id} value={work.id}>
                          {work.name}
                        </option>
                      ))
                    : (productCategories || []).map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))
                  }
                </select>
              </div>
            )}

          
          {/* ประเภทสินค้า (แสดงเมื่อเลือก Product Category) */}
          {formData.group_type === 'product_category' && formData.group_id && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                ประเภทสินค้า <span className="text-red-400">*</span>
              </label>
              <select
                name="type_id"
                value={formData.type_id}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500/50 focus:outline-none transition-all"
              >
                <option value="">เลือกประเภทสินค้า</option>
                {(productTypes || [])
                  .filter(type => type.category_id === parseInt(formData.group_id))
                  .map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))
                }
              </select>
            </div>
          )}
          </div>

          {/* รายละเอียด */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              รายละเอียด (ไม่จำเป็น)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-blue-500/50 focus:outline-none transition-all resize-none"
              placeholder="กรอกรายละเอียดเพิ่มเติม"
            />
          </div>

          {/* ปุ่ม */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-6 py-3 bg-white/5 border border-white/10 text-slate-300 rounded-xl font-medium hover:bg-white/10 transition-all"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'กำลังบันทึก...' : 'เพิ่มรายการ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
