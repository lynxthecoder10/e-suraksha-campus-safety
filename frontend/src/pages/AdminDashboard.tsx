import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpCircle, ScanLine } from 'lucide-react';
import ActiveAlertsPanel from '../components/ActiveAlertsPanel';
import AdminFeedbackPanel from '../components/AdminFeedbackPanel';
import HeatMapPanel from '../components/HeatMapPanel';
import CrisisBrainPanel from '../components/CrisisBrainPanel';
import UserManagementPanel from '../components/UserManagementPanel';
import AdminReportManagementPanel from '../components/AdminReportManagementPanel';
import AuditLogPanel from '../components/AuditLogPanel';
import AdminElevationPanel from '../components/AdminElevationPanel';
import LiveDeploymentPanel from '../components/LiveDeploymentPanel';
import FeatureVerificationPanel from '../components/FeatureVerificationPanel';
import { ProductionReviewReport } from '../components/ProductionReviewReport';
import TechnicalOverviewModal from '../components/TechnicalOverviewModal';
import HelpDialog from '../components/HelpDialog';

export default function AdminDashboard() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive campus safety management and monitoring
          </p>
        </div>
        <div className="flex gap-2">
          <TechnicalOverviewModal />
          <HelpDialog />
        </div>
      </div>

      <Tabs defaultValue="review" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-9">
          <TabsTrigger value="review">Review</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
          <TabsTrigger value="id">Verify ID</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        <TabsContent value="review" className="space-y-4">
          <ProductionReviewReport />
        </TabsContent>

        {/* ... existing tabs ... */}

        <TabsContent value="id" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Digital ID Verification</CardTitle>
              <CardDescription>
                Verify student identities and access permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Reusing DigitalIDPanel for now, typically Admin would have a Scanner here */}
              {/* For this MVP, we show the panel so admin can see what students see, 
                        or we could add a placeholder for "Scan QR" */}
              <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                <ScanLine className="h-12 w-12 mb-4 opacity-50" />
                <h3 className="text-lg font-medium">ID Scanner</h3>
                <p>Camera integration for QR verification coming in v3.4</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Emergency Alerts</CardTitle>
              <CardDescription>
                Monitor and respond to active SOS alerts across campus
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActiveAlertsPanel />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <AdminReportManagementPanel />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <UserManagementPanel />
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Feedback</CardTitle>
              <CardDescription>
                Review feedback and ratings from campus users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminFeedbackPanel />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Safety Heat Map</CardTitle>
                <CardDescription>
                  Incident density visualization and high-risk areas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HeatMapPanel />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Crisis Brain Analytics</CardTitle>
                <CardDescription>
                  AI-powered risk assessment and predictions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CrisisBrainPanel />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="admin" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <AdminElevationPanel />
            <LiveDeploymentPanel />
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>
                Comprehensive audit trail of all administrative actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AuditLogPanel />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <FeatureVerificationPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
