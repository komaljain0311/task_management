import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Plus, 
  Calendar, 
  ChevronLeft, 
  MoreVertical,
  Clock,
  CheckCircle2,
  AlertCircle,
  GripVertical,
  Edit2,
  Trash2
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import NotificationCenter from '../components/NotificationCenter';
import TaskForm from '../components/TaskForm';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await api.get(`/projects/${id}`);
      setProject(response.data);
    } catch (error) {
      console.error("Error fetching project:", error);
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId;
    
    // Optimistic Update
    const tasks = Array.isArray(project?.tasks) ? project.tasks : [];
    const updatedTasks = [...tasks];
    const taskIndex = updatedTasks.findIndex(t => t.id === draggableId);
    if (taskIndex === -1) return;

    const [movedTask] = updatedTasks.splice(taskIndex, 1);
    movedTask.status = newStatus;
    
    updatedTasks.splice(0, 0, movedTask); 

    setProject({ ...project, tasks: updatedTasks });

    try {
      await api.put(`/tasks/${draggableId}`, { status: newStatus });
    } catch (error) {
      console.error("Failed to update task status:", error);
      fetchProject(); // Revert on failure
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchProject();
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const handleEditTask = (task) => {
    setTaskToEdit(task);
    setShowTaskForm(true);
  };

  const handleCloseTaskForm = () => {
    setShowTaskForm(false);
    setTaskToEdit(null);
  };

  if (loading) return <div className="p-8 animate-pulse">Loading project details...</div>;
  if (!project) return <div className="p-8">Project not found.</div>;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Done': return <CheckCircle2 size={16} className="text-green-500" />;
      case 'In Progress': return <Clock size={16} className="text-amber-500" />;
      default: return <AlertCircle size={16} className="text-slate-400" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-700 border-red-200';
      case 'Medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const columns = ['To Do', 'In Progress', 'Done'];

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-slate-950 overflow-hidden">
      {/* Sidebar - Reused */}
      <aside className="w-64 border-r bg-white dark:bg-slate-900 flex flex-col shadow-sm">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            TeamTask
          </h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <Link to="/dashboard">
            <Button variant="ghost" className="w-full justify-start gap-3">
              <LayoutDashboard size={20} /> Dashboard
            </Button>
          </Link>
          <Link to="/projects">
            <Button variant="ghost" className="w-full justify-start gap-3 text-blue-600 bg-blue-50 dark:bg-blue-900/20">
              <Users size={20} /> Projects
            </Button>
          </Link>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        <Link to="/projects" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-blue-600 transition-colors mb-6">
          <ChevronLeft size={16} /> Back to Projects
        </Link>

        <header className="flex items-start justify-between mb-10">
          <div className="space-y-1">
            <h2 className="text-4xl font-bold tracking-tight">{project.title}</h2>
            <p className="text-lg text-muted-foreground">{project.description}</p>
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-2 text-sm font-medium bg-white px-3 py-1.5 rounded-lg border shadow-sm">
                <Calendar size={18} className="text-blue-500" />
                <span>Deadline: {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'None'}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {Array.isArray(project?.members) && project.members.map((member) => (
                    <Avatar key={member.id} className="border-2 border-white w-8 h-8 shadow-sm">
                      <AvatarFallback className="text-[10px] font-bold bg-slate-100">{member.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground font-medium">{project.members.length} Members</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <NotificationCenter />
            {user?.role === 'ADMIN' && (
              <Button variant="outline">Edit Project</Button>
            )}
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
            onClose={handleCloseTaskForm} 
            onTaskCreated={fetchProject} 
            projectId={id}
            projects={[project]}
            task={taskToEdit}
          />
        )}

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-full">
            {columns.map((status) => (
              <div key={status} className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-widest">{status}</h3>
                    <Badge variant="secondary" className="rounded-full px-2 py-0 bg-white shadow-sm font-bold">
                      {(project?.tasks || []).filter(t => t.status === status).length}
                    </Badge>
                  </div>
                </div>

                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex-1 space-y-4 min-h-[500px] transition-colors rounded-xl ${
                        snapshot.isDraggingOver ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                      }`}
                    >
                      {Array.isArray(project?.tasks) && project.tasks
                        .filter(t => t && t.status === status)
                        .map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  ...provided.draggableProps.style,
                                  userSelect: 'none'
                                }}
                              >
                                <Card className={`group border-none shadow-sm hover:shadow-md transition-all bg-white dark:bg-slate-900 ${
                                  snapshot.isDragging ? 'rotate-2 shadow-xl ring-2 ring-blue-500/20' : ''
                                }`}>
                                  <CardContent className="p-4 space-y-4">
                                    <div className="flex items-start justify-between">
                                      <Badge variant="outline" className={`text-[10px] font-bold ${getPriorityColor(task.priority)}`}>
                                        {task.priority}
                                      </Badge>
                                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="h-7 w-7 text-slate-400 hover:text-blue-600"
                                          onClick={(e) => { e.stopPropagation(); handleEditTask(task); }}
                                        >
                                          <Edit2 size={12} />
                                        </Button>
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="h-7 w-7 text-slate-400 hover:text-red-600"
                                          onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                                        >
                                          <Trash2 size={12} />
                                        </Button>
                                        <GripVertical size={14} className="text-slate-300 ml-1" />
                                      </div>
                                    </div>
                                    <h4 className="font-semibold text-slate-800 dark:text-slate-100">{task.title}</h4>
                                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{task.description}</p>
                                    <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-800">
                                      <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground">
                                        {getStatusIcon(task.status)}
                                        <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</span>
                                      </div>
                                      <Avatar className="w-6 h-6 ring-2 ring-white">
                                        <AvatarFallback className="text-[8px] font-bold bg-blue-50 text-blue-600">{task.user?.name.charAt(0)}</AvatarFallback>
                                      </Avatar>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                      
                      {Array.isArray(project?.tasks) && project.tasks.filter(t => t && t.status === status).length === 0 && !snapshot.isDraggingOver && (
                        <div className="h-24 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center text-muted-foreground text-xs italic">
                          Drop tasks here
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </main>
    </div>
  );
};

export default ProjectDetails;
