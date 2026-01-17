import { useGetAllFeedback } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Clock } from 'lucide-react';

export default function AdminFeedbackPanel() {
  const { data: feedback, isLoading } = useGetAllFeedback();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground mt-4">Loading feedback...</p>
        </CardContent>
      </Card>
    );
  }

  const averageRating = feedback && feedback.length > 0
    ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
    : '0';

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Feedback</CardTitle>
        <CardDescription>
          {feedback?.length || 0} feedback submission{feedback?.length !== 1 ? 's' : ''} • Average Rating: {averageRating}/5
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!feedback || feedback.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No feedback submitted yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedback.map((entry) => (
              <div
                key={entry.id.toString()}
                className="p-4 border rounded-lg space-y-2 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < entry.rating ? 'fill-chart-4 text-chart-4' : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                    <Badge variant="outline">{entry.rating}/5</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {new Date(Number(entry.timestamp) / 1000000).toLocaleDateString()}
                  </div>
                </div>
                <p className="text-sm">{entry.message}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
