import React from 'react';
import { FaTools, FaHammer, FaPaintRoller, FaRocket } from 'react-icons/fa';
import { motion } from 'framer-motion';
import './HandOver.css';

const HandOver = () => {

  return (
    <div className="construction-container">
      <div className="construction-content">
        {/* شعار متحرك */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: 'reverse'
          }}
          className="construction-icon"
        >
          <FaTools size={80} />
        </motion.div>

        <h1 className="construction-title">الصفحة تحت الإنشاء</h1>
        
        <p className="construction-text">
          نعمل بجد لتجهيز هذه الصفحة لكم. نعتذر للإزعاج وسنكون معكم قريبًا!
        </p>

        {/* رسومات عمال البناء */}
        <div className="construction-workers">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="worker"
          >
            <FaHammer size={40} />
          </motion.div>
          
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
            className="worker"
          >
            <FaPaintRoller size={40} />
          </motion.div>
          
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
            className="worker"
          >
            <FaRocket size={40} />
          </motion.div>
        </div>

        {/* شريط تقدم متحرك */}
        <div className="progress-container">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "80%" }}
            transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
            className="progress-bar"
          />
        </div>

        {/* رسالة إضافية */}
        <div className="coming-soon">
          <motion.div
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            سنعود قريبًا بمفاجآت رائعة!
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HandOver;