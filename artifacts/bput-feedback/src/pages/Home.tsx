import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useListWindows } from "@workspace/api-client-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: windows, isLoading } = useListWindows();
  const activeWindows = windows?.filter(w => w.isActive) || [];

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <div className="space-y-4 text-center py-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
          BPUT Academic Feedback System
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Secure, transparent, and structured feedback collection for the Biju Patnaik University of Technology.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="border-t-4 border-t-primary shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-2xl">Students</CardTitle>
            <CardDescription>Submit your academic feedback anonymously.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : activeWindows.length > 0 ? (
              <div className="space-y-4">
                <div className="text-sm font-medium">Active Feedback Windows:</div>
                {activeWindows.map(w => (
                  <div key={w.id} className="p-3 bg-muted rounded-md border text-sm flex justify-between items-center">
                    <div>
                      <div className="font-semibold">{w.title}</div>
                      <div className="text-muted-foreground">{w.academicYear} | Sem {w.semester}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-muted/50 rounded text-center text-sm text-muted-foreground">
                No active feedback windows at this time.
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Link href="/submit-feedback" className="w-full">
              <Button className="w-full" size="lg" disabled={activeWindows.length === 0}>
                Submit Feedback
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-t-4 border-t-secondary shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-2xl">Administration</CardTitle>
            <CardDescription>Access analytics and manage feedback windows.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6">
              Faculty and administrators can view detailed performance analytics, departmental comparisons, and manage ongoing feedback collection periods.
            </p>
            <div className="space-y-3">
              <Link href="/dashboard">
                <Button variant="outline" className="w-full justify-start">View Dashboard</Button>
              </Link>
              <Link href="/analytics">
                <Button variant="outline" className="w-full justify-start">Institution Analytics</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
