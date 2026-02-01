import React, { useState, useEffect } from 'react';
import { useI18n } from '../lib/i18n';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Message } from '../types';
import { Card, Button, Input, Toast } from '../components/ui/LayoutComponents';
import { WhatsAppEditor } from '../components/ui/WhatsAppEditor';
import { Plus, Search, X, CreditCard } from 'lucide-react';
import { MessageCard } from '../components/ui/MessageCard';

const Payments = () => {
  const { t } = useI18n();
  const { user } = useAuth();

  // Filter ONLY payments
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formContentPt, setFormContentPt] = useState('');
  const [formContentEs, setFormContentEs] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clipboard_messages')
        .select('*')
        .eq('category', 'Pagamentos')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching payments", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = messages.filter(msg =>
    msg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  const handleDelete = async (id: string) => {
    // Optimistic
    const oldMessages = [...messages];
    setMessages(prev => prev.filter(m => m.id !== id));

    const { error } = await supabase.from('clipboard_messages').delete().eq('id', id);
    if (error) {
      setMessages(oldMessages);
      console.error("Error deleting", error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const messageData = {
      user_id: user.id,
      title: formTitle,
      category: 'Pagamentos',
      tags: formTags.split(',').map(t => t.trim()).filter(Boolean),
      content_pt: formContentPt,
      content_es: formContentEs,
      updated_at: new Date().toISOString()
    };

    try {
      if (editingId) {
        const { error } = await supabase.from('clipboard_messages').update(messageData).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('clipboard_messages').insert([messageData]);
        if (error) throw error;
      }
      await fetchPayments();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving payment", error);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormTitle('');
    setFormTags('Pagamento');
    setFormContentPt('');
    setFormContentEs('');
  };

  const openModal = (msg?: Message) => {
    if (msg) {
      setEditingId(msg.id);
      setFormTitle(msg.title);
      setFormTags(msg.tags ? msg.tags.join(', ') : '');
      setFormContentPt(msg.content_pt);
      setFormContentEs(msg.content_es);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  return (
    <div className="h-full flex flex-col max-w-6xl mx-auto">
      {/* Actions Bar */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-textMain hidden md:flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <CreditCard className="text-primary" size={24} />
          </div>
          {t('msgs.title_payments')}
        </h1>
        <div className="flex items-center gap-4 flex-1 md:flex-none justify-end">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={16} />
            <Input
              placeholder="Buscar chaves pix, scripts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10"
            />
          </div>
          <Button onClick={() => openModal()}>
            <Plus size={18} />
            {t('msgs.new')}
          </Button>
        </div>
      </div>

      {/* List Layout - Single Column */}
      <div className="flex flex-col space-y-4 pb-20">
        {loading ? (
          <div className="text-center py-10 text-textMuted animate-pulse">Carregando pagamentos...</div>
        ) : (
          <>
            {filteredMessages.map((msg) => (
              <MessageCard
                key={msg.id}
                msg={msg}
                onCopyPt={handleCopy}
                onCopyEs={handleCopy}
                onEdit={openModal}
                onDelete={handleDelete}
              />
            ))}
          </>
        )}

        {!loading && filteredMessages.length === 0 && (
          <div className="text-center text-textMuted py-10 border border-dashed border-border rounded-xl">
            Nenhum script de pagamento encontrado.
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-6xl bg-surface border-border shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-border shrink-0 bg-surfaceHighlight/50">
              <h3 className="text-xl font-bold text-textMain">{editingId ? 'Editar Pagamento' : t('msgs.new')}</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="text-textMuted hover:text-textMain" /></button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-8 overflow-y-auto flex-1 bg-surface">
              <div>
                <label className="text-xs uppercase font-bold text-textMuted mb-2 block">Título</label>
                <Input value={formTitle} onChange={e => setFormTitle(e.target.value)} required />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="text-xs uppercase font-bold text-textMuted mb-2 block">Categoria</label>
                  <Input value="Pagamentos" readOnly className="bg-surfaceHighlight" />
                </div>
                <div>
                  <label className="text-xs uppercase font-bold text-textMuted mb-2 block">Tags (Separar por vírgula)</label>
                  <Input value={formTags} onChange={e => setFormTags(e.target.value)} placeholder="Pix, Cartão, Banco..." />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                <WhatsAppEditor
                  label="Conteúdo (Português)"
                  value={formContentPt}
                  onChange={setFormContentPt}
                  placeholder="Chave Pix, dados bancários..."
                  className="flex-1"
                />

                <WhatsAppEditor
                  label="Conteúdo (Espanhol)"
                  value={formContentEs}
                  onChange={setFormContentEs}
                  placeholder="Datos bancarios..."
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

export default Payments;