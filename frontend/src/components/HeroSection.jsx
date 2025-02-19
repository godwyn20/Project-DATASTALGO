import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { PlayArrow, Info } from '@mui/icons-material';

const HeroSection = ({ book }) => {
  if (!book) return null;

  return (
    <div className="relative w-full h-[80vh] overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={book.cover}
          alt={book.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex flex-col justify-end h-full max-w-3xl px-12 pb-32"
      >
        <h1 className="text-6xl font-bold text-white mb-4">{book.title}</h1>
        <p className="text-xl text-gray-300 mb-3">{book.author}</p>
        <p className="text-lg text-gray-400 mb-8 line-clamp-3">{book.description}</p>

        <div className="flex space-x-4">
          <button className="flex items-center px-8 py-3 bg-white text-black rounded hover:bg-opacity-90 transition-colors">
            <PlayArrow className="mr-2" />
            Read Now
          </button>
          <button className="flex items-center px-8 py-3 bg-gray-600 bg-opacity-70 text-white rounded hover:bg-opacity-90 transition-colors">
            <Info className="mr-2" />
            More Info
          </button>
        </div>
      </motion.div>
    </div>
  );
};

HeroSection.propTypes = {
  book: PropTypes.shape({
    title: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    cover: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
  }),
};

export default HeroSection;