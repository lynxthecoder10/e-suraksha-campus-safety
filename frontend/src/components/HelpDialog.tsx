import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HelpCircle, Shield, FileText, MessageSquare, Map, AlertCircle } from 'lucide-react';

export default function HelpDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" size="icon" onClick={() => setOpen(true)}>
        <HelpCircle className="h-5 w-5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              E-Suraksha Help & Guide
            </DialogTitle>
            <DialogDescription>
              Learn how to use E-Suraksha features effectively
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="sos" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="sos">SOS</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="messaging">Messaging</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[50vh] mt-4">
              <TabsContent value="sos" className="space-y-4">
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Shield className="h-4 w-4 text-destructive" />
                    Emergency SOS System
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Purpose:</strong> Trigger immediate emergency alerts to campus security with your location.</p>
                    <p><strong>How to use:</strong></p>
                    <ol className="list-decimal list-inside space-y-1 ml-4">
                      <li>Click the large red SOS button on your dashboard</li>
                      <li>Select the emergency type (Medical, Police, Fire, or Other)</li>
                      <li>Your location will be automatically detected</li>
                      <li>Confirm the alert - you have 3 seconds to cancel</li>
                      <li>Your location will be shared with responders in real-time</li>
                    </ol>
                    <p><strong>Alternative methods:</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Voice command: Say "Help" or "Emergency"</li>
                      <li>Shake detection: Shake your device vigorously</li>
                    </ul>
                    <p className="text-warning"><strong>Important:</strong> Only use for genuine emergencies. False alarms may result in account restrictions.</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reports" className="space-y-4">
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Incident Reporting
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Purpose:</strong> Report safety concerns, incidents, or suspicious activities on campus.</p>
                    <p><strong>How to use:</strong></p>
                    <ol className="list-decimal list-inside space-y-1 ml-4">
                      <li>Navigate to the "Report" tab</li>
                      <li>Provide a detailed description of the incident</li>
                      <li>Your location will be automatically detected</li>
                      <li>Optionally attach photos or videos as evidence</li>
                      <li>Submit the report</li>
                    </ol>
                    <p><strong>Tracking your reports:</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>View all your reports in the "My Reports" tab</li>
                      <li>Check status updates (Open, In Progress, Closed)</li>
                      <li>Read admin comments and feedback</li>
                      <li>View complete status history</li>
                    </ul>
                    <p><strong>Common errors:</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Location permission denied: Enable location in browser settings</li>
                      <li>File too large: Maximum 10MB per file</li>
                      <li>Connection error: Check internet connection and try again</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="messaging" className="space-y-4">
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    Secure Messaging
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Purpose:</strong> Communicate securely with campus security personnel.</p>
                    <p><strong>How to use:</strong></p>
                    <ol className="list-decimal list-inside space-y-1 ml-4">
                      <li>Navigate to the "Messages" tab</li>
                      <li>Type your message in the input field</li>
                      <li>Click "Send" to deliver your message</li>
                      <li>View message history and responses</li>
                    </ol>
                    <p><strong>Best practices:</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Be clear and concise in your messages</li>
                      <li>Include relevant details (location, time, description)</li>
                      <li>Use for non-emergency communications</li>
                      <li>For emergencies, always use the SOS button</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="faq" className="space-y-4">
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-primary" />
                    Frequently Asked Questions
                  </h3>
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="font-semibold">Q: What happens when I trigger an SOS alert?</p>
                      <p className="text-muted-foreground">A: Campus security is immediately notified with your location. Responders will be dispatched to your location, and your location will be tracked in real-time until the alert is resolved.</p>
                    </div>
                    <div>
                      <p className="font-semibold">Q: Can I cancel an SOS alert?</p>
                      <p className="text-muted-foreground">A: Yes, you have 3 seconds to cancel before the alert is sent. After that, you can manually resolve the alert if it was triggered by mistake.</p>
                    </div>
                    <div>
                      <p className="font-semibold">Q: How do I enable location permissions?</p>
                      <p className="text-muted-foreground">A: In your browser settings, allow location access for this website. On mobile, also check your device's location settings.</p>
                    </div>
                    <div>
                      <p className="font-semibold">Q: What if my account is inactive?</p>
                      <p className="text-muted-foreground">A: Contact the campus administrator to reactivate your account. Accounts may be deactivated for policy violations or security reasons.</p>
                    </div>
                    <div>
                      <p className="font-semibold">Q: How do I update my profile information?</p>
                      <p className="text-muted-foreground">A: Navigate to the "Profile" tab to update your name, phone number, emergency contact, and date of birth.</p>
                    </div>
                    <div>
                      <p className="font-semibold">Q: Is my data secure?</p>
                      <p className="text-muted-foreground">A: Yes, all data is encrypted and stored securely. Location data is only shared during active SOS alerts with your consent.</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
