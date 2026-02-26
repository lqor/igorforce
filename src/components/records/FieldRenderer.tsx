"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { Id } from "../../../convex/_generated/dataModel";
import { ExternalLink, Check, X } from "lucide-react";

interface FieldRendererProps {
  value: any;
  type: string;
  lookupObject?: string;
}

export function FieldRenderer({ value, type, lookupObject }: FieldRendererProps) {
  if (value === undefined || value === null || value === "") {
    return <span className="text-sf-text-weak">—</span>;
  }

  switch (type) {
    case "currency":
      return (
        <span>
          ${Number(value).toLocaleString("en-US", { minimumFractionDigits: 0 })}
        </span>
      );
    case "number":
      return <span>{Number(value).toLocaleString()}</span>;
    case "date":
      return <span>{new Date(value + "T00:00:00").toLocaleDateString()}</span>;
    case "checkbox":
      return value === "true" || value === true ? (
        <Check className="h-4 w-4 text-sf-success" />
      ) : (
        <X className="h-4 w-4 text-sf-text-weak" />
      );
    case "email":
      return (
        <a href={`mailto:${value}`} className="text-sf-blue hover:underline">
          {value}
        </a>
      );
    case "phone":
      return (
        <a href={`tel:${value}`} className="text-sf-blue hover:underline">
          {value}
        </a>
      );
    case "url":
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sf-blue hover:underline inline-flex items-center gap-1"
        >
          {value}
          <ExternalLink className="h-3 w-3" />
        </a>
      );
    case "lookup":
      return <LookupRenderer value={value} lookupObject={lookupObject} />;
    case "picklist":
      return (
        <span className="inline-block px-2 py-0.5 bg-sf-cloud rounded text-xs font-medium">
          {value}
        </span>
      );
    case "textarea":
      return <span className="whitespace-pre-wrap">{String(value).slice(0, 200)}</span>;
    default:
      return <span>{String(value)}</span>;
  }
}

function LookupRenderer({ value, lookupObject }: { value: string; lookupObject?: string }) {
  const record = useQuery(
    api.records.get,
    value ? { id: value as Id<"records"> } : "skip"
  );

  if (!record || !lookupObject) {
    return <span className="text-sf-text-weak">—</span>;
  }

  const data = record.data as Record<string, any>;
  const displayName = data.Name || data.LastName
    ? (data.FirstName ? `${data.FirstName} ${data.LastName}` : data.LastName || data.Name)
    : value;

  return (
    <Link
      href={`/objects/${lookupObject}/${value}`}
      className="text-sf-blue hover:underline"
      onClick={(e) => e.stopPropagation()}
    >
      {displayName}
    </Link>
  );
}
