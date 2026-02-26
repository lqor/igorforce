"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { DataTable } from "@/components/ui/DataTable";
import { FieldRenderer } from "./FieldRenderer";
import { PageSpinner } from "@/components/ui/Spinner";
import { Id } from "../../../convex/_generated/dataModel";
import { useRouter } from "next/navigation";

interface RecordListProps {
  objectName: string;
  objectId: Id<"objects">;
}

export function RecordList({ objectName, objectId }: RecordListProps) {
  const fields = useQuery(api.fields.listByObject, { objectId });
  const records = useQuery(api.records.listByObject, { objectId });
  const router = useRouter();

  if (!fields || !records) return <PageSpinner />;

  // Show first 6 non-textarea fields in list
  const visibleFields = fields
    .filter((f) => f.type !== "textarea")
    .slice(0, 6);

  const columns = visibleFields.map((f) => ({
    key: f.name,
    label: f.label,
    render: (value: any) => (
      <FieldRenderer value={value} type={f.type} lookupObject={f.lookupObject} />
    ),
  }));

  return (
    <DataTable
      columns={columns}
      rows={records}
      onRowClick={(row) => router.push(`/objects/${objectName}/${row._id}`)}
      emptyMessage="No records yet. Click New to create one."
    />
  );
}
