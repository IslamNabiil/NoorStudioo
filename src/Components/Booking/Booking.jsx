import React, { useState, useEffect } from 'react';
import { useApp } from '../../AppContext/AppContext';
import { FaClock } from 'react-icons/fa';
import './Booking.css';

const Booking = ({ data }) => {
  const {
    appointments,
    setAppointments,
    customers,
    setCustomers,
    attendance,
    setAttendance
  } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: ''
  });
  const [weekDates, setWeekDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // دالة مساعدة لاسترجاع باقات العميل من Local Storage
  const getCustomerBundles = (customerId) => {
    try {
      const selectedBundles = JSON.parse(localStorage.getItem("selectedBundles")) || [];
      return selectedBundles
        .filter(bundle => bundle.customerId === customerId)
        .map(bundle => ({
          ...bundle,
          category: convertToArabicCategory(bundle.category)
        }));
    } catch (error) {
      console.error("Error parsing selectedBundles:", error);
      return [];
    }
  };

  // دالة لتحويل الفئات إلى أسماء عربية موحدة
  const convertToArabicCategory = (category) => {
    const categoriesMap = {
      'filming': 'تصوير',
      'montage': 'مونتاج',
      'intros': 'مقدمات',
      'reels': 'ريلز',
      'تصوير': 'تصوير',
      'مونتاج': 'مونتاج',
      'مقدمات': 'مقدمات',
      'ريلز': 'ريلز'
    };
    
    return categoriesMap[category] || 'غير محدد';
  };

  const calculateHours = (start, end) => {
    const [startHours, startMins] = start.split(':').map(Number);
    const [endHours, endMins] = end.split(':').map(Number);
    return ((endHours * 60 + endMins) - (startHours * 60 + startMins)) / 60;
  };

  // دالة حساب الساعات المتبقية معدلة
  const calcRemainingHours = (customer) => {
    if (!customer) return 0;
    
    // استرجاع باقات العميل
    const customerBundles = getCustomerBundles(customer.id);
    
    // حساب الساعات من الباقات (لحساب ساعات التصوير فقط)
    const bundlesHours = customerBundles.reduce((total, bundle) => {
      if (bundle.category === 'تصوير' && new Date(bundle.endDate) >= new Date()) {
        return total + (bundle.hours || 0);
      }
      return total;
    }, 0);
    
    // حساب الساعات من الاشتراكات القديمة (بنفس طريقة CustomerDetails)
    const subscriptionsHours = (customer.subscriptions || [])
      .filter(sub => sub.type === 'filming')
      .reduce((total, sub) => total + (sub.hours || 0), 0);
    
    // حساب إجمالي الساعات المتاحة للتصوير
    const totalHours = bundlesHours + subscriptionsHours;
    
    // حساب الساعات المستخدمة في التصوير
    const usedHours = appointments
      .filter(app => app.customerId === customer.id && app.status !== 'cancelled')
      .reduce((acc, app) => acc + (app.hours || 0), 0);
    
    return Math.max(0, totalHours - usedHours);
  };

  const updateCustomerBalance = (customerId, hours, isRefund = false) => {
    setCustomers(prevCustomers => {
      return prevCustomers.map(customer => {
        if (customer.id === customerId) {
          const change = hours * (isRefund ? 1 : -1);

          return {
            ...customer,
            ledger: [
              ...(customer.ledger || []),
              {
                date: new Date().toISOString(),
                description: isRefund
                  ? `استرداد حجز (${hours} ساعة)`
                  : `حجز تصوير (${hours} ساعة)`,
                change
              }
            ]
          };
        }
        return customer;
      });
    });
  };

  const checkAvailableHours = (customerId, requestedHours) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return false;
    return calcRemainingHours(customer) >= requestedHours;
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowForm(false);
      if (e.key === 'Enter' && showForm) handleSubmit();
      if (e.ctrlKey && e.key === 'n') { e.preventDefault(); setShowForm(true); }
      if (e.ctrlKey && e.key === 'e' && selectedDate) {
        e.preventDefault();
        const firstAppointment = appointments.find(app => app.date === selectedDate);
        if (firstAppointment) handleEdit(firstAppointment);
      }
      if (e.ctrlKey && e.key === 'd' && selectedDate) {
        e.preventDefault();
        const firstAppointment = appointments.find(app => app.date === selectedDate);
        if (firstAppointment) handleDelete(firstAppointment.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showForm, selectedCustomerId, formData, selectedDate, appointments]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const storedClients = localStorage.getItem("clients");
        if (storedClients) {
          setCustomers(JSON.parse(storedClients));
        }

        const customersRes = await fetch('/customers.json');
        const data = await customersRes.json();

        const mergedCustomers = [...JSON.parse(storedClients || '[]'), ...data.customers]
          .filter((customer, index, self) =>
            index === self.findIndex((c) => c.id === customer.id)
          );

        setCustomers(mergedCustomers);

        const today = new Date();
        const dates = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(today);
          d.setDate(today.getDate() + i);
          return d;
        });

        setWeekDates(dates);
        setSelectedDate(today.toISOString().split('T')[0]);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    const handleStorageChange = () => {
      const updatedClients = localStorage.getItem("clients");
      if (updatedClients) {
        setCustomers(JSON.parse(updatedClients));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [setCustomers]);

  const handleSubmit = () => {
    setErrorMessage('');
    const { date, startTime, endTime } = formData;
    const hours = calculateHours(startTime, endTime);

    if (hours <= 0) {
      setErrorMessage('وقت النهاية يجب أن يكون بعد وقت البداية');
      return;
    }

    if (!checkAvailableHours(selectedCustomerId, hours)) {
      setErrorMessage('العميل ليس لديه ساعات تصوير كافية');
      return;
    }

    const isConflict = appointments.some(app => {
      if (app.date !== date || (editId && app.id === editId)) return false;
      return (
        (startTime >= app.startTime && startTime < app.endTime) ||
        (endTime > app.startTime && endTime <= app.endTime) ||
        (startTime <= app.startTime && endTime >= app.endTime)
      );
    });

    if (isConflict) {
      setErrorMessage('⚠️ المعاد محجوز بالفعل من عميل آخر');
      return;
    }

    if (editId) {
      const oldAppointment = appointments.find(app => app.id === editId);
      const hoursDiff = hours - (oldAppointment?.hours || 0);

      const updated = appointments.map(app =>
        app.id === editId
          ? { ...app, date, startTime, endTime, hours }
          : app
      );
      setAppointments(updated);

      if (hoursDiff !== 0) {
        updateCustomerBalance(selectedCustomerId, Math.abs(hoursDiff), hoursDiff < 0);
      }
    } else {
      const newApp = {
        id: `app_${Date.now()}`,
        customerId: selectedCustomerId,
        date,
        startTime,
        endTime,
        hours,
        status: 'confirmed',
        notes: '',
        createdAt: new Date().toISOString()
      };
      setAppointments(prev => [...prev, newApp]);
      updateCustomerBalance(selectedCustomerId, hours);
    }

    setShowForm(false);
    setFormData({ date: '', startTime: '', endTime: '' });
    setSelectedCustomerId('');
    setEditId(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الحجز؟')) {
      const deletedApp = appointments.find(app => app.id === id);

      setAppointments(prev => prev.filter(app => app.id !== id));

      if (deletedApp) {
        updateCustomerBalance(deletedApp.customerId, deletedApp.hours, true);
      }

      setAttendance(prev => {
        const newAttendance = { ...prev };
        delete newAttendance[id];
        return newAttendance;
      });
    }
  };

  const handleEdit = (app) => {
    setSelectedCustomerId(app.customerId);
    setFormData({
      date: app.date,
      startTime: app.startTime,
      endTime: app.endTime
    });
    setEditId(app.id);
    setShowForm(true);
  };

  const getDayName = (dateStr) => {
    const daysAr = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return daysAr[new Date(dateStr).getDay()];
  };

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const customerBundles = selectedCustomer ? getCustomerBundles(selectedCustomer.id) : [];

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner"></div>
        <p>جاري تحميل البيانات...</p>
      </div>
    );
  }

  return (
    <div className="acc-container">
      <button className="add-btn" onClick={() => setShowForm(true)}>
        + إضافة حجز جديد
      </button>

      <div className="week-table">
        {weekDates.map(date => {
          const isoDate = date.toISOString().split('T')[0];
          const todayIso = new Date().toISOString().split('T')[0];
          const dayAppointments = appointments
            .filter(app => app.date === isoDate)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

          return (
            <div
              key={isoDate}
              className={`day-cell ${selectedDate === isoDate ? 'selected' : ''}`}
              onClick={() => setSelectedDate(isoDate)}
            >
              <div className="day-header">
                <strong>{getDayName(isoDate)}</strong>
                <div>{isoDate}</div>
              </div>
              <div className="day-body">
                {dayAppointments.length > 0 ? (
                  <>
                    <div className="count">عدد الحجوزات: {dayAppointments.length}</div>
                    <ul>
                      {dayAppointments.map(app => (
                        <li
                          key={app.id}
                          className={`appointment-item ${attendance[app.id] ? 'attended' : ''}`}
                        >
                          <span className="time-range">
                            {app.startTime} - {app.endTime}
                          </span>
                          {isoDate === todayIso && (
                            <label className="attendance-label">
                              <input
                                type="checkbox"
                                checked={attendance[app.id] || false}
                                onChange={() =>
                                  setAttendance(prev => ({
                                    ...prev,
                                    [app.id]: !prev[app.id],
                                  }))
                                }
                              />
                              <span>تم الحضور</span>
                            </label>
                          )}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <div className="empty">لا يوجد حجوزات</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedDate && (
        <div className="day-details">
          <h3 className="day-details-title">
            تفاصيل الحجوزات ليوم {getDayName(selectedDate)} - {selectedDate}
          </h3>
          <ul className="appointments-list">
            {appointments
              .filter(app => app.date === selectedDate)
              .map(app => {
                const customer = customers.find(c => c.id === app.customerId);
                const attended = attendance[app.id];

                return (
                  <li
                    key={app.id}
                    className={`appointment-detail ${attended ? 'attended' : ''}`}
                  >
                    <div className="appointment-info">
                      <span className="customer-name">
                        {customer?.name || 'مجهول'}
                      </span>
                      <span className="time-slot">
                        {app.startTime} - {app.endTime}
                      </span>
                      {attended && <span className="attended-badge">✅ حضر</span>}
                    </div>
                    <div className="appointment-actions">
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(app)}
                      >
                        ✏️ تعديل
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(app.id)}
                      >
                        🗑️ حذف
                      </button>
                    </div>
                  </li>
                );
              })}
          </ul>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">
              {editId ? 'تعديل حجز' : 'إضافة حجز جديد'}
            </h3>

            {errorMessage && (
              <div className="error-message">
                {errorMessage}
              </div>
            )}

            {editId && selectedCustomer && (
              <div className="edit-notice">
                جاري تعديل حجز للعميل: <strong>{selectedCustomer.name}</strong>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="customer-select">اختر العميل:</label>
              <select
                id="customer-select"
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                value={selectedCustomerId}
                className="form-select"
              >
                <option value="">-- اختر عميل --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedCustomer && (
              <div className="customer-summary">
                <div className="summary-item">
                  <span className="summary-label">الرصيد:</span>
                  <span className="summary-value">{selectedCustomer.balance} ج.م</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">ساعات التصوير المتبقية:</span>
                  <span className="summary-value">
                    {calcRemainingHours(selectedCustomer)} ساعة
                  </span>
                </div>

                {/* <div className="subscriptions-summary">
                  <span className="summary-label">اشتراكات التصوير:</span>
                  {(customerBundles.filter(b => b.category === 'تصوير').length > 0 || 
                   (selectedCustomer.subscriptions || []).some(sub => sub.type === 'filming')) ? (
                    <>
                      عرض باقات التصوير
                      {customerBundles
                        .filter(bundle => bundle.category === 'تصوير')
                        .map((bundle, index) => (
                          <div key={`bundle-${index}`} className="subscription-item">
                            <FaClock /> {bundle.hours} ساعة (باقة) - تنتهي في {new Date(bundle.endDate).toLocaleDateString()}
                          </div>
                        ))}
                      
                      عرض اشتراكات التصوير القديمة
                      {(selectedCustomer.subscriptions || [])
                        .filter(sub => sub.type === 'filming')
                        .map((sub, index) => (
                          <div key={`sub-${index}`} className="subscription-item">
                            <FaClock /> {sub.hours} ساعة - من {new Date(sub.start).toLocaleDateString()} إلى {new Date(sub.end).toLocaleDateString()}
                          </div>
                        ))}
                    </>
                  ) : (
                    <div className="empty-message">لا يوجد اشتراكات تصوير</div>
                  )}
                </div> */}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="appointment-date">تاريخ الحجز:</label>
              <input
                type="date"
                id="appointment-date"
                name="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="start-time">من الساعة:</label>
              <input
                type="time"
                id="start-time"
                name="startTime"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="end-time">إلى الساعة:</label>
              <input
                type="time"
                id="end-time"
                name="endTime"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-actions">
              <button
                className="submit-btn"
                onClick={handleSubmit}
                disabled={!selectedCustomerId || !formData.date || !formData.startTime || !formData.endTime}
              >
                {editId ? 'تحديث الحجز' : 'تأكيد الحجز'}
              </button>
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowForm(false);
                  setEditId(null);
                  setFormData({ date: '', startTime: '', endTime: '' });
                  setSelectedCustomerId('');
                }}
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

export default Booking;