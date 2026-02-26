"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageSpinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import * as Icons from "lucide-react";
import Link from "next/link";
import { Database, TrendingUp } from "lucide-react";

export default function HomePage() {
  const objects = useQuery(api.objects.list);
  const seed = useMutation(api.seed.seed);
  const { toast } = useToast();

  if (!objects) return <PageSpinner />;

  const handleSeed = async () => {
    const result = await seed();
    toast(result === "Already seeded" ? "Data already seeded" : "Sample data created!", "success");
  };

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        icon="Zap"
        title="Home"
        subtitle="Welcome to IgorForce"
        actions={
          <Button variant="brand" onClick={handleSeed}>
            <Database className="h-4 w-4" />
            Seed Sample Data
          </Button>
        }
      />

      <div className="px-6 space-y-6">
        {/* Object Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {objects.map((obj) => {
            const Icon = (Icons as any)[obj.icon] || Icons.Box;
            return (
              <Link key={obj._id} href={`/objects/${obj.name}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardBody className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-sf-blue/10">
                      <Icon className="h-6 w-6 text-sf-blue" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sf-text">{obj.pluralLabel}</h3>
                      <p className="text-sm text-sf-text-weak">
                        View all {obj.pluralLabel.toLowerCase()}
                      </p>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Quick Stats */}
        {objects.length > 0 && <StatsSection />}
      </div>
    </div>
  );
}

function StatsSection() {
  const objects = useQuery(api.objects.list);

  return (
    <Card>
      <CardHeader>
        <h2 className="text-base font-semibold flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-sf-blue" />
          Overview
        </h2>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {objects?.map((obj) => (
            <ObjectStat key={obj._id} objectId={obj._id} label={obj.pluralLabel} icon={obj.icon} />
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

function ObjectStat({ objectId, label, icon }: { objectId: any; label: string; icon: string }) {
  const records = useQuery(api.records.listByObject, { objectId });
  const Icon = (Icons as any)[icon] || Icons.Box;

  return (
    <div className="flex items-center gap-3">
      <Icon className="h-5 w-5 text-sf-text-weak" />
      <div>
        <div className="text-2xl font-bold text-sf-navy">{records?.length ?? "—"}</div>
        <div className="text-sm text-sf-text-weak">Total {label}</div>
      </div>
    </div>
  );
}
