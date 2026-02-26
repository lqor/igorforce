"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import Link from "next/link";
import { Box, Database, Wrench } from "lucide-react";

export default function SetupPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader icon="Settings" title="Setup" subtitle="Configure your IgorForce org" />
      <div className="px-6 space-y-4">
        <Link href="/setup/objects">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardBody className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-sf-purple/10">
                <Box className="h-6 w-6 text-sf-purple" />
              </div>
              <div>
                <h3 className="font-semibold text-sf-text">Object Manager</h3>
                <p className="text-sm text-sf-text-weak">
                  Create custom objects, add fields, manage your data model
                </p>
              </div>
            </CardBody>
          </Card>
        </Link>
      </div>
    </div>
  );
}
