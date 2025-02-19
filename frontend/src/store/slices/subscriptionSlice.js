import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const fetchSubscriptionPlans = createAsyncThunk(
  'subscription/fetchPlans',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.get(`${API_URL}/subscription-plans/`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createSubscription = createAsyncThunk(
  'subscription/create',
  async (planId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.post(
        `${API_URL}/subscriptions/`,
        { plan: planId },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const processPayment = createAsyncThunk(
  'subscription/processPayment',
  async (subscriptionId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.post(
        `${API_URL}/subscriptions/${subscriptionId}/process_payment/`,
        {},
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState: {
    plans: [],
    currentSubscription: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearSubscriptionError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptionPlans.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptionPlans.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.plans = payload;
      })
      .addCase(fetchSubscriptionPlans.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      .addCase(createSubscription.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSubscription.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.currentSubscription = payload;
      })
      .addCase(createSubscription.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      .addCase(processPayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(processPayment.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        if (state.currentSubscription) {
          state.currentSubscription.payment_status = 'completed';
        }
      })
      .addCase(processPayment.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      });
  },
});

export const { clearSubscriptionError } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;