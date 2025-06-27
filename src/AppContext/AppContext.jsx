// src/context/AppContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import React from 'react';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [appointments, setAppointments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [attendance, setAttendance] = useState({});

  // تحميل البيانات عند بدء التشغيل
  useEffect(() => {
    const savedAppointments = localStorage.getItem('appointments');
    const savedAttendance = localStorage.getItem('attendance');
    const savedCustomers = localStorage.getItem('customers');

    if (savedAppointments) setAppointments(JSON.parse(savedAppointments));
    if (savedAttendance) setAttendance(JSON.parse(savedAttendance));
    if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
  }, []);

  // حفظ البيانات عند التغيير
  useEffect(() => {
    localStorage.setItem('appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('attendance', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem('customers', JSON.stringify(customers));
  }, [customers]);

  return (
    <AppContext.Provider
      value={{
        appointments,
        setAppointments,
        customers,
        setCustomers,
        attendance,
        setAttendance
      }}
    >
      {children}
    </AppContext.Provider>
  );
};