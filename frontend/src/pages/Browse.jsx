import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, IconButton, CircularProgress } from '@mui/material';
import { Favorite, FavoriteBorder, PlayArrow } from '@mui/icons-material';
import { motion } from 'framer-motion';
import bookService from '../services/bookService';

const BookRow = ({ title, books, onBookClick, onFavoriteClick, favorites }) => (
  <Box sx={{ mb: 4 }}>
    <Typography variant="h5" sx={{ mb: 2, color: 'white' }}>
      {title}
    </Typography>
    <Box
      sx={{
        display: 'flex',
        overflowX: 'auto',
        gap: 2,
        pb: 2,
        '::-webkit-scrollbar': { height: '6px' },
        '::-webkit-scrollbar-track': { background: '#1f1f1f' },
        '::-webkit-scrollbar-thumb': { background: '#e50914', borderRadius: '3px' }
      }}
    >
      {books.map((book) => (
        <motion.div
          key={book.id}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <Box
            sx={{
              position: 'relative',
              width: 200,
              height: 300,
              flexShrink: 0,
              cursor: 'pointer'
            }}
            onClick={() => onBookClick(book.id)}
          >
            <img
              src={book.thumbnail_url || '/book-placeholder.jpg'}
              alt={book.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '4px'
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                p: 2,
                background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                borderRadius: '0 0 4px 4px'
              }}
            >
              <Typography variant="subtitle1" sx={{ color: 'white' }} noWrap>
                {book.title}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: '#ccc' }} noWrap>
                  {book.authors}
                </Typography>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFavoriteClick(book.id);
                  }}
                  sx={{ color: '#e50914' }}
                >
                  {favorites.includes(book.id) ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
              </Box>
            </Box>
          </Box>
        </motion.div>
      ))}
    </Box>
  </Box>
);

function Browse() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [featuredBook, setFeaturedBook] = useState(null);
  const [trendingBooks, setTrendingBooks] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const [trending, newRels, recommended] = await Promise.all([
          bookService.getTrendingBooks(),
          bookService.getNewReleases(),
          bookService.getRecommendedBooks()
        ]);

        setTrendingBooks(trending);
        setNewReleases(newRels);
        setRecommendedBooks(recommended);
        setFeaturedBook(trending[0]);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching books:', error);
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handleBookClick = (bookId) => {
    navigate(`/book/${bookId}`);
  };

  const handleFavoriteClick = async (bookId) => {
    try {
      await bookService.toggleFavorite(bookId);
      setFavorites(prev =>
        prev.includes(bookId)
          ? prev.filter(id => id !== bookId)
          : [...prev, bookId]
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#141414'
        }}
      >
        <CircularProgress sx={{ color: '#e50914' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#141414', minHeight: '100vh' }}>
      {featuredBook && (
        <Box
          sx={{
            position: 'relative',
            height: '70vh',
            backgroundImage: `linear-gradient(to bottom, transparent 60%, #141414),
              url(${featuredBook.thumbnail_url || '/book-placeholder.jpg'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            mb: 4
          }}
        >
          <Container
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              pb: 6
            }}
          >
            <Typography variant="h2" sx={{ color: 'white', mb: 2 }}>
              {featuredBook.title}
            </Typography>
            <Typography variant="h5" sx={{ color: '#ccc', mb: 3 }}>
              {featuredBook.authors}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  backgroundColor: '#e50914',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '1.1rem'
                }}
                onClick={() => handleBookClick(featuredBook.id)}
              >
                <PlayArrow /> Read Now
              </motion.button>
            </Box>
          </Container>
        </Box>
      )}

      <Container>
        <BookRow
          title="Trending Now"
          books={trendingBooks}
          onBookClick={handleBookClick}
          onFavoriteClick={handleFavoriteClick}
          favorites={favorites}
        />
        <BookRow
          title="New Releases"
          books={newReleases}
          onBookClick={handleBookClick}
          onFavoriteClick={handleFavoriteClick}
          favorites={favorites}
        />
        <BookRow
          title="Recommended for You"
          books={recommendedBooks}
          onBookClick={handleBookClick}
          onFavoriteClick={handleFavoriteClick}
          favorites={favorites}
        />
      </Container>
    </Box>
  );
}

export default Browse;