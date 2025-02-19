import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const searchBooks = createAsyncThunk(
  'books/search',
  async (query, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.get(`${API_URL}/books/search/`, {
        params: { q: query },
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const toggleFavorite = createAsyncThunk(
  'books/toggleFavorite',
  async (bookId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.post(
        `${API_URL}/books/${bookId}/favorite/`,
        {},
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      return { bookId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateReadingProgress = createAsyncThunk(
  'books/updateProgress',
  async ({ bookId, progress }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.post(
        `${API_URL}/books/${bookId}/update_progress/`,
        { progress },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      return { bookId, progress, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const bookSlice = createSlice({
  name: 'books',
  initialState: {
    searchResults: [],
    favorites: [],
    readingHistory: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchBooks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchBooks.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.searchResults = payload;
      })
      .addCase(searchBooks.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      .addCase(toggleFavorite.fulfilled, (state, { payload }) => {
        const index = state.favorites.findIndex(book => book.id === payload.bookId);
        if (index === -1) {
          state.favorites.push(payload);
        } else {
          state.favorites.splice(index, 1);
        }
      })
      .addCase(updateReadingProgress.fulfilled, (state, { payload }) => {
        const historyIndex = state.readingHistory.findIndex(
          item => item.book.id === payload.bookId
        );
        if (historyIndex === -1) {
          state.readingHistory.push(payload);
        } else {
          state.readingHistory[historyIndex].progress = payload.progress;
        }
      });
  },
});

export const { clearSearchResults } = bookSlice.actions;
export default bookSlice.reducer;