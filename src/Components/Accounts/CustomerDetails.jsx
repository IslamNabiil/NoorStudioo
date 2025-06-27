import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaUser, FaPhone, FaEnvelope, FaHistory, 
  FaArrowLeft, FaCalendarAlt, FaMoneyBillWave,
  FaFileContract, FaClock, FaPlus, FaSave
} from 'react-icons/fa';
import './CustomerDetails.css';

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [newPayment, setNewPayment] = useState({
    amount: '',
    method: 'cash',
    note: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const fetchCustomer = () => {
      try {
        // الجلب من localStorage أولاً لأنه يحتوي على أحدث البيانات
        const storedClients = localStorage.getItem("clients");
        if (storedClients) {
          const foundCustomer = JSON.parse(storedClients).find(c => c.id === id);
          setCustomer(foundCustomer || null);
        }
        
        // إذا لم يوجد في localStorage، نبحث في ملف JSON
        if (!storedClients) {
          fetch('/customers.json')
            .then(res => res.json())
            .then(data => {
              const foundCustomer = data.customers.find(c => c.id === id);
              setCustomer(foundCustomer || null);
            });
        }
      } catch (error) {
        console.error("Error fetching customer:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();

    // الاستماع لتغييرات localStorage
    const handleStorageChange = () => {
      const storedClients = localStorage.getItem("clients");
      if (storedClients) {
        const updatedCustomer = JSON.parse(storedClients).find(c => c.id === id);
        if (updatedCustomer) {
          setCustomer(updatedCustomer);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return 'غير محدد';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ar-EG', options);
  };

  const calculateTotalContracts = () => {
    return (customer?.contracts || []).reduce((total, contract) => total + contract.totalAmount, 0);
  };

  const calculateTotalPaid = () => {
    return (customer?.payments || []).reduce((total, payment) => total + payment.amount, 0);
  };

  const getRemainingHours = () => {
    return (customer?.subscriptions || [])
      .filter(sub => sub.type === 'filming')
      .reduce((total, sub) => total + (sub.hours || 0), 0);
  };

  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;
    setNewPayment(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddPayment = () => {
    if (!newPayment.amount || isNaN(newPayment.amount)) {
      alert('يجب إدخال مبلغ صحيح');
      return;
    }

    const paymentAmount = parseFloat(newPayment.amount);
    if (paymentAmount <= 0) {
      alert('يجب أن يكون المبلغ أكبر من الصفر');
      return;
    }

    const payment = {
      id: `pay_${Date.now()}`,
      amount: paymentAmount,
      method: newPayment.method,
      note: newPayment.note || 'دفعة نقدية',
      date: new Date().toISOString()
    };

    const updatedCustomer = {
      ...customer,
      balance: (customer.balance || 0) + paymentAmount,
      payments: [...(customer.payments || []), payment]
    };

    // تحديث localStorage
    const storedClients = JSON.parse(localStorage.getItem("clients") || "[]");
    const updatedClients = storedClients.map(c => 
      c.id === id ? updatedCustomer : c
    );
    localStorage.setItem("clients", JSON.stringify(updatedClients));

    setCustomer(updatedCustomer);
    setNewPayment({
      amount: '',
      method: 'cash',
      note: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowPaymentForm(false);
    alert('تم تسجيل الدفعة بنجاح');
  };

  if (loading) {
    return <div className="loading">جاري تحميل البيانات...</div>;
  }

  if (!customer) {
    return <div className="not-found">العميل غير موجود</div>;
  }

  return (
    <div className="customer-details-page">
      <button className="back-button" onClick={() => navigate(-1)}>
        <FaArrowLeft /> العودة
      </button>
      
      <div className="customer-profile">
        <div className="profile-header">
          <div className="avatar">
            <FaUser size={40} />
          </div>
          <div className="profile-info">
            <h2>{customer.name}</h2>
            <div className="financial-summary">
              <span className={`balance ${customer.balance >= 0 ? 'positive' : 'negative'}`}>
                {customer.balance >= 0 ? '+' : ''}{customer.balance} ج.م
              </span>
              <span className="summary-item">
                <FaFileContract /> إجمالي العقود: {calculateTotalContracts()} ج.م
              </span>
              <span className="summary-item">
                <FaMoneyBillWave /> إجمالي المدفوعات: {calculateTotalPaid()} ج.م
              </span>
              <span className="summary-item">
                <FaClock /> ساعات تصوير متاحة: {getRemainingHours()} ساعة
              </span>
            </div>
          </div>
        </div>

        <div className="customer-info">
          <div className="info-item">
            <FaPhone className="info-icon" />
            <span>{customer.tel || 'غير متوفر'}</span>
          </div>
          <div className="info-item">
            <FaEnvelope className="info-icon" />
            <span>{customer.email || 'غير متوفر'}</span>
          </div>
        </div>
      </div>

      <div className="customer-sections">
        <div className="section payment-section">
          <div className="section-header">
            <h3><FaMoneyBillWave /> تسجيل دفعة جديدة</h3>
            {!showPaymentForm && (
              <button 
                className="add-btn"
                onClick={() => setShowPaymentForm(true)}
              >
                <FaPlus /> إضافة دفعة
              </button>
            )}
          </div>

          {showPaymentForm && (
            <div className="payment-form">
              <div className="form-group">
                <label>المبلغ (ج.م)</label>
                <input
                  type="number"
                  name="amount"
                  value={newPayment.amount}
                  onChange={handlePaymentInputChange}
                  placeholder="المبلغ المدفوع"
                />
              </div>
              
              <div className="form-group">
                <label>طريقة الدفع</label>
                <select
                  name="method"
                  value={newPayment.method}
                  onChange={handlePaymentInputChange}
                >
                  <option value="cash">نقدي</option>
                  <option value="transfer">تحويل بنكي</option>
                  <option value="check">شيك</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>ملاحظات (اختياري)</label>
                <input
                  type="text"
                  name="note"
                  value={newPayment.note}
                  onChange={handlePaymentInputChange}
                  placeholder="مثال: دفعة على الحساب"
                />
              </div>
              
              <div className="form-actions">
                <button 
                  className="save-btn"
                  onClick={handleAddPayment}
                >
                  <FaSave /> حفظ الدفعة
                </button>
                <button 
                  className="cancel-btn"
                  onClick={() => setShowPaymentForm(false)}
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}

          <h3><FaHistory /> سجل المدفوعات</h3>
          <div className="payments-list">
            {(customer.payments || []).slice(0, 5).map((payment, index) => (
              <div key={index} className="payment-item">
                <div className="payment-amount">{payment.amount} ج.م</div>
                <div className="payment-details">
                  <span>{formatDate(payment.date)}</span>
                  <span>{payment.method === 'cash' ? 'نقدي' : 
                        payment.method === 'transfer' ? 'تحويل' : 'شيك'}</span>
                  {payment.note && <span className="payment-note">{payment.note}</span>}
                </div>
              </div>
            ))}
            {(!customer.payments || customer.payments.length === 0) && (
              <div className="empty-message">لا يوجد مدفوعات مسجلة</div>
            )}
          </div>
          {customer.payments?.length > 5 && (
            <button 
              className="view-all-btn"
              onClick={() => navigate(`/customer/${id}/payments`)}
            >
              عرض جميع المدفوعات ({customer.payments.length})
            </button>
          )}
        </div>

        <div className="section">
          <h3><FaFileContract /> آخر العقود</h3>
          <div className="contracts-list">
            {(customer.contracts || []).slice(0, 3).map((contract, index) => (
              <div key={index} className="contract-item">
                <div className="contract-header">
                  <span className="contract-date">{formatDate(contract.date)}</span>
                  <span className="contract-amount">{contract.totalAmount} ج.م</span>
                </div>
                <div className="contract-services">
                  {contract.services.slice(0, 2).map((service, i) => (
                    <span key={i} className="service-tag">
                      {service.title} ({service.price} ج.م)
                    </span>
                  ))}
                  {contract.services.length > 2 && (
                    <span className="more-services">+{contract.services.length - 2} خدمات أخرى</span>
                  )}
                </div>
              </div>
            ))}
            {(!customer.contracts || customer.contracts.length === 0) && (
              <div className="empty-message">لا يوجد عقود مسجلة</div>
            )}
          </div>
          {customer.contracts?.length > 3 && (
            <button 
              className="view-all-btn"
              onClick={() => navigate(`/customer/${id}/contracts`)}
            >
              عرض جميع العقود ({customer.contracts.length})
            </button>
          )}
        </div>

        <div className="section">
          <h3><FaCalendarAlt /> اشتراكات التصوير</h3>
          <div className="subscriptions-list">
            {(customer.subscriptions || [])
              .filter(sub => sub.type === 'filming')
              .map((sub, index) => (
                <div key={index} className="subscription-item">
                  <div className="subscription-hours">
                    <FaClock /> {sub.hours} ساعة
                  </div>
                  <div className="subscription-dates">
                    <span>من: {formatDate(sub.start)}</span>
                    <span>إلى: {formatDate(sub.end)}</span>
                  </div>
                </div>
              ))}
            {!customer.subscriptions?.some(sub => sub.type === 'filming') && (
              <div className="empty-message">لا يوجد اشتراكات تصوير</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;