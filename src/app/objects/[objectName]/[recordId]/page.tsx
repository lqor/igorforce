"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { RecordDetail } from "@/components/records/RecordDetail";
import { RecordForm } from "@/components/records/RecordForm";
import { RelatedList } from "@/components/records/RelatedList";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { PageSpinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { useState } from "react";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Pencil, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function RecordDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const objectName = params.objectName as string;
  const recordId = params.recordId as string;

  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const object = useQuery(api.objects.getByName, { name: objectName });
  const fields = useQuery(
    api.fields.listByObject,
    object ? { objectId: object._id } : "skip"
  );
  const record = useQuery(api.records.get, { id: recordId as Id<"records"> });
  const lookupSources = useQuery(api.fields.listByLookupTarget, {
    targetObjectName: objectName,
  });

  const updateRecord = useMutation(api.records.update);
  const deleteRecord = useMutation(api.records.remove);

  if (object === undefined || fields === undefined || record === undefined) {
    return <PageSpinner />;
  }

  if (!object || !record) {
    return (
      <EmptyState
        icon="AlertTriangle"
        title="Record Not Found"
        description="This record may have been deleted."
        action={
          <Link href={`/objects/${objectName}`}>
            <Button variant="brand">Back to {objectName}</Button>
          </Link>
        }
      />
    );
  }

  const data = record.data as Record<string, any>;
  const nameField = fields?.find((f) => f.isNameField);
  const recordName = nameField
    ? data[nameField.name] || "Unnamed"
    : data.Name || data.LastName
      ? (data.FirstName ? `${data.FirstName} ${data.LastName}` : data.Name || data.LastName)
      : "Record";

  const handleDelete = async () => {
    await deleteRecord({ id: record._id });
    toast(`${object.label} deleted`, "success");
    router.push(`/objects/${objectName}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="px-6 pt-2">
        <Link
          href={`/objects/${objectName}`}
          className="inline-flex items-center gap-1 text-sm text-sf-blue hover:underline mb-2"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to {object.pluralLabel}
        </Link>
      </div>

      <PageHeader
        icon={object.icon}
        title={recordName}
        subtitle={object.label}
        actions={
          <div className="flex gap-2">
            <Button onClick={() => setEditing(true)}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        }
      />

      <div className="px-6 space-y-4 pb-8">
        <RecordDetail
          fields={fields || []}
          data={data}
          title="Details"
        />

        {/* Related Lists */}
        {lookupSources?.map((source) => (
          <RelatedList
            key={`${source.objectName}-${source.field.name}`}
            sourceObjectName={objectName}
            sourceRecordId={recordId}
            relatedObjectName={source.objectName}
            relatedObjectLabel={source.objectLabel}
            lookupFieldName={source.field.name}
          />
        ))}
      </div>

      {/* Edit Modal */}
      <Modal
        open={editing}
        onClose={() => setEditing(false)}
        title={`Edit ${object.label}`}
        size="lg"
      >
        <RecordForm
          fields={fields || []}
          initialData={data}
          onSubmit={async (newData) => {
            await updateRecord({ id: record._id, data: newData });
            toast(`${object.label} updated`, "success");
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Confirm Delete"
        size="sm"
      >
        <p className="text-sm text-sf-text mb-4">
          Are you sure you want to delete this {object.label.toLowerCase()}? This
          action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
