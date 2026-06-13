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
import { Clock, MapPin, User, Tag, FileText, Sparkles, Calendar, Paperclip, ExternalLink } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface IncidentDetailModalProps {
  incident: Incident | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function IncidentDetailModal({ incident, isOpen, onClose }: IncidentDetailModalProps) {
  if (!incident) return null;

  let timeDistance = 'just now';
  let occurrenceTime = 'Unknown';
  try {
    timeDistance = formatDistanceToNow(new Date(incident.created_at), { addSuffix: true });
  } catch (e) {
    // Ignore invalid dates
  }

  try {
    occurrenceTime = format(new Date(incident.occurred_at), 'PPP p');
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
              <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
              <div>
                <span className="font-semibold text-slate-700 block text-xs">Occurrence Time</span>
                <span className="font-medium text-slate-900">{occurrenceTime}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400 shrink-0" />
              <div>
                <span className="font-semibold text-slate-700 block text-xs">Reported Time</span>
                <span className="font-medium text-slate-900">{timeDistance}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:col-span-2">
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

          {/* Attachment Section */}
          {incident.image_url && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                <Paperclip className="h-4 w-4 text-slate-400 shrink-0" />
                <span>Attachment Evidence</span>
              </div>
              
              {incident.image_url.toLowerCase().match(/\.(jpeg|jpg|gif|png|webp|svg)/) || !incident.image_url.toLowerCase().endsWith('.pdf') ? (
                <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50 group max-h-[300px] flex items-center justify-center">
                  <img
                    src={incident.image_url}
                    alt="Incident evidence"
                    className="w-full h-auto max-h-[300px] object-contain mx-auto transition-transform duration-300 group-hover:scale-[1.01]"
                  />
                  <a
                    href={incident.image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-md bg-slate-900/80 hover:bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-xs transition-colors cursor-pointer"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Open Original
                  </a>
                </div>
              ) : (
                <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md border border-slate-200 bg-white flex items-center justify-center text-slate-400 shrink-0">
                      <FileText className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">PDF Document Evidence</p>
                      <p className="text-xs text-slate-500">Incident report attachment</p>
                    </div>
                  </div>
                  <a
                    href={incident.image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:text-slate-900 transition-colors gap-1.5 cursor-pointer"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    View File
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
