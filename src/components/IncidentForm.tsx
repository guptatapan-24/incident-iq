'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CATEGORIES, SEVERITIES, SEVERITY_COLORS } from '@/lib/constants';
import { IncidentCategory, IncidentSeverity, supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, CheckCircle2, Loader2, Upload, X, Paperclip } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface FormErrors {
  title?: string;
  store_location?: string;
  category?: string;
  severity?: string;
  description?: string;
  occurred_at?: string;
}

const SEVERITY_DOT_COLORS: Record<IncidentSeverity, string> = {
  Low: 'bg-green-500',
  Medium: 'bg-yellow-500',
  High: 'bg-orange-500',
  Critical: 'bg-red-500',
};

export default function IncidentForm() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [storeLocation, setStoreLocation] = useState('');
  const [category, setCategory] = useState<IncidentCategory | ''>('');
  const [severity, setSeverity] = useState<IncidentSeverity | ''>('');
  const [description, setDescription] = useState('');
  const [reportedBy, setReportedBy] = useState('');
  const [occurredAt, setOccurredAt] = useState('');
  
  // File upload states
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const [aiSuggestion, setAiSuggestion] = useState<{
    summary: string;
    suggested_category: string;
    suggested_severity: string;
    reasoning: string;
  } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiConfigured, setAiConfigured] = useState(true);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 2 * 1024 * 1024) {
      setError('File size must be less than 2MB.');
      return;
    }

    setFile(selectedFile);
    if (selectedFile.type.startsWith('image/')) {
      const previewUrl = URL.createObjectURL(selectedFile);
      setFilePreview(previewUrl);
    } else {
      setFilePreview('file'); // Placeholder for non-image files like PDF
    }
  };

  const handleRemoveFile = () => {
    if (filePreview && filePreview.startsWith('blob:')) {
      URL.revokeObjectURL(filePreview);
    }
    setFile(null);
    setFilePreview(null);
  };

  useEffect(() => {
    return () => {
      if (filePreview && filePreview.startsWith('blob:')) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  useEffect(() => {
    if (user && !reportedBy) {
      setReportedBy(user.name);
    }
  }, [user]);

  useEffect(() => {
    async function checkAIStatus() {
      try {
        const res = await fetch('/api/ai-status');
        if (res.ok) {
          const data = await res.json();
          setAiConfigured(data.configured);
        }
      } catch (e) {
        setAiConfigured(false);
      }
    }
    checkAIStatus();
  }, []);

  const filledFieldsCount = [
    title.trim() !== '',
    storeLocation.trim() !== '',
    category !== '',
    severity !== '',
    description.trim() !== '',
    occurredAt !== '',
  ].filter(Boolean).length;

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!title.trim()) newErrors.title = 'Incident title is required.';
    if (!storeLocation.trim()) newErrors.store_location = 'Store location is required.';
    if (!category) newErrors.category = 'Please select a category.';
    if (!severity) newErrors.severity = 'Please select a severity level.';
    if (!description.trim()) newErrors.description = 'Description is required.';
    if (!occurredAt) newErrors.occurred_at = 'Incident date and time is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const analyzeWithAI = async () => {
    setAiError('');
    setAiSuggestion(null);

    if (!title.trim() || !description.trim()) {
      setAiError('Title and description are required for AI analysis.');
      return;
    }

    if (description.trim().length < 10) {
      setAiError('Description must be at least 10 characters long.');
      return;
    }

    setAiLoading(true);

    try {
      const response = await fetch('/api/ai-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'AI Analysis failed.');
      }

      setAiSuggestion(data);
      setAiSummary(data.summary);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to complete AI analysis.';
      setAiError(errMsg);
    } finally {
      setAiLoading(false);
    }
  };

  const acceptAISuggestion = () => {
    if (!aiSuggestion) return;
    setCategory(aiSuggestion.suggested_category as IncidentCategory);
    setSeverity(aiSuggestion.suggested_severity as IncidentSeverity);
    setAiSuggestion(null);
  };

  const handleSubmit = async () => {
    setError(null);
    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      let imageUrl = '';
      if (file) {
        const fileExt = file.name.split('.').pop();
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('incident-attachments')
          .upload(uniqueName, file);

        if (uploadError) {
          throw new Error(`Failed to upload attachment: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('incident-attachments')
          .getPublicUrl(uniqueName);

        imageUrl = publicUrl;
      }

      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          store_location: storeLocation.trim(),
          category,
          severity,
          description: description.trim(),
          reported_by: reportedBy.trim() || undefined,
          ai_summary: aiSummary || null,
          occurred_at: occurredAt,
          image_url: imageUrl || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit incident report. Please try again.');
      }

      setSuccessId(data.id || 'Unknown ID');
      // Reset form
      setTitle('');
      setStoreLocation('');
      setCategory('');
      setSeverity('');
      setDescription('');
      setReportedBy('');
      setOccurredAt('');
      setFile(null);
      setFilePreview(null);
      setErrors({});
      setAiSuggestion(null);
      setAiSummary(null);
      window.scrollTo(0, 0);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(errMsg);
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  if (successId) {
    return (
      <Card className="border-green-200 bg-green-50/50 shadow-md max-w-2xl mx-auto overflow-hidden">
        <CardContent className="pt-8 pb-8 flex flex-col items-center text-center space-y-5 px-6 sm:px-10">
          <div className="rounded-full bg-green-100 p-4 text-green-600 animate-pulse">
            <CheckCircle2 className="h-14 w-14" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-green-900">Incident Reported!</h3>
            <p className="text-green-700 max-w-md text-sm">
              Your operational report has been submitted and is active on the manager dashboard.
            </p>
            <div className="pt-2">
              <span className="text-xs font-semibold text-slate-500 block mb-1">Incident ID</span>
              <p className="text-sm font-mono bg-white border border-green-200 rounded-lg px-4 py-2 text-green-800 break-all select-all shadow-2xs inline-block">
                {successId}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full pt-4 max-w-md justify-center">
            <Button 
              onClick={() => setSuccessId(null)}
              className="bg-green-600 hover:bg-green-700 text-white font-medium h-10 px-6 shrink-0"
            >
              Report Another Incident
            </Button>
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center justify-center rounded-md border border-green-200 bg-white px-6 py-2 text-sm font-medium text-green-800 shadow-2xs hover:bg-green-50 transition-colors"
            >
              View Dashboard
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white border border-slate-200 shadow-sm overflow-hidden">
      <CardContent className="p-6 sm:p-8 space-y-6">
        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-900">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <span className="font-semibold">Submission Error:</span> {error}
            </div>
          </div>
        )}

        {/* Section 1: Incident Details */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Incident Details</h3>
              <p className="text-xs text-slate-500">Provide the core details of the operational issue.</p>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-full px-3 py-1.5 self-start sm:self-auto">
              <span className="text-[11px] font-semibold text-slate-600">
                {filledFieldsCount}/6 filled
              </span>
              <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                  style={{ width: `${(filledFieldsCount / 6) * 100}%` }}
                />
              </div>
            </div>
          </div>
          <hr className="border-slate-100" />

          {/* Incident Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-slate-700">
              Incident Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g. POS terminal not responding at counter 2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={errors.title ? 'border-red-500 focus-visible:ring-red-500' : 'border-slate-200'}
            />
            {errors.title && <p className="text-xs font-medium text-red-600">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium text-slate-700">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={category} 
                onValueChange={(val) => setCategory(val as IncidentCategory)}
              >
                <SelectTrigger
                  id="category"
                  className={errors.category ? 'border-red-500 focus:ring-red-500' : 'border-slate-200'}
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-xs font-medium text-red-600">{errors.category}</p>}
            </div>

            {/* Severity */}
            <div className="space-y-2">
              <Label htmlFor="severity" className="text-sm font-medium text-slate-700">
                Severity Level <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={severity} 
                onValueChange={(val) => setSeverity(val as IncidentSeverity)}
              >
                <SelectTrigger
                  id="severity"
                  className={errors.severity ? 'border-red-500 focus:ring-red-500' : 'border-slate-200'}
                >
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  {SEVERITIES.map((sev) => (
                    <SelectItem key={sev} value={sev}>
                      <span className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${SEVERITY_DOT_COLORS[sev]}`} />
                        {sev}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.severity && <p className="text-xs font-medium text-red-600">{errors.severity}</p>}
            </div>

            {/* Date & Time of Occurrence */}
            <div className="space-y-2">
              <Label htmlFor="occurredAt" className="text-sm font-medium text-slate-700">
                Date & Time <span className="text-red-500">*</span>
              </Label>
              <Input
                id="occurredAt"
                type="datetime-local"
                value={occurredAt}
                onChange={(e) => setOccurredAt(e.target.value)}
                className={errors.occurred_at ? 'border-red-500 focus-visible:ring-red-500' : 'border-slate-200'}
              />
              {errors.occurred_at && <p className="text-xs font-medium text-red-600">{errors.occurred_at}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-slate-700">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              rows={4}
              maxLength={1000}
              placeholder="Describe the incident in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={errors.description ? 'border-red-500 focus-visible:ring-red-500' : 'border-slate-200'}
            />
            <p className="text-right text-[10px] text-slate-400 font-medium tracking-wide">
              {description.length} / 1000 characters
            </p>
            {errors.description && <p className="text-xs font-medium text-red-600">{errors.description}</p>}
          </div>

          {/* AI Analysis Block */}
          <div className="space-y-3 pt-2">
            <div className="relative group inline-block">
              <Button
                type="button"
                variant="outline"
                disabled={!aiConfigured || !title.trim() || !description.trim() || aiLoading}
                onClick={analyzeWithAI}
                className="flex items-center gap-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 transition-colors h-10 font-medium"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    Analyze with AI
                  </>
                )}
              </Button>

              {!aiConfigured && (
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 scale-0 transition-all rounded bg-slate-900 px-2.5 py-1 text-xs text-white group-hover:scale-100 whitespace-nowrap shadow-md z-50 font-normal">
                  AI analysis not configured
                </span>
              )}
            </div>

            {aiError && (
              <p className="text-xs font-medium text-red-600">{aiError}</p>
            )}

            {aiSuggestion && (
              <Card className="border-indigo-200 bg-indigo-50/40 shadow-xs overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-indigo-950">
                    <span>✨</span>
                    <span>AI Analysis</span>
                  </div>
                  
                  <p className="text-sm text-slate-700 leading-relaxed font-normal">
                    {aiSuggestion.summary}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                    <div>
                      <span className="font-semibold text-slate-700 block mb-0.5">Suggested Category:</span>
                      <span className="text-sm font-medium text-slate-900">{aiSuggestion.suggested_category}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700 block mb-0.5">Suggested Severity:</span>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                        SEVERITY_COLORS[aiSuggestion.suggested_severity as IncidentSeverity] || ''
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          SEVERITY_DOT_COLORS[aiSuggestion.suggested_severity as IncidentSeverity] || ''
                        }`} />
                        {aiSuggestion.suggested_severity}
                      </span>
                    </div>
                  </div>

                  {aiSuggestion.reasoning && (
                    <div className="text-xs">
                      <span className="font-semibold text-slate-700 block mb-0.5">Reasoning:</span>
                      <span className="text-slate-600 italic leading-relaxed">{aiSuggestion.reasoning}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      type="button"
                      size="sm"
                      onClick={acceptAISuggestion}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 font-medium px-3"
                    >
                      Apply Suggestions
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => { setAiSuggestion(null); setAiSummary(null); }}
                      className="text-slate-500 hover:text-slate-800 text-xs h-8 font-medium px-3 hover:bg-slate-100"
                    >
                      Dismiss
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Section 2: Location & Reporter */}
        <div className="space-y-4 pt-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Location & Reporter</h3>
            <p className="text-xs text-slate-500">Provide where the incident occurred and who is reporting it.</p>
          </div>
          <hr className="border-slate-100" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Store Location */}
            <div className="space-y-2">
              <Label htmlFor="storeLocation" className="text-sm font-medium text-slate-700">
                Store Location <span className="text-red-500">*</span>
              </Label>
              <Input
                id="storeLocation"
                placeholder="e.g. Koramangala Branch, Bengaluru"
                value={storeLocation}
                onChange={(e) => setStoreLocation(e.target.value)}
                className={errors.store_location ? 'border-red-500 focus-visible:ring-red-500' : 'border-slate-200'}
              />
              {errors.store_location && (
                <p className="text-xs font-medium text-red-600">{errors.store_location}</p>
              )}
            </div>

            {/* Reported By */}
            <div className="space-y-2">
              <Label htmlFor="reportedBy" className="text-sm font-medium text-slate-700">
                Reported By <span className="text-slate-500 text-xs">(optional)</span>
              </Label>
              <Input
                id="reportedBy"
                placeholder="Your name (optional)"
                value={reportedBy}
                onChange={(e) => setReportedBy(e.target.value)}
                className="border-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Attachments */}
        <div className="space-y-4 pt-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">File & Image Attachments</h3>
            <p className="text-xs text-slate-500">Upload a screenshot, photo, or document related to the incident.</p>
          </div>
          <hr className="border-slate-100" />

          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-700">Attachment</Label>
            
            {filePreview ? (
              <div className="relative rounded-lg border border-slate-200 bg-slate-50/50 p-4 flex items-center justify-between group animate-fade-in">
                <div className="flex items-center gap-3">
                  {file?.type.startsWith('image/') ? (
                    <div className="relative h-16 w-16 rounded-md overflow-hidden border border-slate-200 bg-white shrink-0">
                      <img src={filePreview} alt="Preview" className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-16 w-16 rounded-md border border-slate-200 bg-white flex items-center justify-center text-slate-400 shrink-0">
                      <Paperclip className="h-8 w-8" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{file?.name}</p>
                    <p className="text-xs text-slate-500">
                      {file ? (file.size / 1024 / 1024).toFixed(2) : 0} MB
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveFile}
                  className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full h-8 w-8 transition-colors shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-6 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-400 transition-colors cursor-pointer group relative">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,application/pdf"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="h-8 w-8 text-slate-400 group-hover:scale-110 transition-transform mb-2" />
                <span className="text-sm font-semibold text-slate-700">Click to upload or drag & drop</span>
                <span className="text-xs text-slate-500 mt-1">Image or PDF (max 2MB)</span>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white h-11 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 mt-6"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Reporting Incident...
            </span>
          ) : (
            'Report Incident'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
