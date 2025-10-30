import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OfferCard } from '@/components/ui/offer-card';
import { PushOnboarding } from '@/components/ui/push-onboarding';

vi.mock('@/lib/push', async () => {
  const mod = await vi.importActual<any>('@/lib/push');
  return {
    ...mod,
    shouldShowOnboarding: () => true,
    getPushState: () => 'prompt',
    registerPush: vi.fn().mockResolvedValue(true),
  };
});

describe('Accessibility basics', () => {
  it('OfferCard can be activated via keyboard (Enter)', async () => {
    const onClick = vi.fn();
    const offer = {
      id: 1,
      title: 'Тест предложение',
      discounted_price: 100,
      original_price: 200,
      quantity_available: 1,
      pickup_time_end: '23:59:59',
      image_url: '',
    } as any;

    render(<OfferCard offer={offer} onClick={onClick} />);
    const btn = screen.getByRole('button', { name: /тест предложение/i });
    btn.focus();
    await userEvent.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalled();
  });

  it('Push onboarding opens modal with role="dialog" and focuses a control', async () => {
    render(<PushOnboarding />);
    const more = screen.getByRole('button', { name: /подробнее/i });
    await userEvent.click(more);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    // first button auto-focused
    expect(screen.getByRole('button', { name: /отмена/i })).toHaveFocus();
  });
});


