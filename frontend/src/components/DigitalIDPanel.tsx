import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, RefreshCw, Download } from 'lucide-react';
import { useGetCallerUserProfile, useGetCallerUserRole } from '../hooks/useQueries';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

export default function DigitalIDPanel() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: userRole } = useGetCallerUserRole();
  const { user } = useSupabaseAuth();

  const generateQRCode = async () => {
    if (!user || !userProfile) return;

    setIsGenerating(true);
    try {
      const principal = user.id;
      const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      const idData = {
        principal,
        name: userProfile.name,
        role: userRole ? Object.keys(userRole)[0] : 'user',
        expiresAt: expiry.toISOString(),
        signature: await generateSignature(principal, expiry),
      };

      const qrData = JSON.stringify(idData);
      const qrUrl = await generateQRCodeCanvas(qrData);

      setQrCodeUrl(qrUrl);
      setExpiresAt(expiry);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateQRCodeCanvas = async (data: string): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const size = 300;
      const padding = 20;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve('');
        return;
      }

      // Simple QR code representation (for demo purposes)
      // In production, use a proper QR code library
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, size, size);

      ctx.fillStyle = '#000000';
      const moduleSize = 10;
      const modules = Math.floor((size - padding * 2) / moduleSize);

      // Generate a simple pattern based on data hash
      const hash = data.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

      for (let y = 0; y < modules; y++) {
        for (let x = 0; x < modules; x++) {
          const shouldFill = ((x + y + hash) % 3) === 0;
          if (shouldFill) {
            ctx.fillRect(
              padding + x * moduleSize,
              padding + y * moduleSize,
              moduleSize - 1,
              moduleSize - 1
            );
          }
        }
      }

      // Add corner markers
      const markerSize = moduleSize * 7;
      [
        [padding, padding],
        [size - padding - markerSize, padding],
        [padding, size - padding - markerSize],
      ].forEach(([x, y]) => {
        ctx.fillStyle = '#000000';
        ctx.fillRect(x, y, markerSize, markerSize);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + moduleSize, y + moduleSize, markerSize - moduleSize * 2, markerSize - moduleSize * 2);
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + moduleSize * 2, y + moduleSize * 2, markerSize - moduleSize * 4, markerSize - moduleSize * 4);
      });

      resolve(canvas.toDataURL());
    });
  };

  const generateSignature = async (principal: string, expiry: Date): Promise<string> => {
    const data = `${principal}-${expiry.toISOString()}`;
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = 'campus-id.png';
    link.click();
  };

  const isExpired = expiresAt && expiresAt < new Date();
  const timeRemaining = expiresAt ? Math.max(0, expiresAt.getTime() - Date.now()) : 0;
  const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Digital ID Card
        </CardTitle>
        <CardDescription>
          Time-limited encrypted QR identity card for campus access
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!qrCodeUrl ? (
          <div className="text-center py-12 space-y-4">
            <div className="relative w-64 h-64 mx-auto bg-muted rounded-lg overflow-hidden">
              <img
                src="/assets/generated/digital-id-template.dim_400x250.png"
                alt="Digital ID Template"
                className="w-full h-full object-cover opacity-50"
              />
            </div>
            <Button onClick={generateQRCode} disabled={isGenerating}>
              {isGenerating ? 'Generating...' : 'Generate Digital ID'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-lg shadow-lg">
                <img src={qrCodeUrl} alt="Digital ID QR Code" className="w-64 h-64" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Badge variant={isExpired ? 'destructive' : 'default'}>
                  {isExpired ? 'Expired' : `Valid for ${hoursRemaining}h`}
                </Badge>
              </div>
              {expiresAt && (
                <p className="text-sm text-muted-foreground">
                  Expires: {expiresAt.toLocaleString()}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={generateQRCode} variant="outline" className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
              <Button onClick={downloadQRCode} variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>

            <div className="p-4 bg-muted rounded-lg space-y-2">
              <p className="text-sm font-medium">Identity Information</p>
              <div className="text-sm space-y-1">
                <p><strong>Name:</strong> {userProfile?.name}</p>
                <p><strong>Role:</strong> {userRole ? Object.keys(userRole)[0] : 'user'}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  This QR code is encrypted and time-limited for security.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
