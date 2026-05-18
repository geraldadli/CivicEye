import { Bell } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function NotificationModal({ open, onClose }: Props) {
  if (!open) return null;

  const notifications = [
    "🎉 You just got +150 points from your last report",
    "🚧 Your report is now being processed",
    "✅ One of your reports has been completed",
    "🏆 You reached Bronze Citizen rank",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-[28px] bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-bold">Notifications</h2>
        </div>

        <div className="space-y-3">
          {notifications.map((item) => (
            <div
              key={item}
              className="rounded-2xl bg-orange-50 p-3 text-sm text-stone-700"
            >
              {item}
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-2xl bg-orange-500 py-3 font-semibold text-white"
        >
          Close
        </button>
      </div>
    </div>
  );
}