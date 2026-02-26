"use client";

import { useState } from "react";
import { FieldInput } from "@/components/fields/FieldInput";
import { Button } from "@/components/ui/Button";

interface RecordFormProps {
  fields: Array<{
    name: string;
    label: string;
    type: string;
    required: boolean;
    picklistValues?: string[];
    lookupObject?: string;
  }>;
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

export function RecordForm({
  fields,
  initialData = {},
  onSubmit,
  onCancel,
  submitLabel = "Save",
}: RecordFormProps) {
  const [data, setData] = useState<Record<string, any>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    for (const field of fields) {
      if (field.required && !data[field.name]) {
        newErrors[field.name] = "This field is required";
      }
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setSaving(true);
    try {
      await onSubmit(data);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => (
          <div key={field.name} className={field.type === "textarea" ? "md:col-span-2" : ""}>
            <FieldInput
              field={field}
              value={data[field.name]}
              onChange={(val) => {
                setData((prev) => ({ ...prev, [field.name]: val }));
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next[field.name];
                  return next;
                });
              }}
              error={errors[field.name]}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t border-sf-border">
        <Button type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="brand" disabled={saving}>
          {saving ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
