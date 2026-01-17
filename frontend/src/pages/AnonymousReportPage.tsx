import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Upload, X, Shield, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link } from '@tanstack/react-router';

export default function AnonymousReportPage() {
  const [description, setDescription] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const maxSize = 10 * 1024 * 1024;
      const validFiles = newFiles.filter(file => {
        if (file.size > maxSize) {
          toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
          return false;
        }
        return true;
      });
      setMediaFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      toast.error('Please provide a description');
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate device hash for abuse prevention
      const deviceHash = await generateDeviceHash();
      
      // In a real implementation, this would send to backend
      // For now, simulate submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Anonymous Report Submitted', {
        description: 'Your report has been received. Thank you for helping keep our campus safe.',
        duration: 5000,
      });
      
      setDescription('');
      setMediaFiles([]);
      
      const fileInput = document.getElementById('media') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error: any) {
      console.error('Failed to submit anonymous report:', error);
      toast.error('Submission Failed', {
        description: 'Failed to submit report. Please try again.',
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateDeviceHash = async (): Promise<string> => {
    const userAgent = navigator.userAgent;
    const screenRes = `${screen.width}x${screen.height}`;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const fingerprint = `${userAgent}-${screenRes}-${timezone}`;
    
    const encoder = new TextEncoder();
    const data = encoder.encode(fingerprint);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-accent/5">
      <Header />
      <main className="flex-1 container py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <Shield className="h-16 w-16 text-primary mx-auto" />
            <h1 className="text-3xl font-bold">Anonymous Shadow Report</h1>
            <p className="text-muted-foreground">
              Submit safety concerns anonymously. Your identity is protected.
            </p>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Privacy Notice:</strong> This form is completely anonymous. We use a hashed device identifier only to prevent abuse, not to track you.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Submit Anonymous Report</CardTitle>
              <CardDescription>
                Report safety concerns without revealing your identity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="description">Incident Description *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what you witnessed or experienced..."
                    rows={6}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="media">Attach Evidence (Optional)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="media"
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('media')?.click()}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Media
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Maximum file size: 10MB per file</p>
                </div>

                {mediaFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label>Attached Files ({mediaFiles.length})</Label>
                    <div className="space-y-2">
                      {mediaFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                          <span className="text-sm truncate flex-1">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Anonymous Report'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center">
            <Link to="/">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
