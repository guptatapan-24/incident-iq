'use client';

import React, { useEffect, useState, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Check, Info, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  created_at: string;
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      // Silent error
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Poll for notifications every 20 seconds
    const interval = setInterval(fetchNotifications, 20000);

    // Refresh on incident status changes too
    window.addEventListener('incidentStatusChanged', fetchNotifications);

    return () => {
      clearInterval(interval);
      window.removeEventListener('incidentStatusChanged', fetchNotifications);
    };
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );

      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch (e) {
      // Re-fetch on error to revert
      fetchNotifications();
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    setLoading(true);
    try {
      // Optimistic update
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
    } catch (e) {
      // Re-fetch on error to revert
      fetchNotifications();
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />;
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />;
      default:
        return <Info className="h-4 w-4 text-blue-500 shrink-0" />;
    }
  };

  const getTypeColors = (type: string, read: boolean) => {
    if (read) return 'bg-slate-50 border-slate-100';
    switch (type) {
      case 'error':
        return 'bg-red-50/70 border-red-100';
      case 'warning':
        return 'bg-amber-50/70 border-amber-100';
      case 'success':
        return 'bg-green-50/70 border-green-100';
      default:
        return 'bg-blue-50/70 border-blue-100';
    }
  };

  return (
    <div className="relative">
      {/* Click outside backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 cursor-default" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          fetchNotifications();
        }}
        className="relative p-2 text-slate-500 hover:text-slate-800 transition-colors rounded-full hover:bg-slate-50 focus:outline-none cursor-pointer"
        aria-label="View notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-extrabold text-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Container */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50/50">
            <h4 className="text-sm font-bold text-slate-800">Notifications</h4>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={loading}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 focus:outline-none disabled:opacity-50 cursor-pointer"
              >
                <Check className="h-3.5 w-3.5" />
                Mark all as read
              </button>
            )}
          </div>

          {/* List content */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 select-none">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center space-y-2">
                <Bell className="h-8 w-8 text-slate-300" />
                <p className="text-xs font-medium text-slate-500">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => {
                let timeText = 'just now';
                try {
                  timeText = formatDistanceToNow(new Date(notif.created_at), { addSuffix: true });
                } catch (e) {
                  // Fallback
                }

                return (
                  <div
                    key={notif.id}
                    onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                    className={`flex items-start gap-3 p-3.5 transition-colors text-left border-l-2 cursor-pointer ${
                      notif.read ? 'border-transparent hover:bg-slate-50/50' : 'border-blue-600 hover:bg-slate-50'
                    } ${getTypeColors(notif.type, notif.read)}`}
                  >
                    {getTypeIcon(notif.type)}
                    <div className="space-y-0.5 min-w-0">
                      <p className={`text-xs leading-snug truncate ${notif.read ? 'text-slate-600 font-medium' : 'text-slate-900 font-semibold'}`}>
                        {notif.title}
                      </p>
                      <p className="text-[11px] leading-relaxed text-slate-500 font-normal break-words">
                        {notif.message}
                      </p>
                      <span className="text-[9px] text-slate-400 block pt-0.5 font-medium">{timeText}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
