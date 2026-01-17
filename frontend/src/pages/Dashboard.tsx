import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import SOSPanel from '../components/SOSPanel';
import IncidentReportPanel from '../components/IncidentReportPanel';
import ActiveAlertsPanel from '../components/ActiveAlertsPanel';
import FeedbackPanel from '../components/FeedbackPanel';
import MessagingPanel from '../components/MessagingPanel';
import SafetyMapPanel from '../components/SafetyMapPanel';
import DigitalIDPanel from '../components/DigitalIDPanel';
import UserReportsPanel from '../components/UserReportsPanel';
import UserProfilePanel from '../components/UserProfilePanel';
import HelpDialog from '../components/HelpDialog';
import { 
  Bell, 
  FileText, 
  MessageSquare, 
  Map, 
  CreditCard, 
  Shield, 
  AlertCircle,
  CheckCircle,
  Clock,
  MessageCircle,
  IdCard,
  User
} from 'lucide-react';
import { useGetCallerUserProfile, useGetDashboardSummary } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('alerts');

  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: dashboardSummary, isLoading: summaryLoading } = useGetDashboardSummary();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const userName = userProfile?.name || 'Student';
  const userInitials = getInitials(userName);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container py-6 space-y-6 animate-fade-in">
        {/* Breadcrumb Navigation */}
        <Breadcrumb>
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

        {/* Page Title with Help */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Student Dashboard</h1>
            <p className="text-muted-foreground">Your safety is our priority</p>
          </div>
          <HelpDialog />
        </div>

        {/* Emergency SOS Button - Moved to Top */}
        <Card className="border-2 border-destructive/30 shadow-xl bg-gradient-to-br from-destructive/5 to-destructive/10">
          <CardContent className="p-6">
            <SOSPanel />
          </CardContent>
        </Card>

        {/* Personalized Header Area */}
        <Card className="border-2 border-primary/20 shadow-lg overflow-hidden">
          <div 
            className="h-24 bg-gradient-to-r from-primary via-primary/90 to-primary/80 relative"
            style={{
              backgroundImage: 'url(/assets/generated/personalized-header-bg.dim_800x120.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/60" />
          </div>
          <CardContent className="pt-0 pb-6 px-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 -mt-12 relative z-10">
              <Avatar className="h-24 w-24 border-4 border-background shadow-xl ring-2 ring-primary/20">
                <AvatarImage src={userProfile?.profilePhoto || "/assets/generated/student-avatar-placeholder.dim_100x100.png"} alt={userName} />
                <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                  {userInitials}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-2 mt-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl font-bold text-foreground">
                    {profileLoading ? <Skeleton className="h-8 w-32" /> : `Welcome, ${userName}`}
                  </h2>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                    <Shield className="h-3 w-3 mr-1" />
                    Student
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm">
                  Your safety is our priority. Quick access to emergency services and campus safety features.
                </p>
              </div>

              <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('profile')}
                  className="gap-2 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Profile</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('messages')}
                  className="gap-2 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Messages</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('id')}
                  className="gap-2 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all"
                >
                  <IdCard className="h-4 w-4" />
                  <span className="hidden sm:inline">Digital ID</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-destructive">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Alerts</CardTitle>
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <Skeleton className="h-10 w-20" />
              ) : (
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-foreground">{Number(dashboardSummary?.activeAlertsCount || 0)}</div>
                  <p className="text-xs text-muted-foreground">
                    {Number(dashboardSummary?.activeAlertsCount || 0) === 0 ? 'All clear' : 'Emergency situations'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Your Reports</CardTitle>
                <FileText className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <Skeleton className="h-10 w-20" />
              ) : (
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-foreground">{Number(dashboardSummary?.userReportsCount || 0)}</div>
                  <p className="text-xs text-muted-foreground">
                    {Number(dashboardSummary?.userReportsCount || 0) === 0 ? 'No reports yet' : 'Submitted incidents'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-success">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Safety Status</CardTitle>
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-success">Safe</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Last checked: {new Date().toLocaleTimeString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-6" />

        {/* Enhanced Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <Card className="border-2 border-primary/20">
            <CardContent className="p-2">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 h-auto gap-1 bg-transparent">
                <TabsTrigger 
                  value="alerts" 
                  className="flex flex-col sm:flex-row items-center gap-2 py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                >
                  <Bell className="h-5 w-5" />
                  <span className="text-xs sm:text-sm font-medium">Alerts</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="report" 
                  className="flex flex-col sm:flex-row items-center gap-2 py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                >
                  <FileText className="h-5 w-5" />
                  <span className="text-xs sm:text-sm font-medium">Report</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="my-reports" 
                  className="flex flex-col sm:flex-row items-center gap-2 py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                >
                  <FileText className="h-5 w-5" />
                  <span className="text-xs sm:text-sm font-medium">My Reports</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="messages" 
                  className="flex flex-col sm:flex-row items-center gap-2 py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span className="text-xs sm:text-sm font-medium">Messages</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="map" 
                  className="flex flex-col sm:flex-row items-center gap-2 py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                >
                  <Map className="h-5 w-5" />
                  <span className="text-xs sm:text-sm font-medium">Safety Map</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="id" 
                  className="flex flex-col sm:flex-row items-center gap-2 py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                >
                  <CreditCard className="h-5 w-5" />
                  <span className="text-xs sm:text-sm font-medium">Digital ID</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="profile" 
                  className="flex flex-col sm:flex-row items-center gap-2 py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                >
                  <User className="h-5 w-5" />
                  <span className="text-xs sm:text-sm font-medium">Profile</span>
                </TabsTrigger>
              </TabsList>
            </CardContent>
          </Card>

          <TabsContent value="alerts" className="space-y-4 animate-fade-in">
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Active Emergency Alerts
                </CardTitle>
                <CardDescription>
                  View and monitor active emergency situations on campus
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ActiveAlertsPanel />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="report" className="space-y-4 animate-fade-in">
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Report an Incident
                </CardTitle>
                <CardDescription>
                  Submit safety concerns or incident reports with location and media
                </CardDescription>
              </CardHeader>
              <CardContent>
                <IncidentReportPanel />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-reports" className="space-y-4 animate-fade-in">
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  My Incident Reports
                </CardTitle>
                <CardDescription>
                  View your submitted reports with status tracking and admin comments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserReportsPanel />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-4 animate-fade-in">
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Secure Messaging
                </CardTitle>
                <CardDescription>
                  Communicate securely with campus security personnel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MessagingPanel />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="map" className="space-y-4 animate-fade-in">
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Map className="h-5 w-5 text-primary" />
                  Campus Safety Map
                </CardTitle>
                <CardDescription>
                  View incident heat maps and evacuation routes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SafetyMapPanel />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="id" className="space-y-4 animate-fade-in">
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Digital Identity Card
                </CardTitle>
                <CardDescription>
                  Generate your QR-based digital ID for campus access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DigitalIDPanel />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4 animate-fade-in">
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  My Profile
                </CardTitle>
                <CardDescription>
                  View and update your profile information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserProfilePanel />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
