import { Coins, CreditCard, Ticket, Wallet } from 'lucide-react';
import { AppButton } from '@/components/common/AppButton';
import SectionCard from '@/components/common/SectionCard';
import { Voucher } from '@/types/civiceye';

export default function StorePage() {
  const vouchers: Voucher[] = [
    { id: 'v1', type: 'food', title: 'Food Voucher', description: 'Dapatkan diskon sebesar 10% untuk Pizza Hut', points: 300, badge: 'Pizza Hut' },
    { id: 'v2', type: 'money', title: 'Money Voucher', description: 'Tukarkan point untuk E-wallet Rp 10.000,00', points: 500, badge: 'E-wallet' },
  ];

  return (
    <SectionCard title="Rewards Marketplace" subtitle="Tukar Civic Points menjadi voucher yang berguna." icon={<Ticket className="h-5 w-5 text-orange-600" />}>
      <div className="space-y-3">
        {vouchers.map((voucher) => (
          <article key={voucher.id} className="rounded-[28px] bg-stone-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white p-3 text-orange-600 shadow-sm">
                  {voucher.type === 'food' ? <CreditCard className="h-5 w-5" /> : <Wallet className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-sm text-stone-500">{voucher.badge}</p>
                  <h3 className="font-semibold text-stone-900">{voucher.title}</h3>
                  <p className="mt-1 max-w-sm text-sm text-stone-500">{voucher.description}</p>
                </div>
              </div>
              <div className="rounded-2xl bg-orange-100 px-3 py-2 text-right text-orange-800">
                <p className="text-xs font-medium">Points</p>
                <p className="text-lg font-extrabold">{voucher.points}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <Coins className="h-4 w-4 text-orange-500" /> Tukar poinmu
              </div>
              <AppButton variant="secondary">Redeem</AppButton>
            </div>
          </article>
        ))}
      </div>
    </SectionCard>
  );
}
