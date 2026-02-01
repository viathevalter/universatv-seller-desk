import React from 'react';
import { useI18n } from '../lib/i18n';
import { Card, Button, Input, Textarea } from '../components/ui/LayoutComponents';
import { UploadCloud, Save } from 'lucide-react';

const Admin = () => {
  const { t } = useI18n();

  return (
    <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-textMain mb-6">{t('admin.title')}</h2>
        
        <Card className="p-8">
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
    </div>
  );
};

export default Admin;