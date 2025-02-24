import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from './store';
import Navigation from './components/Navigation';
import Subscriptions from './pages/Subscriptions';
import BookDetail from './pages/BookDetail';

// Import pages
import Home from './pages/Home';
import Browse from './pages/Browse';
import Search from './pages/Search';
import Categories from './pages/Categories';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';

// Create dark theme for Netflix-like appearance
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#e50914',
    },
    background: {
      default: '#000000',
      paper: '#141414',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b3b3b3',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#000000',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={darkTheme}>
        <Router>
          <div className="flex flex-col">
            <Navigation />
            <main className="flex-1 pt-16">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/browse" element={<Browse />} />
                <Route path="/search" element={<Search />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/book/:id" element={<BookDetail />} />
                <Route path="/subscriptions" element={<Subscriptions />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Routes>
            </main>
          </div>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;