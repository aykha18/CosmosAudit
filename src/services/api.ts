import axios from 'axios';
import { LeadData, AssessmentResponse } from '../types';

const API_URL = process.env.REACT_APP_API_URL || '/api';

export const api = {
  // Save lead
  async saveLead(leadData: LeadData): Promise<{ leadId: number }> {
    const response = await axios.post(`${API_URL}/leads`, leadData);
    return response.data;
  },

  // Save assessment
  async saveAssessment(data: {
    leadId: number;
    score: number;
    readinessLevel: string;
    responses: AssessmentResponse[];
  }) {
    const response = await axios.post(`${API_URL}/assessments`, data);
    return response.data;
  },

  // Get all leads
  async getLeads() {
    const response = await axios.get(`${API_URL}/leads`);
    return response.data;
  },

  // Get lead by ID
  async getLead(id: number) {
    const response = await axios.get(`${API_URL}/leads/${id}`);
    return response.data;
  },

  // Get stats
  async getStats() {
    const response = await axios.get(`${API_URL}/stats`);
    return response.data;
  }
};

export default api;
