import { createFileRoute } from '@tanstack/react-router';
import { SettingsPage } from '@/components/pages/settings-page';

export const Route = createFileRoute('/me/settings')({
  component: SettingsPage,
});