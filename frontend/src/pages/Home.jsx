import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box } from '@mui/material';
import BookRow from '../components/BookRow';

const Home = () => {
  const dispatch = useDispatch();
  // TODO: Replace with actual book data from your Redux store
  const mockBooks = [
    {
      id: 1,
      title: 'Book 1',
      author: 'Author 1',
      cover_image: 'https://via.placeholder.com/200x300',
    },
    {
      id: 2,
      title: 'Book 2',
      author: 'Author 2',
      cover_image: 'https://via.placeholder.com/200x300',
    },
    {
      id: 3,
      title: 'Book 3',
      author: 'Author 3',
      cover_image: 'https://via.placeholder.com/200x300',
    },
    {
      id: 4,
      title: 'Book 4',
      author: 'Author 4',
      cover_image: 'https://via.placeholder.com/200x300',
    },
    {
      id: 5,
      title: 'Book 5',
      author: 'Author 5',
      cover_image: 'https://via.placeholder.com/200x300',
    },
  ];

  useEffect(() => {
    // TODO: Fetch books data when API is ready
  }, [dispatch]);

  return (
    <Box sx={{ pt: 2, pb: 4 }}>
      <BookRow title="Newest Episodes" books={mockBooks} />
      <BookRow title="Popular Books" books={mockBooks} />
      <BookRow title="Continue Reading" books={mockBooks} />
      <BookRow title="Recommended for You" books={mockBooks} />
    </Box>
  );
};

export default Home;