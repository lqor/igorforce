"use client";

import * as Icons from "lucide-react";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  const IconComponent = icon ? (Icons as any)[icon] : Icons.Inbox;

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-sf-cloud mb-4">
        <IconComponent className="h-8 w-8 text-sf-text-weak" />
      </div>
      <h3 className="text-lg font-semibold text-sf-text mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-sf-text-weak max-w-sm mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}
