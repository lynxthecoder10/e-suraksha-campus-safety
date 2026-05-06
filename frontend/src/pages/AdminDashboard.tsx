import { useState, type ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  BarChart3,
  BellRing,
  ClipboardCheck,
  FileSearch,
  Fingerprint,
  Gauge,
  LockKeyhole,
  MessageSquareText,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Users,
  type LucideIcon,
} from 'lucide-react';
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

const adminTabs = [
  { value: 'review', label: 'Review', helper: 'Launch checks', icon: ClipboardCheck },
  { value: 'alerts', label: 'Alerts', helper: 'SOS response', icon: BellRing },
  { value: 'reports', label: 'Reports', helper: 'Incident queue', icon: FileSearch },
  { value: 'users', label: 'Users', helper: 'Accounts', icon: Users },
  { value: 'feedback', label: 'Feedback', helper: 'Campus voice', icon: MessageSquareText },
  { value: 'analytics', label: 'Analytics', helper: 'Risk insights', icon: BarChart3 },
  { value: 'admin', label: 'Admin', helper: 'Controls', icon: LockKeyhole },
  { value: 'audit', label: 'Audit', helper: 'Traceability', icon: Activity },
  { value: 'id', label: 'Verify ID', helper: 'QR scanner', icon: Fingerprint },
  { value: 'features', label: 'Features', helper: 'QA matrix', icon: Gauge },
];

const overviewCards = [
  { label: 'Response readiness', value: '24/7', helper: 'Operations console online', icon: ShieldCheck },
  { label: 'Review workflow', value: 'Guided', helper: 'Production checks first', icon: ClipboardCheck },
  { label: 'Risk intelligence', value: 'Live', helper: 'Heat map and AI insights', icon: BarChart3 },
];

