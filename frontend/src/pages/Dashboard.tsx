import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  ChevronRight,
  CreditCard,
  FileText,
  Home,
  Map,
  MessageSquare,
  PhoneCall,
  PlugZap,
  Radio,
  Shield,
  Smartphone,
  User,
  Wifi,
  type LucideIcon,
} from 'lucide-react';
import { useGetCallerUserProfile, useGetDashboardSummary } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';

const menuItems = [
  { value: 'home', label: 'Safety Home', helper: 'Emergency, campus status, device health', icon: Home },
  { value: 'alerts', label: 'Campus Alerts', helper: 'Live safety notices', icon: Bell },
  { value: 'report', label: 'Report Incident', helper: 'Send a concern to security', icon: FileText },
  { value: 'my-reports', label: 'My Reports', helper: 'Track submitted incidents', icon: FileText },
  { value: 'messages', label: 'Messages', helper: 'Talk to campus security', icon: MessageSquare },
  { value: 'map', label: 'Safety Map', helper: 'Routes, zones, and hotspots', icon: Map },
  { value: 'id', label: 'Digital ID', helper: 'QR-based campus access', icon: CreditCard },
  { value: 'profile', label: 'Profile', helper: 'Personal and emergency details', icon: User },
];

const campusDetails = [
  { label: 'Security desk', value: 'Open 24/7', helper: 'Main gate response team online', icon: Shield },
  { label: 'Safe routes', value: '6 active', helper: 'Library, hostel, labs, and parking', icon: Map },
  { label: 'Campus network', value: 'Connected', helper: 'Emergency updates enabled', icon: Wifi },
];

const deviceSignals = [
  { label: 'Location sharing', value: 92, helper: 'Ready for emergency response', icon: Radio },
  { label: 'Device connectivity', value: 88, helper: 'Online and receiving alerts', icon: Smartphone },
  { label: 'Emergency sync', value: 96, helper: 'SOS queue and messages available', icon: PlugZap },
];

