import React, { useState, useEffect } from "react";
import { FaUser, FaPlus, FaTimes, FaFileContract, FaClock, FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Customers.css";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    tel: "",
    balance: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomers = () => {
      try {
        const storedClients = localStorage.getItem("clients");
        if (storedClients) {
          setCustomers(JSON.parse(storedClients));
        }
        
        fetch('/customers.json')
          .then(res => res.json())
          .then(data => {
            if (!storedClients) {
              setCustomers(data.customers);
              localStorage.setItem("clients", JSON.stringify(data.customers));
            }
          });
      } catch (error) {
        console.error("Error loading customers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();

    const handleStorageChange = () => {
      const updatedClients = localStorage.getItem("clients");
      if (updatedClients) {
        setCustomers(JSON.parse(updatedClients));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleCustomerClick = (customerId, e) => {
    // منع الانتقال إذا تم النقر على زر التعديل أو الحذف
    if (e.target.closest('.action-btn')) return;
    navigate(`/customer/${customerId}`);
  };

  const handleAddCustomer = () => {
    const newId = `cust_${Date.now()}`;
    const customerToAdd = {
      ...newCustomer,
      id: newId,
      subscriptions: [],
      contracts: [],
      payments: [],
      ledger: []
    };
    
    const updatedCustomers = [...customers, customerToAdd];
    setCustomers(updatedCustomers);
    localStorage.setItem("clients", JSON.stringify(updatedCustomers));
    
    setShowAddForm(false);
    setNewCustomer({ name: "", email: "", tel: "", balance: 0 });
    alert(`تم إضافة العميل ${customerToAdd.name} بنجاح`);
  };

  const handleEditCustomer = (customer) => {
    setCurrentCustomer(customer);
    setNewCustomer({
      name: customer.name,
      email: customer.email || "",
      tel: customer.tel || "",
      balance: customer.balance || 0
    });
    setShowEditForm(true);
  };

  const handleUpdateCustomer = () => {
    const updatedCustomers = customers.map(customer => 
      customer.id === currentCustomer.id 
        ? { ...customer, ...newCustomer }
        : customer
    );
    
    setCustomers(updatedCustomers);
    localStorage.setItem("clients", JSON.stringify(updatedCustomers));
    
    setShowEditForm(false);
    setCurrentCustomer(null);
    setNewCustomer({ name: "", email: "", tel: "", balance: 0 });
    alert(`تم تحديث بيانات العميل ${newCustomer.name} بنجاح`);
  };

  const handleDeleteCustomer = (customerId, customerName) => {
    if (window.confirm(`هل أنت متأكد من حذف العميل ${customerName}؟ سيتم حذف جميع بياناته بما في ذلك العقود والمدفوعات.`)) {
      const updatedCustomers = customers.filter(customer => customer.id !== customerId);
      setCustomers(updatedCustomers);
      localStorage.setItem("clients", JSON.stringify(updatedCustomers));
      alert(`تم حذف العميل ${customerName} بنجاح`);
    }
  };

  const calculateRemainingHours = (customer) => {
    return (customer.subscriptions || [])
      .filter(sub => sub.type === 'filming')
      .reduce((acc, sub) => acc + (sub.hours || 0), 0);
  };

  const countActiveContracts = (customer) => {
    return (customer.contracts || []).length;
  };

  if (loading) {
    return <div className="loading">جاري تحميل البيانات...</div>;
  }

  return (
    <div className="customers-page">
      <div className="customers-header">
        <h2 className="customers-title">قائمة العملاء</h2>
        <div className="header-actions">
          <button 
            className="add-customer-btn"
            onClick={() => setShowAddForm(true)}
          >
            <FaPlus /> إضافة عميل جديد
          </button>
          <span className="total-customers">إجمالي العملاء: {customers.length}</span>
        </div>
      </div>

      <div className="customers-grid">
        {customers.map((customer) => (
          <div 
            className="customer-card" 
            key={customer.id}
            onClick={(e) => handleCustomerClick(customer.id, e)}
          >
            <div className="customer-header">
              <div className="customer-avatar">
                <FaUser className="user-icon" />
              </div>
              <h3 className="customer-name">{customer.name}</h3>
              <div className="customer-meta">
                <span className="contracts-count">
                  <FaFileContract /> {countActiveContracts(customer)}
                </span>
                <span className="hours-count">
                  <FaClock /> {calculateRemainingHours(customer)}h
                </span>
              </div>
            </div>
            
            <div className="customer-info">
              <div className="info-item">
                <span className="info-label">الهاتف:</span>
                <span>{customer.tel || 'غير متوفر'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">البريد:</span>
                <span>{customer.email || 'غير متوفر'}</span>
              </div>
            </div>
            
            <div className="customer-footer">
              <div className="customer-balance-container">
                <span className={`balance ${customer.balance >= 0 ? 'positive' : 'negative'}`}>
                  {customer.balance >= 0 ? '+' : ''}{customer.balance} ج.م
                </span>
                <span className="balance-label">الرصيد الحالي</span>
              </div>
              
              <div className="customer-actions">
                <button 
                  className="action-btn edit-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditCustomer(customer);
                  }}
                >
                  <FaEdit />
                </button>
                <button 
                  className="action-btn delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCustomer(customer.id, customer.name);
                  }}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* نموذج إضافة عميل جديد */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="customer-modal">
            <div className="modal-header">
              <h3>إضافة عميل جديد</h3>
              <button 
                className="close-btn"
                onClick={() => setShowAddForm(false)}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="form-group">
              <label>اسم العميل:</label>
              <input
                type="text"
                name="name"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                placeholder="أدخل اسم العميل"
                required
              />
            </div>
            
            <div className="form-group">
              <label>البريد الإلكتروني:</label>
              <input
                type="email"
                name="email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                placeholder="أدخل البريد الإلكتروني"
              />
            </div>
            
            <div className="form-group">
              <label>رقم الهاتف:</label>
              <input
                type="tel"
                name="tel"
                value={newCustomer.tel}
                onChange={(e) => setNewCustomer({...newCustomer, tel: e.target.value})}
                placeholder="أدخل رقم الهاتف"
                required
              />
            </div>
            
            <div className="form-group">
              <label>الرصيد الابتدائي:</label>
              <input
                type="number"
                name="balance"
                value={newCustomer.balance}
                onChange={(e) => setNewCustomer({...newCustomer, balance: parseFloat(e.target.value) || 0})}
                placeholder="أدخل الرصيد"
              />
            </div>
            
            <div className="form-actions">
              <button 
                className="submit-btn"
                onClick={handleAddCustomer}
                disabled={!newCustomer.name || !newCustomer.tel}
              >
                حفظ العميل
              </button>
              <button 
                className="cancel-btn"
                onClick={() => setShowAddForm(false)}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نموذج تعديل العميل */}
      {showEditForm && (
        <div className="modal-overlay">
          <div className="customer-modal">
            <div className="modal-header">
              <h3>تعديل بيانات العميل</h3>
              <button 
                className="close-btn"
                onClick={() => setShowEditForm(false)}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="form-group">
              <label>اسم العميل:</label>
              <input
                type="text"
                name="name"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                placeholder="أدخل اسم العميل"
                required
              />
            </div>
            
            <div className="form-group">
              <label>البريد الإلكتروني:</label>
              <input
                type="email"
                name="email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                placeholder="أدخل البريد الإلكتروني"
              />
            </div>
            
            <div className="form-group">
              <label>رقم الهاتف:</label>
              <input
                type="tel"
                name="tel"
                value={newCustomer.tel}
                onChange={(e) => setNewCustomer({...newCustomer, tel: e.target.value})}
                placeholder="أدخل رقم الهاتف"
                required
              />
            </div>
            
            <div className="form-group">
              <label>الرصيد:</label>
              <input
                type="number"
                name="balance"
                value={newCustomer.balance}
                onChange={(e) => setNewCustomer({...newCustomer, balance: parseFloat(e.target.value) || 0})}
                placeholder="أدخل الرصيد"
              />
            </div>
            
            <div className="form-actions">
              <button 
                className="submit-btn"
                onClick={handleUpdateCustomer}
                disabled={!newCustomer.name || !newCustomer.tel}
              >
                حفظ التعديلات
              </button>
              <button 
                className="cancel-btn"
                onClick={() => setShowEditForm(false)}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;