// components/LoadingSpinner.jsx
import React from "react";
import "./LoadingSpinner.css"; // هنضيف التنسيق في خطوة 2

const LoadingSpinner = () => {
  return (
    <div className="spinner-wrapper">
      <div className="spinner"></div>
      <p>... جاري التحميل</p>
    </div>
  );
};

export default LoadingSpinner;
