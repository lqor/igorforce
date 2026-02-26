"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { PageSpinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { useState } from "react";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "currency", label: "Currency" },
  { value: "date", label: "Date" },
  { value: "picklist", label: "Picklist" },
  { value: "checkbox", label: "Checkbox" },
  { value: "lookup", label: "Lookup Relationship" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "url", label: "URL" },
  { value: "textarea", label: "Text Area (Long)" },
];

export default function FieldManagerPage() {
  const params = useParams();
  const objectName = params.objectName as string;
  const { toast } = useToast();

  const object = useQuery(api.objects.getByName, { name: objectName });
  const fields = useQuery(
    api.fields.listByObject,
    object ? { objectId: object._id } : "skip"
  );
  const objects = useQuery(api.objects.list);
  const createField = useMutation(api.fields.create);
  const removeField = useMutation(api.fields.remove);

  const [showNewField, setShowNewField] = useState(false);
  const [newField, setNewField] = useState({
    label: "",
    type: "text",
    required: false,
    picklistValues: "",
    lookupObject: "",
  });
  const [saving, setSaving] = useState(false);

  if (object === undefined || fields === undefined) return <PageSpinner />;
  if (!object) {
    return (
      <EmptyState icon="AlertTriangle" title="Object Not Found" />
    );
  }

  const handleCreateField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newField.label.trim()) return;
    setSaving(true);
    try {
      await createField({
        objectId: object._id,
        name: newField.label,
        label: newField.label,
        type: newField.type,
        required: newField.required,
        picklistValues: newField.type === "picklist" && newField.picklistValues
          ? newField.picklistValues.split("\n").map((v) => v.trim()).filter(Boolean)
          : undefined,
        lookupObject: newField.type === "lookup" ? newField.lookupObject : undefined,
      });
      toast("Field created", "success");
      setShowNewField(false);
      setNewField({ label: "", type: "text", required: false, picklistValues: "", lookupObject: "" });
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: "label", label: "Label" },
    { key: "name", label: "API Name" },
    {
      key: "type",
      label: "Type",
      render: (val: string) => (
        <span className="text-xs px-2 py-0.5 rounded bg-sf-cloud font-medium">
          {FIELD_TYPES.find((t) => t.value === val)?.label || val}
        </span>
      ),
    },
    {
      key: "required",
      label: "Required",
      render: (val: boolean) => (val ? "Yes" : ""),
    },
    {
      key: "isCustom",
      label: "Custom",
      render: (val: boolean) => (
        <span className={`text-xs px-2 py-0.5 rounded ${val ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
          {val ? "Custom" : "Standard"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      className: "w-10",
      render: (_: any, row: any) =>
        row.isCustom && !row.isNameField ? (
          <button
            onClick={async (e) => {
              e.stopPropagation();
              await removeField({ id: row._id });
              toast("Field deleted", "success");
            }}
            className="p-1 rounded hover:bg-red-50 text-sf-text-weak hover:text-sf-error"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ) : null,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="px-6 pt-4">
        <Link
          href="/setup/objects"
          className="inline-flex items-center gap-1 text-sm text-sf-blue hover:underline"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Object Manager
        </Link>
      </div>

      <PageHeader
        icon={object.icon}
        title={`${object.label} Fields`}
        subtitle={`Manage fields for ${object.label}`}
        actions={
          <Button variant="brand" onClick={() => setShowNewField(true)}>
            <Plus className="h-4 w-4" />
            New Field
          </Button>
        }
      />

      <div className="px-6">
        <Card>
          <DataTable columns={columns} rows={fields || []} />
        </Card>
      </div>

      {/* New Field Modal */}
      <Modal
        open={showNewField}
        onClose={() => setShowNewField(false)}
        title="New Custom Field"
      >
        <form onSubmit={handleCreateField} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-sf-text mb-1">
              Label <span className="text-sf-error">*</span>
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-sf-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-sf-blue"
              value={newField.label}
              onChange={(e) => setNewField({ ...newField, label: e.target.value })}
              required
            />
            <p className="mt-1 text-xs text-sf-text-weak">
              API Name: {newField.label ? newField.label.replace(/\s+/g, "_") + "__c" : "—"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-sf-text mb-1">
              Type
            </label>
            <select
              className="w-full px-3 py-2 border border-sf-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-sf-blue"
              value={newField.type}
              onChange={(e) => setNewField({ ...newField, type: e.target.value })}
            >
              {FIELD_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {newField.type === "picklist" && (
            <div>
              <label className="block text-sm font-medium text-sf-text mb-1">
                Picklist Values (one per line)
              </label>
              <textarea
                className="w-full px-3 py-2 border border-sf-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-sf-blue h-24"
                value={newField.picklistValues}
                onChange={(e) => setNewField({ ...newField, picklistValues: e.target.value })}
                placeholder={"Option 1\nOption 2\nOption 3"}
              />
            </div>
          )}

          {newField.type === "lookup" && (
            <div>
              <label className="block text-sm font-medium text-sf-text mb-1">
                Lookup Object
              </label>
              <select
                className="w-full px-3 py-2 border border-sf-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-sf-blue"
                value={newField.lookupObject}
                onChange={(e) => setNewField({ ...newField, lookupObject: e.target.value })}
              >
                <option value="">Select object...</option>
                {objects?.map((obj) => (
                  <option key={obj._id} value={obj.name}>{obj.label}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="required"
              className="h-4 w-4 rounded border-sf-border text-sf-blue"
              checked={newField.required}
              onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
            />
            <label htmlFor="required" className="text-sm text-sf-text">
              Required
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-sf-border">
            <Button type="button" onClick={() => setShowNewField(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="brand" disabled={saving || !newField.label.trim()}>
              {saving ? "Creating..." : "Create Field"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
