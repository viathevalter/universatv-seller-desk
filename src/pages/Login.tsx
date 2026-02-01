import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tv, ArrowRight, Loader2 } from 'lucide-react';
import { useI18n } from '../lib/i18n';
import { Button, Input, Toast } from '../components/ui/LayoutComponents';
import { supabase } from '../lib/supabase';

const Login = () => {
  const { t, setLanguage, language } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      navigate('/app');
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[120px]"></div>

      <div className="absolute top-6 right-6 z-20">
        <div className="flex bg-surfaceHighlight rounded-lg p-1 border border-border">
          <button onClick={() => setLanguage('pt')} className={`px-3 py-1 rounded text-xs font-bold ${language === 'pt' ? 'bg-primary text-white' : 'text-textMuted'}`}>PT</button>
          <button onClick={() => setLanguage('es')} className={`px-3 py-1 rounded text-xs font-bold ${language === 'es' ? 'bg-primary text-white' : 'text-textMuted'}`}>ES</button>
        </div>
      </div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-orange-600 rounded-2xl shadow-2xl shadow-primary/30 mb-6">
            <Tv className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">UniversaTV</h1>
          <p className="text-textMuted">Seller Desk & Support Center</p>
        </div>

        <div className="bg-surface border border-border p-8 rounded-2xl shadow-2xl">
          <h2 className="text-xl font-semibold mb-6 text-white">{t('login.title')}</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-textMuted mb-1.5">{t('login.email')}</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seller@universatv.com"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-textMuted mb-1.5">{t('login.password')}</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-900/20 border border-red-500/50 rounded text-red-200 text-sm">{error}</div>
            )}

            <Button type="submit" className="w-full mt-6 py-3 text-base" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={20} /> : <>{t('login.button')} <ArrowRight size={18} /></>}
            </Button>


          </form>
        </div>

        <p className="text-center text-xs text-textMuted mt-8">
          &copy; 2024 UniversaTV Entertainment. Internal Use Only.
        </p>
      </div>
      <Toast message={error} visible={!!error} />
    </div>
  );
};

export default Login;
