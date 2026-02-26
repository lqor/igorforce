"use client";

import { FieldRenderer } from "./FieldRenderer";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";

interface RecordDetailProps {
  fields: Array<{
    name: string;
    label: string;
    type: string;
    lookupObject?: string;
  }>;
  data: Record<string, any>;
  title: string;
}

export function RecordDetail({ fields, data, title }: RecordDetailProps) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-base font-semibold text-sf-text">{title}</h2>
      </CardHeader>
      <CardBody>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              <dt className="text-xs font-medium text-sf-text-weak uppercase tracking-wider mb-1">
                {field.label}
              </dt>
              <dd className="text-sm text-sf-text">
                <FieldRenderer
                  value={data[field.name]}
                  type={field.type}
                  lookupObject={field.lookupObject}
                />
              </dd>
            </div>
          ))}
        </dl>
      </CardBody>
    </Card>
  );
}
