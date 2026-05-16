import { clamp } from '@/utils/format';

export default function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-orange-100">
      <div
        className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
        style={{ width: `${clamp(value, 0, 1) * 100}%` }}
      />
    </div>
  );
}
