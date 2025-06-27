import React from "react";
import { Link } from "react-router-dom";
import "./NotFound.css";

const NotFound = () => {
  return (
      <div className="notfound-container">
        <h1>404</h1>
        <p>الصفحة غير موجودة</p>
        <p>ربما كتبت عنوان URL خطأ أو أن الصفحة لم تعد موجودة.</p>
        <Link to="/">الرجوع للصفحة الرئيسية</Link>
      </div>
  );
};

export default NotFound;
