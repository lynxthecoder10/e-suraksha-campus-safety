import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGetLiveDeploymentInfo } from '../hooks/useQueries';
import { ExternalLink, Copy, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

export default function LiveDeploymentPanel() {
  const { data: deploymentInfo, isLoading, error } = useGetLiveDeploymentInfo();
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = async () => {
    if (!deploymentInfo?.url) return;

    try {
      await navigator.clipboard.writeText(deploymentInfo.url);
      setCopied(true);
      toast.success('URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy URL');
    }
  };

  const handleOpenUrl = () => {
    if (!deploymentInfo?.url) return;
    window.open(deploymentInfo.url, '_blank', 'noopener,noreferrer');
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('active') || statusLower.includes('live')) {
      return <Badge variant="default" className="bg-success text-success-foreground">Live</Badge>;
    }
    if (statusLower.includes('maintenance')) {
      return <Badge variant="outline" className="border-warning text-warning">Maintenance</Badge>;
    }
    return <Badge variant="secondary">{status}</Badge>;
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading Deployment Info...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Error Loading Deployment Info
          </CardTitle>
          <CardDescription>
            Unable to fetch live deployment information. Please try again later.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!deploymentInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Live Deployment</CardTitle>
          <CardDescription>
            No deployment information available yet. The application will be accessible once deployed to the Internet Computer network.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-muted-foreground/25 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Deployment information will appear here after the first deployment.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              Live Deployment
            </CardTitle>
            <CardDescription>
              Access your E-Suraksha application on the Internet Computer
            </CardDescription>
          </div>
          {getStatusBadge(deploymentInfo.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Production URL</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-md border border-border bg-muted/50 px-3 py-2 font-mono text-sm break-all">
              {deploymentInfo.url}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyUrl}
              title="Copy URL"
            >
              {copied ? (
                <CheckCircle2 className="h-4 w-4 text-success" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="default"
              size="icon"
              onClick={handleOpenUrl}
              title="Open in new tab"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Version</label>
            <p className="text-sm font-mono">{deploymentInfo.version}</p>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
            <p className="text-sm">{formatDate(deploymentInfo.lastUpdated)}</p>
          </div>
        </div>

        <div className="rounded-lg bg-muted/50 p-4 space-y-2">
          <h4 className="text-sm font-semibold">Quick Access</h4>
          <p className="text-xs text-muted-foreground">
            Share this URL with users to access the live E-Suraksha Campus Safety application. 
            The application is hosted on the Internet Computer blockchain for maximum security and reliability.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
