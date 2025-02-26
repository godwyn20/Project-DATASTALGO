import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { useState } from 'react';

const BookCard = ({ title, author, cover, description }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative flex-shrink-0 w-[200px] h-[300px] rounded-lg overflow-hidden cursor-pointer bg-black group"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div
        className={`w-full h-full ${!cover ? 'bg-gray-700' : ''}`}
      >
        {cover ? (
          <img
            src={cover}
            alt={title}
            className="w-full h-full object-cover opacity-90"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-white text-lg">{title}</span>
          </div>
        )}
      </div>
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/95 to-transparent p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isHovered ? 1 : 0.8, y: isHovered ? 0 : 10 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="text-white font-bold text-lg mb-1 truncate">{title}</h3>
        <p className="text-gray-300 text-sm mb-2 truncate">{author}</p>
        <p className="text-gray-400 text-xs line-clamp-2 group-hover:line-clamp-none transition-all duration-300">{description}</p>
      </motion.div>
    </motion.div>
  );
};

BookCard.propTypes = {
  title: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
  cover: PropTypes.string,
  description: PropTypes.string.isRequired,
};

export default BookCard;
