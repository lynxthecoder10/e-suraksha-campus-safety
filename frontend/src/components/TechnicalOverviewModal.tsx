import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Code, 
  Server, 
  Shield, 
  Database, 
  Smartphone, 
  Wifi, 
  Lock, 
  Zap,
  Globe,
  Layers,
  Package,
  GitBranch,
  Cloud,
  Activity,
  Eye,
  Bell,
  FileText,
  Users,
  MapPin,
  Camera,
  Radio,
  Cpu,
  HardDrive,
  Network
} from 'lucide-react';

export default function TechnicalOverviewModal() {
  const [open, setOpen] = useState(false);

  const techStack = {
    frontend: [
      { name: 'React 19', icon: <Code className="h-4 w-4" />, description: 'Modern UI library with hooks and concurrent features' },
      { name: 'TypeScript', icon: <Code className="h-4 w-4" />, description: 'Type-safe JavaScript for robust development' },
      { name: 'Vite', icon: <Zap className="h-4 w-4" />, description: 'Lightning-fast build tool and dev server' },
      { name: 'TailwindCSS', icon: <Layers className="h-4 w-4" />, description: 'Utility-first CSS framework with OKLCH colors' },
      { name: 'Shadcn/ui', icon: <Package className="h-4 w-4" />, description: 'Accessible component library with Radix UI' },
      { name: 'React Query', icon: <Database className="h-4 w-4" />, description: 'Powerful data fetching and caching' },
    ],
    backend: [
      { name: 'Motoko', icon: <Server className="h-4 w-4" />, description: 'Internet Computer native language' },
      { name: 'IC Canisters', icon: <Cloud className="h-4 w-4" />, description: 'Decentralized smart contract containers' },
      { name: 'Actor Model', icon: <Network className="h-4 w-4" />, description: 'Concurrent message-passing architecture' },
      { name: 'Stable Memory', icon: <HardDrive className="h-4 w-4" />, description: 'Persistent blockchain storage' },
    ],
    auth: [
      { name: 'Internet Identity', icon: <Shield className="h-4 w-4" />, description: 'Decentralized authentication system' },
      { name: 'Session Tokens', icon: <Lock className="h-4 w-4" />, description: '24-hour secure sessions with auto-refresh' },
      { name: 'Role-Based Access', icon: <Users className="h-4 w-4" />, description: 'Admin, Student, Security, Faculty roles' },
      { name: 'Audit Logging', icon: <FileText className="h-4 w-4" />, description: 'Comprehensive security event tracking' },
    ],
    storage: [
      { name: 'Caffeine Blob Storage', icon: <Database className="h-4 w-4" />, description: 'Large file storage for media' },
      { name: 'ExternalBlob API', icon: <Package className="h-4 w-4" />, description: 'Efficient blob handling with streaming' },
      { name: 'Direct URL Access', icon: <Globe className="h-4 w-4" />, description: 'Browser-cached HTTP URLs for media' },
      { name: 'Upload Progress', icon: <Activity className="h-4 w-4" />, description: 'Real-time upload tracking' },
    ],
    integrations: [
      { name: 'BLE Mesh', icon: <Radio className="h-4 w-4" />, description: 'Bluetooth Low Energy multi-hop networking' },
      { name: 'QR Code Scanner', icon: <Camera className="h-4 w-4" />, description: 'Camera-based QR code detection' },
      { name: 'Camera API', icon: <Camera className="h-4 w-4" />, description: 'Web camera access for media capture' },
      { name: 'Geolocation', icon: <MapPin className="h-4 w-4" />, description: 'GPS location tracking with fallback' },
      { name: 'Voice Detection', icon: <Bell className="h-4 w-4" />, description: 'Web Speech API for emergency phrases' },
      { name: 'Accelerometer', icon: <Smartphone className="h-4 w-4" />, description: 'Device shake detection for SOS' },
      { name: 'IoT Mock Layer', icon: <Cpu className="h-4 w-4" />, description: 'Panic poles, wearables, smart locks' },
    ],
    deployment: [
      { name: 'Internet Computer', icon: <Cloud className="h-4 w-4" />, description: 'Decentralized blockchain platform' },
      { name: 'HTTPS', icon: <Lock className="h-4 w-4" />, description: 'Secure encrypted connections' },
      { name: 'PWA-Enabled', icon: <Smartphone className="h-4 w-4" />, description: 'Progressive Web App capabilities' },
      { name: 'Global CDN', icon: <Globe className="h-4 w-4" />, description: 'Fast content delivery worldwide' },
    ],
    pwa: [
      { name: 'Service Worker v2', icon: <Cpu className="h-4 w-4" />, description: 'Enhanced caching and offline support' },
      { name: 'Web App Manifest', icon: <FileText className="h-4 w-4" />, description: 'Complete PWA configuration' },
      { name: 'Offline Caching', icon: <Database className="h-4 w-4" />, description: 'Multi-layer cache strategy' },
      { name: 'Install Prompts', icon: <Smartphone className="h-4 w-4" />, description: 'Chrome/Edge install detection' },
      { name: 'Background Sync', icon: <Wifi className="h-4 w-4" />, description: 'Automatic queue synchronization' },
      { name: 'Session Persistence', icon: <Lock className="h-4 w-4" />, description: 'Offline session caching' },
    ],
    security: [
      { name: 'WCAG 2.1 AA+', icon: <Eye className="h-4 w-4" />, description: 'Accessibility compliance' },
      { name: 'Encrypted Storage', icon: <Lock className="h-4 w-4" />, description: 'Secure localStorage encryption' },
      { name: 'Token Validation', icon: <Shield className="h-4 w-4" />, description: 'Backend session verification' },
      { name: 'Rate Limiting', icon: <Activity className="h-4 w-4" />, description: 'Protection against abuse' },
      { name: 'Audit Trails', icon: <FileText className="h-4 w-4" />, description: 'Immutable security logs' },
    ],
    realtime: [
      { name: 'WebSocket Simulation', icon: <Network className="h-4 w-4" />, description: 'Real-time messaging infrastructure' },
      { name: 'Live Location', icon: <MapPin className="h-4 w-4" />, description: '5-second GPS updates during SOS' },
      { name: 'Status Updates', icon: <Activity className="h-4 w-4" />, description: 'Real-time incident tracking' },
      { name: 'Push Ready', icon: <Bell className="h-4 w-4" />, description: 'Push notification infrastructure' },
    ],
    offline: [
      { name: 'SOS Queue', icon: <Bell className="h-4 w-4" />, description: 'Offline emergency alert queuing' },
      { name: 'Cached Dashboard', icon: <Layers className="h-4 w-4" />, description: 'Offline dashboard access' },
      { name: 'Auto Sync', icon: <Wifi className="h-4 w-4" />, description: 'Automatic synchronization on reconnect' },
      { name: 'Network Detection', icon: <Activity className="h-4 w-4" />, description: 'Online/offline status monitoring' },
    ],
    mobile: [
      { name: 'Shake Detection', icon: <Smartphone className="h-4 w-4" />, description: 'Accelerometer-based SOS trigger' },
      { name: 'Voice Commands', icon: <Bell className="h-4 w-4" />, description: 'Emergency phrase detection' },
      { name: 'Haptic Feedback', icon: <Smartphone className="h-4 w-4" />, description: 'Vibration confirmation' },
      { name: 'Touch Optimized', icon: <Smartphone className="h-4 w-4" />, description: 'Mobile-first responsive design' },
    ],
    accessibility: [
      { name: 'Screen Readers', icon: <Eye className="h-4 w-4" />, description: 'NVDA, JAWS, VoiceOver support' },
      { name: 'Keyboard Nav', icon: <Code className="h-4 w-4" />, description: 'Full keyboard navigation' },
      { name: 'ARIA Labels', icon: <Eye className="h-4 w-4" />, description: 'Comprehensive ARIA attributes' },
      { name: 'Color Contrast', icon: <Eye className="h-4 w-4" />, description: 'AA+ contrast ratios' },
    ],
  };

  const architecture = [
    {
      layer: 'Presentation Layer',
      icon: <Layers className="h-5 w-5" />,
      components: ['React Components', 'Shadcn/ui', 'TailwindCSS', 'Responsive Design'],
      description: 'User interface with modern component architecture'
    },
    {
      layer: 'Application Layer',
      icon: <Code className="h-5 w-5" />,
      components: ['React Query', 'State Management', 'Routing', 'Form Handling'],
      description: 'Business logic and application state'
    },
    {
      layer: 'Service Layer',
      icon: <Network className="h-5 w-5" />,
      components: ['Location Service', 'Voice Detection', 'Shake Detection', 'Offline Queue'],
      description: 'Device integration and service coordination'
    },
    {
      layer: 'API Layer',
      icon: <Server className="h-5 w-5" />,
      components: ['Actor Interface', 'Backend Queries', 'Mutations', 'Error Handling'],
      description: 'Backend communication and data fetching'
    },
    {
      layer: 'Backend Layer',
      icon: <Cloud className="h-5 w-5" />,
      components: ['Motoko Canisters', 'Authorization', 'Blob Storage', 'Session Management'],
      description: 'Decentralized backend on Internet Computer'
    },
    {
      layer: 'Storage Layer',
      icon: <Database className="h-5 w-5" />,
      components: ['Stable Memory', 'Blob Storage', 'Session Cache', 'Audit Logs'],
      description: 'Persistent blockchain storage'
    },
  ];

  const features = [
    { name: 'Emergency SOS', status: 'Active', coverage: '100%' },
    { name: 'Session Persistence', status: 'Active', coverage: '100%' },
    { name: 'Incident Reporting', status: 'Active', coverage: '100%' },
    { name: 'Media Upload', status: 'Active', coverage: '100%' },
    { name: 'Admin Management', status: 'Active', coverage: '100%' },
    { name: 'Role-Based Access', status: 'Active', coverage: '100%' },
    { name: 'PWA Installation', status: 'Active', coverage: '100%' },
    { name: 'Offline Support', status: 'Active', coverage: '100%' },
    { name: 'Location Tracking', status: 'Active', coverage: '100%' },
    { name: 'Audit Logging', status: 'Active', coverage: '100%' },
    { name: 'Crisis Brain', status: 'Active', coverage: '100%' },
    { name: 'Anonymous Reporting', status: 'Active', coverage: '100%' },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Code className="h-4 w-4 mr-2" />
          Technical Overview
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">E-Suraksha Technical Overview</DialogTitle>
          <DialogDescription>
            Comprehensive technical architecture and technology stack
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="stack" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="stack">Tech Stack</TabsTrigger>
            <TabsTrigger value="architecture">Architecture</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="deployment">Deployment</TabsTrigger>
          </TabsList>

          <TabsContent value="stack" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Code className="h-5 w-5 text-primary" />
                  Frontend Technologies
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {techStack.frontend.map((tech, idx) => (
                    <Card key={idx}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          {tech.icon}
                          <CardTitle className="text-sm">{tech.name}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground">{tech.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Server className="h-5 w-5 text-primary" />
                  Backend Technologies
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {techStack.backend.map((tech, idx) => (
                    <Card key={idx}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          {tech.icon}
                          <CardTitle className="text-sm">{tech.name}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground">{tech.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Authentication & Security
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {techStack.auth.map((tech, idx) => (
                    <Card key={idx}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          {tech.icon}
                          <CardTitle className="text-sm">{tech.name}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground">{tech.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  Storage Solutions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {techStack.storage.map((tech, idx) => (
                    <Card key={idx}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          {tech.icon}
                          <CardTitle className="text-sm">{tech.name}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground">{tech.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-primary" />
                  Device Integrations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {techStack.integrations.map((tech, idx) => (
                    <Card key={idx}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          {tech.icon}
                          <CardTitle className="text-sm">{tech.name}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground">{tech.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-primary" />
                  PWA Features
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {techStack.pwa.map((tech, idx) => (
                    <Card key={idx}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          {tech.icon}
                          <CardTitle className="text-sm">{tech.name}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground">{tech.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="architecture" className="space-y-6 mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">System Architecture Layers</h3>
              {architecture.map((layer, idx) => (
                <Card key={idx} className="border-l-4 border-l-primary">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      {layer.icon}
                      <CardTitle className="text-base">{layer.layer}</CardTitle>
                    </div>
                    <CardDescription>{layer.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {layer.components.map((component, cidx) => (
                        <Badge key={cidx} variant="secondary">{component}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-3">Data Flow</h3>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">1</div>
                        <div>
                          <p className="font-medium">User Interaction</p>
                          <p className="text-xs text-muted-foreground">React components handle user input and events</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">2</div>
                        <div>
                          <p className="font-medium">State Management</p>
                          <p className="text-xs text-muted-foreground">React Query manages server state and caching</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">3</div>
                        <div>
                          <p className="font-medium">API Communication</p>
                          <p className="text-xs text-muted-foreground">Actor interface calls backend canister methods</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">4</div>
                        <div>
                          <p className="font-medium">Backend Processing</p>
                          <p className="text-xs text-muted-foreground">Motoko canisters execute business logic</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">5</div>
                        <div>
                          <p className="font-medium">Data Persistence</p>
                          <p className="text-xs text-muted-foreground">Stable memory stores data on blockchain</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">6</div>
                        <div>
                          <p className="font-medium">Response & Update</p>
                          <p className="text-xs text-muted-foreground">UI updates with new data and feedback</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-6 mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Feature Implementation Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {features.map((feature, idx) => (
                  <Card key={idx}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{feature.name}</CardTitle>
                        <Badge className="bg-success text-success-foreground">{feature.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Coverage:</span>
                        <span className="font-semibold text-success">{feature.coverage}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-3">Performance Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Login Render</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-success">{'<'}200ms</div>
                      <p className="text-xs text-muted-foreground">Instant UI rendering</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">SOS Response</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-success">{'<'}500ms</div>
                      <p className="text-xs text-muted-foreground">Emergency alert speed</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Lighthouse Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-success">95+</div>
                      <p className="text-xs text-muted-foreground">PWA compliance</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="deployment" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Cloud className="h-5 w-5 text-primary" />
                  Deployment Platform
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {techStack.deployment.map((tech, idx) => (
                    <Card key={idx}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          {tech.icon}
                          <CardTitle className="text-sm">{tech.name}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground">{tech.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-3">Deployment Features</h3>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Globe className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Decentralized Hosting</p>
                          <p className="text-xs text-muted-foreground">Hosted on Internet Computer blockchain with no single point of failure</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Lock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">End-to-End Security</p>
                          <p className="text-xs text-muted-foreground">HTTPS encryption, secure session management, and blockchain immutability</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Zap className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">High Performance</p>
                          <p className="text-xs text-muted-foreground">Global CDN, optimized caching, and sub-second response times</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Smartphone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">PWA Installation</p>
                          <p className="text-xs text-muted-foreground">Installable on Android, iOS, Windows, Mac, and Linux devices</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Database className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Offline Capability</p>
                          <p className="text-xs text-muted-foreground">Service worker caching enables offline SOS and dashboard access</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Activity className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Auto Updates</p>
                          <p className="text-xs text-muted-foreground">Automatic service worker updates with user notification</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-3">Browser Support</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-2xl font-bold text-success">100%</div>
                      <p className="text-xs text-muted-foreground mt-1">Chrome/Edge</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-2xl font-bold text-warning">80%</div>
                      <p className="text-xs text-muted-foreground mt-1">Firefox</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-2xl font-bold text-warning">70%</div>
                      <p className="text-xs text-muted-foreground mt-1">Safari</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-2xl font-bold text-success">100%</div>
                      <p className="text-xs text-muted-foreground mt-1">Opera</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              <p>Version 30.0 • Built with ❤️ for Campus Safety</p>
              <p className="text-xs mt-1">Powered by Internet Computer & Caffeine.ai</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

