import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Globe, Cloud } from 'lucide-react';

export default function LiveDeploymentPanel() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5 text-primary" />
              Cloud Infrastructure
            </CardTitle>
            <CardDescription>
              Deployment status and environment information
            </CardDescription>
          </div>
          <Badge variant="default" className="bg-green-600 hover:bg-green-700">Online</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Globe className="h-4 w-4" />
              Frontend Host
            </div>
            <div className="text-lg font-semibold">Netlify Enterprise</div>
            <div className="flex items-center gap-2 text-xs text-green-600">
              <CheckCircle2 className="h-3 w-3" />
              Git Integration: Active
            </div>
          </div>

          <div className="space-y-2 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Cloud className="h-4 w-4" />
              Backend Database
            </div>
            <div className="text-lg font-semibold">Supabase (PostgreSQL)</div>
            <div className="flex items-center gap-2 text-xs text-green-600">
              <CheckCircle2 className="h-3 w-3" />
              Real-time Replication: Active
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">System Metrics</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Region</span>
              <span>ap-south-1 (Mumbai)</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Environment</span>
              <span>Production</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Version</span>
              <span className="font-mono">v3.3.0</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Uptime</span>
              <span className="font-mono text-green-600">99.99%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
