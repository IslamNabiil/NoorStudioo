import React from "react";
import logo1 from "../../assets/images/logo1.png"; // Adjust the path as necessary
import { MdOutlineLinkedCamera } from "react-icons/md";
import { BsFillCameraFill, BsSearch } from "react-icons/bs";
import { Link } from "react-router-dom";
import "./header.css"; // Ensure you have the CSS file for styling

function TopHeader() {
  return (
    <>
      <div className="top-header">
        <div className="row">
          <div>
          <Link to="/" className="logo-info">
            <img className="logo" src={logo1} alt="logo1" />
            <h2>
              <p className="title">
                <span>N</span>oor <span>S</span>tudio
              </p>
              <BsFillCameraFill />
            </h2>
          </Link>
          </div>
          <div className="search-bar">
            <BsSearch />
          </div>
        </div>
      </div>
    </>
  );
}

export default TopHeader;
