import { Coins, CreditCard, Ticket, Wallet } from "lucide-react";
import SectionCard from "@/components/common/SectionCard";
import { Voucher } from "@/types/civiceye";
import { useApp } from "@/context/AppContext";

export default function StorePage() {
  const { user, redeemVoucher } = useApp();

  const vouchers: Voucher[] = [
    {
      id: "v1",
      type: "food",
      title: "Pizza Hut Voucher",
      description: "Dapatkan diskon sebesar 10% untuk Pizza Hut",
      points: 300,
      badge: "Pizza Hut",
    },
    {
      id: "v2",
      type: "money",
      title: "Gopay Rp 10.000,00",
      description: "Tukarkan point untuk saldo Gopay Rp 10.000,00",
      points: 500,
      badge: "GoPay",
    },
    {
      id: "v3",
      type: "money",
      title: "ShopeePay Rp 20.000,00",
      description: "Tukarkan point untuk saldo ShopeePay Rp 20.000,00",
      points: 900,
      badge: "ShopeePay",
    },
  ];

  const handleRedeem = (voucher: Voucher) => {
    if (!user) return;
    if (user.points < voucher.points) {
      alert(
        `Klaim Gagal: Civic Points Anda tidak mencukupi.\nPoints Anda: ${user.points} pts.\nPoints dibutuhkan: ${voucher.points} pts.`
      );
      return;
    }

    const confirmRedeem = window.confirm(
      `Tukarkan ${voucher.points} Civic Points untuk "${voucher.title}"?`
    );
    if (!confirmRedeem) return;

    const success = redeemVoucher(voucher.points);
    if (success) {
      const mockCode = `CE-${Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      alert(
        `Klaim Berhasil!\n\nAnda menukarkan ${voucher.points} pts untuk "${voucher.title}".\n\nKode Voucher Anda:\n${mockCode}\n\nTunjukkan kode di atas di merchant atau salin ke e-wallet Anda.`
      );
    }
  };

  return (
    <SectionCard
      title="Rewards Marketplace"
      subtitle="Tukar Civic Points menjadi voucher yang berguna."
      icon={<Ticket className="h-5 w-5 text-orange-600" />}
    >
      <div className="space-y-3">
        {vouchers.map((voucher) => (
          <article
            key={voucher.id}
            className="rounded-[28px] bg-stone-50 p-4 border border-stone-150/50 hover:border-orange-100 transition text-left"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white p-3 text-orange-600 shadow-sm border border-stone-150">
                  {voucher.type === "food" ? (
                    <CreditCard className="w-5 h-5" />
                  ) : (
                    <Wallet className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">
                    {voucher.badge}
                  </p>
                  <h3 className="font-semibold text-stone-900 mt-0.5">{voucher.title}</h3>
                  <p className="mt-1 max-w-sm text-sm text-stone-500">{voucher.description}</p>
                </div>
              </div>
              <div className="rounded-2xl bg-orange-100 px-3.5 py-2 text-right text-orange-850 border border-orange-200">
                <p className="text-[10px] font-bold uppercase tracking-wider">Points</p>
                <p className="text-lg font-extrabold mt-0.5">{voucher.points}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-stone-150 pt-3.5">
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <Coins className="h-4 w-4 text-orange-500" />
                Tukar poinmu
              </div>
              <button
                onClick={() => handleRedeem(voucher)}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition active:scale-[0.99] bg-orange-500 text-white shadow-md shadow-orange-100 hover:bg-orange-600"
              >
                Redeem
              </button>
            </div>
          </article>
        ))}
      </div>
    </SectionCard>
  );
}