export default function Dashboard() {
  const [activePage, setActivePage] = useState('home');

  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: dashboardSummary, isLoading: summaryLoading } = useGetDashboardSummary();

  const getInitials = (name: string) => name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const openPage = (page: string) => {
    setActivePage(page);
    requestAnimationFrame(() => {
      document.getElementById('student-page-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const userName = userProfile?.name || 'Student';
  const userInitials = getInitials(userName);
  const activeAlertsCount = Number(dashboardSummary?.activeAlertsCount || 0);
  const userReportsCount = Number(dashboardSummary?.userReportsCount || 0);
  const activeMenuItem = menuItems.find(item => item.value === activePage) || menuItems[0];
  const ActiveIcon = activeMenuItem.icon;

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,oklch(var(--background)),oklch(var(--accent)/0.45))]">
      <div className="container grid gap-6 py-5 pb-28 lg:grid-cols-[320px_1fr] lg:py-8">
        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-1 safe-scrollbar">
          <Card className="border-primary/15 bg-card/95 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14 border-2 border-primary/20 shadow-md">
                  <AvatarImage src={userProfile?.profilePhoto?.[0] || '/assets/generated/student-avatar-placeholder.dim_100x100.svg'} alt={userName} />
                  <AvatarFallback className="bg-primary text-lg font-bold text-primary-foreground">{userInitials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-base font-bold text-foreground">
                    {profileLoading ? 'Loading profile...' : userName}
                  </p>
                  <p className="text-xs text-muted-foreground">Student safety dashboard</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/25 bg-destructive/5 shadow-lg">
            <CardContent className="space-y-3 p-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-lg">
                <PhoneCall className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-destructive">Emergency is always one tap away</p>
                <p className="text-xs text-muted-foreground">Use the SOS button from any dashboard page.</p>
              </div>
              <Button
                variant="destructive"
                className="w-full rounded-2xl"
                onClick={() => document.getElementById('main-emergency-button')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              >
                Go to SOS
              </Button>
            </CardContent>
          </Card>

          <nav aria-label="Student dashboard menu" className="space-y-2">
            {menuItems.map(({ value, label, helper, icon: Icon }) => {
              const isActive = activePage === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => openPage(value)}
                  className={`w-full rounded-2xl border p-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isActive
                    ? 'border-primary/40 bg-primary text-primary-foreground shadow-lg shadow-primary/15'
                    : 'border-border/70 bg-card/90 hover:border-primary/30 hover:bg-primary/5'
                    }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="flex items-center gap-3">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isActive ? 'bg-primary-foreground/15' : 'bg-primary/10 text-primary'}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{label}</span>
                      <span className={`block text-xs ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{helper}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 opacity-70" />
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main id="student-page-content" className="min-w-0 scroll-mt-24 space-y-6">
          <section className="rounded-[2rem] border border-primary/15 bg-card/95 p-5 shadow-xl md:p-7">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <Badge variant="outline" className="mb-3 rounded-full border-success/30 bg-success/10 text-success">
                  <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                  Campus safety system online
                </Badge>
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                  {activePage === 'home' ? `Hi ${userName}, stay safe on campus.` : activeMenuItem.label}
                </h1>
                <p className="mt-2 max-w-2xl text-muted-foreground">
                  {activePage === 'home'
                    ? 'A calmer student dashboard focused on emergency access, campus status, and your essential safety tools.'
                    : activeMenuItem.helper}
                </p>
              </div>
              <HelpDialog />
            </div>
          </section>

          {activePage === 'home' ? (
            <HomePage
              activeAlertsCount={activeAlertsCount}
              userReportsCount={userReportsCount}
              summaryLoading={summaryLoading}
              openPage={openPage}
            />
          ) : (
            <FeaturePage icon={ActiveIcon} title={activeMenuItem.label} description={activeMenuItem.helper}>
              {activePage === 'alerts' && <ActiveAlertsPanel />}
              {activePage === 'report' && <IncidentReportPanel />}
              {activePage === 'my-reports' && <UserReportsPanel />}
              {activePage === 'messages' && <MessagingPanel />}
              {activePage === 'map' && <SafetyMapPanel />}
              {activePage === 'id' && <DigitalIDPanel />}
              {activePage === 'profile' && <UserProfilePanel />}
            </FeaturePage>
          )}
        </main>
      </div>

      <div className="fixed inset-x-3 bottom-3 z-40 rounded-3xl border border-border/70 bg-card/95 p-2 shadow-2xl backdrop-blur md:inset-x-auto md:left-5 md:w-80" aria-label="Emergency quick actions">
        <div className="grid grid-cols-3 gap-2 md:grid-cols-[1.25fr_1fr_1fr]">
          <Button
            variant="destructive"
            className="h-12 rounded-2xl gap-1.5 text-xs font-bold md:text-sm"
            onClick={() => document.getElementById('main-emergency-button')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
          >
            <PhoneCall className="h-4 w-4" />
            SOS
          </Button>
          <Button variant="outline" className="h-12 rounded-2xl gap-1.5 text-xs md:text-sm" onClick={() => openPage('report')}>
            <FileText className="h-4 w-4" />
            Report
          </Button>
          <Button variant="outline" className="h-12 rounded-2xl gap-1.5 text-xs md:text-sm" onClick={() => openPage('map')}>
            <Map className="h-4 w-4" />
            Map
          </Button>
        </div>
      </div>
    </div>
  );
}

type HomePageProps = {
  activeAlertsCount: number;
  userReportsCount: number;
  summaryLoading: boolean;
  openPage: (page: string) => void;
};

function HomePage({ activeAlertsCount, userReportsCount, summaryLoading, openPage }: HomePageProps) {
  return (
    <div className="space-y-6">
      <Card id="main-emergency-button" className="scroll-mt-24 border-2 border-destructive/30 bg-gradient-to-br from-destructive/10 via-card to-card shadow-2xl shadow-destructive/10">
        <CardHeader className="text-center">
          <Badge variant="outline" className="mx-auto w-fit rounded-full border-destructive/30 bg-background/80 text-destructive">
            Priority action
          </Badge>
          <CardTitle className="text-3xl text-destructive md:text-4xl">Emergency SOS</CardTitle>
          <CardDescription className="mx-auto max-w-2xl text-base">
            Press SOS to alert campus security and share your location. Keep this page open during travel, late hours, or when you feel unsafe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SOSPanel />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <StatusCard
          label="Active alerts"
          value={summaryLoading ? null : activeAlertsCount.toString()}
          helper={activeAlertsCount === 0 ? 'No active campus emergencies' : 'Open alerts need attention'}
          icon={AlertCircle}
          tone="destructive"
          onClick={() => openPage('alerts')}
        />
        <StatusCard
          label="Your reports"
          value={summaryLoading ? null : userReportsCount.toString()}
          helper={userReportsCount === 0 ? 'No reports submitted yet' : 'Tap to review status'}
          icon={FileText}
          tone="primary"
          onClick={() => openPage('my-reports')}
        />
        <StatusCard
          label="Safety status"
          value="Safe"
          helper="Campus safety services connected"
          icon={CheckCircle}
          tone="success"
          onClick={() => openPage('map')}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <Card className="border-primary/15 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Campus safety details
            </CardTitle>
            <CardDescription>Key campus information shown up front without crowding your tools.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3 xl:grid-cols-1">
            {campusDetails.map(({ label, value, helper, icon: Icon }) => (
              <div key={label} className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="rounded-xl bg-primary/10 p-2 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="rounded-full bg-background/70">{value}</Badge>
                </div>
                <p className="font-semibold">{label}</p>
                <p className="text-sm text-muted-foreground">{helper}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-primary/15 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              Device connectivity
            </CardTitle>
            <CardDescription>Quick confidence checks for emergency readiness.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {deviceSignals.map(({ label, value, helper, icon: Icon }) => (
              <div key={label} className="space-y-2 rounded-2xl border border-border/70 bg-muted/30 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    <p className="font-semibold">{label}</p>
                  </div>
                  <span className="text-sm font-bold text-primary">{value}%</span>
                </div>
                <Progress value={value} className="h-2" />
                <p className="text-xs text-muted-foreground">{helper}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

type StatusCardProps = {
  label: string;
  value: string | null;
  helper: string;
  icon: LucideIcon;
  tone: 'destructive' | 'primary' | 'success';
  onClick: () => void;
};

function StatusCard({ label, value, helper, icon: Icon, tone, onClick }: StatusCardProps) {
  const toneClass = {
    destructive: 'text-destructive bg-destructive/10 border-destructive/25',
    primary: 'text-primary bg-primary/10 border-primary/25',
    success: 'text-success bg-success/10 border-success/25',
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-3xl border border-border/70 bg-card p-5 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className={`rounded-2xl border p-3 ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      {value === null ? <Skeleton className="mt-2 h-9 w-20" /> : <p className="mt-1 text-3xl font-bold">{value}</p>}
      <p className="mt-1 text-sm text-muted-foreground">{helper}</p>
    </button>
  );
}

type FeaturePageProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
};

function FeaturePage({ icon: Icon, title, description, children }: FeaturePageProps) {
  return (
    <Card className="border-primary/15 shadow-xl">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Icon className="h-6 w-6 text-primary" />
              {title}
            </CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
          <Badge variant="outline" className="w-fit rounded-full bg-primary/5 text-primary">Dedicated page</Badge>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
