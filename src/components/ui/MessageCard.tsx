import React, { useState } from 'react';
import { Message } from '../../types';
import { Edit2, Trash2 } from 'lucide-react';

interface MessageCardProps {
  msg: Message;
  onCopyPt: (text: string) => void;
  onCopyEs: (text: string) => void;
  onEdit: (msg: Message) => void;
  onDelete: (id: string) => void;
}

export const MessageCard: React.FC<MessageCardProps> = ({ msg, onCopyPt, onCopyEs, onEdit, onDelete }) => {
  // Local state to track which language is currently visible on this card
  // Defaults to PT, but switches when user clicks a copy button
  const [previewLang, setPreviewLang] = useState<'pt' | 'es'>('pt');

  const handleCopyPt = () => {
    setPreviewLang('pt');
    onCopyPt(msg.content_pt);
  };

  const handleCopyEs = () => {
    setPreviewLang('es');
    onCopyEs(msg.content_es);
  };

  return (
    <div className="bg-surface rounded-xl p-5 border border-border relative hover:border-primary/40 transition-colors shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-lg font-bold text-textMain tracking-tight">{msg.title}</h3>
          <div className="flex gap-2">
            {msg.tags.map(tag => (
              <span key={tag} className="bg-[#3A2216] text-primary text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-[#5A321E]">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="flex gap-2 text-textMuted">
          <button onClick={() => onEdit(msg)} className="hover:text-textMain transition-colors p-1"><Edit2 size={16} /></button>
          <button onClick={() => onDelete(msg.id)} className="hover:text-red-400 transition-colors p-1"><Trash2 size={16} /></button>
        </div>
      </div>

      <div className="bg-background p-4 rounded-lg text-textMuted font-mono text-sm mb-5 leading-relaxed border border-border/50 min-h-[80px]">
        {previewLang === 'pt' ? msg.content_pt : msg.content_es}
      </div>

      <div className="flex justify-end gap-3">
        <button 
            onClick={handleCopyPt}
            className={`flex items-center gap-2 bg-[#111318] border rounded-lg px-4 py-2 transition-colors group ${previewLang === 'pt' ? 'border-green-900 ring-1 ring-green-900/50' : 'border-border hover:border-green-900'}`}
        >
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${previewLang === 'pt' ? 'bg-green-500 text-black border-green-500' : 'bg-green-900/30 text-green-500 border-green-900/50'}`}>PT</span>
          <span className={`text-sm font-medium transition-colors ${previewLang === 'pt' ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>Copiar Português</span>
        </button>
        
        <button 
            onClick={handleCopyEs}
            className={`flex items-center gap-2 bg-[#111318] border rounded-lg px-4 py-2 transition-colors group ${previewLang === 'es' ? 'border-primary ring-1 ring-primary/50' : 'border-border hover:border-primary/30'}`}
        >
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${previewLang === 'es' ? 'bg-primary text-white border-primary' : 'bg-primary/10 text-primary border-primary/30'}`}>ES</span>
          <span className={`text-sm font-medium transition-colors ${previewLang === 'es' ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>Copiar Español</span>
        </button>
      </div>
    </div>
  );
};