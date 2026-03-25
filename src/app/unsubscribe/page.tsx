"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";

function UnsubscribeContent() {
  const params = useSearchParams();
  const status = params.get("status");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>
            {status === "success" ? "Unsubscribed" : "Unsubscribe"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {status === "success" ? (
            <>
              <p className="text-muted-foreground mb-4">
                You have been successfully unsubscribed from NewDandasLetter.
              </p>
              <p className="text-sm text-muted-foreground">
                Changed your mind?{" "}
                <Link href="/subscribe" className="text-indigo-600 hover:underline">
                  Re-subscribe
                </Link>
              </p>
            </>
          ) : status === "not-found" ? (
            <p className="text-muted-foreground">
              This unsubscribe link is invalid or you are already unsubscribed.
            </p>
          ) : (
            <p className="text-muted-foreground">Processing your request...</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><p>Loading...</p></div>}>
      <UnsubscribeContent />
    </Suspense>
  );
}
