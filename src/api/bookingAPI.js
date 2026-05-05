// services/bookingAPI.js
const API_BASE_URL =  'https://saimr-backend-1.onrender.com/api';

const bookingAPI = {
  /**
   * Book an appointment for property viewing
   */
  bookAppointment: async (bookingData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(bookingData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to book appointment');
      }
      
      return data;
    } catch (error) {
      console.error('Error booking appointment:', error);
      throw error;
    }
  },

  /**
   * Get user's appointments
   */
  getUserAppointments: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/appointments/my`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch appointments');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching user appointments:', error);
      throw error;
    }
  },

  /**
   * Get agent's appointments (for agent dashboard)
   */
  getAgentAppointments: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/agent/appointments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch appointments');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching agent appointments:', error);
      throw error;
    }
  },

  /**
   * Update appointment status (for agents)
   */
  updateAppointmentStatus: async (appointmentId, updateData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update appointment status');
      }
      
      return data;
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  },

  /**
   * Cancel an appointment
   */
  cancelAppointment: async (appointmentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel appointment');
      }
      
      return data;
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      throw error;
    }
  }
};

export default bookingAPI;