import React, { useEffect, useState } from "react";
import "../BundleCard.css";

const SmartServiceCard = ({ title, items, initialSelected = [], onSelect }) => {
  const [activeKeys, setActiveKeys] = useState([]);

  useEffect(() => {
    const initKeys = initialSelected.map((item) => item.id || `${item.title}-${item.price}`);
    setActiveKeys(initKeys);
  }, [initialSelected]);

  const handleClick = (item, fullTitle, key) => {
    const isSelected = activeKeys.includes(key);
    const updatedKeys = isSelected
      ? activeKeys.filter((k) => k !== key)
      : [...activeKeys, key];

    setActiveKeys(updatedKeys);
    onSelect && onSelect({ ...item, title: fullTitle, id: item.id || key });
  };

  return (
    <div className="bundle-card">
      <h2>{title}</h2>
      <div className="bundle-types">
        {items.map((item, idx) => {
          if (item.type) {
            return (
              <div key={idx} className="bundle-type-group">
                <strong>{item.title}</strong>
                <div className="bundle-types">
                  {item.type.map((sub, i) => {
                    const fullTitle = `${item.title} - ${sub.title}`;
                    const key = sub.id || `${item.title}-${sub.title}-${sub.price}`;
                    const subIsActive = activeKeys.includes(key);
                    return (
                      <div
                        key={key}
                        className={`bundle-type ${subIsActive ? "active" : ""}`}
                        onClick={() => handleClick(sub, fullTitle, key)}
                      >
                        <strong>{sub.title}</strong>
                        <p>{sub.price} ج.م</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }

          if (item.types) {
            return (
              <div key={idx} className="bundle-type-group">
                <strong>{item.title}</strong>
                <div className="bundle-types">
                  {item.types.map((sub, i) => {
                    const fullTitle = `${item.title} - ${sub.title}`;
                    const key = sub.id || `${item.title}-${sub.title}-${sub.price}`;
                    const subIsActive = activeKeys.includes(key);
                    return (
                      <div
                        key={key}
                        className={`bundle-type ${subIsActive ? "active" : ""}`}
                        onClick={() => handleClick(sub, fullTitle, key)}
                      >
                        <strong>{sub.title}</strong>
                        <p>{sub.price} ج.م</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }

          const key = item.id || `${item.title}-${item.price}`;
          const isActive = activeKeys.includes(key);
          return (
            <div
              key={key}
              className={`bundle-type ${isActive ? "active" : ""}`}
              onClick={() => handleClick(item, item.title, key)}
            >
              <strong>{item.title}</strong>
              <p>{item.price} ج.م</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SmartServiceCard;
