import React from 'react';
import { Card } from '../components/ui/LayoutComponents';
import { BarChart3, Users, MessageSquare, ArrowUpRight } from 'lucide-react';
import { useI18n } from '../lib/i18n';

const StatCard = ({ label, value, icon: Icon, trend }: any) => (
  <Card className="p-6 hover:border-primary/50 transition-colors">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-textMuted font-medium mb-1">{label}</p>
        <h3 className="text-3xl font-bold text-textMain">{value}</h3>
      </div>
      <div className="p-3 bg-surfaceHighlight rounded-lg">
        <Icon className="text-primary" size={24} />
      </div>
    </div>
    <div className="mt-4 flex items-center text-xs text-green-400 font-medium">
      <ArrowUpRight size={14} className="mr-1" />
      {trend}
    </div>
  </Card>
);

const Dashboard = () => {
    const { t } = useI18n();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Vendas Hoje" value="12" icon={BarChart3} trend="+15% vs ontem" />
        <StatCard label="Atendimentos" value="34" icon={Users} trend="+5% vs ontem" />
        <StatCard label="Mensagens Copiadas" value="156" icon={MessageSquare} trend="+22% essa semana" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 h-64 flex flex-col items-center justify-center border-dashed border-2 border-border bg-transparent">
             <p className="text-textMuted">Gráfico de Vendas (Em breve)</p>
        </Card>
        <Card className="p-6 h-64 flex flex-col items-center justify-center border-dashed border-2 border-border bg-transparent">
             <p className="text-textMuted">Atividades Recentes (Em breve)</p>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;