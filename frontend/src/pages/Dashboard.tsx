import { useState, type ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import SOSPanel from '../components/SOSPanel';
import IncidentReportPanel from '../components/IncidentReportPanel';
import ActiveAlertsPanel from '../components/ActiveAlertsPanel';
import MessagingPanel from '../components/MessagingPanel';
import SafetyMapPanel from '../components/SafetyMapPanel';
import DigitalIDPanel from '../components/DigitalIDPanel';
import UserReportsPanel from '../components/UserReportsPanel';
import UserProfilePanel from '../components/UserProfilePanel';
import HelpDialog from '../components/HelpDialog';
import {
  AlertCircle,
  Bell,
  CheckCircle,
  ClipboardCheck,
  CreditCard,
  FileText,
  IdCard,
  LifeBuoy,
  Map,
  MapPinned,
  MessageCircle,
  MessageSquare,
  Navigation,
  PhoneCall,
  Sparkles,
  User,
  type LucideIcon,
} from 'lucide-react';
import { useGetCallerUserProfile, useGetDashboardSummary } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';

const safetyChecklist = [
  { label: 'Location ready', helper: 'Keep location access on for faster response.', icon: MapPinned },
  { label: 'Report early', helper: 'Small concerns help security prevent escalation.', icon: ClipboardCheck },
  { label: 'Stay reachable', helper: 'Watch messages after SOS or reports.', icon: MessageCircle },
];

const tabItems = [
  { value: 'alerts', label: 'Alerts', helper: 'Live campus notices', icon: Bell },
  { value: 'report', label: 'Report', helper: 'Share an incident', icon: FileText },
  { value: 'my-reports', label: 'My Reports', helper: 'Track progress', icon: FileText },
  { value: 'messages', label: 'Messages', helper: 'Security chat', icon: MessageSquare },
  { value: 'map', label: 'Safety Map', helper: 'Routes & zones', icon: Map },
  { value: 'id', label: 'Digital ID', helper: 'Campus access', icon: CreditCard },
  { value: 'profile', label: 'Profile', helper: 'Personal details', icon: User },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('alerts');

  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: dashboardSummary, isLoading: summaryLoading } = useGetDashboardSummary();

  const getInitials = (name: string) => name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const userName = userProfile?.name || 'Student';
  const userInitials = getInitials(userName);
  const activeAlertsCount = Number(dashboardSummary?.activeAlertsCount || 0);
  const userReportsCount = Number(dashboardSummary?.userReportsCount || 0);
  const selectedTab = tabItems.find(item => item.value === activeTab) || tabItems[0];
  const openWorkspaceTab = (tab: string) => {
    setActiveTab(tab);
    requestAnimationFrame(() => {
      document.getElementById('safety-workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const accentStyles = {
    destructive: { icon: 'text-destructive', value: 'text-destructive' },
    primary: { icon: 'text-primary', value: 'text-primary' },
    success: { icon: 'text-success', value: 'text-success' },
  };

  const summaryCards = [
    {
      label: 'Active alerts',
      value: activeAlertsCount,
      detail: activeAlertsCount === 0 ? 'All clear across campus' : 'Needs immediate attention',
      icon: AlertCircle,
      accent: 'destructive',
      action: () => openWorkspaceTab('alerts'),
    },
    {
      label: 'Your reports',
      value: userReportsCount,
      detail: userReportsCount === 0 ? 'No reports submitted yet' : 'Submitted incidents',
      icon: FileText,
      accent: 'primary',
      action: () => openWorkspaceTab('my-reports'),
    },
    {
      label: 'Safety status',
      value: 'Safe',
      detail: `Updated ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      icon: CheckCircle,
      accent: 'success',
      action: () => openWorkspaceTab('map'),
    },
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,oklch(var(--primary)/0.14),transparent_34%),linear-gradient(135deg,oklch(var(--background)),oklch(var(--accent)/0.55))]">
      <div className="container space-y-6 py-5 pb-28 md:py-8 animate-fade-in">
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Student Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <section className="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-card/85 p-5 shadow-2xl shadow-primary/10 backdrop-blur md:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,oklch(var(--primary)/0.12),transparent_45%,oklch(var(--destructive)/0.10))]" />
          <div className="relative grid gap-6 lg:grid-cols-[1fr_380px] lg:items-center">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-primary hover:bg-primary/15" variant="outline">
                  <Sparkles className="h-3.5 w-3.5" />
                  Personal safety command center
                </Badge>
                <Badge className="gap-1.5 rounded-full border-success/30 bg-success/10 px-3 py-1 text-success" variant="outline">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Location-aware support
                </Badge>
              </div>

              <div className="space-y-3">
                <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-foreground md:text-5xl">
                  Welcome back{profileLoading ? '' : `, ${userName}`}. Stay connected, safe, and informed.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                  Trigger SOS, report incidents, message security, and view safer campus routes from one clean, mobile-friendly dashboard.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {summaryCards.map(({ label, value, detail, icon: Icon, accent, action }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={action}
                    className="group rounded-2xl border border-border/70 bg-background/80 p-4 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-muted-foreground">{label}</p>
                      <Icon className={`h-5 w-5 ${accentStyles[accent].icon}`} />
                    </div>
                    {summaryLoading && label !== 'Safety status' ? (
                      <Skeleton className="mt-3 h-9 w-20" />
                    ) : (
                      <p className={`mt-3 text-3xl font-bold ${accentStyles[accent].value}`}>{value}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="gap-2 rounded-full px-6" onClick={() => openWorkspaceTab('report')}>
                  <FileText className="h-4 w-4" />
                  Report a concern
                </Button>
                <Button size="lg" variant="outline" className="gap-2 rounded-full bg-background/70 px-6" onClick={() => openWorkspaceTab('map')}>
                  <Navigation className="h-4 w-4" />
                  Open safety map
                </Button>
                <HelpDialog />
              </div>

              <div className="grid gap-3 sm:grid-cols-3" aria-label="Safety checklist">
                {safetyChecklist.map(({ label, helper, icon: Icon }) => (
                  <div key={label} className="rounded-2xl border border-primary/10 bg-background/60 p-3">
                    <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">{label}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{helper}</p>
                  </div>
                ))}
              </div>
            </div>

            <Card id="emergency-sos" className="scroll-mt-24 border-destructive/25 bg-destructive/5 shadow-xl shadow-destructive/10">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                      <LifeBuoy className="h-5 w-5" />
                      Emergency ready
                    </CardTitle>
                    <CardDescription>One tap sends your alert and last known location.</CardDescription>
                  </div>
                  <Badge variant="outline" className="rounded-full border-destructive/30 bg-background/80 text-destructive">
                    24/7
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <SOSPanel />
              </CardContent>
            </Card>
          </div>
        </section>

        <Card id="safety-workspace" className="scroll-mt-24 overflow-hidden border-primary/15 bg-card/90 shadow-xl shadow-primary/5 backdrop-blur">
          <CardContent className="p-0">
            <div className="grid gap-0 lg:grid-cols-[300px_1fr]">
              <aside className="border-b bg-muted/30 p-4 lg:border-b-0 lg:border-r">
                <div className="mb-4 flex items-center gap-3 rounded-2xl bg-background/80 p-3 shadow-sm">
                  <Avatar className="h-14 w-14 border-2 border-primary/20 shadow-md">
                    <AvatarImage src={userProfile?.profilePhoto?.[0] || '/assets/generated/student-avatar-placeholder.dim_100x100.svg'} alt={userName} />
                    <AvatarFallback className="bg-primary text-lg font-bold text-primary-foreground">{userInitials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">{profileLoading ? 'Loading profile...' : userName}</p>
                    <p className="text-xs text-muted-foreground">Student safety profile</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 lg:flex-col">
                  <Button variant="outline" className="flex-1 justify-start gap-2 rounded-xl lg:flex-none" onClick={() => openWorkspaceTab('profile')}>
                    <User className="h-4 w-4" />
                    Profile
                  </Button>
                  <Button variant="outline" className="flex-1 justify-start gap-2 rounded-xl lg:flex-none" onClick={() => openWorkspaceTab('messages')}>
                    <MessageCircle className="h-4 w-4" />
                    Messages
                  </Button>
                  <Button variant="outline" className="flex-1 justify-start gap-2 rounded-xl lg:flex-none" onClick={() => openWorkspaceTab('id')}>
                    <IdCard className="h-4 w-4" />
                    Digital ID
                  </Button>
                </div>
              </aside>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="min-w-0 space-y-0">
                <div className="sticky top-16 z-20 border-b bg-card/95 p-3 backdrop-blur">
                  <TabsList className="flex h-auto w-full justify-start gap-2 safe-scrollbar overflow-x-auto bg-transparent p-0">
                    {tabItems.map(({ value, label, helper, icon: Icon }) => (
                      <TabsTrigger
                        key={value}
                        value={value}
                        className="min-w-[132px] flex-col items-start gap-1 rounded-2xl border border-transparent bg-muted/40 px-4 py-3 text-left data-[state=active]:border-primary/30 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"
                      >
                        <span className="flex items-center gap-2 text-sm font-semibold">
                          <Icon className="h-4 w-4" />
                          {label}
                        </span>
                        <span className="text-[11px] opacity-75">{helper}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                <div className="p-4 md:p-6">
                  <div className="mb-5 rounded-2xl border border-primary/10 bg-primary/5 p-4">
                    <p className="text-sm font-semibold text-primary">Now viewing</p>
                    <h2 className="text-2xl font-bold tracking-tight">{selectedTab.label}</h2>
                    <p className="text-sm text-muted-foreground">{selectedTab.helper}</p>
                  </div>

                  <TabsContent value="alerts" className="mt-0 space-y-4 animate-fade-in">
                    <PanelShell icon={Bell} title="Active Emergency Alerts" description="View and monitor active emergency situations on campus.">
                      <ActiveAlertsPanel />
                    </PanelShell>
                  </TabsContent>

                  <TabsContent value="report" className="mt-0 space-y-4 animate-fade-in">
                    <PanelShell icon={FileText} title="Report an Incident" description="Submit safety concerns or incident reports with location and media.">
                      <IncidentReportPanel />
                    </PanelShell>
                  </TabsContent>

                  <TabsContent value="my-reports" className="mt-0 space-y-4 animate-fade-in">
                    <PanelShell icon={FileText} title="My Incident Reports" description="View your submitted reports with status tracking and admin comments.">
                      <UserReportsPanel />
                    </PanelShell>
                  </TabsContent>

                  <TabsContent value="messages" className="mt-0 space-y-4 animate-fade-in">
                    <PanelShell icon={MessageSquare} title="Secure Messaging" description="Communicate securely with campus security personnel.">
                      <MessagingPanel />
                    </PanelShell>
                  </TabsContent>

                  <TabsContent value="map" className="mt-0 space-y-4 animate-fade-in">
                    <PanelShell icon={Map} title="Campus Safety Map" description="View incident heat maps, safer routes, and campus safety zones.">
                      <SafetyMapPanel />
                    </PanelShell>
                  </TabsContent>

                  <TabsContent value="id" className="mt-0 space-y-4 animate-fade-in">
                    <PanelShell icon={CreditCard} title="Digital Identity Card" description="Generate your QR-based digital ID for campus access.">
                      <DigitalIDPanel />
                    </PanelShell>
                  </TabsContent>

                  <TabsContent value="profile" className="mt-0 space-y-4 animate-fade-in">
                    <PanelShell icon={User} title="My Profile" description="View and update your profile information.">
                      <UserProfilePanel />
                    </PanelShell>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="fixed inset-x-3 bottom-3 z-40 rounded-3xl border border-border/70 bg-card/95 p-2 shadow-2xl backdrop-blur md:hidden" aria-label="Quick safety actions">
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="destructive"
            className="h-12 rounded-2xl gap-1.5 text-xs"
            onClick={() => document.getElementById('emergency-sos')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          >
            <PhoneCall className="h-4 w-4" />
            SOS
          </Button>
          <Button variant="outline" className="h-12 rounded-2xl gap-1.5 text-xs" onClick={() => openWorkspaceTab('report')}>
            <FileText className="h-4 w-4" />
            Report
          </Button>
          <Button variant="outline" className="h-12 rounded-2xl gap-1.5 text-xs" onClick={() => openWorkspaceTab('map')}>
            <Map className="h-4 w-4" />
            Map
          </Button>
        </div>
      </div>
    </div>
  );
}

type PanelShellProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
};

function PanelShell({ icon: Icon, title, description, children }: PanelShellProps) {
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
