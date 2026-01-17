import { useGetCrisisBrainPrediction, useGetHistoricalAlerts } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, MapPin, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function CrisisBrainPanel() {
  const { data: prediction, isLoading: predictionLoading } = useGetCrisisBrainPrediction();
  const { data: historicalAlerts, isLoading: alertsLoading } = useGetHistoricalAlerts();

  const isLoading = predictionLoading || alertsLoading;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground mt-4">Analyzing data...</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate time-based patterns
  const hourCounts = new Map<number, number>();
  historicalAlerts?.forEach((alert) => {
    const date = new Date(Number(alert.timestamp) / 1000000);
    const hour = date.getHours();
    hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
  });

  const peakHours = Array.from(hourCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <Alert className="border-chart-1">
        <Brain className="h-5 w-5" />
        <AlertTitle>Crisis Brain Analytics</AlertTitle>
        <AlertDescription>
          AI-powered predictive analysis based on historical incident data and patterns
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-destructive" />
              High-Risk Areas
            </CardTitle>
            <CardDescription>Predicted locations requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            {!prediction || prediction.highRiskAreas.length === 0 ? (
              <p className="text-sm text-muted-foreground">No high-risk areas identified</p>
            ) : (
              <div className="space-y-3">
                {prediction.highRiskAreas.map(([location, label], index) => (
                  <div
                    key={index}
                    className="p-3 border rounded-lg space-y-1 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">High Risk</Badge>
                      <span className="font-semibold text-sm">{label}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span className="font-mono">
                        {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-chart-1" />
              Peak Activity Times
            </CardTitle>
            <CardDescription>Hours with highest incident rates</CardDescription>
          </CardHeader>
          <CardContent>
            {peakHours.length === 0 ? (
              <p className="text-sm text-muted-foreground">Insufficient data for analysis</p>
            ) : (
              <div className="space-y-3">
                {peakHours.map(([hour, count], index) => (
                  <div
                    key={hour}
                    className="flex items-center justify-between p-3 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-chart-1/10 text-chart-1 font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold">
                          {hour.toString().padStart(2, '0')}:00 - {((hour + 1) % 24).toString().padStart(2, '0')}:00
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {count} incident{count !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Increase patrol presence in high-risk areas during peak hours
            </AlertDescription>
          </Alert>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Consider installing additional emergency call stations in identified hotspots
            </AlertDescription>
          </Alert>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Review lighting and visibility in areas with frequent incidents
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
