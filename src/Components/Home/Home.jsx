import React from 'react';
import { FaCamera, FaVideo, FaSmile, FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';
import { motion } from 'framer-motion';
import './HomePage.css';

const HomePage = () => {
  // بيانات الخدمات
  const services = [
    {
      title: "باقات التصوير",
      description: "أحدث معدات التصوير باحترافية عالية",
      icon: <FaCamera size={40} />,
      category: "تصوير"
    },
    {
      title: "خدمات المونتاج",
      description: "إخراج احترافي لمقاطع الفيديو",
      icon: <FaVideo size={40} />,
      category: "مونتاج"
    },
    {
      title: "تصوير الأحداث",
      description: "توثيق كامل لمناسباتك الخاصة",
      icon: <FaSmile size={40} />,
      category: "أحداث"
    }
  ];

  // بيانات فريق العمل
  const team = [
    {
      name: "أحمد محمد",
      role: "مصور محترف",
      image: "/team1.jpg"
    },
    {
      name: "مريم خالد",
      role: "مصممة جرافيك",
      image: "/team2.jpg"
    }
  ];

  // بيانات آراء العملاء
  const testimonials = [
    {
      text: "أفضل استوديو تعاملت معه، جودة التصوير ممتازة",
      author: "سارة عبدالله"
    },
    {
      text: "احترافية في العمل وسرعة في التنفيذ",
      author: "خالد محمود"
    }
  ];

  return (
    <div className="home-page">
      {/* قسم الهيرو */}
      <header className="hero-section">
        <div className="hero-content">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            استوديو <span>نور</span> للتصوير الفوتوغرافي
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            نقدم خدمات التصوير والمونتاج بجودة عالية وبأسعار تنافسية
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <button className="cta-button">احجز جلستك الآن</button>
          </motion.div>
        </div>
      </header>

      {/* قسم الخدمات */}
      <section className="services-section">
        <h2>خدماتنا</h2>
        <div className="services-grid">
          {services.map((service, index) => (
            <motion.div 
              key={index}
              className="service-card"
              whileHover={{ y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="service-icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <span className="service-category">{service.category}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* معرض الأعمال */}
      <section className="gallery-section">
        <h2>معرض أعمالنا</h2>
        <div className="gallery-grid">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <motion.div 
              key={item}
              className="gallery-item"
              whileHover={{ scale: 1.03 }}
            >
              <img src={`/work${item}.jpg`} alt={`عمل ${item}`} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* فريق العمل */}
      <section className="team-section">
        <h2>فريقنا</h2>
        <div className="team-grid">
          {team.map((member, index) => (
            <motion.div 
              key={index}
              className="team-card"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <img src={member.image} alt={member.name} />
              <h3>{member.name}</h3>
              <p>{member.role}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* آراء العملاء */}
      <section className="testimonials-section">
        <h2>آراء عملائنا</h2>
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={index}
              className="testimonial-card"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p>"{testimonial.text}"</p>
              <span>- {testimonial.author}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* قسم الاتصال */}
      <footer className="contact-section">
        <div className="contact-info">
          <h2>تواصل معنا</h2>
          <div className="contact-item">
            <FaPhone />
            <span>+20 123 456 7890</span>
          </div>
          <div className="contact-item">
            <FaEnvelope />
            <span>info@studio-nour.com</span>
          </div>
          <div className="contact-item">
            <FaMapMarkerAlt />
            <span>123 شارع التحرير، القاهرة، مصر</span>
          </div>
          <div className="social-links">
            <a href="#"><FaFacebook /></a>
            <a href="#"><FaInstagram /></a>
            <a href="#"><FaTwitter /></a>
          </div>
        </div>
        <div className="contact-form">
          <h3>أرسل لنا رسالة</h3>
          <form>
            <input type="text" placeholder="اسمك" required />
            <input type="email" placeholder="بريدك الإلكتروني" required />
            <textarea placeholder="رسالتك" rows="4" required></textarea>
            <button type="submit">إرسال</button>
          </form>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;