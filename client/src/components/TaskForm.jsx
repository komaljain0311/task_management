import React, { useState, useEffect } from 'react';
import { X, Calendar, Type, AlignLeft, User, Flag, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from '../services/api';

const TaskForm = ({ onClose, onTaskCreated, projectId, projects, task }) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'To Do',
    priority: task?.priority || 'MEDIUM',
    dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    userId: task?.userId || '',
    projectId: task?.projectId || projectId || ''
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/auth/users'); // I need to implement this endpoint or use /projects/:id to get members
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.projectId) {
      alert("Please select a project");
      return;
    }
    setLoading(true);
    try {
      if (task) {
        const response = await api.put(`/tasks/${task.id}`, formData);
        onTaskCreated(response.data);
      } else {
        const response = await api.post('/tasks', formData);
        onTaskCreated(response.data);
      }
      onClose();
    } catch (error) {
      console.error("Error saving task:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <h2 className="text-xl font-bold">{task ? 'Edit Task' : 'Create New Task'}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Task Title</Label>
            <Input 
              required
              placeholder="What needs to be done?"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Project</Label>
              <select 
                className="w-full h-10 px-3 rounded-lg border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={formData.projectId}
                onChange={(e) => setFormData({...formData, projectId: e.target.value})}
                required
              >
                <option value="">Select Project</option>
                {projects?.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Assign To</Label>
              <select 
                className="w-full h-10 px-3 rounded-lg border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={formData.userId}
                onChange={(e) => setFormData({...formData, userId: e.target.value})}
              >
                <option value="">Select User</option>
                {users?.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Priority</Label>
              <select 
                className="w-full h-10 px-3 rounded-lg border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Due Date</Label>
              <Input 
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Description</Label>
            <textarea 
              className="w-full min-h-[80px] px-3 py-2 rounded-lg border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="Additional details..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
