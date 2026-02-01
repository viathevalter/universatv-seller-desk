import React, { useState } from 'react';
import { useI18n } from '../lib/i18n';
import { Card, Button, Input, Textarea } from '../components/ui/LayoutComponents';
import { UploadCloud, Save, Users, Layers } from 'lucide-react';
import { UserManagement } from '../components/admin/UserManagement';

const Admin = () => {
    const { t } = useI18n();
    const [activeTab, setActiveTab] = useState<'apps' | 'users'>('apps');

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-textMain mb-6">{t('admin.title')}</h2>

            <div className="flex gap-4 mb-6 border-b border-border">
                <button
                    onClick={() => setActiveTab('apps')}
                    className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'apps'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-textMuted hover:text-textMain'
                        }`}
                >
                    <Layers size={18} /> {t('admin.tab.apps')}
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'users'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-textMuted hover:text-textMain'
                        }`}
                >
                    <Users size={18} /> {t('admin.tab.users')}
                </button>
            </div>

            {activeTab === 'apps' ? (
                <Card className="p-8 animate-in fade-in slide-in-from-left-4 duration-300">
                    <div className="flex items-center gap-4 mb-8 border-b border-border pb-4">
                        <Button variant="primary">Novo App</Button>
                        <Button variant="ghost">Gerenciar Mensagens</Button>
                        <Button variant="ghost">Gerenciar Suporte</Button>
                    </div>

                    <h3 className="text-lg font-bold text-textMain mb-4">Cadastro de App</h3>
                    <form className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-textMuted mb-2">Nome do App</label>
                                <Input placeholder="Ex: DreamTV" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-textMuted mb-2">Link da Loja</label>
                                <Input placeholder="https://..." />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-textMuted mb-2">Plataformas (separar por vírgula)</label>
                            <Input placeholder="Android TV, Fire TV, TV Box..." />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-textMuted mb-2">Instruções (PT)</label>
                                <Textarea className="h-32" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-textMuted mb-2">Instrucciones (ES)</label>
                                <Textarea className="h-32" />
                            </div>
                        </div>

                        <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-textMuted hover:border-primary hover:bg-surfaceHighlight transition-colors cursor-pointer">
                            <UploadCloud size={32} className="mb-2" />
                            <span className="text-sm">Upload Imagem Principal</span>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="ghost" type="button">{t('common.cancel')}</Button>
                            <Button variant="primary" type="button"><Save size={18} /> {t('common.save')}</Button>
                        </div>
                    </form>
                </Card>
            ) : (
                <UserManagement />
            )}
        </div>
    );
};

export default Admin;