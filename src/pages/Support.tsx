import React, { useState, useEffect } from 'react';
import { useI18n } from '../lib/i18n';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { SupportGuide } from '../types';
import { Card, Button, Input, Toast } from '../components/ui/LayoutComponents';
import { WhatsAppEditor } from '../components/ui/WhatsAppEditor';
import { WifiOff, Lock, AlertTriangle, HelpCircle, Search, Plus, Edit2, Trash2, X, LucideIcon, Loader2 } from 'lucide-react';

// Icon mapping for display and selection
const iconMap: Record<string, LucideIcon> = {
    'WifiOff': WifiOff,
    'Lock': Lock,
    'AlertTriangle': AlertTriangle,
    'HelpCircle': HelpCircle
};

const iconOptions = [
    { value: 'WifiOff', label: 'Wifi / Conexão' },
    { value: 'Lock', label: 'Cadeado / Login' },
    { value: 'AlertTriangle', label: 'Alerta / Erro' },
    { value: 'HelpCircle', label: 'Ajuda / Geral' }
];

interface SupportCardProps {
    item: SupportGuide;
    onCopy: (text: string) => void;
    onEdit: (item: SupportGuide) => void;
    onDelete: (id: string) => void;
}

// Extracted Card Component to handle local state per item
const SupportCard: React.FC<SupportCardProps> = ({
    item,
    onCopy,
    onEdit,
    onDelete
}) => {
    const [previewLang, setPreviewLang] = useState<'pt' | 'es'>('pt');
    const Icon = iconMap[item.icon] || HelpCircle;

    const handleCopyPt = () => {
        setPreviewLang('pt');
        onCopy(item.content_pt);
    };

    const handleCopyEs = () => {
        setPreviewLang('es');
        onCopy(item.content_es);
    };

    return (
        <div className="bg-surface rounded-xl p-5 border border-border relative hover:border-primary/40 transition-colors shadow-sm group">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-surfaceHighlight flex items-center justify-center border border-border group-hover:border-primary/30 transition-colors">
                        <Icon className="text-textMuted group-hover:text-primary transition-colors" size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-textMain tracking-tight">
                        {previewLang === 'pt' ? item.title_pt : item.title_es}
                    </h3>
                </div>
                <div className="flex gap-2 text-textMuted">
                    <button onClick={() => onEdit(item)} className="hover:text-textMain transition-colors p-1"><Edit2 size={16} /></button>
                    <button onClick={() => onDelete(item.id)} className="hover:text-red-400 transition-colors p-1"><Trash2 size={16} /></button>
                </div>
            </div>

            <div className="bg-background p-4 rounded-lg text-textMuted font-mono text-sm mb-5 leading-relaxed border border-border/50 whitespace-pre-line min-h-[60px]">
                {previewLang === 'pt' ? item.content_pt : item.content_es}
            </div>

            <div className="flex justify-end gap-3">
                <button
                    onClick={handleCopyPt}
                    className={`flex items-center gap-2 bg-[#111318] border rounded-lg px-4 py-2 transition-colors group/btn ${previewLang === 'pt' ? 'border-green-900 ring-1 ring-green-900/50' : 'border-border hover:border-green-900'}`}
                >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${previewLang === 'pt' ? 'bg-green-500 text-black border-green-500' : 'bg-green-900/30 text-green-500 border-green-900/50'}`}>PT</span>
                    <span className={`text-sm font-medium transition-colors ${previewLang === 'pt' ? 'text-white' : 'text-gray-400 group-hover/btn:text-white'}`}>Copiar Português</span>
                </button>

                <button
                    onClick={handleCopyEs}
                    className={`flex items-center gap-2 bg-[#111318] border rounded-lg px-4 py-2 transition-colors group/btn ${previewLang === 'es' ? 'border-primary ring-1 ring-primary/50' : 'border-border hover:border-primary/30'}`}
                >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${previewLang === 'es' ? 'bg-primary text-white border-primary' : 'bg-primary/10 text-primary border-primary/30'}`}>ES</span>
                    <span className={`text-sm font-medium transition-colors ${previewLang === 'es' ? 'text-white' : 'text-gray-400 group-hover/btn:text-white'}`}>Copiar Español</span>
                </button>
            </div>
        </div>
    );
};

const Support = () => {
    const { t } = useI18n();
    const { user } = useAuth();
    const [supportItems, setSupportItems] = useState<SupportGuide[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [toastVisible, setToastVisible] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formTitlePt, setFormTitlePt] = useState('');
    const [formTitleEs, setFormTitleEs] = useState('');
    const [formIcon, setFormIcon] = useState('HelpCircle');
    const [formContentPt, setFormContentPt] = useState('');
    const [formContentEs, setFormContentEs] = useState('');

    useEffect(() => {
        fetchSupport();
    }, []);

    const fetchSupport = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('support_guides')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSupportItems(data || []);
        } catch (error) {
            console.error('Error fetching support:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = supportItems.filter(item =>
        item.title_pt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.title_es.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 2000);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este guia?')) {
            const oldItems = [...supportItems];
            setSupportItems(prev => prev.filter(i => i.id !== id));

            const { error } = await supabase.from('support_guides').delete().eq('id', id);
            if (error) {
                console.error(error);
                setSupportItems(oldItems);
            }
        }
    };

    const openModal = (item?: SupportGuide) => {
        if (item) {
            setEditingId(item.id);
            setFormTitlePt(item.title_pt);
            setFormTitleEs(item.title_es);
            setFormIcon(item.icon);
            setFormContentPt(item.content_pt);
            setFormContentEs(item.content_es);
        } else {
            setEditingId(null);
            setFormTitlePt('');
            setFormTitleEs('');
            setFormIcon('HelpCircle');
            setFormContentPt('');
            setFormContentEs('');
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) return;

        const itemData = {
            user_id: user.id,
            title_pt: formTitlePt,
            title_es: formTitleEs,
            content_pt: formContentPt,
            content_es: formContentEs,
            icon: formIcon,
            updated_at: new Date().toISOString()
        };

        try {
            if (editingId) {
                const { error } = await supabase.from('support_guides').update(itemData).eq('id', editingId);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('support_guides').insert([itemData]);
                if (error) throw error;
            }
            await fetchSupport();
            setIsModalOpen(false);
        } catch (err) {
            console.error("Error saving support:", err);
        }
    };

    return (
        <div className="h-full flex flex-col max-w-6xl mx-auto">
            {/* Actions Bar */}
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-textMain hidden md:flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <HelpCircle className="text-primary" size={24} />
                    </div>
                    {t('support.title')}
                </h1>
                <div className="flex items-center gap-4 flex-1 md:flex-none justify-end">
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={16} />
                        <Input
                            placeholder={t('search.placeholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Button onClick={() => openModal()}>
                        <Plus size={18} />
                        {t('support.new')}
                    </Button>
                </div>
            </div>

            {/* List Layout - Single Column */}
            <div className="flex flex-col space-y-4 pb-20">
                {loading ? (
                    <div className="flex items-center justify-center py-20 text-textMuted"><Loader2 className="animate-spin mr-2" /> Carregando guias...</div>
                ) : (
                    <>
                        {filteredItems.map(item => (
                            <SupportCard
                                key={item.id}
                                item={item}
                                onCopy={handleCopy}
                                onEdit={openModal}
                                onDelete={handleDelete}
                            />
                        ))}
                    </>
                )}

                {!loading && filteredItems.length === 0 && (
                    <div className="text-center text-textMuted py-10 border border-dashed border-border rounded-xl">
                        Nenhum guia encontrado.
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-6xl bg-surface border-border shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b border-border shrink-0 bg-surfaceHighlight/50">
                            <h3 className="text-xl font-bold text-textMain">{editingId ? t('support.edit') : t('support.new')}</h3>
                            <button onClick={() => setIsModalOpen(false)}><X className="text-textMuted hover:text-textMain" /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-8 space-y-8 overflow-y-auto flex-1 bg-surface">
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <label className="text-xs uppercase font-bold text-textMuted mb-2 block">Título (PT)</label>
                                    <Input value={formTitlePt} onChange={e => setFormTitlePt(e.target.value)} required />
                                </div>
                                <div>
                                    <label className="text-xs uppercase font-bold text-textMuted mb-2 block">Título (ES)</label>
                                    <Input value={formTitleEs} onChange={e => setFormTitleEs(e.target.value)} required />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs uppercase font-bold text-textMuted mb-2 block">Ícone</label>
                                <select
                                    value={formIcon}
                                    onChange={e => setFormIcon(e.target.value)}
                                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-textMain focus:outline-none focus:ring-2 focus:ring-primary/50"
                                >
                                    {iconOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                                <WhatsAppEditor
                                    label="Conteúdo (Português)"
                                    value={formContentPt}
                                    onChange={setFormContentPt}
                                    className="flex-1"
                                />

                                <WhatsAppEditor
                                    label="Conteúdo (Espanhol)"
                                    value={formContentEs}
                                    onChange={setFormContentEs}
                                    className="flex-1"
                                />
                            </div>
                        </form>
                        <div className="p-6 border-t border-border flex justify-end gap-3 shrink-0 bg-surfaceHighlight/30">
                            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>{t('common.cancel')}</Button>
                            <Button type="submit" onClick={(e) => {
                                const form = e.currentTarget.closest('.fixed')?.querySelector('form');
                                form?.requestSubmit();
                            }}>{t('common.save')}</Button>
                        </div>
                    </Card>
                </div>
            )}

            <Toast message={t('common.copied')} visible={toastVisible} />
        </div>
    );
};
export default Support;