import { ArrowLeft, Home, Map, Users, Store, Camera } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-[#fafaf8] flex flex-col">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col pb-24">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <p className="text-sm">9.41</p>
          <button className="text-2xl">⋯</button>
        </div>

        {/* Title */}
        <div className="px-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <ArrowLeft className="w-6 h-6 text-[#B85C45]" />
            <h1 className="text-[#B85C45]">Reward</h1>
          </div>
          <h3>Dashboard Report</h3>
        </div>

        {/* Points Card */}
        <div className="px-6 mb-8">
          <div className="bg-[#B85C45] rounded-3xl p-6 text-white">
            <p className="text-sm mb-2">Civic Points Kamu:</p>
            <p className="text-5xl mb-2">1,250 points</p>
            <p className="text-sm mb-3">Warga Aktif</p>
            <div className="w-full bg-white/30 rounded-full h-2 mb-2">
              <div className="bg-white rounded-full h-2" style={{ width: '62.5%' }}></div>
            </div>
            <p className="text-sm">750 points lagi menuju Warga Teladan</p>
          </div>
        </div>

        {/* Rewards Section */}
        <div className="px-6">
          <h3 className="mb-4">Tukar Poinmu!</h3>

          {/* Food Voucher */}
          <div className="border-2 border-[#B85C45] rounded-3xl p-6 mb-4">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🍕</div>
              <div className="flex-1">
                <h3 className="text-[#B85C45] mb-2">Food Voucher</h3>
                <p className="text-sm mb-4">
                  Dapatkan diskon sebesar<br />10% untuk Pizza Hut
                </p>
              </div>
              <button className="bg-[#B85C45] text-white px-6 py-2 rounded-full text-sm">
                Redeem
              </button>
            </div>
          </div>

          {/* Money Voucher */}
          <div className="border-2 border-[#B85C45] rounded-3xl p-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">💳</div>
              <div className="flex-1">
                <h3 className="text-[#B85C45] mb-2">Money Voucher</h3>
                <p className="text-sm mb-4">
                  Tukarkan point untuk<br />E-wallet Rp 10.000,00
                </p>
              </div>
              <button className="bg-[#B85C45] text-white px-6 py-2 rounded-full text-sm">
                Redeem
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-2xl mx-auto relative">
          {/* Camera Button */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2">
            <button className="w-16 h-16 bg-[#B85C45] rounded-full flex items-center justify-center shadow-lg">
              <Camera className="w-7 h-7 text-white" />
            </button>
          </div>

          {/* Nav Items */}
          <div className="flex items-center justify-around px-6 py-4">
            <button className="flex flex-col items-center gap-1">
              <Home className="w-6 h-6 text-[#B85C45]" />
            </button>
            <button className="flex flex-col items-center gap-1">
              <Map className="w-6 h-6 text-[#B85C45]" />
            </button>
            <div className="w-16"></div>
            <button className="flex flex-col items-center gap-1">
              <Users className="w-6 h-6 text-[#B85C45]" />
            </button>
            <button className="flex flex-col items-center gap-1">
              <div className="w-8 h-1 bg-[#B85C45] rounded-full mb-1"></div>
              <Store className="w-6 h-6 text-[#B85C45]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}