"use client";

import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as Icons from "lucide-react";

export default function NewObjectPage() {
  const router = useRouter();
  const { toast } = useToast();
  const createObject = useMutation(api.objects.create);
  const [form, setForm] = useState({
    label: "",
    pluralLabel: "",
    description: "",
    icon: "Box",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.label.trim()) return;
    setSaving(true);
    try {
      await createObject({
        name: form.label,
        label: form.label,
        pluralLabel: form.pluralLabel || form.label + "s",
        description: form.description || undefined,
        icon: form.icon,
      });
      toast("Custom object created", "success");
      router.push("/setup/objects");
    } finally {
      setSaving(false);
    }
  };

  const iconOptions = [
    "Box", "Star", "Heart", "Bookmark", "Flag", "Tag", "Briefcase",
    "Truck", "Package", "Clipboard", "FileText", "Folder", "Archive",
    "Globe", "Map", "Target", "Zap", "Shield", "Award", "Gift",
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader icon="Plus" title="New Custom Object" />
      <div className="px-6">
        <Card>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-sf-text mb-1">
                  Label <span className="text-sf-error">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-sf-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-sf-blue"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  placeholder="e.g., Project"
                  required
                />
                <p className="mt-1 text-xs text-sf-text-weak">
                  API Name: {form.label ? form.label.replace(/\s+/g, "_") + "__c" : "—"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-sf-text mb-1">
                  Plural Label
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-sf-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-sf-blue"
                  value={form.pluralLabel}
                  onChange={(e) => setForm({ ...form, pluralLabel: e.target.value })}
                  placeholder={form.label ? form.label + "s" : "e.g., Projects"}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-sf-text mb-1">
                  Description
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-sf-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-sf-blue h-20 resize-y"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-sf-text mb-1">
                  Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {iconOptions.map((iconName) => {
                    const Icon = (Icons as any)[iconName];
                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setForm({ ...form, icon: iconName })}
                        className={`p-2 rounded border ${
                          form.icon === iconName
                            ? "border-sf-blue bg-sf-blue/10"
                            : "border-sf-border hover:bg-sf-cloud"
                        }`}
                        title={iconName}
                      >
                        {Icon && <Icon className="h-5 w-5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-sf-border">
                <Button type="button" onClick={() => router.push("/setup/objects")}>
                  Cancel
                </Button>
                <Button type="submit" variant="brand" disabled={saving || !form.label.trim()}>
                  {saving ? "Creating..." : "Create Object"}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
