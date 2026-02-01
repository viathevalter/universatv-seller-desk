import React, { useState, useEffect } from 'react';
import { useI18n } from '../lib/i18n';
import { Card, Button, Input, Select, Badge, Toast } from '../components/ui/LayoutComponents';
import { Copy, Link as LinkIcon, AlertCircle, CheckCircle, Download } from 'lucide-react';
import { replaceBaseUrl, buildM3U, extractCredentials } from '../utils/urlTools';

const VPS_LIST = [
    'http://sharkvpn.unilafour.xyz',
    'http://sharkvpn.unicrnh.xyz',
    'http://sharkvpn.unilasix.xyz',
    'http://sharkvpn.unilaseven.xyz',
];

const UpdateURL = () => {
    const { t } = useI18n();
    const [activeTab, setActiveTab] = useState<'url' | 'credentials'>('url');
    const [vps, setVps] = useState(VPS_LIST[0]);
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // Tab 1 State
    const [originalUrl, setOriginalUrl] = useState('');
    const [finalUrl, setFinalUrl] = useState('');

    // Tab 2 State
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [outputType, setOutputType] = useState<'ts' | 'm3u8'>('ts');

    // Load VPS from localStorage
    useEffect(() => {
        const savedVps = localStorage.getItem('updateurl_vps');
        if (savedVps && VPS_LIST.includes(savedVps)) {
            setVps(savedVps);
        }
    }, []);

    // Save VPS to localStorage
    const handleVpsChange = (newVps: string) => {
        setVps(newVps);
        localStorage.setItem('updateurl_vps', newVps);
    };

    // Tab 1 Logic
    useEffect(() => {
        if (!originalUrl) {
            setFinalUrl('');
            return;
        }
        const result = replaceBaseUrl(originalUrl, vps);
        if (result) {
            setFinalUrl(result);
        } else {
            setFinalUrl(''); // Invalid URL
        }
    }, [originalUrl, vps]);

    // Sync credentials from URL tab to Credentials tab
    useEffect(() => {
        if (originalUrl) {
            const creds = extractCredentials(originalUrl);
            if (creds) {
                if (creds.username) setUsername(creds.username);
                if (creds.password) setPassword(creds.password);
            }
        }
    }, [originalUrl]);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setToastMessage(t('updateUrl.copied'));
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 2000);
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setOriginalUrl(text);
        } catch {
            alert(t('updateUrl.pasteError'));
        }
    };

    const handleImportCredentials = async () => {
        try {
            const text = await navigator.clipboard.readText();
            const creds = extractCredentials(text);
            if (creds && (creds.username || creds.password)) {
                if (creds.username) setUsername(creds.username);
                if (creds.password) setPassword(creds.password);
                setToastMessage(t('updateUrl.importSuccess'));
                setToastVisible(true);
            } else {
                setToastMessage(t('updateUrl.importError'));
                setToastVisible(true);
            }
            setTimeout(() => setToastVisible(false), 2000);
        } catch {
            setToastMessage(t('updateUrl.pasteError'));
            setToastVisible(true);
            setTimeout(() => setToastVisible(false), 2000);
        }
    };

    // Tab 2 Outputs
    const m3uTs = buildM3U(vps, username, password, 'ts');
    const m3u8 = buildM3U(vps, username, password, 'm3u8');
    const xtreamLines = `Server: ${vps}\nUsername: ${username}\nPassword: ${password}`;
    const accessLines = `Username: ${username}\nPassword: ${password}\nURL: ${vps}`;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-textMain mb-2 flex items-center gap-2">
                    <LinkIcon className="text-primary" /> {t('updateUrl.title')}
                </h1>
                <p className="text-textMuted">{t('updateUrl.subtitle')}</p>
            </div>

            <Card className="p-0 overflow-hidden bg-surface border-border">
                {/* Tabs Header */}
                <div className="flex border-b border-border bg-surfaceHighlight/30">
                    <button
                        onClick={() => setActiveTab('url')}
                        className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'url'
                            ? 'bg-surface text-primary border-t-2 border-primary'
                            : 'text-textMuted hover:text-textMain hover:bg-surfaceHighlight'
                            }`}
                    >
                        {t('updateUrl.tab.url')}
                    </button>
                    <button
                        onClick={() => setActiveTab('credentials')}
                        className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'credentials'
                            ? 'bg-surface text-primary border-t-2 border-primary'
                            : 'text-textMuted hover:text-textMain hover:bg-surfaceHighlight'
                            }`}
                    >
                        {t('updateUrl.tab.credentials')}
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    {/* Common VPS Select */}
                    <div className="w-full md:w-1/2">
                        <label className="block text-xs font-bold text-textMuted uppercase mb-2">{t('updateUrl.vps')}</label>
                        <Select value={vps} onChange={(e) => handleVpsChange(e.target.value)}>
                            {VPS_LIST.map((v) => (
                                <option key={v} value={v}>{v}</option>
                            ))}
                        </Select>
                    </div>

                    {activeTab === 'url' ? (
                        /* TAB 1 CONTENT */
                        <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="block text-xs font-bold text-textMuted uppercase">{t('updateUrl.originalUrl')}</label>
                                    <button onClick={handlePaste} className="text-xs text-primary hover:underline font-bold">{t('updateUrl.paste')}</button>
                                </div>
                                <textarea
                                    value={originalUrl}
                                    onChange={(e) => setOriginalUrl(e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg p-3 text-sm text-textMain focus:ring-2 focus:ring-primary focus:outline-none min-h-[100px] font-mono"
                                    placeholder={t('updateUrl.placeholder')}
                                />
                                {originalUrl && !finalUrl && (
                                    <span className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                        <AlertCircle size={12} /> {t('updateUrl.error')}
                                    </span>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-textMuted uppercase mb-2">{t('updateUrl.finalUrl')}</label>
                                <div className="space-y-4">
                                    <div className="w-full bg-surfaceHighlight/20 border border-border rounded-lg p-4 font-mono text-lg text-textMain break-all min-h-[80px] flex items-center">
                                        {finalUrl || <span className="text-textMuted opacity-50">{t('updateUrl.generating')}</span>}
                                    </div>
                                    <div className="flex gap-4">
                                        <Button
                                            onClick={() => setOriginalUrl('')}
                                            variant="ghost"
                                            className="flex-1 py-6 text-base border border-border"
                                            title={t('updateUrl.clear')}
                                        >
                                            {t('updateUrl.clear')}
                                        </Button>
                                        <Button
                                            onClick={() => handleCopy(finalUrl)}
                                            disabled={!finalUrl}
                                            className="flex-[2] py-6 text-base bg-primary text-white hover:bg-primaryHover disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-lg"
                                        >
                                            <Copy size={20} className="mr-2" /> {t('updateUrl.copyFinal')}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* TAB 2 CONTENT */
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex justify-end">
                                <button onClick={handleImportCredentials} className="text-xs text-primary hover:underline font-bold flex items-center gap-1">
                                    <Download size={14} /> {t('updateUrl.importUrl')}
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-textMuted uppercase mb-2">{t('updateUrl.username')}</label>
                                    <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="Ex: maria25" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-textMuted uppercase mb-2">{t('updateUrl.password')}</label>
                                    <Input value={password} onChange={e => setPassword(e.target.value)} placeholder="Ex: 123456" />
                                </div>
                            </div>

                            <div className="w-full md:w-1/3">
                                <label className="block text-xs font-bold text-textMuted uppercase mb-2">{t('updateUrl.output')}</label>
                                <Select value={outputType} onChange={(e) => setOutputType(e.target.value as any)}>
                                    <option value="ts">ts (arquivo .ts)</option>
                                    <option value="m3u8">m3u8 (HLS)</option>
                                </Select>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-border">
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="text-xs font-bold text-textMuted">M3U (TS)</label>
                                        <Button size="sm" variant="secondary" onClick={() => handleCopy(m3uTs)}><Copy size={12} className="mr-1" /> {t('updateUrl.copyM3uTs')}</Button>
                                    </div>
                                    <div className="bg-background p-3 rounded border border-border font-mono text-xs text-textMuted break-all">{m3uTs}</div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="text-xs font-bold text-textMuted">M3U (M3U8)</label>
                                        <Button size="sm" variant="secondary" onClick={() => handleCopy(m3u8)}><Copy size={12} className="mr-1" /> {t('updateUrl.copyM3u8')}</Button>
                                    </div>
                                    <div className="bg-background p-3 rounded border border-border font-mono text-xs text-textMuted break-all">{m3u8}</div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="text-xs font-bold text-textMuted">{t('updateUrl.accessData')}</label>
                                        <Button size="sm" variant="secondary" onClick={() => handleCopy(accessLines)} className="bg-primary/20 text-primary border-primary/20 hover:bg-primary/30"><Copy size={12} className="mr-1" /> {t('updateUrl.copyAccess')}</Button>
                                    </div>
                                    <pre className="bg-background p-3 rounded border border-border font-mono text-xs text-textMuted whitespace-pre-wrap">{accessLines}</pre>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="text-xs font-bold text-textMuted">{t('updateUrl.xtream')}</label>
                                        <Button size="sm" variant="secondary" onClick={() => handleCopy(xtreamLines)}><Copy size={12} className="mr-1" /> {t('updateUrl.copyXtream')}</Button>
                                    </div>
                                    <pre className="bg-background p-3 rounded border border-border font-mono text-xs text-textMuted whitespace-pre-wrap">{xtreamLines}</pre>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            <Toast message={toastMessage} visible={toastVisible} />
        </div>
    );
};

export default UpdateURL;
