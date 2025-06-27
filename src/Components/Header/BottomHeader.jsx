import React, { useState, useRef, useEffect } from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import { Link } from "react-router-dom";

function BottomHeader({ customers = [] }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [localCustomers, setLocalCustomers] = useState(customers);
  const dropdownRef = useRef();

  const navBar = [
    { id: 1, name: "Bundels", route: "/bundels" },
    { id: 2, name: "Accounts", route: "/accounts" },
    { id: 3, name: "Bookings", route: "/bookings" },
    { id: 4, name: "HandOver", route: "/handover" },
    { id: 5, name: "Contract", route: "/contract" },
  ];

  // تحديث العملاء من localStorage عند التغيير
  useEffect(() => {
    const handleStorageChange = () => {
      const storedCustomers = localStorage.getItem("clients");
      if (storedCustomers) {
        setLocalCustomers(JSON.parse(storedCustomers));
      }
    };

    // استمع لتغييرات localStorage
    window.addEventListener('storage', handleStorageChange);
    
    // جلب أحدث بيانات العملاء عند التحميل
    const storedCustomers = localStorage.getItem("clients");
    if (storedCustomers) {
      setLocalCustomers(JSON.parse(storedCustomers));
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // غلق القائمة عند النقر خارجها
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // حساب عدد العقود النشطة لكل عميل
  const getActiveContractsCount = (customerId) => {
    const customer = localCustomers.find(c => c.id === customerId);
    return customer?.contracts?.length || 0;
  };

  return (
    <div className="btm-header">
      <div className="customerInfo" ref={dropdownRef}>
        <div
          className="customer"
          onClick={() => setShowDropdown((prev) => !prev)}
        >
          Customers{" "}
          <IoMdArrowDropdown
            className={showDropdown ? "arrow-icon rotate" : "arrow-icon"}
          />
          <span className="customers-count">{localCustomers.length}</span>
        </div>

        {showDropdown && (
          <ul className="customers-list">
            {localCustomers.map((item) => (
              <li key={item.id} className="customer-item">
                <div className="customer-name">{item.name}</div>
                <div className="customer-details">
                  <span className={`balance ${item.balance >= 0 ? "positive" : "negative"}`}>
                    {item.balance.toLocaleString()} ج.م
                  </span>
                  <span className="contracts-count">
                    {getActiveContractsCount(item.id)} عقود
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="navItems">
        {navBar.map((item) => (
          <div className="navItem" key={item.id}>
            <Link to={item.route}>{item.name}</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BottomHeader;