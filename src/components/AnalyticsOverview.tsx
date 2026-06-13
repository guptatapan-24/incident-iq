'use client';

import React from 'react';
import { Incident, IncidentCategory, IncidentSeverity } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CATEGORIES, SEVERITIES } from '@/lib/constants';
import { BarChart3, ShieldAlert, CheckCircle2, Activity, Heart, Calendar } from 'lucide-react';

interface AnalyticsOverviewProps {
  incidents: Incident[];
}

const SEVERITY_COLORS: Record<IncidentSeverity, string> = {
  Low: 'bg-green-500',
  Medium: 'bg-yellow-500',
  High: 'bg-orange-500',
  Critical: 'bg-red-500',
};

const SEVERITY_TEXT_COLORS: Record<IncidentSeverity, string> = {
  Low: 'text-green-600',
  Medium: 'text-yellow-600',
  High: 'text-orange-600',
  Critical: 'text-red-600',
};

export default function AnalyticsOverview({ incidents }: AnalyticsOverviewProps) {
  const total = incidents.length;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-slate-200 rounded-xl shadow-sm space-y-4 min-h-[350px]">
        <div className="rounded-full bg-slate-50 p-4 text-slate-400 border border-slate-100">
          <Activity className="h-10 w-10" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-slate-900">No data available</h3>
          <p className="text-sm text-slate-500">There are no incidents matching your current filter set to analyze.</p>
        </div>
      </div>
    );
  }

  // 1. Category Calculations
  const categoryCounts = incidents.reduce((acc, incident) => {
    acc[incident.category] = (acc[incident.category] || 0) + 1;
    return acc;
  }, {} as Record<IncidentCategory, number>);

  const maxCategoryCount = Math.max(...Object.values(categoryCounts), 1);

  // 2. Severity Calculations
  const severityCounts = incidents.reduce((acc, incident) => {
    acc[incident.severity] = (acc[incident.severity] || 0) + 1;
    return acc;
  }, {} as Record<IncidentSeverity, number>);

  // 3. Status Calculations
  const statusCounts = incidents.reduce((acc, incident) => {
    acc[incident.status] = (acc[incident.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 4. KPI Metrics
  const resolvedOrClosedCount = (statusCounts['Resolved'] || 0) + (statusCounts['Closed'] || 0);
  const resolutionRate = Math.round((resolvedOrClosedCount / total) * 100);

  const criticalOrHighCount = (severityCounts['Critical'] || 0) + (severityCounts['High'] || 0);
  const criticalRatio = Math.round((criticalOrHighCount / total) * 100);

  // 5. Operational Health Score
  // Base 100, deduct points for open incidents based on severity
  const openIncidents = incidents.filter(i => i.status === 'Open' || i.status === 'In Progress');
  let healthScore = 100;
  openIncidents.forEach(incident => {
    if (incident.severity === 'Critical') healthScore -= 15;
    else if (incident.severity === 'High') healthScore -= 8;
    else if (incident.severity === 'Medium') healthScore -= 3;
    else healthScore -= 1;
  });
  healthScore = Math.max(healthScore, 0);

  let healthStatus = 'Good';
  let healthColor = 'text-green-600 bg-green-50 border-green-200';
  if (healthScore < 50) {
    healthStatus = 'Critical';
    healthColor = 'text-red-600 bg-red-50 border-red-200';
  } else if (healthScore < 80) {
    healthStatus = 'Warning';
    healthColor = 'text-amber-600 bg-amber-50 border-amber-200';
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI 1: Health Score */}
        <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Ops Health Score
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-slate-900">{healthScore}</span>
                <span className="text-sm font-medium text-slate-400">/ 100</span>
              </div>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold border ${healthColor}`}>
                {healthStatus}
              </span>
            </div>
            <div className="p-4 rounded-full bg-slate-50 border border-slate-100 text-slate-600">
              <Heart className="h-6 w-6 text-rose-500 fill-rose-500" />
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: Resolution Rate */}
        <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Resolution Rate
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-slate-900">{resolutionRate}%</span>
              </div>
              <p className="text-xs text-slate-500 leading-normal">
                {resolvedOrClosedCount} of {total} incidents resolved
              </p>
            </div>
            <div className="p-4 rounded-full bg-slate-50 border border-slate-100 text-slate-600">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: Critical Density */}
        <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Critical Density
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-slate-900">{criticalRatio}%</span>
              </div>
              <p className="text-xs text-slate-500 leading-normal">
                {criticalOrHighCount} critical or high incidents
              </p>
            </div>
            <div className="p-4 rounded-full bg-slate-50 border border-slate-100 text-slate-600">
              <ShieldAlert className="h-6 w-6 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Category breakdown (3/5 cols) */}
        <Card className="border-slate-200 shadow-sm bg-white lg:col-span-3">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-500" />
              Incidents by Category
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            {CATEGORIES.map(category => {
              const count = categoryCounts[category] || 0;
              const percent = total > 0 ? Math.round((count / total) * 100) : 0;
              const fillPercent = (count / maxCategoryCount) * 100;

              return (
                <div key={category} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-700">{category}</span>
                    <span className="font-bold text-slate-900">
                      {count} <span className="text-slate-400 font-medium text-xs">({percent}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-50">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${fillPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Severity & Status breakdown (2/5 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Severity distribution */}
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-rose-500" />
                Severity Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {SEVERITIES.map(sev => {
                const count = severityCounts[sev] || 0;
                const percent = total > 0 ? Math.round((count / total) * 100) : 0;

                return (
                  <div key={sev} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/30">
                    <div className="flex items-center gap-2.5">
                      <span className={`h-3 w-3 rounded-full ${SEVERITY_COLORS[sev]}`} />
                      <span className="text-sm font-semibold text-slate-700">{sev}</span>
                    </div>
                    <span className={`text-sm font-bold ${SEVERITY_TEXT_COLORS[sev]}`}>
                      {count} <span className="text-slate-400 font-medium text-xs">({percent}%)</span>
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Status Breakdown card */}
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Status Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex h-5 w-full rounded-full overflow-hidden mb-5 bg-slate-100">
                {['Open', 'In Progress', 'Resolved', 'Closed'].map((status, index) => {
                  const count = statusCounts[status] || 0;
                  if (count === 0) return null;
                  const percent = (count / total) * 100;
                  
                  const colors = [
                    'bg-red-400',
                    'bg-amber-400',
                    'bg-green-400',
                    'bg-slate-400'
                  ];

                  return (
                    <div
                      key={status}
                      className={`${colors[index]} h-full transition-all duration-300`}
                      style={{ width: `${percent}%` }}
                      title={`${status}: ${count}`}
                    />
                  );
                })}
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  { name: 'Open', color: 'bg-red-400', val: statusCounts['Open'] || 0 },
                  { name: 'In Progress', color: 'bg-amber-400', val: statusCounts['In Progress'] || 0 },
                  { name: 'Resolved', color: 'bg-green-400', val: statusCounts['Resolved'] || 0 },
                  { name: 'Closed', color: 'bg-slate-400', val: statusCounts['Closed'] || 0 },
                ].map(item => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                    <span className="text-slate-500 font-medium">{item.name}:</span>
                    <span className="font-bold text-slate-800">{item.val}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
