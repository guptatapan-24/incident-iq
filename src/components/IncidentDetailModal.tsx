'use client';

import React from 'react';
import { Incident } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { SEVERITY_COLORS, STATUS_COLORS } from '@/lib/constants';
import { Clock, MapPin, User, Tag, FileText, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface IncidentDetailModalProps {
  incident: Incident | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function IncidentDetailModal({ incident, isOpen, onClose }: IncidentDetailModalProps) {
  if (!incident) return null;

  let timeDistance = 'just now';
  try {
    timeDistance = formatDistanceToNow(new Date(incident.created_at), { addSuffix: true });
  } catch (e) {
    // Ignore invalid dates
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl bg-white border border-slate-200 shadow-lg p-6 rounded-xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={`font-semibold shadow-xs ${STATUS_COLORS[incident.status] || ''}`}>
              {incident.status}
            </Badge>
            <Badge variant="outline" className={`font-semibold shadow-xs ${SEVERITY_COLORS[incident.severity] || ''}`}>
              {incident.severity}
            </Badge>
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-tight">
            {incident.title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Detailed information about restaurant operational incident {incident.title}.
          </DialogDescription>
        </DialogHeader>

        <hr className="border-slate-100 my-4" />

        <div className="space-y-5">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-600 bg-slate-50/50 border border-slate-100 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-slate-400 shrink-0" />
              <div>
                <span className="font-semibold text-slate-700 block text-xs">Category</span>
                <span className="font-medium text-slate-900">{incident.category}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
              <div>
                <span className="font-semibold text-slate-700 block text-xs">Store Location</span>
                <span className="font-medium text-slate-900">{incident.store_location}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400 shrink-0" />
              <div>
                <span className="font-semibold text-slate-700 block text-xs">Reported Time</span>
                <span className="font-medium text-slate-900">{timeDistance}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-slate-400 shrink-0" />
              <div>
                <span className="font-semibold text-slate-700 block text-xs">Reported By</span>
                <span className="font-medium text-slate-900">{incident.reported_by || 'Anonymous'}</span>
              </div>
            </div>
          </div>

          {/* AI Summary Section */}
          {incident.ai_summary && (
            <div className="space-y-2 border border-indigo-100 bg-indigo-50/30 p-4 rounded-lg">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-indigo-950">
                <Sparkles className="h-4 w-4 text-indigo-500 shrink-0" />
                <span>AI Operational Summary</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed font-normal">
                {incident.ai_summary}
              </p>
            </div>
          )}

          {/* Description Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
              <FileText className="h-4 w-4 text-slate-400 shrink-0" />
              <span>Full Description</span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed bg-white border border-slate-200 p-4 rounded-lg whitespace-pre-wrap font-normal">
              {incident.description}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
