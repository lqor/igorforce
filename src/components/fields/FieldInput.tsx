"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import clsx from "clsx";

interface FieldInputProps {
  field: {
    name: string;
    label: string;
    type: string;
    required: boolean;
    picklistValues?: string[];
    lookupObject?: string;
  };
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

export function FieldInput({ field, value, onChange, error }: FieldInputProps) {
  const baseClasses = clsx(
    "w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-sf-blue focus:border-sf-blue",
    error ? "border-sf-error" : "border-sf-border"
  );

  const renderInput = () => {
    switch (field.type) {
      case "textarea":
        return (
          <textarea
            className={clsx(baseClasses, "h-24 resize-y")}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
          />
        );

      case "picklist":
        return (
          <select
            className={baseClasses}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="">--None--</option>
            {field.picklistValues?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );

      case "checkbox":
        return (
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-sf-border text-sf-blue focus:ring-sf-blue"
            checked={value === "true" || value === true}
            onChange={(e) => onChange(e.target.checked ? "true" : "false")}
          />
        );

      case "date":
        return (
          <input
            type="date"
            className={baseClasses}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
          />
        );

      case "number":
      case "currency":
        return (
          <div className="relative">
            {field.type === "currency" && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sf-text-weak text-sm">$</span>
            )}
            <input
              type="number"
              className={clsx(baseClasses, field.type === "currency" && "pl-7")}
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              step={field.type === "currency" ? "0.01" : "1"}
            />
          </div>
        );

      case "email":
        return (
          <input
            type="email"
            className={baseClasses}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
          />
        );

      case "phone":
        return (
          <input
            type="tel"
            className={baseClasses}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
          />
        );

      case "url":
        return (
          <input
            type="url"
            className={baseClasses}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://"
          />
        );

      case "lookup":
        return <LookupInput field={field} value={value} onChange={onChange} baseClasses={baseClasses} />;

      default:
        return (
          <input
            type="text"
            className={baseClasses}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
          />
        );
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-sf-text mb-1">
        {field.label}
        {field.required && <span className="text-sf-error ml-0.5">*</span>}
      </label>
      {renderInput()}
      {error && <p className="mt-1 text-xs text-sf-error">{error}</p>}
    </div>
  );
}

function LookupInput({
  field,
  value,
  onChange,
  baseClasses,
}: {
  field: FieldInputProps["field"];
  value: any;
  onChange: (value: any) => void;
  baseClasses: string;
}) {
  const lookupObj = useQuery(
    api.objects.getByName,
    field.lookupObject ? { name: field.lookupObject } : "skip"
  );
  const lookupRecords = useQuery(
    api.records.listByObject,
    lookupObj ? { objectId: lookupObj._id } : "skip"
  );

  return (
    <select
      className={baseClasses}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">--None--</option>
      {lookupRecords?.map((rec) => {
        const data = rec.data as Record<string, any>;
        const label = data.Name || (data.FirstName ? `${data.FirstName} ${data.LastName}` : data.LastName) || rec._id;
        return (
          <option key={rec._id} value={rec._id}>
            {label}
          </option>
        );
      })}
    </select>
  );
}
