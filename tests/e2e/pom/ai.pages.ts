import { AiChatPage } from '../../../pages/ai/ai-chat.page';
import { AiInsightsPage } from '../../../pages/ai/ai-insights.page';
import { EnergySavingsPage } from '../../../pages/ai/energy-savings.page';
import { PageCase } from './types';

export const aiPageCases: PageCase[] = [
  { name: 'AI Chat', route: '/ai-chat', build: (page) => new AiChatPage(page) },
  { name: 'AI Insights', route: '/ai-insights', build: (page) => new AiInsightsPage(page) },
  { name: 'Energy Savings', route: '/energy-savings', build: (page) => new EnergySavingsPage(page) },
];
