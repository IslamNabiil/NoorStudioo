import React, { useState, useEffect } from "react";
import "./Services.css";

const Services = ({ title, price, id, onSelect, initialSelected }) => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const isSelected = initialSelected?.some(
      (item) => item.id === id && item.title === title
    );
    if (isSelected) {
      setActive(true);
    }
  }, [initialSelected, id, title]);

  const handleClick = () => {
    const newState = !active;
    setActive(newState);

    onSelect &&
      onSelect({
        id,
        title,
        price,
      });
  };

  return (
    <div
      className={`service-card ${active ? "active" : ""}`}
      onClick={handleClick}
    >
      <strong>{title}</strong>
      <p>{price} ج.م</p>
    </div>
  );
};

export default Services;
