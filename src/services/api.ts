import axios from 'axios';
import { LeadData, AssessmentResponse } from '../types';

const API_URL = process.env.REACT_APP_API_URL || '/api';
const AGENT_API_URL = process.env.REACT_APP_AGENT_API_URL || 'http://localhost:8000/api/v1';

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
  },

  // Audit API functions
  async runAudit(auditRequest: {
    repo_url?: string;
    branch?: string;
    contract_files?: string[] | undefined;
    contract_paths?: string[] | undefined;
    analysis_type: 'repo' | 'files';
    run_explainer?: boolean;
  }) {
    try {
      const response = await axios.post(`${AGENT_API_URL}/audit`, auditRequest);
      return response.data;
    } catch (error: any) {
      // Handle agent service not available
      if (error.code === 'ERR_BLOCKED_BY_CLIENT' || error.code === 'ERR_NETWORK' || !AGENT_API_URL || AGENT_API_URL.includes('localhost')) {
        throw new Error('Audit service is currently not available. Please try again later.');
      }
      throw error;
    }
  },

  async getAuditStatus(runId: string) {
    try {
      const response = await axios.get(`${AGENT_API_URL}/audit/${runId}`);
      return response.data;
    } catch (error: any) {
      // Handle agent service not available
      if (error.code === 'ERR_BLOCKED_BY_CLIENT' || error.code === 'ERR_NETWORK' || !AGENT_API_URL || AGENT_API_URL.includes('localhost')) {
        throw new Error('Audit service is currently not available. Please try again later.');
      }
      throw error;
    }
  }
};

export default api;
