import { useState } from 'react';
import { useGetUserIncidentReports, useGetReportComments, useGetReportStatusHistory } from '../hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { FileText, Eye, Clock, MessageSquare, User, MapPin } from 'lucide-react';
import { Variant_closed_open_inProgress } from 'declarations/backend';

export default function UserReportsPanel() {
  const { data: reports = [], isLoading } = useGetUserIncidentReports();
  const [selectedReport, setSelectedReport] = useState<bigint | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const { data: comments = [] } = useGetReportComments(selectedReport);
  const { data: statusHistory = [] } = useGetReportStatusHistory(selectedReport);

  const handleViewDetails = (reportId: bigint) => {
    setSelectedReport(reportId);
    setDetailsDialogOpen(true);
  };

  const getStatusBadge = (status: Variant_closed_open_inProgress) => {
    switch (status) {
      case Variant_closed_open_inProgress.open:
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">Open</Badge>;
      case Variant_closed_open_inProgress.inProgress:
        return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">In Progress</Badge>;
      case Variant_closed_open_inProgress.closed:
        return <Badge variant="outline" className="bg-success/10 text-success border-success/30">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const selectedReportData = reports.find(r => r.id === selectedReport);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>You haven't submitted any reports yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {reports.map((report) => (
          <Card key={report.id.toString()} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="font-mono text-sm">Report #{report.id.toString()}</span>
                    {getStatusBadge(report.status)}
                  </div>
                  <p className="text-sm line-clamp-2">{report.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(Number(report.timestamp) / 1000000).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {report.location.latitude.toFixed(4)}, {report.location.longitude.toFixed(4)}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDetails(report.id)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Report Details #{selectedReport?.toString()}
            </DialogTitle>
            <DialogDescription>
              View your report details, status history, and admin comments
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            {selectedReportData && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Report ID:</span>
                      <p className="font-mono">#{selectedReportData.id.toString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <p>{getStatusBadge(selectedReportData.status)}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Submitted:</span>
                      <p>{new Date(Number(selectedReportData.timestamp) / 1000000).toLocaleString()}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Description:</span>
                    <p className="mt-1 p-3 bg-muted rounded-md">{selectedReportData.description}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Location:</span>
                    <p className="mt-1">
                      Lat: {selectedReportData.location.latitude.toFixed(4)},
                      Lng: {selectedReportData.location.longitude.toFixed(4)}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Status History
                  </h3>
                  {statusHistory.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No status updates yet</p>
                  ) : (
                    <div className="space-y-2">
                      {statusHistory.map((entry, index) => (
                        <div key={index} className="flex items-start gap-3 text-sm p-2 bg-muted/50 rounded">
                          <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="font-medium capitalize">{entry.status.replace('inProgress', 'In Progress')}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(Number(entry.timestamp) / 1000000).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Admin Comments
                  </h3>
                  {comments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No comments from administrators yet</p>
                  ) : (
                    <div className="space-y-2">
                      {comments.map((comment, index) => (
                        <div key={index} className="flex items-start gap-3 text-sm p-3 bg-muted/50 rounded">
                          <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div className="flex-1">
                            <p>{comment.comment}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(Number(comment.timestamp) / 1000000).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
