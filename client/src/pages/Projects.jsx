import React, { useState, useEffect, useMemo } from 'react';
import { LayoutDashboard, Plus, Search, Calendar, Users, MoreVertical, Trash2, Edit2, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import NotificationCenter from '../components/NotificationCenter';
import ProjectForm from '../components/ProjectForm';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showProjectForm, setShowProjectForm] = useState(false);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    if (!Array.isArray(projects)) return [];
    return projects.filter(p => 
      p.title?.toLowerCase().includes(search.toLowerCase()) || 
      p.description?.toLowerCase().includes(search.toLowerCase())
    );
  }, [projects, search]);

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-slate-950 overflow-hidden">
      {/* Sidebar - Reused for consistency */}
      <aside className="w-64 border-r bg-white dark:bg-slate-900 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            TeamTask
          </h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-3" onClick={() => window.location.href = '/dashboard'}>
            <LayoutDashboard size={20} /> Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-blue-600 bg-blue-50 dark:bg-blue-900/20">
            <Users size={20} /> Projects
          </Button>
          {/* Add more nav items as needed */}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
            <p className="text-muted-foreground">Manage your team's projects and members.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input 
                className="pl-10 bg-white dark:bg-slate-900" 
                placeholder="Search projects..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <NotificationCenter />
            {user?.role === 'ADMIN' && (
              <Button 
                className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                onClick={() => setShowProjectForm(true)}
              >
                <Plus className="mr-2" size={20} /> Create Project
              </Button>
            )}
          </div>
        </header>

        {showProjectForm && (
          <ProjectForm 
            onClose={() => setShowProjectForm(false)} 
            onProjectCreated={fetchProjects} 
          />
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-100 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="group border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-900 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl font-bold group-hover:text-blue-600 transition-colors">
                      {project.title}
                    </CardTitle>
                    {user?.role === 'ADMIN' && (
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical size={16} />
                      </Button>
                    )}
                  </div>
                  <CardDescription className="line-clamp-2 mt-2">
                    {project.description || "No description provided."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar size={16} className="text-blue-500" />
                    <span>
                      {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <span>Team Members</span>
                      <span>{project.members?.length || 0}</span>
                    </div>
                    <div className="flex -space-x-2 overflow-hidden">
                      {project.members?.map((member, i) => (
                        <Avatar key={member.id} className="border-2 border-white dark:border-slate-900 w-8 h-8">
                          <AvatarFallback className="bg-slate-100 text-[10px]">{(member.name?.charAt(0) || 'U').toUpperCase()}</AvatarFallback>
                        </Avatar>
                      ))}
                      {user?.role === 'ADMIN' && (
                        <Button variant="outline" size="icon" className="w-8 h-8 rounded-full border-dashed bg-transparent hover:bg-blue-50 hover:text-blue-600">
                          <UserPlus size={14} />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-4 border-t flex justify-between bg-slate-50/50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      {project._count?.tasks || 0} Tasks
                    </Badge>
                  </div>
<Button 
  variant="ghost" 
  size="sm" 
  className="hover:text-blue-600"
  onClick={() => window.location.href = `/projects/${project.id}`}
>
  View Details
</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredProjects.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed">
            <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
            <h3 className="mt-4 text-lg font-semibold">No projects found</h3>
            <p className="text-muted-foreground">Get started by creating your first project.</p>
            {user?.role === 'ADMIN' && (
              <Button className="mt-6 bg-blue-600">Create Project</Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Projects;
