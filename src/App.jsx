import React, { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import TopHeader from "./Components/Header/TopHeader";
import BottomHeader from "./Components/Header/BottomHeader";
import Bundle from "./Components/Bundels/Bundle";
import Accounts from "./Components/Accounts/Customers";
// import CustomerDetails from "./Components/Customers/CustomerDetails";
import CustomerDetails from "./Components/Accounts/CustomerDetails"
import NotFound from "./Components/Errors/NotFound";
import Booking from "./Components/Booking/Booking";
import HandOver from "./Components/handover/handover";
import Contract from "./Components/Contract/Contract";
import Home from "./Components/Home/Home";

function App() {
  const [products, setProducts] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetch("./product.json")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        console.log(data);
      });
  }, []);

  useEffect(() => {
    fetch("./appointments.json")
      .then((res) => res.json())
      .then((data) => {
        setAppointments(data);
        console.log(data);
      });
  }, []);

  useEffect(() => {
    fetch("./customers.json")
      .then((res) => res.json())
      .then((data) => {
        console.log(data.customers);
        setCustomers(data.customers);
      });
  }, []);

  return (
    <>
      <TopHeader />
      <BottomHeader customers={customers}/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/bundels" element={<Bundle data={products} />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/bookings" element={<Booking customers={customers}/>} />
        <Route path="/customer/:id" element={<CustomerDetails />} />
        <Route path="/handover" element={<HandOver />} />
        <Route path="/contract" element={<Contract />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
