import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { BizDashboard } from '@/components/pages/biz-dashboard';

export const Route = createFileRoute('/biz/')({
  component: BizDashboard,
});
