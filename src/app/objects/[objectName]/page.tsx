"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { RecordList } from "@/components/records/RecordList";
import { PageSpinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Plus } from "lucide-react";

export default function ObjectListPage() {
  const params = useParams();
  const router = useRouter();
  const objectName = params.objectName as string;
  const object = useQuery(api.objects.getByName, { name: objectName });

  if (object === undefined) return <PageSpinner />;
  if (object === null) {
    return (
      <EmptyState
        icon="AlertTriangle"
        title="Object Not Found"
        description={`The object "${objectName}" does not exist.`}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        icon={object.icon}
        title={object.pluralLabel}
        subtitle={object.description}
        actions={
          <Button
            variant="brand"
            onClick={() => router.push(`/objects/${objectName}/new`)}
          >
            <Plus className="h-4 w-4" />
            New {object.label}
          </Button>
        }
      />
      <div className="px-6">
        <Card>
          <RecordList objectName={objectName} objectId={object._id} />
        </Card>
      </div>
    </div>
  );
}
