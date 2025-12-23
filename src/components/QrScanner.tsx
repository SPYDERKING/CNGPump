import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, CameraOff, Keyboard } from 'lucide-react';

interface QrScannerProps {
  onScan: (data: string) => void;
  isProcessing?: boolean;
}

export const QrScanner = ({ onScan, isProcessing }: QrScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanning = async () => {
    if (!containerRef.current) return;

    try {
      scannerRef.current = new Html5Qrcode('qr-reader');
      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          if (!isProcessing) {
            onScan(decodedText);
          }
        },
        () => {}
      );
      setIsScanning(true);
    } catch (error) {
      console.error('Error starting scanner:', error);
      setShowManualInput(true);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop();
      setIsScanning(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim() && !isProcessing) {
      onScan(manualCode.trim().toUpperCase());
      setManualCode('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Token Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          {!isScanning ? (
            <Button onClick={startScanning} className="flex-1">
              <Camera className="mr-2 h-4 w-4" />
              Start Camera
            </Button>
          ) : (
            <Button onClick={stopScanning} variant="destructive" className="flex-1">
              <CameraOff className="mr-2 h-4 w-4" />
              Stop Camera
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setShowManualInput(!showManualInput)}
          >
            <Keyboard className="h-4 w-4" />
          </Button>
        </div>

        <div
          id="qr-reader"
          ref={containerRef}
          className={`rounded-lg overflow-hidden ${isScanning ? '' : 'hidden'}`}
        />

        {showManualInput && (
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <Input
              placeholder="Enter token code (e.g., CNG-ABC123)"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              disabled={isProcessing}
            />
            <Button type="submit" disabled={isProcessing || !manualCode.trim()}>
              Verify
            </Button>
          </form>
        )}

        {isProcessing && (
          <div className="text-center text-muted-foreground">
            Processing token...
          </div>
        )}
      </CardContent>
    </Card>
  );
};
