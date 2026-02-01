import React, { useState, useRef, useEffect } from 'react';
import { useI18n } from '../lib/i18n';
import { Card, Button, Badge, Toast } from '../components/ui/LayoutComponents';
import { Sparkles, Copy, RefreshCw, Trash2, ClipboardPaste, ArrowRightLeft, History, FilePlus2, AlertTriangle } from 'lucide-react';
import { TranslationHistoryItem } from '../types';
import { GoogleGenAI, Type, Schema } from "@google/genai";

type TranslationMode = 'dual' | 'translate_pt' | 'reply_es' | 'reply_pt';

// Initialize Gemini Client
// Initialize Gemini Client safely
// This prevents the app from crashing if the key is missing at startup
const getAiClient = () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
};

const Translator = () => {
    const { t } = useI18n();
    const [inputText, setInputText] = useState('');
    const [outputPt, setOutputPt] = useState('');
    const [outputEs, setOutputEs] = useState('');
    const [detectedLang, setDetectedLang] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [mode, setMode] = useState<TranslationMode>('dual');
    const [activeOutputTab, setActiveOutputTab] = useState<'pt' | 'es'>('pt');
    const [toastVisible, setToastVisible] = useState(false);

    // Load history from localStorage on mount
    const [history, setHistory] = useState<TranslationHistoryItem[]>(() => {
        const saved = localStorage.getItem('universatv_translator_history');
        return saved ? JSON.parse(saved) : [];
    });

    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Save history to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('universatv_translator_history', JSON.stringify(history));
    }, [history]);

    const handleCopy = (text: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 2000);
    };

    const handleClear = () => {
        setInputText('');
        setOutputPt('');
        setOutputEs('');
        setDetectedLang(null);
        setError(null);
        inputRef.current?.focus();
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setInputText(text);
        } catch (err) {
            console.error('Failed to read clipboard', err);
        }
    };

    const generateResponse = async () => {
        if (!inputText.trim()) return;
        if (!process.env.API_KEY) {
            setError("API Key não configurada (process.env.API_KEY).");
            return;
        }

        setIsLoading(true);
        setError(null);
        setOutputPt('');
        setOutputEs('');

        try {
            // 1. Define the System Instruction based on the selected Mode
            let systemContext = `Você é um 'Agente Tradutor' especializado para vendedores de IPTV da UniversaTV.
        Contexto: O vendedor usa este painel para falar com clientes em Português (PT) e Espanhol (ES).
        Tom: Profissional, amigável, direto e curto. Mantenha emojis se existirem.
        Nunca invente preços ou canais que não estão no texto original.
        
        Regras de Saída:
        Retorne SEMPRE um JSON com as chaves: "pt", "es", "detectedLanguage".
        `;

            let specificInstruction = "";

            switch (mode) {
                case 'dual':
                    specificInstruction = `
                Tarefa: Tradução Fiel.
                - Se a entrada for PT, traduza para ES. O campo 'pt' deve ser a cópia da entrada (melhorada se necessário).
                - Se a entrada for ES, traduza para PT. O campo 'es' deve ser a cópia da entrada (melhorada se necessário).
                - O objetivo é ter o mesmo texto nas duas línguas.`;
                    break;
                case 'translate_pt':
                    specificInstruction = `
                Tarefa: Entendimento.
                - O objetivo é o vendedor brasileiro entender o que o cliente disse.
                - Campo 'pt': A tradução do que o cliente disse.
                - Campo 'es': Deixe vazio ou coloque o original.`;
                    break;
                case 'reply_es':
                    specificInstruction = `
                Tarefa: Gerar Resposta em Espanhol.
                - A entrada é uma mensagem de um cliente (em qualquer língua) ou um comando do vendedor.
                - Gere uma RESPOSTA comercial em ESPANHOL adequada para enviar ao cliente.
                - Campo 'pt': Uma explicação breve do que está sendo respondido (para o vendedor saber).
                - Campo 'es': A resposta pronta para copiar e enviar.`;
                    break;
                case 'reply_pt':
                    specificInstruction = `
                Tarefa: Gerar Resposta em Português.
                - A entrada é uma mensagem de um cliente.
                - Gere uma RESPOSTA comercial em PORTUGUÊS adequada.
                - Campo 'pt': A resposta pronta para copiar.
                - Campo 'es': Uma tradução dessa resposta (opcional).`;
                    break;
            }

            // 2. Define the JSON Schema for structured output
            const responseSchema: Schema = {
                type: Type.OBJECT,
                properties: {
                    pt: { type: Type.STRING, description: "Texto em Português" },
                    es: { type: Type.STRING, description: "Texto em Espanhol" },
                    detectedLanguage: { type: Type.STRING, description: "Idioma detectado na entrada (PT, ES, ou OUTRO)" },
                },
                required: ["pt", "es", "detectedLanguage"],
            };

            // 3. Call Gemini
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-latest',
                contents: {
                    role: 'user',
                    parts: [{ text: `Input: "${inputText}"` }]
                },
                config: {
                    systemInstruction: systemContext + specificInstruction,
                    responseMimeType: "application/json",
                    responseSchema: responseSchema,
                    temperature: 0.3, // Low temperature for more consistent/factual translations
                }
            });

            // 4. Parse Response
            const jsonText = response.text;
            if (!jsonText) throw new Error("Resposta vazia da IA");

            const result = JSON.parse(jsonText);

            // 5. Update UI
            setOutputPt(result.pt || "");
            setOutputEs(result.es || "");
            setDetectedLang(result.detectedLanguage || null);

            // Auto-switch tab based on mode
            if (mode === 'reply_es') setActiveOutputTab('es');
            if (mode === 'reply_pt') setActiveOutputTab('pt');

            // 6. Save to History
            const newHistoryItem: TranslationHistoryItem = {
                id: Date.now().toString(),
                input: inputText,
                output_pt: result.pt || "",
                output_es: result.es || "",
                mode: mode,
                timestamp: new Date()
            };
            setHistory(prev => [newHistoryItem, ...prev].slice(0, 10)); // Keep last 10 items

        } catch (err) {
            console.error("Erro na tradução:", err);
            setError("Falha ao processar. Verifique sua conexão ou a chave de API.");
        } finally {
            setIsLoading(false);
        }
    };

    const restoreHistory = (item: TranslationHistoryItem) => {
        setInputText(item.input);
        setOutputPt(item.output_pt);
        setOutputEs(item.output_es);
        setMode(item.mode);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="h-full flex flex-col max-w-7xl mx-auto gap-6">

            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-surface p-6 rounded-xl border border-border shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-textMain flex items-center gap-2">
                        <Sparkles className="text-primary" size={24} />
                        {t('trans.title')}
                    </h1>
                    <p className="text-textMuted text-sm mt-1">{t('trans.subtitle')}</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative group w-full md:w-64">
                        <select
                            value={mode}
                            onChange={(e) => setMode(e.target.value as TranslationMode)}
                            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-textMain appearance-none focus:ring-2 focus:ring-primary/50 cursor-pointer text-sm font-medium"
                        >
                            <option value="dual">{t('trans.mode.dual')}</option>
                            <option value="translate_pt">{t('trans.mode.translate_pt')}</option>
                            <option value="reply_es">{t('trans.mode.reply_es')}</option>
                            <option value="reply_pt">{t('trans.mode.reply_pt')}</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-textMuted">
                            <ArrowRightLeft size={14} />
                        </div>
                    </div>

                    <Button
                        onClick={generateResponse}
                        disabled={isLoading || !inputText}
                        className={`py-2.5 px-6 font-bold shadow-orange-900/20 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? (
                            <RefreshCw className="animate-spin" size={20} />
                        ) : (
                            <Sparkles size={18} />
                        )}
                        <span className="hidden md:inline">{t('trans.generate')}</span>
                    </Button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-900/20 border border-red-900/50 text-red-200 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertTriangle size={18} />
                    <span className="text-sm">{error}</span>
                </div>
            )}

            {/* Main Content: Split View */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">

                {/* Left: Input */}
                <Card className="flex flex-col overflow-hidden border-primary/20 shadow-lg">
                    <div className="p-3 bg-surfaceHighlight border-b border-border flex justify-between items-center">
                        <span className="text-xs font-bold text-textMuted uppercase tracking-wider pl-2">Entrada</span>
                        <div className="flex gap-2">
                            {detectedLang && (
                                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 animate-in fade-in">
                                    Detectado: {detectedLang}
                                </Badge>
                            )}
                            <button onClick={handlePaste} className="p-1.5 text-textMuted hover:text-textMain hover:bg-surface rounded transition-colors" title={t('trans.paste')}>
                                <ClipboardPaste size={16} />
                            </button>
                            <button onClick={handleClear} className="p-1.5 text-textMuted hover:text-red-400 hover:bg-surface rounded transition-colors" title={t('trans.clear')}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                    <textarea
                        ref={inputRef}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={t('trans.input_placeholder')}
                        className="flex-1 w-full bg-background/50 p-6 text-base resize-none focus:outline-none focus:bg-background transition-colors font-mono leading-relaxed text-textMain"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.ctrlKey) {
                                generateResponse();
                            }
                        }}
                    />
                    <div className="px-4 py-2 text-[10px] text-textMuted border-t border-border bg-surfaceHighlight/30 text-right">
                        Ctrl + Enter para gerar
                    </div>
                </Card>

                {/* Right: Output */}
                <Card className="flex flex-col overflow-hidden bg-surfaceHighlight/30">
                    {/* Tabs */}
                    <div className="flex border-b border-border bg-surface">
                        <button
                            onClick={() => setActiveOutputTab('pt')}
                            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeOutputTab === 'pt' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-textMuted hover:text-textMain hover:bg-surfaceHighlight'}`}
                        >
                            PORTUGUÊS
                        </button>
                        <button
                            onClick={() => setActiveOutputTab('es')}
                            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeOutputTab === 'es' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-textMuted hover:text-textMain hover:bg-surfaceHighlight'}`}
                        >
                            ESPAÑOL
                        </button>
                    </div>

                    <div className="flex-1 relative group">
                        {isLoading ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-textMuted animate-pulse bg-surface/50 backdrop-blur-sm z-10">
                                <Sparkles className="text-primary animate-bounce" size={32} />
                                <span className="text-sm font-medium">IA Pensando...</span>
                            </div>
                        ) : null}

                        <div className="p-6 h-full font-mono text-base leading-relaxed whitespace-pre-wrap text-textMain overflow-y-auto">
                            {activeOutputTab === 'pt' ? outputPt : outputEs}
                            {((activeOutputTab === 'pt' && !outputPt) || (activeOutputTab === 'es' && !outputEs)) && !isLoading && (
                                <div className="flex flex-col items-center justify-center h-full text-textMuted opacity-30 gap-2">
                                    <ArrowRightLeft size={32} />
                                    <span className="italic select-none">O resultado aparecerá aqui...</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Output Actions */}
                    <div className="p-4 border-t border-border bg-surface flex justify-end gap-3">
                        <Button variant="ghost" className="text-xs" onClick={() => setToastVisible(true)}>
                            <FilePlus2 size={16} /> {t('trans.add_draft')}
                        </Button>
                        <Button
                            variant="primary"
                            className="w-full md:w-auto"
                            onClick={() => handleCopy(activeOutputTab === 'pt' ? outputPt : outputEs)}
                            disabled={(!outputPt && activeOutputTab === 'pt') || (!outputEs && activeOutputTab === 'es')}
                        >
                            <Copy size={18} /> {t('msgs.copy')}
                        </Button>
                    </div>
                </Card>
            </div>

            {/* History Section */}
            {history.length > 0 && (
                <div className="flex flex-col gap-4 pb-10">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-textMuted uppercase flex items-center gap-2 px-1">
                            <History size={16} /> {t('trans.history')}
                        </h3>
                        <button onClick={() => setHistory([])} className="text-xs text-textMuted hover:text-red-400">Limpar Histórico</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {history.map((item) => (
                            <div key={item.id} className="bg-surface border border-border rounded-lg p-4 hover:border-primary/50 transition-colors group flex flex-col h-full">
                                <div className="flex justify-between items-start mb-2">
                                    <Badge className="text-[10px] py-0 h-5 bg-surfaceHighlight text-textMuted">{new Date(item.timestamp).toLocaleTimeString()}</Badge>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => restoreHistory(item)} className="p-1 hover:text-primary" title="Reutilizar"><RefreshCw size={14} /></button>
                                    </div>
                                </div>
                                <p className="text-xs text-textMuted line-clamp-2 mb-3 italic flex-1">"{item.input}"</p>
                                <div className="flex gap-2 mt-auto pt-2 border-t border-border/30">
                                    {item.output_pt && (
                                        <button
                                            onClick={() => handleCopy(item.output_pt)}
                                            className="flex-1 bg-surfaceHighlight border border-border rounded px-2 py-1.5 text-[10px] font-bold text-center hover:bg-primary hover:text-white hover:border-primary transition-colors truncate uppercase"
                                        >
                                            PT
                                        </button>
                                    )}
                                    {item.output_es && (
                                        <button
                                            onClick={() => handleCopy(item.output_es)}
                                            className="flex-1 bg-surfaceHighlight border border-border rounded px-2 py-1.5 text-[10px] font-bold text-center hover:bg-primary hover:text-white hover:border-primary transition-colors truncate uppercase"
                                        >
                                            ES
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <Toast message={t('common.copied')} visible={toastVisible} />
        </div>
    );
};

export default Translator;