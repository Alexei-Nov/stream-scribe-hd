
import { Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';

interface SettingsPanelProps {
  quality: 'standard' | 'high' | 'ultra';
  onQualityChange: (quality: 'standard' | 'high' | 'ultra') => void;
  audioEnabled: boolean;
  onAudioToggle: () => void;
  isStreaming: boolean;
}

const SettingsPanel = ({
  quality,
  onQualityChange,
  audioEnabled,
  onAudioToggle,
  isStreaming
}: SettingsPanelProps) => {
  return (
    <Card className="border-stream-border bg-stream-muted">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 font-medium">
          <Settings size={18} className="text-stream-accent" />
          Stream Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Audio</Label>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Include Audio</span>
            <Switch 
              checked={audioEnabled} 
              onCheckedChange={onAudioToggle}
              disabled={isStreaming}
              className="data-[state=checked]:bg-stream-accent"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Stream Quality</Label>
          <RadioGroup 
            value={quality} 
            onValueChange={onQualityChange as (value: string) => void}
            className="space-y-2"
            disabled={isStreaming}
          >
            <div className="flex items-center space-x-2 rounded-md border border-stream-border p-2 hover:bg-stream/30 cursor-pointer">
              <RadioGroupItem value="standard" id="standard" className="text-stream-accent" />
              <Label htmlFor="standard" className="flex flex-1 justify-between cursor-pointer">
                <span>Standard</span>
                <span className="text-xs text-muted-foreground">720p</span>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 rounded-md border border-stream-border p-2 hover:bg-stream/30 cursor-pointer">
              <RadioGroupItem value="high" id="high" className="text-stream-accent" />
              <Label htmlFor="high" className="flex flex-1 justify-between cursor-pointer">
                <span>High</span>
                <span className="text-xs text-muted-foreground">1080p</span>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 rounded-md border border-stream-border p-2 hover:bg-stream/30 cursor-pointer">
              <RadioGroupItem value="ultra" id="ultra" className="text-stream-accent" />
              <Label htmlFor="ultra" className="flex flex-1 justify-between cursor-pointer">
                <span>Ultra</span>
                <span className="text-xs text-muted-foreground">4K</span>
              </Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
};

export default SettingsPanel;
