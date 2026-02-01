
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Language } from '../types';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  'nav.dashboard': { pt: 'Dashboard', es: 'Panel' },
  'nav.selling': { pt: 'Vendendo', es: 'Ventas' },
  'nav.tasks': { pt: 'Tarefas', es: 'Tareas' },
  'nav.payments': { pt: 'Pagamentos', es: 'Pagos' },
  'nav.apps': { pt: 'Apps & Instalação', es: 'Apps e Instalación' },
  'nav.support': { pt: 'Suporte', es: 'Soporte' },
  'nav.translator': { pt: 'Agente Tradutor', es: 'Agente Traductor' },
  'nav.admin': { pt: 'Admin', es: 'Admin' },
  'search.placeholder': { pt: 'Buscar frases, apps, tags...', es: 'Buscar frases, apps, etiquetas...' },
  'login.title': { pt: 'Entrar', es: 'Acceso' },
  'login.email': { pt: 'Email', es: 'Correo' },
  'login.password': { pt: 'Senha', es: 'Contraseña' },
  'login.button': { pt: 'Acessar Sistema', es: 'Acceder al Sistema' },
  'apps.search': { pt: 'Buscar aplicativo...', es: 'Buscar aplicación...' },
  'apps.platforms': { pt: 'Plataformas', es: 'Plataformas' },
  'apps.dragText': { pt: 'Arraste esta imagem para o WhatsApp Web', es: 'Arrastra esta imagen a WhatsApp Web' },
  'apps.copyLink': { pt: 'Copiar Link', es: 'Copiar Enlace' },
  'apps.download': { pt: 'Baixar', es: 'Descargar' },
  'apps.viewImage': { pt: 'Ver Imagem', es: 'Ver Imagen' },
  'apps.instructions': { pt: 'Instruções', es: 'Instrucciones' },
  'apps.copyInstructions': { pt: 'Copiar Instruções', es: 'Copiar Instrucciones' },
  'apps.gallery': { pt: 'Galeria de Tutorial', es: 'Galería de Tutoriales' },
  'msgs.title': { pt: 'Scripts de Venda', es: 'Guiones de Venta' },
  'msgs.title_payments': { pt: 'Scripts de Pagamento', es: 'Guiones de Pago' },
  'msgs.new': { pt: 'Nova Mensagem', es: 'Nuevo Mensaje' },
  'msgs.copy': { pt: 'Copiar', es: 'Copiar' },
  'support.title': { pt: 'Guias de Suporte', es: 'Guías de Soporte' },
  'support.new': { pt: 'Novo Guia', es: 'Nueva Guía' },
  'support.edit': { pt: 'Editar Guia', es: 'Editar Guía' },
  'common.cancel': { pt: 'Cancelar', es: 'Cancelar' },
  'common.save': { pt: 'Salvar', es: 'Guardar' },
  'common.copied': { pt: 'Copiado!', es: '¡Copiado!' },
  'admin.title': { pt: 'Painel Administrativo', es: 'Panel Administrativo' },
  
  // Translator Module
  'trans.title': { pt: 'Agente Tradutor', es: 'Agente Traductor' },
  'trans.subtitle': { pt: 'Cole a mensagem do cliente e gere resposta pronta em segundos.', es: 'Pega el mensaje del cliente y genera una respuesta lista en segundos.' },
  'trans.input_placeholder': { pt: 'Cole aqui a mensagem do cliente...', es: 'Pega aquí el mensaje del cliente...' },
  'trans.generate': { pt: 'Traduzir / Gerar', es: 'Traducir / Generar' },
  'trans.detect': { pt: 'Detectar idioma', es: 'Detectar idioma' },
  'trans.clear': { pt: 'Limpar', es: 'Limpiar' },
  'trans.paste': { pt: 'Colar', es: 'Pegar' },
  'trans.history': { pt: 'Histórico Recente', es: 'Historial Reciente' },
  'trans.mode.dual': { pt: 'Duas saídas (PT + ES)', es: 'Dos salidas (PT + ES)' },
  'trans.mode.translate_pt': { pt: 'Traduzir para PT (Entender)', es: 'Traducir a PT (Entender)' },
  'trans.mode.reply_es': { pt: 'Gerar resposta em ES', es: 'Generar respuesta en ES' },
  'trans.mode.reply_pt': { pt: 'Gerar resposta em PT', es: 'Generar respuesta en PT' },
  'trans.add_draft': { pt: 'Add rascunho', es: 'Agregar borrador' },

  // Tasks Module
  'tasks.title': { pt: 'Tarefas', es: 'Tareas' },
  'tasks.new_client': { pt: 'Novo Cliente', es: 'Nuevo Cliente' },
  'tasks.manage_stages': { pt: 'Gerenciar Etapas', es: 'Gestionar Etapas' },
  'tasks.view.kanban': { pt: 'Kanban', es: 'Kanban' },
  'tasks.view.today': { pt: 'Hoje', es: 'Hoy' },
  'tasks.view.overdue': { pt: 'Atrasados', es: 'Atrasados' },
  'tasks.view.week': { pt: 'Semana', es: 'Semana' },
  'tasks.search': { pt: 'Buscar cliente, tag...', es: 'Buscar cliente, etiqueta...' },
  'tasks.card.whatsapp': { pt: 'WhatsApp', es: 'WhatsApp' },
  'tasks.card.edit': { pt: 'Editar', es: 'Editar' },
  'tasks.card.delete': { pt: 'Excluir', es: 'Eliminar' },
  'tasks.card.due': { pt: 'Vence:', es: 'Vence:' },
  'tasks.form.name': { pt: 'Nome do Cliente', es: 'Nombre del Cliente' },
  'tasks.form.whatsapp': { pt: 'WhatsApp (apenas números)', es: 'WhatsApp (solo números)' },
  'tasks.form.stage': { pt: 'Etapa', es: 'Etapa' },
  'tasks.form.next_action': { pt: 'Próxima Ação', es: 'Próxima Acción' },
  'tasks.form.due_at': { pt: 'Data/Hora Lembrete', es: 'Fecha/Hora Recordatorio' },
  'tasks.form.device': { pt: 'Dispositivo', es: 'Dispositivo' },
  'tasks.form.notes': { pt: 'Observações', es: 'Observaciones' },
  'tasks.priority': { pt: 'Prioridade', es: 'Prioridad' },
  'tasks.priority.low': { pt: 'Baixa', es: 'Baja' },
  'tasks.priority.medium': { pt: 'Média', es: 'Media' },
  'tasks.priority.high': { pt: 'Alta', es: 'Alta' },
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('pt');

  const t = (key: string): string => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[language] || key;
  };

  return React.createElement(
    I18nContext.Provider,
    { value: { language, setLanguage, t } },
    children
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within an I18nProvider');
  return context;
};
