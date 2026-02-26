"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { PageSpinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import * as Icons from "lucide-react";
import Link from "next/link";

export default function ObjectManagerPage() {
  const objects = useQuery(api.objects.list);
  const removeObject = useMutation(api.objects.remove);
  const router = useRouter();
  const { toast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  if (!objects) return <PageSpinner />;

  const columns = [
    {
      key: "icon",
      label: "",
      className: "w-10",
      render: (_: any, row: any) => {
        const Icon = (Icons as any)[row.icon] || Icons.Box;
        return <Icon className="h-4 w-4 text-sf-blue" />;
      },
    },
    {
      key: "label",
      label: "Label",
      render: (_: any, row: any) => (
        <Link
          href={`/setup/objects/${row.name}/fields`}
          className="text-sf-blue hover:underline font-medium"
          onClick={(e) => e.stopPropagation()}
        >
          {row.label}
        </Link>
      ),
    },
    { key: "name", label: "API Name" },
    {
      key: "isCustom",
      label: "Type",
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
        row.isCustom ? (
          <button
            onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }}
            className="p-1 rounded hover:bg-red-50 text-sf-text-weak hover:text-sf-error"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ) : null,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        icon="Box"
        title="Object Manager"
        subtitle="Manage standard and custom objects"
        actions={
          <Button variant="brand" onClick={() => router.push("/setup/objects/new")}>
            <Plus className="h-4 w-4" />
            New Custom Object
          </Button>
        }
      />
      <div className="px-6">
        <Card>
          <DataTable
            columns={columns}
            rows={objects}
            onRowClick={(row) => router.push(`/setup/objects/${row.name}/fields`)}
          />
        </Card>
      </div>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Custom Object"
        size="sm"
      >
        <p className="text-sm text-sf-text mb-4">
          Are you sure you want to delete <strong>{deleteTarget?.label}</strong>?
          All fields and records will be permanently deleted.
        </p>
        <div className="flex justify-end gap-2">
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button
            variant="destructive"
            onClick={async () => {
              await removeObject({ id: deleteTarget._id });
              toast(`${deleteTarget.label} deleted`, "success");
              setDeleteTarget(null);
            }}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
