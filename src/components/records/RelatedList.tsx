"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { FieldRenderer } from "./FieldRenderer";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Id } from "../../../convex/_generated/dataModel";

interface RelatedListProps {
  sourceObjectName: string;
  sourceRecordId: string;
  relatedObjectName: string;
  relatedObjectLabel: string;
  lookupFieldName: string;
}

export function RelatedList({
  sourceObjectName,
  sourceRecordId,
  relatedObjectName,
  relatedObjectLabel,
  lookupFieldName,
}: RelatedListProps) {
  const router = useRouter();
  const relatedObj = useQuery(api.objects.getByName, { name: relatedObjectName });
  const fields = useQuery(
    api.fields.listByObject,
    relatedObj ? { objectId: relatedObj._id } : "skip"
  );
  const records = useQuery(
    api.records.listByLookup,
    relatedObj
      ? {
          objectId: relatedObj._id,
          fieldName: lookupFieldName,
          lookupValue: sourceRecordId,
        }
      : "skip"
  );

  if (!relatedObj || !fields || !records) return null;

  const visibleFields = fields
    .filter((f) => f.type !== "textarea" && f.type !== "lookup")
    .slice(0, 5);

  const columns = visibleFields.map((f) => ({
    key: f.name,
    label: f.label,
    render: (value: any) => (
      <FieldRenderer value={value} type={f.type} lookupObject={f.lookupObject} />
    ),
  }));

  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold text-sf-text">
          {relatedObjectLabel} ({records.length})
        </h3>
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            router.push(
              `/objects/${relatedObjectName}/new?${lookupFieldName}=${sourceRecordId}`
            )
          }
        >
          <Plus className="h-3 w-3" />
          New
        </Button>
      </CardHeader>
      {records.length > 0 ? (
        <DataTable
          columns={columns}
          rows={records}
          onRowClick={(row) => router.push(`/objects/${relatedObjectName}/${row._id}`)}
        />
      ) : (
        <CardBody>
          <p className="text-sm text-sf-text-weak text-center py-4">
            No {relatedObjectLabel.toLowerCase()} records.
          </p>
        </CardBody>
      )}
    </Card>
  );
}
