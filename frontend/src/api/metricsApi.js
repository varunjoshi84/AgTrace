import axiosClient from './axiosClient';

// Get summary metrics for the dashboard
export const getSummaryMetrics = async () => {
  try {
    const response = await axiosClient.get('/metrics/summary');
    return response.data;
  } catch (error) {
    console.error('Error fetching summary metrics:', error);
    // Return fallback data if API fails
    return {
      totalVerifiedBatches: '1,200+',
      activeFarms: '120+',
      carbonOffset: '2.5 tons',
      totalProducts: '5,000+',
      customerSatisfaction: '98%',
      certifiedOrganic: '85%'
    };
  }
};

// Get detailed metrics for admin dashboard
export const getDetailedMetrics = async () => {
  try {
    const response = await axiosClient.get('/metrics/detailed');
    return response.data;
  } catch (error) {
    console.error('Error fetching detailed metrics:', error);
    throw error;
  }
};

// Get farm-specific metrics
export const getFarmMetrics = async (farmId) => {
  try {
    const response = await axiosClient.get(`/metrics/farm/${farmId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching farm metrics:', error);
    throw error;
  }
};

// Get product category metrics
export const getCategoryMetrics = async () => {
  try {
    const response = await axiosClient.get('/metrics/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching category metrics:', error);
    throw error;
  }
};

// Get monthly trends
export const getMonthlyTrends = async (months = 12) => {
  try {
    const response = await axiosClient.get(`/metrics/trends?months=${months}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching monthly trends:', error);
    throw error;
  }
};