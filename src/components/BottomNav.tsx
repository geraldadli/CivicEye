import { type ComponentType } from "react";
import { Home, MessageSquareText, ScanLine, Store, Users } from "lucide-react";
import { BottomTab } from "@/types/civiceye";

type BottomNavProps = {
  tab: BottomTab;
  setTab: (tab: BottomTab) => void;
  className?: string;
};

const items: Array<{
  key: BottomTab;
  label: string;
  Icon: ComponentType<{ className?: string }>;
}> = [
  { key: "home", label: "Home", Icon: Home },
  { key: "forum", label: "Forum", Icon: MessageSquareText },
  { key: "scan", label: "Scan", Icon: ScanLine },
  { key: "community", label: "Community", Icon: Users },
  { key: "store", label: "Store", Icon: Store },
];

export default function BottomNav({ tab, setTab, className = "" }: BottomNavProps) {
  return (
    <nav className={`fixed inset-x-0 bottom-0 z-30 px-4 pb-4 lg:hidden ${className}`}>
      <div className="mx-auto max-w-md rounded-[30px] border border-orange-100 bg-white/95 px-3 py-3 shadow-[0_20px_50px_rgba(122,62,25,0.16)] backdrop-blur">
        <div className="grid grid-cols-5 items-center gap-1">
          {items.map(({ key, label, Icon }) => {
            const active = tab === key;
            const isCenter = key === "scan";

            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                aria-label={label}
                className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 transition ${
                  isCenter
                    ? "-mt-8 rounded-[26px] bg-gradient-to-br from-orange-500 to-amber-400 p-3 text-white shadow-lg shadow-orange-200"
                    : active
                      ? "bg-orange-50 text-orange-700"
                      : "text-stone-500"
                }`}
              >
                <Icon className={isCenter ? "h-6 w-6" : "h-5 w-5"} />
                <span className="text-[10px] font-semibold leading-none">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}