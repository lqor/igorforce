"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { RecordForm } from "@/components/records/RecordForm";
import { PageSpinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";

export default function NewRecordPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const objectName = params.objectName as string;

  const object = useQuery(api.objects.getByName, { name: objectName });
  const fields = useQuery(
    api.fields.listByObject,
    object ? { objectId: object._id } : "skip"
  );
  const createRecord = useMutation(api.records.create);

  if (!object || !fields) return <PageSpinner />;

  // Pre-fill from query params (e.g., lookup fields from related lists)
  const initialData: Record<string, any> = {};
  for (const [key, value] of searchParams.entries()) {
    initialData[key] = value;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        icon={object.icon}
        title={`New ${object.label}`}
      />
      <div className="px-6">
        <Card>
          <CardBody>
            <RecordForm
              fields={fields}
              initialData={initialData}
              onSubmit={async (data) => {
                const id = await createRecord({ objectId: object._id, data });
                toast(`${object.label} created`, "success");
                router.push(`/objects/${objectName}/${id}`);
              }}
              onCancel={() => router.push(`/objects/${objectName}`)}
              submitLabel={`Save ${object.label}`}
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
