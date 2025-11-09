import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';

interface Lead {
  id: number;
  name: string;
  email: string;
  company: string;
  role: string;
  phone: string;
  created_at: string;
}

interface Stats {
  totalLeads: number;
  totalAssessments: number;
  averageScore: number;
  byReadinessLevel: {
    nurture?: number;
    co_creator_qualified?: number;
    priority?: number;
  };
}

const AdminDashboard: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [leadsData, statsData] = await Promise.all([
        api.getLeads(),
        api.getStats()
      ]);
      setLeads(leadsData);
      setStats(statsData);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Lead analytics and management</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-blue-400" />
              <span className="text-3xl font-bold">{stats?.totalLeads || 0}</span>
            </div>
            <h3 className="text-gray-400 text-sm">Total Leads</h3>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <span className="text-3xl font-bold">{stats?.totalAssessments || 0}</span>
            </div>
            <h3 className="text-gray-400 text-sm">Assessments Completed</h3>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-purple-400" />
              <span className="text-3xl font-bold">{stats?.averageScore || 0}</span>
            </div>
            <h3 className="text-gray-400 text-sm">Average Score</h3>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <AlertCircle className="w-8 h-8 text-yellow-400" />
              <span className="text-3xl font-bold">
                {stats?.byReadinessLevel?.priority || 0}
              </span>
            </div>
            <h3 className="text-gray-400 text-sm">Priority Leads</h3>
          </div>
        </div>

        {/* Readiness Level Breakdown */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Readiness Level Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">
                {stats?.byReadinessLevel?.priority || 0}
              </div>
              <div className="text-gray-400">Priority</div>
              <div className="text-sm text-gray-500 mt-1">Score: 71-100</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">
                {stats?.byReadinessLevel?.co_creator_qualified || 0}
              </div>
              <div className="text-gray-400">Co-Creator Qualified</div>
              <div className="text-sm text-gray-500 mt-1">Score: 41-70</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-400 mb-2">
                {stats?.byReadinessLevel?.nurture || 0}
              </div>
              <div className="text-gray-400">Nurture</div>
              <div className="text-sm text-gray-500 mt-1">Score: 0-40</div>
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-6">Recent Leads</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Company</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Role</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Phone</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      No leads yet
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="py-3 px-4">{lead.name}</td>
                      <td className="py-3 px-4 text-gray-400">{lead.email}</td>
                      <td className="py-3 px-4 text-gray-400">{lead.company || '-'}</td>
                      <td className="py-3 px-4 text-gray-400">{lead.role || '-'}</td>
                      <td className="py-3 px-4 text-gray-400">{lead.phone || '-'}</td>
                      <td className="py-3 px-4 text-gray-400">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