const operatorWorkflow = [
  { label: 'Triage SOS', helper: 'Confirm live alerts and location context.', icon: BellRing },
  { label: 'Assign owner', helper: 'Route reports or students to the right responder.', icon: Users },
  { label: 'Close the loop', helper: 'Send updates and capture audit evidence.', icon: MessageSquareText },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('review');
  const selectedTab = adminTabs.find(tab => tab.value === activeTab) || adminTabs[0];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,oklch(var(--primary)/0.14),transparent_32%),linear-gradient(135deg,oklch(var(--background)),oklch(var(--muted)/0.65))]">
      <div className="container mx-auto space-y-6 px-4 py-6 md:py-8">
        <section className="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-card/90 p-5 shadow-2xl shadow-primary/10 backdrop-blur md:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,oklch(var(--primary)/0.12),transparent_48%,oklch(var(--warning)/0.12))]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="rounded-full border-primary/30 bg-primary/10 px-3 py-1 text-primary">
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  Command center
                </Badge>
                <Badge variant="outline" className="rounded-full border-success/30 bg-success/10 px-3 py-1 text-success">
                  <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                  Secure admin access
                </Badge>
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight md:text-5xl">Admin Dashboard</h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                  A streamlined operations cockpit for emergency response, reports, identity checks, analytics, and release readiness.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <TechnicalOverviewModal />
              <HelpDialog />
            </div>
          </div>

          <div className="relative mt-6 grid gap-3 md:grid-cols-3">
            {overviewCards.map(({ label, value, helper, icon: Icon }) => (
              <Card key={label} className="border-border/70 bg-background/80 shadow-sm">
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="mt-1 text-2xl font-bold">{value}</p>
                    <p className="text-xs text-muted-foreground">{helper}</p>
                  </div>
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="relative mt-4 rounded-3xl border border-primary/10 bg-background/70 p-4">
            <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-primary">Recommended response flow</p>
                <p className="text-xs text-muted-foreground">Designed to help operators move from signal to resolution with less hesitation.</p>
              </div>
              <Badge variant="outline" className="w-fit rounded-full bg-card/80">3-step playbook</Badge>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {operatorWorkflow.map(({ label, helper, icon: Icon }, index) => (
                <div key={label} className="flex gap-3 rounded-2xl border border-border/70 bg-card/80 p-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Step {index + 1}</p>
                    <p className="font-semibold text-foreground">{label}</p>
                    <p className="text-xs leading-5 text-muted-foreground">{helper}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
          <Card className="sticky top-16 z-20 border-primary/15 bg-card/95 p-3 shadow-lg backdrop-blur">
            <TabsList className="flex h-auto w-full justify-start gap-2 safe-scrollbar overflow-x-auto bg-transparent p-0">
              {adminTabs.map(({ value, label, helper, icon: Icon }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="min-w-[126px] flex-col items-start gap-1 rounded-2xl border border-transparent bg-muted/40 px-4 py-3 text-left data-[state=active]:border-primary/30 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"
                >
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <Icon className="h-4 w-4" />
                    {label}
                  </span>
                  <span className="text-[11px] opacity-75">{helper}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Card>

          <div className="rounded-[1.5rem] border border-primary/10 bg-card/90 p-4 shadow-xl shadow-primary/5 backdrop-blur md:p-6">
            <div className="mb-5 flex flex-col gap-2 rounded-2xl border border-primary/10 bg-primary/5 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-primary">Active workspace</p>
                <h2 className="text-2xl font-bold tracking-tight">{selectedTab.label}</h2>
                <p className="text-sm text-muted-foreground">{selectedTab.helper}</p>
              </div>
              <Badge variant="outline" className="w-fit rounded-full bg-background/80">
                Operator-friendly layout
              </Badge>
            </div>

            <TabsContent value="review" className="mt-0 space-y-4 animate-fade-in">
              <ProductionReviewReport />
            </TabsContent>

            <TabsContent value="id" className="mt-0 space-y-4 animate-fade-in">
              <AdminPanelShell icon={Fingerprint} title="Digital ID Verification" description="Verify student identities and access permissions.">
                <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-primary/20 bg-muted/30 p-10 text-center text-muted-foreground">
                  <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary">
                    <ScanLine className="h-12 w-12" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">ID Scanner</h3>
                  <p className="mt-2 max-w-md text-sm">Camera-based QR verification is reserved in this workspace so staff immediately understand where ID scanning will live.</p>
                </div>
              </AdminPanelShell>
            </TabsContent>

            <TabsContent value="alerts" className="mt-0 space-y-4 animate-fade-in">
              <AdminPanelShell icon={BellRing} title="Active Emergency Alerts" description="Monitor and respond to active SOS alerts across campus.">
                <ActiveAlertsPanel />
              </AdminPanelShell>
            </TabsContent>

            <TabsContent value="reports" className="mt-0 space-y-4 animate-fade-in">
              <AdminReportManagementPanel />
            </TabsContent>

            <TabsContent value="users" className="mt-0 space-y-4 animate-fade-in">
              <UserManagementPanel />
            </TabsContent>

            <TabsContent value="feedback" className="mt-0 space-y-4 animate-fade-in">
              <AdminPanelShell icon={MessageSquareText} title="User Feedback" description="Review feedback and ratings from campus users.">
                <AdminFeedbackPanel />
              </AdminPanelShell>
            </TabsContent>

            <TabsContent value="analytics" className="mt-0 space-y-4 animate-fade-in">
              <div className="grid gap-4 xl:grid-cols-2">
                <AdminPanelShell icon={BarChart3} title="Safety Heat Map" description="Incident density visualization and high-risk areas.">
                  <HeatMapPanel />
                </AdminPanelShell>
                <AdminPanelShell icon={Gauge} title="Crisis Brain Analytics" description="AI-powered risk assessment and predictions.">
                  <CrisisBrainPanel />
                </AdminPanelShell>
              </div>
            </TabsContent>

            <TabsContent value="admin" className="mt-0 space-y-4 animate-fade-in">
              <div className="grid gap-4 xl:grid-cols-2">
                <AdminElevationPanel />
                <LiveDeploymentPanel />
              </div>
            </TabsContent>

            <TabsContent value="audit" className="mt-0 space-y-4 animate-fade-in">
              <AdminPanelShell icon={Activity} title="Audit Logs" description="Comprehensive audit trail of all administrative actions.">
                <AuditLogPanel />
              </AdminPanelShell>
            </TabsContent>

            <TabsContent value="features" className="mt-0 space-y-4 animate-fade-in">
              <FeatureVerificationPanel />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

type AdminPanelShellProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
};

function AdminPanelShell({ icon: Icon, title, description, children }: AdminPanelShellProps) {
  return (
    <Card className="border-primary/20 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
