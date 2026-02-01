
import { AppItem, Message, SupportGuide, TaskStage, TaskCard } from '../types';

export const mockApps: AppItem[] = [
  {
    id: '1',
    name: 'DreamTV',
    platforms: ['Android TV', 'TV Box', 'Fire TV'],
    link_store: 'https://play.google.com/store/apps/details?id=com.dreamtv',
    instructions_pt: `1. Baixe o aplicativo DreamTV na loja.\n2. Abra o app.\n3. Digite o código enviado.\n4. Aproveite!`,
    instructions_es: `1. Descarga la aplicación DreamTV en la tienda.\n2. Abre la aplicación.\n3. Ingresa el código enviado.\n4. ¡Disfruta!`,
    image_main_url: 'https://picsum.photos/400/300',
    tutorial_images_urls: ['https://picsum.photos/200/300', 'https://picsum.photos/201/300'],
    tags: ['Recomendado', 'Rápido']
  },
  {
    id: '2',
    name: 'Smarters Pro',
    platforms: ['iOS', 'Apple TV', 'Android'],
    link_store: 'https://apps.apple.com/app/smarters',
    instructions_pt: 'Abra o Smarters, selecione "Login com API Xtream".',
    instructions_es: 'Abre Smarters, selecciona "Login con API Xtream".',
    image_main_url: 'https://picsum.photos/400/301',
    tutorial_images_urls: [],
    tags: ['Estável']
  }
];

export const mockMessages: Message[] = [
  {
    id: '1',
    title: 'Bom dia - Abordagem',
    category: 'Venda',
    tags: ['Abordagem', 'Manhã'],
    content_pt: 'Olá, bom dia! Em qual dispositivo você gostaria de realizar o nosso teste gratuito?!\n* TV Smart\n* TV com aparelho Box\n* Computador / PS4 / Celular',
    content_es: '¡Hola, buenos días! ¿En qué dispositivo le gustaría realizar nuestra prueba gratuita?!\n* Smart TV\n* TV con caja (Box)\n* Computadora / PS4 / Celular'
  },
  {
    id: '3',
    title: 'Fechamento Mensal',
    category: 'Venda',
    tags: ['Oferta', 'Mensal'],
    content_pt: 'Nosso plano mensal é apenas R$ 29,90. Acesso completo a todos os canais, filmes e séries. Vamos fechar?',
    content_es: 'Nuestro plan mensual cuesta solo $ 29,90. Acceso completo a todos los canales, películas y series. ¿Cerramos?'
  },
  {
    id: '2',
    title: 'Chave PIX (CNPJ)',
    category: 'Pagamentos',
    tags: ['Pix', 'Empresa'],
    content_pt: 'Segue a chave PIX para ativação imediata:\nCNPJ: 12.345.678/0001-90\nBanco: Inter\nNome: Universa Tech\n\nEnvie o comprovante por favor.',
    content_es: 'Aquí está la clave PIX para activación inmediata:\nCNPJ: 12.345.678/0001-90\nBanco: Inter\nNombre: Universa Tech\n\nEnvíe el comprobante por favor.'
  },
  {
    id: '4',
    title: 'Link Cartão de Crédito',
    category: 'Pagamentos',
    tags: ['Link', 'Automático'],
    content_pt: 'Para pagar no cartão, use este link seguro: https://pagamento.universatv.com/checkout/123',
    content_es: 'Para pagar con tarjeta, use este enlace seguro: https://pagamento.universatv.com/checkout/123'
  }
];

export const mockSupport: SupportGuide[] = [
  {
    id: '1',
    title_pt: 'Travando / Buffering',
    title_es: 'Congelamiento / Buffering',
    content_pt: '1. Reinicie o modem.\n2. Limpe o cache do app.\n3. Teste em outra rede (4G).',
    content_es: '1. Reinicie el módem.\n2. Limpie la caché de la app.\n3. Pruebe en otra red (4G).',
    icon: 'WifiOff'
  },
  {
    id: '2',
    title_pt: 'Erro de Login',
    title_es: 'Error de Acceso',
    content_pt: 'Verifique se digitou maiúsculas e minúsculas corretamente. O sistema é sensível.',
    content_es: 'Verifique si escribió mayúsculas y minúsculas correctamente. El sistema es sensible.',
    icon: 'Lock'
  }
];

// TASKS MOCK DATA
export const mockStages: TaskStage[] = [
  { id: '1', name_pt: 'Novos Leads', name_es: 'Nuevos Leads', color: '#3B82F6', order: 1, active: true },
  { id: '2', name_pt: 'Teste Enviado', name_es: 'Prueba Enviada', color: '#F59E0B', order: 2, active: true },
  { id: '3', name_pt: 'Aguardando Pagto', name_es: 'Esperando Pago', color: '#8B5CF6', order: 3, active: true },
  { id: '4', name_pt: 'Ativo / Pós-Venda', name_es: 'Activo / Postventa', color: '#10B981', order: 4, active: true },
  { id: '5', name_pt: 'Perdidos', name_es: 'Perdidos', color: '#EF4444', order: 5, active: true },
];

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

export const mockTasks: TaskCard[] = [
  {
    id: '101',
    ownerUserId: '1',
    customerName: 'Carlos Silva',
    whatsapp: '5511999999999',
    language: 'pt',
    device: 'TV Samsung',
    interestTags: ['Futebol', 'Canais'],
    notes: 'Cliente quer testar antes do jogo do Flamengo.',
    stageId: '1',
    nextAction: 'Enviar Teste',
    dueAt: today.toISOString(),
    priority: 'high',
    createdAt: yesterday.toISOString(),
  },
  {
    id: '102',
    ownerUserId: '1',
    customerName: 'Juan Perez',
    whatsapp: '59177777777',
    language: 'es',
    device: 'Firestick',
    interestTags: ['Peliculas'],
    notes: 'Preguntó precio anual.',
    stageId: '2',
    nextAction: 'Cobrar Feedback',
    dueAt: yesterday.toISOString(), // Overdue
    priority: 'medium',
    createdAt: yesterday.toISOString(),
  },
  {
    id: '103',
    ownerUserId: '1',
    customerName: 'Maria Souza',
    whatsapp: '5521988888888',
    language: 'pt',
    device: 'TV Box',
    interestTags: [],
    notes: 'Aguardando pix cair.',
    stageId: '3',
    nextAction: 'Liberar Acesso',
    dueAt: tomorrow.toISOString(),
    priority: 'low',
    createdAt: today.toISOString(),
  }
];
