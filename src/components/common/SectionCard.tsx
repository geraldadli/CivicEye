import React from "react";

interface SectionCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export default function SectionCard({
  title,
  subtitle,
  icon,
  children,
}: SectionCardProps) {
  return (
    <section className="rounded-[28px] bg-white/95 p-4 shadow-[0_16px_40px_rgba(122,62,25,0.12)] ring-1 ring-orange-100/80 backdrop-blur">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
          </div>
          {subtitle ? (
            <p className="mt-1 text-sm text-stone-500">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}