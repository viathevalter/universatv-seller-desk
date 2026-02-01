import React, { useEffect, useState } from 'react';
import { Card, Button, Input, Select, Badge, Toast } from '../ui/LayoutComponents';
import { useI18n } from '../../lib/i18n';
import { supabase } from '../../lib/supabase';
import { UserPlus, Search, Shield, User, Trash2 } from 'lucide-react';

interface Profile {
    id: string;
    name: string;
    role: string;
    created_at: string;
    email?: string; // Often simulated or joined
}

export const UserManagement = () => {
    const { t } = useI18n();
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // New User State
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState('seller');

    const [toastMessage, setToastMessage] = useState('');
    const [toastVisible, setToastVisible] = useState(false);

    const fetchProfiles = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (data) setProfiles(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchProfiles();
    }, []);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const { data, error } = await supabase.functions.invoke('invite-user', {
                body: {
                    email: newEmail,
                    password: newPassword,
                    name: newName,
                    role: newRole
                }
            });

            if (error) throw new Error(error.message || 'Error executing function');
            if (data?.error) throw new Error(data.error);

            setToastMessage(t('admin.users.createSuccess'));
            setToastVisible(true);

            // Refresh list
            fetchProfiles();

            setIsCreating(false);
            setNewName('');
            setNewEmail('');
            setNewPassword('');
        } catch (err: any) {
            setToastMessage(t('common.error') + ': ' + err.message);
            setToastVisible(true);
        }

        setTimeout(() => setToastVisible(false), 3000);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-textMain">{t('admin.users.title')}</h3>
                <Button onClick={() => setIsCreating(!isCreating)} variant="primary">
                    <UserPlus size={18} className="mr-2" /> {t('admin.users.add')}
                </Button>
            </div>

            {isCreating && (
                <Card className="p-6 bg-surfaceHighlight/10 border-primary/20">
                    <h4 className="font-bold text-lg mb-4">{t('admin.users.newTitle')}</h4>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-textMuted uppercase mb-2">{t('admin.users.name')}</label>
                                <Input required value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex: João Silva" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-textMuted uppercase mb-2">{t('admin.users.email')}</label>
                                <Input required type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="Ex: joao@universatv.com" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-textMuted uppercase mb-2">{t('login.password')}</label>
                            <Input required type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="*******" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-textMuted uppercase mb-2">{t('admin.users.role')}</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="role" value="seller" checked={newRole === 'seller'} onChange={e => setNewRole(e.target.value)} className="accent-primary" />
                                    <span className="text-sm">Vendedor</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="role" value="admin" checked={newRole === 'admin'} onChange={e => setNewRole(e.target.value)} className="accent-primary" />
                                    <span className="text-sm">Admin</span>
                                </label>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>{t('common.cancel')}</Button>
                            <Button type="submit" variant="primary">{t('admin.users.sendInvite')}</Button>
                        </div>
                    </form>
                </Card>
            )}

            <Card className="p-0 overflow-hidden">
                <div className="p-4 border-b border-border bg-surfaceHighlight/20 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={16} />
                        <input className="w-full bg-background border border-border rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder={t('admin.users.search')} />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-surfaceHighlight/50 border-b border-border">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-bold text-textMuted uppercase">{t('admin.users.colName')}</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-textMuted uppercase">{t('admin.users.colRole')}</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-textMuted uppercase">{t('admin.users.colDate')}</th>
                                <th className="text-right px-6 py-4 text-xs font-bold text-textMuted uppercase">{t('admin.users.colActions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {profiles.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-textMuted">
                                        {t('admin.users.empty')}
                                    </td>
                                </tr>
                            )}
                            {profiles.map(profile => (
                                <tr key={profile.id} className="hover:bg-surfaceHighlight/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                                <User size={14} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-textMain">{profile.name || 'Sem Nome'}</p>
                                                <p className="text-xs text-textMuted">{profile.email || `id: ${profile.id.slice(0, 8)}...`}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge className={profile.role === 'admin' ? 'bg-purple-900/20 text-purple-400 border-purple-500/30' : 'bg-green-900/20 text-green-400 border-green-500/30'}>
                                            {profile.role === 'admin' ? <Shield size={10} className="mr-1 inline" /> : null}
                                            {profile.role?.toUpperCase()}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-textMuted">
                                        {new Date(profile.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-textMuted hover:text-red-400 transition-colors" title="Excluir">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Toast message={toastMessage} visible={toastVisible} />
        </div>
    );
};
