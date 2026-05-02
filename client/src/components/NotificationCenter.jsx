import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Info, AlertTriangle, UserPlus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from '../services/api';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      const data = Array.isArray(response.data) ? response.data : [];
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all read:", error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'ASSIGNMENT': return <UserPlus className="text-blue-500" size={16} />;
      case 'DEADLINE': return <AlertTriangle className="text-red-500" size={16} />;
      default: return <Info className="text-slate-400" size={16} />;
    }
  };

  return (
    <div className="relative">
      <Button 
        variant="outline" 
        size="icon" 
        className="relative hover:bg-slate-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 hover:bg-red-600 border-2 border-white">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border rounded-2xl shadow-2xl z-50 overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="font-bold text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllRead}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>
            
            <div className="max-h-[400px] overflow-y-auto divide-y">
              {notifications.length === 0 ? (
                <div className="p-10 text-center text-muted-foreground text-sm">
                  <Bell className="mx-auto h-8 w-8 opacity-20 mb-2" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={`p-4 flex gap-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group relative ${!n.isRead ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                    onClick={() => !n.isRead && markRead(n.id)}
                  >
                    <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${!n.isRead ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-tight mb-1 ${!n.isRead ? 'font-semibold text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>
                        {n.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!n.isRead && (
                      <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                    )}
                  </div>
                ))
              )}
            </div>
            
            <div className="p-3 border-t text-center bg-slate-50/50 dark:bg-slate-800/50">
              <Button variant="ghost" size="sm" className="w-full text-xs font-semibold text-slate-500">
                View All Activity
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;
