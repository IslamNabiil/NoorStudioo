  import React, { useEffect, useState } from "react";
  import BundleCard from "./BundleCard";
  import SmartServiceCard from "./Services/smartServiceCard";
  import LoadingSpinner from "../Loading/LoadingSpinner";

  const Bundle = ({ data }) => {
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(() => {
      const saved = localStorage.getItem("selectedBundles");
      return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
      if (data && Object.keys(data).length > 0) {
        const timeout = setTimeout(() => setLoading(false), 1000);
        return () => clearTimeout(timeout);
      }
    }, [data]);

    const extractCategory = (item) => {
      // استخراج الكاتيجوري من الهيكل الأصلي للبيانات
      if (item.category) return item.category;
      if (data.bundels?.filming?.types?.some(t => t.id === item.id)) return "تصوير";
      if (data.bundels?.montage?.some(m => m.contains.some(c => c.types.some(t => t.id === item.id)))) return "مونتاج";
      if (data.services.Intros?.some(i => i.id === item.id)) return "مقدمات";
      if (data.services.Reels?.some(r => r.id === item.id)) return "ريلز";
      return "غير محدد";
    };

    const handleSelect = (item) => {
      const isAlready = selected.some(el => el.id === item.id);
      
      const updated = isAlready
        ? selected.filter(el => el.id !== item.id)
        : [...selected, { ...item, category: extractCategory(item) }];

      setSelected(updated);
      localStorage.setItem("selectedBundles", JSON.stringify(updated));
    };

    const isItemSelected = (item) => {
      return selected.some(el => el.id === item.id);
    };

    if (loading) return <LoadingSpinner />;

    return (
      <div className="bundle-container">
        <h1 className="section-title">الباقات</h1>

        {data.bundels?.filming && (
          <BundleCard
            title={data.bundels.filming.nickname}
            description={data.bundels.filming.description}
            types={data.bundels.filming.types.map(t => ({
              ...t,
              category: "تصوير"
            }))}
            onSelect={handleSelect}
            initialSelected={selected}
          />
        )}

        {data.bundels?.montage?.map((item, idx) => (
          <BundleCard
            key={idx}
            title={item.title}
            description={item.description}
            kinds={item.contains.map(kind => ({
              ...kind,
              types: kind.types.map(type => ({
                ...type,
                category: "مونتاج"
              }))
            }))}
            onSelect={handleSelect}
            initialSelected={selected}
          />
        ))}

        <h1 className="section-title">الخدمات</h1>

        <div className="services-grid">
          <SmartServiceCard
            title="Intros"
            items={data.services.Intros.map(i => ({ ...i, category: "مقدمات" }))}
            onSelect={handleSelect}
            initialSelected={selected}
          />

          <SmartServiceCard
            title="Reels"
            items={data.services.Reels.map(r => ({ ...r, category: "ريلز" }))}
            onSelect={handleSelect}
            initialSelected={selected}
          />

          {data.services.Design.map((group, index) => (
            <SmartServiceCard
              key={`design-${group.id || index}`}
              title={group.title}
              items={group.type.map(t => ({
                ...t,
                category: group.title.includes('Post') ? 'منشورات' :
                        group.title.includes('cover') ? 'كفرات' : 
                        group.title.includes('certificate') ? 'شهادات' :
                        'تصاميم'
              }))}
              onSelect={handleSelect}
              initialSelected={selected}
            />
          ))}

          <SmartServiceCard
            title="Page Management"
            items={data.services.Page_Management.flatMap(p => 
              p.types ? p.types.map(t => ({ ...t, category: "إدارة صفحات" })) : [{ ...p, category: "إعلانات" }]
            )}
            onSelect={handleSelect}
            initialSelected={selected}
          />
        </div>
      </div>
    );
  };

  export default Bundle;