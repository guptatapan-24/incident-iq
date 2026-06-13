'use client';

import React, { useEffect, useState } from 'react';
import StatsBar from '@/components/StatsBar';
import FilterBar from '@/components/FilterBar';
import IncidentTable from '@/components/IncidentTable';
import AnalyticsOverview from '@/components/AnalyticsOverview';
import { Incident } from '@/lib/supabase';
import { toast } from 'sonner';
import { List, BarChart3 } from 'lucide-react';

interface Filters {
  search: string;
  category: string;
  severity: string;
  status: string;
}

export default function DashboardPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'analytics'>('list');
  const [filters, setFilters] = useState<Filters>({
    search: '',
    category: '',
    severity: '',
    status: '',
  });

  const fetchIncidents = async (currentFilters: Filters) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (currentFilters.search) queryParams.set('search', currentFilters.search);
      if (currentFilters.category) queryParams.set('category', currentFilters.category);
      if (currentFilters.severity) queryParams.set('severity', currentFilters.severity);
      if (currentFilters.status) queryParams.set('status', currentFilters.status);

      const url = `/api/incidents?${queryParams.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch incidents');
      const data = await res.json();
      setIncidents(data);
    } catch (err) {
      toast.error('Failed to load incidents. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents(filters);
  }, [filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      category: '',
      severity: '',
      status: '',
    });
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/incidents/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      toast.success(`Status updated to ${newStatus}`);
      
      // Dispatch custom event to notify Header and StatsBar to update
      window.dispatchEvent(new Event('incidentStatusChanged'));
      
      // Refetch incidents to display updated list
      fetchIncidents(filters);
    } catch (err) {
      toast.error('Failed to update incident status. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-7xl space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Incident Dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Monitor, filter, and manage operational incidents in real-time.
          </p>
        </div>
      </div>

      {/* Statistics Bar */}
      <StatsBar />

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('list')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 text-sm font-semibold transition-colors focus:outline-none cursor-pointer ${
            activeTab === 'list'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <List className="h-4 w-4" />
          Incidents List
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 text-sm font-semibold transition-colors focus:outline-none cursor-pointer ${
            activeTab === 'analytics'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          Analytics Overview
        </button>
      </div>

      {/* Filter and Content Container */}
      <div className="space-y-4">
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        {activeTab === 'list' ? (
          <>
            {/* Count Indicator */}
            <div className="text-sm text-slate-500 font-medium px-1">
              {loading ? (
                'Loading incidents...'
              ) : (
                `Showing ${incidents.length} ${incidents.length === 1 ? 'incident' : 'incidents'}`
              )}
            </div>

            {/* Incident Table */}
            <IncidentTable
              incidents={incidents}
              onStatusChange={handleStatusChange}
              loading={loading}
            />
          </>
        ) : (
          <AnalyticsOverview incidents={incidents} />
        )}
      </div>
    </div>
  );
}
