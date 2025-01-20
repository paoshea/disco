import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';
import { Slider } from '@/components/ui/Slider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

interface MatchPreferencesPanelProps {
  onSubmit: (data: MatchPreferencesFormData) => void;
  initialValues?: Partial<MatchPreferencesFormData>;
}

interface MatchPreferencesFormData {
  maxDistance: number;
  minAge?: number;
  maxAge?: number;
  interests: string[];
  timeWindow?: 'anytime' | 'now' | '15min' | '30min' | '1hour' | 'today';
  activityType?: string;
  privacyMode?: 'standard' | 'strict';
  useBluetoothProximity: boolean;
}

const schema = z.object({
  maxDistance: z.number().min(0).max(100),
  minAge: z.number().min(18).max(100).optional(),
  maxAge: z.number().min(18).max(100).optional(),
  interests: z.array(z.string()),
  timeWindow: z.enum(['anytime', 'now', '15min', '30min', '1hour', 'today']).optional(),
  activityType: z.string().optional(),
  privacyMode: z.enum(['standard', 'strict']).optional(),
  useBluetoothProximity: z.boolean()
});

export function MatchPreferencesPanel({ onSubmit, initialValues }: MatchPreferencesPanelProps) {
  const { register, handleSubmit, watch, setValue } = useForm<MatchPreferencesFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      maxDistance: 10,
      interests: [],
      useBluetoothProximity: false,
      ...initialValues
    }
  });

  const handleValueChange = (field: keyof MatchPreferencesFormData, value: unknown) => {
    setValue(field, value as never);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Match Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Distance Range (miles)</Label>
              <Slider
                value={[watch('maxDistance')]}
                min={0}
                max={100}
                step={1}
                onValueChange={([value]) => handleValueChange('maxDistance', value)}
              />
              <span className="text-sm text-gray-500">{watch('maxDistance')} miles</span>
            </div>

            <div className="space-y-2">
              <Label>Time Window</Label>
              <Select
                value={watch('timeWindow')}
                onValueChange={(value) => handleValueChange('timeWindow', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time window" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="anytime">Anytime</SelectItem>
                  <SelectItem value="now">Right Now</SelectItem>
                  <SelectItem value="15min">Next 15 Minutes</SelectItem>
                  <SelectItem value="30min">Next 30 Minutes</SelectItem>
                  <SelectItem value="1hour">Next Hour</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Privacy Mode</Label>
              <Select
                value={watch('privacyMode')}
                onValueChange={(value) => handleValueChange('privacyMode', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select privacy mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="strict">Strict</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Interests</Label>
              <div className="flex flex-wrap gap-2">
                {watch('interests').map((interest) => (
                  <Badge
                    key={interest}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => {
                      const interests = watch('interests').filter((i) => i !== interest);
                      handleValueChange('interests', interests);
                    }}
                  >
                    {interest} ×
                  </Badge>
                ))}
              </div>
              <Input
                placeholder="Add interest..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const value = (e.target as HTMLInputElement).value.trim();
                    if (value) {
                      const interests = [...watch('interests'), value];
                      handleValueChange('interests', interests);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Use Bluetooth Proximity</Label>
              <Switch
                checked={watch('useBluetoothProximity')}
                onCheckedChange={(checked) => handleValueChange('useBluetoothProximity', checked)}
              />
            </div>

            <Button type="submit" className="w-full">
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
