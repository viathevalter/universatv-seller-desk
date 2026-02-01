import React, { useState, useRef } from 'react';
import { Bold, Italic, Strikethrough, Code, List, Eye, Edit3 } from 'lucide-react';

interface WhatsAppEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}

export const WhatsAppEditor: React.FC<WhatsAppEditorProps> = ({ 
  value, 
  onChange, 
  placeholder, 
  className = '',
  label
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isPreview, setIsPreview] = useState(false);

  const insertFormat = (symbol: string, wrap: boolean = true) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);

    let newText = '';
    let newCursorPos = 0;

    if (wrap) {
      // Logic for wrapping (Bold, Italic, Strike)
      newText = `${before}${symbol}${selection}${symbol}${after}`;
      newCursorPos = selection.length > 0 ? end + (symbol.length * 2) : start + symbol.length;
    } else {
      // Logic for prefix (List)
      newText = `${before}\n${symbol} ${selection}${after}`;
      newCursorPos = end + symbol.length + 2;
    }

    onChange(newText);
    
    // Restore cursor / focus
    setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Simple parser to visualize WhatsApp formatting
  const renderPreview = (text: string) => {
    if (!text) return <span className="text-textMuted italic">Visualização vazia...</span>;

    let html = text
      // Escape HTML
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      // Bold *text*
      .replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
      // Italic _text_
      .replace(/_([^_]+)_/g, '<em>$1</em>')
      // Strike ~text~
      .replace(/~([^~]+)~/g, '<strike>$1</strike>')
      // Monospace ```text```
      .replace(/```([^`]+)```/g, '<code class="bg-surfaceHighlight border border-border px-1 rounded font-mono text-sm">$1</code>')
      // Line breaks
      .replace(/\n/g, '<br/>');

    return <div dangerouslySetInnerHTML={{ __html: html }} className="whitespace-pre-wrap leading-relaxed" />;
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && <label className="text-xs uppercase font-bold text-textMuted">{label}</label>}
      
      <div className="bg-background border border-border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary/50 transition-all">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-2 py-2 bg-surfaceHighlight border-b border-border">
          <div className="flex items-center gap-1">
            <button 
              type="button"
              onClick={() => insertFormat('*')} 
              className="p-1.5 text-textMuted hover:text-textMain hover:bg-surface rounded transition-colors" 
              title="Negrito (*)"
            >
              <Bold size={16} />
            </button>
            <button 
              type="button"
              onClick={() => insertFormat('_')} 
              className="p-1.5 text-textMuted hover:text-textMain hover:bg-surface rounded transition-colors" 
              title="Itálico (_)"
            >
              <Italic size={16} />
            </button>
            <button 
              type="button"
              onClick={() => insertFormat('~')} 
              className="p-1.5 text-textMuted hover:text-textMain hover:bg-surface rounded transition-colors" 
              title="Riscado (~)"
            >
              <Strikethrough size={16} />
            </button>
            <button 
              type="button"
              onClick={() => insertFormat('```')} 
              className="p-1.5 text-textMuted hover:text-textMain hover:bg-surface rounded transition-colors" 
              title="Código (```)"
            >
              <Code size={16} />
            </button>
            <div className="w-[1px] h-4 bg-border mx-1" />
            <button 
              type="button"
              onClick={() => insertFormat('-', false)} 
              className="p-1.5 text-textMuted hover:text-textMain hover:bg-surface rounded transition-colors" 
              title="Lista (- )"
            >
              <List size={16} />
            </button>
          </div>

          {/* Preview Toggle */}
          <div className="flex bg-surface rounded-md p-0.5 border border-border">
             <button
                type="button" 
                onClick={() => setIsPreview(false)}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors flex items-center gap-2 ${!isPreview ? 'bg-primary text-white shadow-sm' : 'text-textMuted hover:text-textMain'}`}
             >
                <Edit3 size={12} /> Editor
             </button>
             <button
                type="button" 
                onClick={() => setIsPreview(true)}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors flex items-center gap-2 ${isPreview ? 'bg-primary text-white shadow-sm' : 'text-textMuted hover:text-textMain'}`}
             >
                <Eye size={12} /> Visualizar
             </button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="relative min-h-[250px] bg-background">
            {isPreview ? (
                <div className="w-full h-full p-4 text-sm text-textMain font-sans overflow-y-auto max-h-[400px]">
                    {renderPreview(value)}
                </div>
            ) : (
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full h-full min-h-[250px] p-4 bg-transparent text-textMain placeholder-textMuted focus:outline-none font-mono text-sm leading-relaxed resize-y"
                    style={{ minHeight: '250px' }}
                />
            )}
        </div>
        <div className="px-3 py-1 bg-surfaceHighlight border-t border-border text-[10px] text-textMuted flex justify-between">
            <span>Use a barra acima para formatar</span>
            <span>{value?.length || 0} caracteres</span>
        </div>
      </div>
    </div>
  );
};
