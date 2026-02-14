import { useState } from 'react';
import { useGetHistoricalReports, useUpdateIncidentReportStatus, useAddReportComment, useGetReportComments, useGetReportStatusHistory } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { FileText, Eye, MessageSquare, Clock, User, AlertCircle } from 'lucide-react';
import type { Variant_closed_open_inProgress } from 'declarations/backend';

export default function AdminReportManagementPanel() {
  const { data: reports = [], isLoading } = useGetHistoricalReports();
  const updateStatus = useUpdateIncidentReportStatus();
  const addComment = useAddReportComment();

  const [selectedReport, setSelectedReport] = useState<bigint | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<Variant_closed_open_inProgress | null>(null);
  const [newComment, setNewComment] = useState('');

  const { data: comments = [] } = useGetReportComments(selectedReport);
  const { data: statusHistory = [] } = useGetReportStatusHistory(selectedReport);

  const handleViewDetails = (reportId: bigint) => {
    setSelectedReport(reportId);
    setDetailsDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedReport || !newStatus) {
      toast.error('Please select a status');
      return;
    }

    try {
      await updateStatus.mutateAsync({ reportId: selectedReport, status: newStatus });
      toast.success('Report status updated successfully');
      setNewStatus(null);
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status', {
        description: error.message || 'Please try again',
      });
    }
  };

  const handleAddComment = async () => {
    if (!selectedReport || !newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      await addComment.mutateAsync({ reportId: selectedReport, comment: newComment.trim() });
      toast.success('Comment added successfully');
      setNewComment('');
    } catch (error: any) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment', {
        description: error.message || 'Please try again',
      });
    }
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Report Management
          </CardTitle>
          <CardDescription>Loading reports...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Report Management
          </CardTitle>
          <CardDescription>
            View, update, and manage all incident reports with status tracking and comments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No reports found
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map((report) => (
                    <TableRow key={report.id.toString()}>
                      <TableCell className="font-mono">#{report.id.toString()}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {report.user.toText().slice(0, 8)}...
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{report.description}</TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell>{new Date(Number(report.timestamp) / 1000000).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(report.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Report Details #{selectedReport?.toString()}
            </DialogTitle>
            <DialogDescription>
              View and manage incident report details, status, and comments
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            {selectedReportData && (
              <div className="space-y-6">
                {/* Report Information */}
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Report Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Report ID:</span>
                      <p className="font-mono">#{selectedReportData.id.toString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <p>{getStatusBadge(selectedReportData.status)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Submitted By:</span>
                      <p className="font-mono text-xs">{selectedReportData.user.toText().slice(0, 16)}...</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Date:</span>
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

                {/* Status History */}
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Status History
                  </h3>
                  {statusHistory.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No status history available</p>
                  ) : (
                    <div className="space-y-2">
                      {statusHistory.map((entry, index) => (
                        <div key={index} className="flex items-start gap-3 text-sm p-2 bg-muted/50 rounded">
                          <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="font-medium">{entry.status}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(Number(entry.timestamp) / 1000000).toLocaleString()}
                            </p>
                            {entry.comment && <p className="text-xs mt-1">{entry.comment}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Comments */}
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Admin Comments
                  </h3>
                  {comments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No comments yet</p>
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

                <Separator />

                {/* Update Status */}
                <div className="space-y-3">
                  <Label>Update Status</Label>
                  <div className="flex gap-2">
                    <Select value={newStatus || undefined} onValueChange={(value) => setNewStatus(value as Variant_closed_open_inProgress)}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select new status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={Variant_closed_open_inProgress.open}>Open</SelectItem>
                        <SelectItem value={Variant_closed_open_inProgress.inProgress}>In Progress</SelectItem>
                        <SelectItem value={Variant_closed_open_inProgress.closed}>Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleUpdateStatus} disabled={!newStatus || updateStatus.isPending}>
                      {updateStatus.isPending ? 'Updating...' : 'Update'}
                    </Button>
                  </div>
                </div>

                {/* Add Comment */}
                <div className="space-y-3">
                  <Label>Add Comment</Label>
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Enter your comment..."
                    rows={3}
                  />
                  <Button onClick={handleAddComment} disabled={!newComment.trim() || addComment.isPending} className="w-full">
                    {addComment.isPending ? 'Adding...' : 'Add Comment'}
                  </Button>
                </div>
              </div>
            )}
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
