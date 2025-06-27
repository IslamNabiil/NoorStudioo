import React, { useRef, useState, useEffect } from "react";
import writtenNumber from "written-number";
import "./Contract.css";

function Contract() {
  const contractRef = useRef();
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [paidAmount, setPaidAmount] = useState("");
  const [loading, setLoading] = useState(true);
  
  // جلب البيانات من localStorage
  const localStorageData = localStorage.getItem("selectedBundles");
  const saved = localStorageData ? JSON.parse(localStorageData) : [];

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch('./customers.json');
        const data = await response.json();
        setClients(data.customers);
        
        const storedClients = localStorage.getItem("clients");
        if (storedClients) {
          setClients(JSON.parse(storedClients));
        }
      } catch (error) {
        console.error("Error fetching clients:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  // حساب قيمة كل باقة (سعر الباقة × عدد الساعات)
  const calculateBundleValue = (item) => {
    return item.price * (item.hours || 1); // إذا لم تكن هناك ساعات نعتبرها 1 ساعة
  };

  // حساب الإجمالي كمجموع قيم الباقات
  const total = saved.reduce((acc, item) => acc + calculateBundleValue(item), 0);
  writtenNumber.defaults.lang = "ar";
  const numberInWords = writtenNumber(total);

  const today = new Date();
  const day = today.toLocaleDateString("ar-EG", { weekday: "long" });
  const date = today.toLocaleDateString("ar-EG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handlePrint = () => {
    const content = contractRef.current.innerHTML;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = content;
    window.print();
    document.body.innerHTML = originalContent;
  };

  const handleSubmit = () => {
    if (!selectedClient) {
      alert("يجب اختيار عميل أولاً");
      return;
    }
  
    if (window.confirm("هل تريد تأكيد هذا العقد؟")) {
      const totalHours = saved.reduce((acc, item) => acc + (item.hours || 0), 0);
  
      const updatedClients = clients.map(client => {
        if (client.id === selectedClient.id) {
          const newBalance = (client.balance || 0) - total + (parseFloat(paidAmount) || 0);
          
          return {
            ...client,
            balance: newBalance,
            subscriptions: [
              ...(client.subscriptions || []),
              ...saved
                .filter(item => item.hours > 0)
                .map(item => ({
                  type: item.category.includes('تصوير') ? 'filming' : 'service',
                  itemId: item.id,
                  hours: item.hours || 0,
                  start: new Date().toISOString(),
                  end: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
                }))
            ],
            contracts: [
              ...(client.contracts || []),
              {
                date: new Date().toISOString(),
                totalAmount: total,
                paidAmount: parseFloat(paidAmount) || 0,
                remainingAmount: total - (parseFloat(paidAmount) || 0),
                services: saved.map(item => ({
                  title: item.title,
                  price: calculateBundleValue(item), // استخدام قيمة الباقة المحسوبة
                  originalPrice: item.price, // حفظ السعر الأصلي كمرجع
                  category: item.category,
                  hours: item.hours || 0,
                  hourlyRate: item.hourlyRate || 0
                }))
              }
            ],
            payments: [
              ...(client.payments || []),
              ...(paidAmount > 0 ? [{
                date: new Date().toISOString(),
                amount: parseFloat(paidAmount),
                method: 'cash',
                note: 'دفعة عقد جديد'
              }] : [])
            ]
          };
        }
        return client;
      });
  
      localStorage.setItem("clients", JSON.stringify(updatedClients));
      localStorage.removeItem("selectedBundles");
      
      alert(`تم حفظ العقد بنجاح وتحديث رصيد العميل
      \nالساعات المضافة: ${totalHours} ساعة
      \nالمبلغ المدفوع: ${paidAmount || 0} ج.م`);
      
      handlePrint();
    }
  };

  if (loading) {
    return <div className="loading">جاري تحميل بيانات العملاء...</div>;
  }

  return (
    <div className="contract-wrapper" ref={contractRef}>
      <div className="contract-container">
        <div className="contract-header">
          <img src="/logo1.png" alt="Logo" className="contract-logo" />
          <h1 className="contract-title">عقد تقديم خدمات</h1>
        </div>

        <p className="contract-text">
          إنه في يوم <strong>{day}</strong>، الموافق <strong>{date}</strong>، تم الاتفاق بين الطرف الأول:
          <strong> استوديو نور </strong>، والطرف الثاني: 
          
          <span className="print-only-client">
            {selectedClient ? `${selectedClient.name} (${selectedClient.tel || 'لا يوجد رقم'})` : "__________"}
          </span>
          
          <select 
            className="client-select no-print"
            value={selectedClient?.id || ""}
            onChange={(e) => {
              const clientId = e.target.value;
              const client = clients.find(c => c.id === clientId);
              setSelectedClient(client);
            }}
          >
            <option value="">اختر عميل</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.name} - {client.tel || 'لا يوجد رقم'}
              </option>
            ))}
          </select>
          ، على ما يلي:
        </p>

        <h2 className="contract-subtitle">الخدمات المختارة:</h2>

        <table className="contract-table">
  <thead>
    <tr>
      <th>م</th>
      <th>نوع الخدمة</th>
      <th>اسم الخدمة / الباقة</th>
      <th>عدد الساعات</th>
      <th>سعر الباقة</th>
      <th>قيمة الباقة</th>
    </tr>
  </thead>
  <tbody>
    {saved.map((item, index) => {
      const bundleValue = item.hours ? item.price * item.hours : item.price;
      return (
        <tr key={index}>
          <td>{index + 1}</td>
          <td>{item.category || "غير محدد"}</td>
          <td>{item.title}</td>
          <td>{item.hours || '-'}</td>
          <td>{item.price} ج.م</td>
          <td>{bundleValue} ج.م</td>
        </tr>
      );
    })}
  </tbody>
</table>

        <p className="contract-total">
          وقد اتفق الطرفان على أن إجمالي تكلفة هذه الخدمات هو:
          <strong> {total} ج.م </strong> ({numberInWords} جنيهاً فقط لا غير).
        </p>

        <h2 className="contract-subtitle">المدفوعات:</h2>

        <p className="contract-text">
          تم دفع مبلغ وقدره: {" "}
          <input
            type="number"
            className="contract-input no-print"
            placeholder="المبلغ المدفوع (جنيه)"
            value={paidAmount}
            onChange={(e) => setPaidAmount(e.target.value)}
          /> {" "}
          <span className="print-only-payment">
            {paidAmount ? `${paidAmount} ج.م` : "__________"}
          </span>
          فقط لا غير.
        </p>

        <div className="contract-footer">
          <p>حرر هذا العقد برضا الطرفين للعمل بموجبه عند اللزوم.</p>
          <button className="submit-contract no-print" onClick={handleSubmit}>
            تأكيد العقد
          </button>
        </div>
      </div>
    </div>
  );
}

export default Contract;