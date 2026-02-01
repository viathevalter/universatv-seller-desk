import React, { useState, useEffect } from 'react';
import { useI18n } from '../lib/i18n';
import { mockApps } from '../lib/mockDb';
import { AppItem } from '../types';
import { Card, Button, Input, Badge, Toast, Textarea } from '../components/ui/LayoutComponents';
import { WhatsAppEditor } from '../components/ui/WhatsAppEditor';
import { Search, Copy, Download, ExternalLink, Smartphone, Maximize2, X, Plus, Edit2, Trash2, Save } from 'lucide-react';

const Apps = () => {
  const { t, language } = useI18n();
  const [apps, setApps] = useState<AppItem[]>(mockApps);
  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pt'|'es'>('pt');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formLinkStore, setFormLinkStore] = useState('');
  const [formImageMain, setFormImageMain] = useState('');
  const [formPlatforms, setFormPlatforms] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formTutorialUrls, setFormTutorialUrls] = useState('');
  const [formInstructionsPt, setFormInstructionsPt] = useState('');
  const [formInstructionsEs, setFormInstructionsEs] = useState('');

  // Initialize selection
  useEffect(() => {
    if (apps.length > 0 && !selectedApp) {
        setSelectedApp(apps[0]);
    }
  }, [apps, selectedApp]);

  useEffect(() => {
      setActiveTab(language);
  }, [language]);

  const filteredApps = apps.filter(app => 
    app.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este aplicativo?')) {
        const newApps = apps.filter(a => a.id !== id);
        setApps(newApps);
        if (selectedApp?.id === id) {
            setSelectedApp(newApps.length > 0 ? newApps[0] : null);
        }
    }
  };

  const resetForm = () => {
      setEditingId(null);
      setFormName('');
      setFormLinkStore('');
      setFormImageMain('');
      setFormPlatforms('');
      setFormTags('');
      setFormTutorialUrls('');
      setFormInstructionsPt('');
      setFormInstructionsEs('');
  };

  const openModal = (app?: AppItem) => {
    if (app) {
        setEditingId(app.id);
        setFormName(app.name);
        setFormLinkStore(app.link_store);
        setFormImageMain(app.image_main_url);
        setFormPlatforms(app.platforms.join(', '));
        setFormTags(app.tags.join(', '));
        setFormTutorialUrls(app.tutorial_images_urls.join(', '));
        setFormInstructionsPt(app.instructions_pt);
        setFormInstructionsEs(app.instructions_es);
    } else {
        resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newApp: AppItem = {
        id: editingId || Date.now().toString(),
        name: formName,
        link_store: formLinkStore,
        image_main_url: formImageMain,
        instructions_pt: formInstructionsPt,
        instructions_es: formInstructionsEs,
        platforms: formPlatforms.split(',').map(s => s.trim()).filter(Boolean),
        tags: formTags.split(',').map(s => s.trim()).filter(Boolean),
        tutorial_images_urls: formTutorialUrls.split(',').map(s => s.trim()).filter(Boolean),
    };

    if (editingId) {
        setApps(prev => prev.map(a => a.id === editingId ? newApp : a));
        if (selectedApp?.id === editingId) setSelectedApp(newApp);
    } else {
        setApps(prev => [...prev, newApp]);
        setSelectedApp(newApp);
    }
    setIsModalOpen(false);
    resetForm();
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      
      {/* Col 1: List (Fixed Width) */}
      <div className="w-[380px] flex flex-col gap-4 shrink-0">
        <div className="flex gap-2">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={16} />
                <Input 
                    placeholder={t('apps.search')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-10"
                />
            </div>
            <Button className="px-3 bg-primary hover:bg-primaryHover text-white h-10" onClick={() => openModal()} title="Adicionar Novo App">
                <Plus size={20} />
            </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {filteredApps.map(app => (
                <div 
                    key={app.id} 
                    onClick={() => setSelectedApp(app)}
                    className={`group relative p-4 rounded-lg border cursor-pointer transition-all flex items-center gap-3 ${
                        selectedApp?.id === app.id 
                        ? 'bg-primary/10 border-primary shadow-lg shadow-primary/10' 
                        : 'bg-surface border-border hover:border-primary/50'
                    }`}
                >
                    <img src={app.image_main_url} className="w-12 h-12 rounded object-cover bg-black shrink-0" alt="" />
                    <div className="overflow-hidden flex-1">
                        <h4 className={`font-semibold truncate ${selectedApp?.id === app.id ? 'text-primary' : 'text-textMain'}`}>{app.name}</h4>
                        <div className="flex gap-1 mt-1 overflow-hidden">
                            {app.platforms.slice(0, 2).map(p => (
                                <span key={p} className="text-[10px] bg-background px-1.5 py-0.5 rounded text-textMuted border border-border whitespace-nowrap">{p}</span>
                            ))}
                        </div>
                    </div>
                    
                    {/* Hover Actions for Quick CRUD */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-surface shadow-lg rounded-md p-1 border border-border z-10">
                        <button 
                            onClick={(e) => { e.stopPropagation(); openModal(app); }}
                            className="p-1.5 text-textMuted hover:text-textMain hover:bg-surfaceHighlight rounded"
                            title="Editar"
                        >
                            <Edit2 size={14} />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(app.id); }}
                            className="p-1.5 text-textMuted hover:text-red-400 hover:bg-red-900/20 rounded"
                            title="Excluir"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Col 2: Details (Flexible) */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedApp ? (
            <Card className="flex-1 flex flex-col p-6 overflow-y-auto">
                <div className="flex justify-between items-start mb-6 pb-6 border-b border-border">
                    <div>
                        <h2 className="text-3xl font-bold text-textMain mb-2">{selectedApp.name}</h2>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {selectedApp.platforms.map(p => <Badge key={p}>{p}</Badge>)}
                        </div>
                        {selectedApp.link_store && (
                             <a href={selectedApp.link_store} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                                <ExternalLink size={12} /> Link da Loja
                             </a>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => openModal(selectedApp)}>
                            <Edit2 size={16} /> Editar
                        </Button>
                        <Button variant="destructive" onClick={() => handleDelete(selectedApp.id)}>
                            <Trash2 size={16} /> Excluir
                        </Button>
                    </div>
                </div>

                {/* Draggable Main Image */}
                <div className="mb-8 p-4 bg-background rounded-xl border-2 border-dashed border-border flex flex-col items-center">
                    <div className="relative group cursor-grab active:cursor-grabbing">
                        <img 
                            src={selectedApp.image_main_url} 
                            alt={selectedApp.name} 
                            className="h-64 rounded-lg object-contain shadow-2xl"
                            draggable="true"
                            onDragStart={(e) => {
                                e.dataTransfer.setData("text/plain", selectedApp.image_main_url);
                                e.dataTransfer.effectAllowed = "copy";
                            }}
                        />
                         <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                            <span className="text-white font-bold flex items-center gap-2 pointer-events-none">
                                <Maximize2 size={20} /> Drag to WhatsApp
                            </span>
                        </div>
                    </div>
                    <p className="mt-3 text-sm text-primary font-medium flex items-center gap-2">
                        <Smartphone size={16} />
                        {t('apps.dragText')}
                    </p>
                </div>

                {/* Instructions Tabs */}
                <div className="flex-1 flex flex-col">
                    <div className="flex border-b border-border mb-4">
                        <button 
                            onClick={() => setActiveTab('pt')}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'pt' ? 'border-primary text-primary' : 'border-transparent text-textMuted hover:text-textMain'}`}
                        >
                            Português
                        </button>
                        <button 
                            onClick={() => setActiveTab('es')}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'es' ? 'border-primary text-primary' : 'border-transparent text-textMuted hover:text-textMain'}`}
                        >
                            Español
                        </button>
                    </div>
                    <div className="flex-1 bg-surfaceHighlight p-4 rounded-lg border border-border whitespace-pre-wrap font-mono text-sm text-textMuted leading-relaxed">
                        {activeTab === 'pt' ? selectedApp.instructions_pt : selectedApp.instructions_es}
                    </div>
                </div>

                {/* Tutorial Gallery */}
                 {selectedApp.tutorial_images_urls.length > 0 && (
                    <div className="mt-6">
                        <h4 className="text-sm font-bold text-textMuted mb-3 uppercase tracking-wider">{t('apps.gallery')}</h4>
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {selectedApp.tutorial_images_urls.map((url, idx) => (
                                <img 
                                    key={idx} 
                                    src={url} 
                                    className="h-20 w-20 object-cover rounded border border-border cursor-pointer hover:border-primary"
                                    onClick={() => setZoomedImage(url)}
                                    alt="Tutorial step"
                                />
                            ))}
                        </div>
                    </div>
                )}
            </Card>
        ) : (
            <div className="flex-1 flex items-center justify-center text-textMuted border border-dashed border-border rounded-xl">
                Selecione ou crie um aplicativo
            </div>
        )}
      </div>

      {/* Col 3: Quick Actions (Fixed Width) */}
      <div className="w-[300px] flex flex-col gap-4 shrink-0">
         {selectedApp && (
             <>
                <Card className="p-4 bg-surfaceHighlight border-primary/20">
                    <h3 className="text-textMain font-bold mb-4">{t('apps.copyInstructions')}</h3>
                    <div className="flex flex-col gap-3">
                        <Button 
                            className={`w-full py-4 text-lg border ${activeTab === 'pt' ? 'border-green-500' : 'border-transparent'}`} 
                            onClick={() => {
                                handleCopy(selectedApp.instructions_pt);
                                setActiveTab('pt');
                            }}
                        >
                            <Copy size={20} /> PORTUGUÊS
                        </Button>
                        <Button 
                            className={`w-full py-4 text-lg border ${activeTab === 'es' ? 'border-primary' : 'border-transparent'}`} 
                            onClick={() => {
                                handleCopy(selectedApp.instructions_es);
                                setActiveTab('es');
                            }}
                        >
                            <Copy size={20} /> ESPAÑOL
                        </Button>
                        <p className="text-xs text-center text-textMuted">Copia e exibe o texto na aba central</p>
                    </div>
                </Card>

                <Card className="p-4">
                     <h3 className="text-textMain font-bold mb-4">{t('apps.viewImage')}</h3>
                     <Button variant="secondary" className="w-full mb-2" onClick={() => setZoomedImage(selectedApp.image_main_url)}>
                        <Maximize2 size={18} /> {t('apps.viewImage')}
                     </Button>
                     <a href={selectedApp.image_main_url} download className="block">
                        <Button variant="ghost" className="w-full border border-border">
                            <Download size={18} /> {t('apps.download')}
                        </Button>
                     </a>
                </Card>
             </>
         )}
      </div>

      {/* Image Modal */}
      {zoomedImage && (
          <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-10 backdrop-blur-sm" onClick={() => setZoomedImage(null)}>
              <button className="absolute top-6 right-6 text-white hover:text-primary"><X size={32} /></button>
              <img src={zoomedImage} className="max-w-full max-h-full rounded shadow-2xl" draggable="true" onClick={(e) => e.stopPropagation()} />
          </div>
      )}

      {/* App Form Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
              <Card className="w-full max-w-6xl bg-surface border-border shadow-2xl animate-in fade-in zoom-in duration-200 h-[90vh] flex flex-col">
                  <div className="flex justify-between items-center p-6 border-b border-border shrink-0 bg-surfaceHighlight/50">
                      <h3 className="text-xl font-bold text-textMain">{editingId ? 'Editar Aplicativo' : 'Novo Aplicativo'}</h3>
                      <button onClick={() => setIsModalOpen(false)}><X className="text-textMuted hover:text-textMain" /></button>
                  </div>
                  
                  <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-8 bg-surface">
                      <div className="grid grid-cols-2 gap-8">
                          <div>
                              <label className="block text-xs font-bold text-textMuted uppercase mb-2">Nome do App</label>
                              <Input value={formName} onChange={e => setFormName(e.target.value)} required placeholder="Ex: DreamTV" />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-textMuted uppercase mb-2">Link da Loja</label>
                              <Input value={formLinkStore} onChange={e => setFormLinkStore(e.target.value)} placeholder="https://play.google.com..." />
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-8">
                           <div>
                              <label className="block text-xs font-bold text-textMuted uppercase mb-2">Plataformas (separar por vírgula)</label>
                              <Input value={formPlatforms} onChange={e => setFormPlatforms(e.target.value)} placeholder="Android TV, FireStick..." />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-textMuted uppercase mb-2">Tags (separar por vírgula)</label>
                              <Input value={formTags} onChange={e => setFormTags(e.target.value)} placeholder="Rápido, Estável..." />
                          </div>
                      </div>

                      <div>
                           <label className="block text-xs font-bold text-textMuted uppercase mb-2">URL Imagem Principal</label>
                           <Input value={formImageMain} onChange={e => setFormImageMain(e.target.value)} placeholder="https://..." />
                      </div>

                      {/* Stacked Instructions */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <WhatsAppEditor 
                            label="Instruções (Português)"
                            value={formInstructionsPt}
                            onChange={setFormInstructionsPt}
                            className="flex-1"
                          />
                          
                          <WhatsAppEditor 
                            label="Instruções (Espanhol)"
                            value={formInstructionsEs}
                            onChange={setFormInstructionsEs}
                            className="flex-1"
                          />
                      </div>

                      <div>
                           <label className="block text-xs font-bold text-textMuted uppercase mb-2">URLs Galeria (separar por vírgula)</label>
                           <Textarea value={formTutorialUrls} onChange={e => setFormTutorialUrls(e.target.value)} className="h-20" placeholder="https://img1.com, https://img2.com..." />
                      </div>
                  </form>

                  <div className="p-6 border-t border-border flex justify-end gap-3 shrink-0 bg-surfaceHighlight/30">
                      <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>{t('common.cancel')}</Button>
                      <Button type="submit" onClick={(e) => {
                          const form = e.currentTarget.closest('.fixed')?.querySelector('form');
                          form?.requestSubmit();
                      }}>
                          <Save size={18} /> {t('common.save')}
                      </Button>
                  </div>
              </Card>
          </div>
      )}

      <Toast message={t('common.copied')} visible={toastVisible} />
    </div>
  );
};

export default Apps;