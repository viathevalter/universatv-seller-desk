import React, { useState, useEffect } from 'react';
import { useI18n } from '../lib/i18n';
import { mockTasks, mockStages } from '../lib/mockDb';
import { TaskCard, TaskStage, TaskPriority } from '../types';
import { Card, Button, Input, Badge, Toast, Textarea } from '../components/ui/LayoutComponents';
import { Plus, Search, Filter, Calendar, AlertCircle, Phone, Edit2, Trash2, CheckCircle, Clock, Settings, X, MoreHorizontal } from 'lucide-react';

const Tasks = () => {
  const { t, language } = useI18n();
  const [tasks, setTasks] = useState<TaskCard[]>(mockTasks);
  const [stages, setStages] = useState<TaskStage[]>(mockStages);
  const [viewMode, setViewMode] = useState<'kanban' | 'today' | 'overdue' | 'week'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskCard | null>(null);

  // Filter Logic
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          task.whatsapp.includes(searchTerm) ||
                          task.interestTags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const getOverdueTasks = () => {
    const now = new Date();
    return filteredTasks.filter(t => new Date(t.dueAt) < now && !isCompleted(t.stageId)).sort((a,b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
  };

  const getTodayTasks = () => {
    const today = new Date().toISOString().split('T')[0];
    return filteredTasks.filter(t => t.dueAt.startsWith(today)).sort((a,b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
  };

  // Helper to determine if a stage is "Completed" (simplified logic, assuming last stage is lost/done or custom)
  // For this MVP, we just rely on the user moving cards.
  const isCompleted = (stageId: string) => false; 

  // --- CRUD OPERATIONS ---

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const newTask: TaskCard = {
        id: editingTask ? editingTask.id : Date.now().toString(),
        ownerUserId: '1',
        customerName: formData.get('customerName') as string,
        whatsapp: formData.get('whatsapp') as string,
        language: formData.get('language') as 'pt' | 'es',
        device: formData.get('device') as string,
        interestTags: (formData.get('tags') as string).split(',').map(s => s.trim()).filter(Boolean),
        notes: formData.get('notes') as string,
        stageId: formData.get('stageId') as string,
        nextAction: formData.get('nextAction') as string,
        dueAt: formData.get('dueAt') as string,
        priority: formData.get('priority') as TaskPriority,
        createdAt: editingTask ? editingTask.createdAt : new Date().toISOString(),
    };

    if (editingTask) {
        setTasks(prev => prev.map(t => t.id === editingTask.id ? newTask : t));
    } else {
        setTasks(prev => [...prev, newTask]);
    }
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  const handleDeleteTask = (id: string) => {
      if (window.confirm('Tem certeza?')) {
          setTasks(prev => prev.filter(t => t.id !== id));
      }
  };

  const handleMoveStage = (taskId: string, newStageId: string) => {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, stageId: newStageId } : t));
  };

  // --- COMPONENT: TASK CARD ---
  const TaskCardItem: React.FC<{ task: TaskCard }> = ({ task }) => {
      const isOverdue = new Date(task.dueAt) < new Date();
      const stage = stages.find(s => s.id === task.stageId);

      return (
          <div className={`bg-surface border-l-4 rounded-lg p-3 shadow-sm hover:shadow-md transition-all relative group ${task.priority === 'high' ? 'border-l-red-500' : task.priority === 'medium' ? 'border-l-orange-500' : 'border-l-blue-500'} border-y border-r border-border`}>
              {/* Header */}
              <div className="flex justify-between items-start mb-2">
                  <div>
                      <h4 className="font-bold text-textMain text-sm">{task.customerName}</h4>
                      <div className="flex items-center gap-1 text-xs text-textMuted">
                        <Phone size={10} /> {task.whatsapp}
                      </div>
                  </div>
                  <div className="flex gap-1">
                     <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${task.language === 'pt' ? 'bg-green-900/30 text-green-500' : 'bg-blue-900/30 text-blue-500'}`}>
                         {task.language}
                     </span>
                  </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                  {task.interestTags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[9px] bg-surfaceHighlight border border-border px-1 rounded text-textMuted">{tag}</span>
                  ))}
              </div>

              {/* Next Action & Date */}
              <div className="bg-background/50 rounded p-2 mb-2">
                  <p className="text-xs text-textMain font-medium mb-1">{task.nextAction}</p>
                  <div className={`flex items-center gap-1 text-[10px] ${isOverdue ? 'text-red-400 font-bold' : 'text-textMuted'}`}>
                      {isOverdue ? <AlertCircle size={10} /> : <Clock size={10} />}
                      {new Date(task.dueAt).toLocaleString(language === 'pt' ? 'pt-BR' : 'es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute:'2-digit' })}
                  </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                  <a href={`https://wa.me/${task.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="text-primary hover:text-textMain transition-colors" title="WhatsApp">
                      <Phone size={16} />
                  </a>
                  <div className="flex gap-2">
                      <select 
                        className="bg-transparent text-[10px] text-textMuted border border-border rounded max-w-[80px]"
                        value={task.stageId}
                        onChange={(e) => handleMoveStage(task.id, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      >
                          {stages.map(s => <option key={s.id} value={s.id}>{language === 'pt' ? s.name_pt : s.name_es}</option>)}
                      </select>
                      <button onClick={() => { setEditingTask(task); setIsTaskModalOpen(true); }} className="text-textMuted hover:text-textMain">
                          <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDeleteTask(task.id)} className="text-textMuted hover:text-red-400">
                          <Trash2 size={14} />
                      </button>
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto">
             <div className="flex bg-surface rounded-lg p-1 border border-border shrink-0">
                <button onClick={() => setViewMode('kanban')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${viewMode === 'kanban' ? 'bg-primary text-white shadow' : 'text-textMuted hover:text-textMain'}`}>
                    {t('tasks.view.kanban')}
                </button>
                <button onClick={() => setViewMode('today')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${viewMode === 'today' ? 'bg-primary text-white shadow' : 'text-textMuted hover:text-textMain'}`}>
                    {t('tasks.view.today')}
                </button>
                <button onClick={() => setViewMode('overdue')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${viewMode === 'overdue' ? 'bg-red-600 text-white shadow' : 'text-textMuted hover:text-red-400'}`}>
                    {t('tasks.view.overdue')}
                    {getOverdueTasks().length > 0 && <span className="bg-white/20 px-1.5 rounded text-[10px]">{getOverdueTasks().length}</span>}
                </button>
                 <button onClick={() => setViewMode('week')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${viewMode === 'week' ? 'bg-primary text-white shadow' : 'text-textMuted hover:text-textMain'}`}>
                    {t('tasks.view.week')}
                </button>
             </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={16} />
                <Input 
                    placeholder={t('tasks.search')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-10"
                />
            </div>
            
            <div className="relative">
                <select 
                    value={priorityFilter} 
                    onChange={e => setPriorityFilter(e.target.value)}
                    className="h-10 bg-surface border border-border rounded-md pl-3 pr-8 text-sm text-textMuted focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                >
                    <option value="all">Prioridade: Todas</option>
                    <option value="high">Alta</option>
                    <option value="medium">Média</option>
                    <option value="low">Baixa</option>
                </select>
                <Filter className="absolute right-2 top-1/2 -translate-y-1/2 text-textMuted pointer-events-none" size={14} />
            </div>

            <Button onClick={() => { setIsStageModalOpen(true) }} variant="ghost" title={t('tasks.manage_stages')}>
                <Settings size={20} />
            </Button>

            <Button onClick={() => { setEditingTask(null); setIsTaskModalOpen(true); }} className="shrink-0">
                <Plus size={18} /> {t('tasks.new_client')}
            </Button>
        </div>
      </div>

      {/* VIEW CONTENT */}
      <div className="flex-1 overflow-hidden relative rounded-xl border border-border bg-surfaceHighlight/20">
          
          {/* KANBAN VIEW */}
          {viewMode === 'kanban' && (
              <div className="h-full overflow-x-auto overflow-y-hidden flex gap-4 p-4">
                  {stages.filter(s => s.active).sort((a,b) => a.order - b.order).map(stage => (
                      <div key={stage.id} className="min-w-[300px] w-[300px] flex flex-col h-full bg-surface/50 rounded-xl border border-border">
                          <div className="p-3 border-b border-border flex justify-between items-center" style={{ borderTop: `3px solid ${stage.color}`}}>
                              <h3 className="font-bold text-sm text-textMain">{language === 'pt' ? stage.name_pt : stage.name_es}</h3>
                              <span className="text-xs bg-background px-2 py-0.5 rounded text-textMuted border border-border">
                                  {filteredTasks.filter(t => t.stageId === stage.id).length}
                              </span>
                          </div>
                          <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
                              {filteredTasks.filter(t => t.stageId === stage.id).map(task => (
                                  <TaskCardItem key={task.id} task={task} />
                              ))}
                          </div>
                      </div>
                  ))}
              </div>
          )}

          {/* LIST VIEWS (Today / Overdue) */}
          {(viewMode === 'today' || viewMode === 'overdue') && (
               <div className="h-full overflow-y-auto p-6 max-w-4xl mx-auto space-y-4">
                   {(viewMode === 'today' ? getTodayTasks() : getOverdueTasks()).length === 0 ? (
                       <div className="text-center text-textMuted py-20">Nenhuma tarefa encontrada para este filtro.</div>
                   ) : (
                       (viewMode === 'today' ? getTodayTasks() : getOverdueTasks()).map(task => (
                           <div key={task.id} className="flex items-center gap-4 bg-surface p-4 rounded-xl border border-border hover:border-primary/30 transition-colors">
                                <div className={`w-1 h-12 rounded-full ${task.priority === 'high' ? 'bg-red-500' : 'bg-primary'}`}></div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-textMain text-lg">{task.customerName}</h4>
                                    <div className="flex items-center gap-4 text-sm text-textMuted mt-1">
                                        <span className="flex items-center gap-1"><Phone size={12} /> {task.whatsapp}</span>
                                        <span className="flex items-center gap-1"><Clock size={12} /> {new Date(task.dueAt).toLocaleString()}</span>
                                        <span className="bg-surfaceHighlight px-2 py-0.5 rounded text-xs">{task.nextAction}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                     <a href={`https://wa.me/${task.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer">
                                        <Button variant="ghost" className="text-green-500 hover:text-green-400 hover:bg-green-900/20"><Phone size={18} /> WhatsApp</Button>
                                     </a>
                                     <Button variant="secondary" onClick={() => { setEditingTask(task); setIsTaskModalOpen(true); }}><Edit2 size={16} /></Button>
                                </div>
                           </div>
                       ))
                   )}
               </div>
          )}

          {/* WEEK VIEW (Simplified) */}
          {viewMode === 'week' && (
              <div className="h-full flex items-center justify-center text-textMuted flex-col gap-4">
                  <Calendar size={48} className="opacity-20" />
                  <p>Visão semanal em breve...</p>
                  {/* TODO: Implement grouped list by Day */}
              </div>
          )}
      </div>

      {/* TASK MODAL */}
      {isTaskModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <Card className="w-full max-w-2xl bg-surface border-border shadow-2xl h-[90vh] flex flex-col">
                  <div className="flex justify-between items-center p-6 border-b border-border bg-surfaceHighlight/50">
                      <h3 className="text-xl font-bold text-textMain">{editingTask ? 'Editar Tarefa' : t('tasks.new_client')}</h3>
                      <button onClick={() => setIsTaskModalOpen(false)}><X className="text-textMuted hover:text-textMain" /></button>
                  </div>
                  <form onSubmit={handleSaveTask} className="flex-1 overflow-y-auto p-6 space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                          <div>
                              <label className="text-xs uppercase font-bold text-textMuted mb-2 block">{t('tasks.form.name')}</label>
                              <Input name="customerName" defaultValue={editingTask?.customerName} required placeholder="Ex: João Silva" />
                          </div>
                          <div>
                              <label className="text-xs uppercase font-bold text-textMuted mb-2 block">{t('tasks.form.whatsapp')}</label>
                              <Input name="whatsapp" defaultValue={editingTask?.whatsapp} required placeholder="Ex: 5511999999999" />
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                           <div>
                              <label className="text-xs uppercase font-bold text-textMuted mb-2 block">Idioma</label>
                              <select name="language" defaultValue={editingTask?.language || 'pt'} className="w-full bg-background border border-border rounded-md px-3 py-2 text-textMain focus:ring-2 focus:ring-primary/50">
                                  <option value="pt">Português</option>
                                  <option value="es">Español</option>
                              </select>
                           </div>
                           <div>
                              <label className="text-xs uppercase font-bold text-textMuted mb-2 block">{t('tasks.form.device')}</label>
                              <Input name="device" defaultValue={editingTask?.device} placeholder="Ex: TV Samsung, TV Box" />
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                           <div>
                              <label className="text-xs uppercase font-bold text-textMuted mb-2 block">{t('tasks.form.stage')}</label>
                              <select name="stageId" defaultValue={editingTask?.stageId} className="w-full bg-background border border-border rounded-md px-3 py-2 text-textMain focus:ring-2 focus:ring-primary/50">
                                  {stages.map(s => <option key={s.id} value={s.id}>{language === 'pt' ? s.name_pt : s.name_es}</option>)}
                              </select>
                           </div>
                           <div>
                              <label className="text-xs uppercase font-bold text-textMuted mb-2 block">{t('tasks.priority')}</label>
                              <select name="priority" defaultValue={editingTask?.priority || 'medium'} className="w-full bg-background border border-border rounded-md px-3 py-2 text-textMain focus:ring-2 focus:ring-primary/50">
                                  <option value="low">{t('tasks.priority.low')}</option>
                                  <option value="medium">{t('tasks.priority.medium')}</option>
                                  <option value="high">{t('tasks.priority.high')}</option>
                              </select>
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                           <div>
                              <label className="text-xs uppercase font-bold text-textMuted mb-2 block">{t('tasks.form.next_action')}</label>
                              <Input name="nextAction" defaultValue={editingTask?.nextAction} placeholder="Ex: Enviar Teste, Cobrar..." />
                           </div>
                           <div>
                              <label className="text-xs uppercase font-bold text-textMuted mb-2 block">{t('tasks.form.due_at')}</label>
                              <Input 
                                type="datetime-local" 
                                name="dueAt" 
                                defaultValue={editingTask?.dueAt ? new Date(editingTask.dueAt).toISOString().slice(0, 16) : ''} 
                                required 
                                className="scheme-dark"
                              />
                          </div>
                      </div>

                      <div>
                          <label className="text-xs uppercase font-bold text-textMuted mb-2 block">Tags (separar por vírgula)</label>
                          <Input name="tags" defaultValue={editingTask?.interestTags.join(', ')} placeholder="Futebol, Filmes, Revenda..." />
                      </div>

                      <div>
                          <label className="text-xs uppercase font-bold text-textMuted mb-2 block">{t('tasks.form.notes')}</label>
                          <Textarea name="notes" defaultValue={editingTask?.notes} className="h-24" />
                      </div>

                      <div className="pt-6 flex justify-end gap-3">
                           <Button variant="ghost" type="button" onClick={() => setIsTaskModalOpen(false)}>{t('common.cancel')}</Button>
                           <Button type="submit">{t('common.save')}</Button>
                      </div>
                  </form>
              </Card>
          </div>
      )}

      {/* MANAGE STAGES MODAL */}
      {isStageModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <Card className="w-full max-w-lg bg-surface border-border shadow-2xl">
                  <div className="flex justify-between items-center p-6 border-b border-border bg-surfaceHighlight/50">
                      <h3 className="text-xl font-bold text-textMain">{t('tasks.manage_stages')}</h3>
                      <button onClick={() => setIsStageModalOpen(false)}><X className="text-textMuted hover:text-textMain" /></button>
                  </div>
                  <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
                      {stages.sort((a,b) => a.order - b.order).map(stage => (
                          <div key={stage.id} className="flex items-center gap-3 p-3 bg-background border border-border rounded-lg">
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: stage.color }}></div>
                              <div className="flex-1">
                                  <p className="font-bold text-sm text-textMain">{stage.name_pt}</p>
                                  <p className="text-xs text-textMuted">{stage.name_es}</p>
                              </div>
                              <div className="flex gap-1">
                                  {/* Simple order buttons logic would go here, omitting for brevity */}
                                  <Button variant="ghost" className="p-1 h-8 w-8"><Edit2 size={14}/></Button>
                              </div>
                          </div>
                      ))}
                      <Button variant="secondary" className="w-full mt-4 border-dashed"><Plus size={16} /> Nova Etapa</Button>
                  </div>
                  <div className="p-6 border-t border-border flex justify-end">
                      <Button onClick={() => setIsStageModalOpen(false)}>{t('common.save')}</Button>
                  </div>
              </Card>
          </div>
      )}

      <Toast message="Ação realizada!" visible={toastVisible} />
    </div>
  );
};

export default Tasks;