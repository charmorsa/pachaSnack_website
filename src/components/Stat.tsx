import type { ReactNode } from 'react';

type StatProps = {
  icon: ReactNode;
  label: string;
  value: number | string;
};

export function Stat({ icon, label, value }: StatProps) {
  return (
    <div className="stat">
      <span className="stat-icon">{icon}</span>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
