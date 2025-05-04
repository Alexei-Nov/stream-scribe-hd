
import { useState } from 'react';
import { ScreenShare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SourceSelectorProps {
  onSourceSelect: (source: 'monitor' | 'window' | 'browser') => void;
  disabled: boolean;
  activeSource?: 'monitor' | 'window' | 'browser';
}

const SourceSelector = ({ onSourceSelect, disabled, activeSource }: SourceSelectorProps) => {
  const [selected, setSelected] = useState<'monitor' | 'window' | 'browser'>(activeSource || 'monitor');

  const handleChange = (value: 'monitor' | 'window' | 'browser') => {
    setSelected(value);
    onSourceSelect(value);
  };

  return (
    <Card className="border-stream-border bg-stream-muted">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 font-medium">
          <ScreenShare size={18} className="text-stream-accent" />
          Select Source
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selected}
          onValueChange={handleChange as (value: string) => void}
          className="flex flex-col space-y-2"
          disabled={disabled}
        >
          <div className="flex items-center space-x-2 rounded-md border border-stream-border p-2 hover:bg-stream/30 cursor-pointer">
            <RadioGroupItem value="monitor" id="monitor" className="text-stream-accent" />
            <Label htmlFor="monitor" className="flex-1 cursor-pointer">
              Entire Screen
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 rounded-md border border-stream-border p-2 hover:bg-stream/30 cursor-pointer">
            <RadioGroupItem value="window" id="window" className="text-stream-accent" />
            <Label htmlFor="window" className="flex-1 cursor-pointer">
              Application Window
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 rounded-md border border-stream-border p-2 hover:bg-stream/30 cursor-pointer">
            <RadioGroupItem value="browser" id="browser" className="text-stream-accent" />
            <Label htmlFor="browser" className="flex-1 cursor-pointer">
              Browser Tab
            </Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default SourceSelector;
