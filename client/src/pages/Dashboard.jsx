import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  Users,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import NotificationCenter from '../components/NotificationCenter';
import TaskForm from '../components/TaskForm';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectFilter, setProjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showTaskForm, setShowTaskForm] = useState(false);

  const fetchData = async () => {
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/projects')
      ]);
      setTasks(Array.isArray(tasksRes.data) ? tasksRes.data : []);
      setProjects(Array.isArray(projectsRes.data) ? projectsRes.data : []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredTasks = useMemo(() => {
    if (!Array.isArray(tasks)) return [];
    return tasks.filter(task => {
      if (!task) return false;
      const matchProject = projectFilter === 'all' || task.projectId === projectFilter;
      const matchStatus = statusFilter === 'all' || task.status === statusFilter;
      return matchProject && matchStatus;
    });
  }, [tasks, projectFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = filteredTasks.length;
    const completed = filteredTasks.filter(t => t.status === 'Done').length;
    const pending = filteredTasks.filter(t => t.status !== 'Done').length;
    const overdue = filteredTasks.filter(t => 
      t.status !== 'Done' && t.dueDate && new Date(t.dueDate) < new Date()
    ).length;

    return [
      { title: "Total Tasks", value: total, icon: LayoutDashboard, color: "text-blue-500", bg: "bg-blue-50" },
      { title: "Completed", value: completed, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50" },
      { title: "Pending", value: pending, icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
      { title: "Overdue", value: overdue, icon: AlertCircle, color: "text-red-500", bg: "bg-red-50" },
    ];
  }, [filteredTasks]);

  if (loading) {
    return <div className="p-8 text-center">Loading Dashboard...</div>;
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-slate-950 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white dark:bg-slate-900 flex flex-col shadow-sm">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            TeamTask
          </h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-3 text-blue-600 bg-blue-50 dark:bg-blue-900/20">
            <LayoutDashboard size={20} /> Dashboard
          </Button>
          <Link to="/projects">
            <Button variant="ghost" className="w-full justify-start gap-3">
              <Users size={20} /> Team Projects
            </Button>
          </Link>
        </nav>
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 px-2 py-3">
            <Avatar>
              <AvatarFallback>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
                <Badge variant="outline" className="text-[10px] py-0 px-1 bg-blue-50 text-blue-700">{user?.role || 'MEMBER'}</Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate">{user?.email || 'No email'}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-2" onClick={logout}>Log out</Button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
            <p className="text-muted-foreground text-sm">Real-time statistics and task distribution.</p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationCenter />
            <Button 
              className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20"
              onClick={() => setShowTaskForm(true)}
            >
              <Plus className="mr-2" size={20} /> New Task
            </Button>
          </div>
        </header>

        {showTaskForm && (
          <TaskForm 
            onClose={() => setShowTaskForm(false)} 
            onTaskCreated={fetchData} 
            projects={projects}
          />
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title} className="border-none shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Simplified Task List */}
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="pb-0 border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold">Recent Tasks</CardTitle>
              <Badge variant="secondary" className="font-normal">{filteredTasks.length} total</Badge>
            </div>
          </CardHeader>
          <div className="divide-y max-h-[400px] overflow-y-auto bg-white dark:bg-slate-900">
            {filteredTasks.length === 0 ? (
              <div className="p-10 text-center text-muted-foreground italic">No tasks found.</div>
            ) : (
              filteredTasks.map(task => (
                <div key={task.id} className="p-4 flex items-center justify-between">
                  <p className="text-sm font-semibold">{task.title}</p>
                  <Badge variant="outline">{task.status}</Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
