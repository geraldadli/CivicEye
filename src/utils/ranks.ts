import { clamp } from './format';

const rankThresholds = [
  { label: 'Warga Baru', min: 0 },
  { label: 'Warga Aktif', min: 500 },
  { label: 'Warga Teladan', min: 2000 },
  { label: 'Warga Inspiratif', min: 5000 },
];

export function getRank(points: number) {
  let current = rankThresholds[0];
  let next = rankThresholds[rankThresholds.length - 1];

  for (let i = 0; i < rankThresholds.length; i += 1) {
    if (points >= rankThresholds[i].min) {
      current = rankThresholds[i];
      next = rankThresholds[Math.min(i + 1, rankThresholds.length - 1)];
    }
  }

  const nextPointsNeeded = next.min === current.min ? 0 : Math.max(0, next.min - points);
  const progress = next.min === current.min ? 1 : clamp((points - current.min) / (next.min - current.min), 0, 1);

  return {
    current: current.label,
    next: next.label,
    nextPointsNeeded,
    progress,
  };
}
