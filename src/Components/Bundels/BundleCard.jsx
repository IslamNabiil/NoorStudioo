import React, { useState, useEffect } from "react";
import "./BundleCard.css";

const BundleCard = ({ title, description, types, kinds, onSelect, initialSelected = [] }) => {
  const [activeIds, setActiveIds] = useState([]);
  const [activeKindIds, setActiveKindIds] = useState([]);

  useEffect(() => {
    // نحدد الـ IDs اللي متسجله في الـ localStorage
    const idsFromStorage = initialSelected.map((item) => item.id);

    // نقسمهم حسب مكانهم (types أو kinds)
    const typeIds = (types || [])
      .map((type) => type.id)
      .filter((id) => idsFromStorage.includes(id));

    const kindIds = (kinds || [])
      .flatMap((kind) => kind.types.map((type) => type.id))
      .filter((id) => idsFromStorage.includes(id));

    setActiveIds(typeIds);
    setActiveKindIds(kindIds);
  }, [initialSelected, types, kinds]);

  const handleTypeClick = (type) => {
    const alreadyActive = activeIds.includes(type.id);
    const updated = alreadyActive
      ? activeIds.filter((id) => id !== type.id)
      : [...activeIds, type.id];

    setActiveIds(updated);
    onSelect && onSelect(type);
  };

  const handleKindClick = (type) => {
    const alreadyActive = activeKindIds.includes(type.id);
    const updated = alreadyActive
      ? activeKindIds.filter((id) => id !== type.id)
      : [...activeKindIds, type.id];

    setActiveKindIds(updated);
    onSelect && onSelect(type);
  };

  return (
    <>
      <div className="bundle-card">
        <h2 className="bundle-title">{title}</h2>
        <p className="bundle-description">{description}</p>

        <div className="bundle-types">
          {types &&
            types.map((type) => (
              <div
                key={type.id}
                className={`bundle-type ${activeIds.includes(type.id) ? "active" : ""}`}
                onClick={() => handleTypeClick(type)}
              >
                <strong>{type.title}</strong>
                <p>{type.price} ج.م</p>
                {type.hours && <p>{type.hours} ساعات</p>}
              </div>
            ))}

          {kinds &&
            kinds.map((kind, i) => (
              <div className="bundle-card2" key={i}>
                <strong className="bundle-title">{kind.nickname}</strong>
                <div className="bundle-types2">
                  {kind.types.map((type, id) => (
                    <div
                      className={`bundle-type2 ${activeKindIds.includes(type.id) ? "active" : ""}`}
                      key={id}
                      onClick={() => handleKindClick(type)}
                    >
                      <strong>{type.title}</strong>
                      <p>{type.price} ج.م</p>
                      <p>{type.hours} ساعات</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
};

export default BundleCard;
