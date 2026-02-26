"use client";

import * as Icons from "lucide-react";
import clsx from "clsx";

interface PageHeaderProps {
  icon?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ icon, title, subtitle, actions, className }: PageHeaderProps) {
  const IconComponent = icon ? (Icons as any)[icon] : null;

  return (
    <div className={clsx("flex items-center justify-between px-6 py-4", className)}>
      <div className="flex items-center gap-3">
        {IconComponent && (
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-sf-blue/10">
            <IconComponent className="h-5 w-5 text-sf-blue" />
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold text-sf-navy">{title}</h1>
          {subtitle && (
            <p className="text-sm text-sf-text-weak">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
