import React from 'react';
import { motion } from 'framer-motion';

const AnimatedSection = ({ children, delay = 0, className = "", width = "100%" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, ease: "easeOut", delay }}
      className={className}
      style={{ width }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedSection;