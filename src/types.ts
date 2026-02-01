
export type Language = 'pt' | 'es';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface AppItem {
  id: string;
  name: string;
  platforms: string[]; // e.g., 'Android', 'TV Box', 'Fire TV'
  link_store: string;
  instructions_pt: string;
  instructions_es: string;
  image_main_url: string;
  tutorial_images_urls: string[];
  tags: string[];
}

export type MessageCategory = 'Venda' | 'Instalação' | 'Suporte' | 'Pagamentos';

export interface Message {
  id: string;
  title: string;
  category: MessageCategory;
  tags: string[];
  content_pt: string;
  content_es: string;
}

export interface SupportGuide {
  id: string;
  title_pt: string;
  title_es: string;
  content_pt: string;
  content_es: string;
  icon: string; // Icon name
}

export interface TranslationHistoryItem {
    id: string;
    input: string;
    output_pt: string;
    output_es: string;
    mode: 'dual' | 'translate_pt' | 'reply_es' | 'reply_pt';
    timestamp: Date;
}

// Tasks / CRM Module
export interface TaskStage {
  id: string;
  name_pt: string;
  name_es: string;
  color: string; // Hex or Tailwind class
  order: number;
  active: boolean;
}

export type TaskPriority = 'low' | 'medium' | 'high';

export interface TaskCard {
  id: string;
  ownerUserId: string;
  customerName: string;
  whatsapp: string;
  language: 'pt' | 'es';
  device: string;
  interestTags: string[];
  notes: string;
  stageId: string;
  nextAction: string;
  dueAt: string; // ISO Date string
  priority: TaskPriority;
  createdAt: string;
}
