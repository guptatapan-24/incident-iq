'use client';

import React from 'react';
import { CATEGORIES, SEVERITIES, STATUSES } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X } from 'lucide-react';

interface FilterBarProps {
  filters: {
    search: string;
    category: string;
    severity: string;
    status: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
}

export default function FilterBar({ filters, onFilterChange, onClearFilters }: FilterBarProps) {
  const isAnyFilterActive =
    filters.search !== '' ||
    filters.category !== '' ||
    filters.severity !== '' ||
    filters.status !== '';

  return (
    <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm w-full">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search incidents..."
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
          className="pl-9 pr-4 border-slate-200 focus-visible:ring-slate-950 focus-visible:ring-offset-1 h-10 w-full"
        />
      </div>

      {/* Select Filters Group */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Category Select */}
        <Select
          value={filters.category || 'all'}
          onValueChange={(val) => onFilterChange('category', val === 'all' ? '' : val)}
        >
          <SelectTrigger className="w-full lg:w-[180px] border-slate-200 h-10">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Severity Select */}
        <Select
          value={filters.severity || 'all'}
          onValueChange={(val) => onFilterChange('severity', val === 'all' ? '' : val)}
        >
          <SelectTrigger className="w-full lg:w-[160px] border-slate-200 h-10">
            <SelectValue placeholder="All Severities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            {SEVERITIES.map((sev) => (
              <SelectItem key={sev} value={sev}>
                {sev}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Select */}
        <Select
          value={filters.status || 'all'}
          onValueChange={(val) => onFilterChange('status', val === 'all' ? '' : val)}
        >
          <SelectTrigger className="w-full lg:w-[150px] border-slate-200 h-10">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUSES.map((stat) => (
              <SelectItem key={stat} value={stat}>
                {stat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters Button */}
      {isAnyFilterActive && (
        <Button
          variant="ghost"
          onClick={onClearFilters}
          className="text-slate-500 hover:text-slate-900 gap-1.5 h-10 shrink-0 self-end lg:self-auto hover:bg-slate-50"
        >
          <X className="h-4 w-4" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}
