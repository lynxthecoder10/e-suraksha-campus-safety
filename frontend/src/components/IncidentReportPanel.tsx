import { useState, useEffect } from 'react';
import { useReportIncident } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ExternalBlob } from 'declarations/backend';
import { Upload, X, MapPin, FileImage, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function IncidentReportPanel() {
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(true);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const reportIncident = useReportIncident();

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationError(null);
          setDetectingLocation(false);
        },
        (error) => {
          let errorMessage = 'Unable to get location. Using default coordinates.';

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Using default coordinates.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable. Using default coordinates.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Using default coordinates.';
              break;
          }

          setLocationError(errorMessage);
          setLocation({ latitude: 0, longitude: 0 });
          setDetectingLocation(false);
          console.error('Geolocation error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      const errorMessage = 'Geolocation not supported. Using default coordinates.';
      setLocationError(errorMessage);
      setLocation({ latitude: 0, longitude: 0 });
      setDetectingLocation(false);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);

      // Validate file sizes (max 10MB per file)
      const maxSize = 10 * 1024 * 1024; // 10MB
      const validFiles = newFiles.filter(file => {
        if (file.size > maxSize) {
          toast.error(`File ${file.name} is too large`, {
            description: 'Maximum file size is 10MB.',
          });
          return false;
        }

        // Validate file type
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
          toast.error(`File ${file.name} is not supported`, {
            description: 'Only images and videos are allowed.',
          });
          return false;
        }

        return true;
      });

      if (validFiles.length > 0) {
        setMediaFiles((prev) => [...prev, ...validFiles]);
        toast.success(`${validFiles.length} file(s) added`, {
          description: 'Ready to submit with your report.',
        });
      }
    }
  };

  const removeFile = (index: number) => {
    const fileName = mediaFiles[index]?.name;
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));

    // Clear upload progress for removed file
    if (fileName) {
      setUploadProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[fileName];
        return newProgress;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      toast.error('Description required', {
        description: 'Please provide a description of the incident.',
      });
      return;
    }

    if (!location) {
      toast.error('Location not available', {
        description: 'Please wait for location detection to complete.',
      });
      return;
    }

    try {
      const mediaBlobs: ExternalBlob[] = [];

      // Process media files with progress tracking
      if (mediaFiles.length > 0) {
        toast.info('Processing media files...', {
          description: `Uploading ${mediaFiles.length} file(s)`,
        });
      }

      for (let i = 0; i < mediaFiles.length; i++) {
        const file = mediaFiles[i];
        try {
          const arrayBuffer = await file.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);

          const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
            setUploadProgress((prev) => ({ ...prev, [file.name]: percentage }));
          });

          mediaBlobs.push(blob);
        } catch (error) {
          console.error(`Failed to process file ${file.name}:`, error);
          toast.error(`Failed to process ${file.name}`, {
            description: 'This file will be skipped.',
          });
        }
      }

      const reportId = await reportIncident.mutateAsync({
        description: description.trim(),
        location,
        media: mediaBlobs,
      });

      toast.success('Incident Report Submitted', {
        description: `Report ID: ${reportId.toString()}. Thank you for reporting.`,
        duration: 5000,
      });

      // Reset form
      setDescription('');
      setMediaFiles([]);
      setUploadProgress({});

      // Reset file input
      const fileInput = document.getElementById('media') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error: any) {
      console.error('Failed to submit incident report:', error);

      let errorMessage = 'Failed to submit incident report. Please try again.';
      let errorDescription = 'An unexpected error occurred.';

      if (error.message) {
        if (error.message.includes('Actor not available')) {
          errorMessage = 'Connection error';
          errorDescription = 'Please check your internet connection and try again.';
        } else if (error.message.includes('Unauthorized')) {
          errorMessage = 'Authentication required';
          errorDescription = 'Please log in again to submit reports.';
        } else if (error.message.includes('session')) {
          errorMessage = 'Session expired';
          errorDescription = 'Please log in again to continue.';
        } else {
          errorDescription = error.message;
        }
      }

      toast.error(errorMessage, {
        description: errorDescription,
        duration: 7000,
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report an Incident</CardTitle>
        <CardDescription>
          Submit safety concerns or incident reports with optional media attachments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {detectingLocation && (
            <Alert>
              <MapPin className="h-4 w-4 animate-pulse" />
              <AlertDescription>Detecting your location...</AlertDescription>
            </Alert>
          )}

          {locationError && (
            <Alert>
              <MapPin className="h-4 w-4" />
              <AlertDescription>{locationError}</AlertDescription>
            </Alert>
          )}

          {location && !detectingLocation && !locationError && (
            <Alert>
              <MapPin className="h-4 w-4" />
              <AlertDescription>
                Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Incident Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the incident in detail..."
              rows={5}
              required
              disabled={reportIncident.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="media">Attach Photos/Videos (Optional)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="media"
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
                disabled={reportIncident.isPending}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('media')?.click()}
                className="w-full"
                disabled={reportIncident.isPending}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Media
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Maximum file size: 10MB per file. Supported formats: Images and videos.
            </p>
          </div>

          {mediaFiles.length > 0 && (
            <div className="space-y-2">
              <Label>Attached Files ({mediaFiles.length})</Label>
              <div className="space-y-2">
                {mediaFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileImage className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {uploadProgress[file.name] !== undefined && uploadProgress[file.name] < 100 && (
                        <span className="text-xs text-muted-foreground">
                          {uploadProgress[file.name]}%
                        </span>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(index)}
                        disabled={reportIncident.isPending}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={reportIncident.isPending || !location || detectingLocation}
          >
            {reportIncident.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting Report...
              </>
            ) : (
              'Submit Incident Report'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
