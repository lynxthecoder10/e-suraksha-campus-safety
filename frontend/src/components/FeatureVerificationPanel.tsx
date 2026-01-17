import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, AlertCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGetFeatureVerificationReport } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';

export default function FeatureVerificationPanel() {
  const { data: report, isLoading, error } = useGetFeatureVerificationReport();

  const handleExport = () => {
    if (!report) return;

    const exportData = {
      generatedAt: new Date().toISOString(),
      completion: Number(report.completion),
      coverage: Number(report.coverage),
      features: report.features.map(f => ({
        title: f.title,
        description: f.description,
        implemented: f.implemented,
        functional: f.functional,
        status: f.status,
        component: f.component,
        api: f.api,
        details: f.details,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `e-suraksha-feature-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Report</CardTitle>
          <CardDescription>Failed to generate feature verification report</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!report) return null;

  const completion = Number(report.completion);
  const coverage = Number(report.coverage);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{report.features.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Core system features</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Implementation Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completion}%</div>
            <Progress value={completion} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {report.features.filter(f => f.implemented).length} of {report.features.length} implemented
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Functional Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{coverage}%</div>
            <Progress value={coverage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {report.features.filter(f => f.functional).length} features fully functional
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Feature Details Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Feature Verification Report</CardTitle>
            <CardDescription>
              Comprehensive status of all E-Suraksha system features with component and API mapping
            </CardDescription>
          </div>
          <Button onClick={handleExport} variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Feature</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[100px]">Implemented</TableHead>
                  <TableHead className="w-[100px]">Functional</TableHead>
                  <TableHead>Components</TableHead>
                  <TableHead>Backend API</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.features.map((feature, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{feature.title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {feature.description}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          feature.status === 'Complete' || feature.status === 'Active'
                            ? 'default'
                            : feature.status === 'Not Implemented'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {feature.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {feature.implemented ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </TableCell>
                    <TableCell>
                      {feature.functional ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : feature.implemented ? (
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </TableCell>
                    <TableCell className="text-xs font-mono">
                      {feature.component || <span className="text-muted-foreground">N/A</span>}
                    </TableCell>
                    <TableCell className="text-xs font-mono">
                      {feature.api || <span className="text-muted-foreground">N/A</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Legend</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span>Implemented and functional</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <span>Implemented but not fully functional</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <XCircle className="h-4 w-4 text-red-600" />
            <span>Not implemented</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
