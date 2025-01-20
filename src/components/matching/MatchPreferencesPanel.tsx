import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, Label } from '@/components/ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
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
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<MatchPreferencesFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      maxDistance: 50,
      interests: [],
      useBluetoothProximity: false,
      ...initialValues
    }
  });

  const [newInterest, setNewInterest] = React.useState('');
  const interests = watch('interests');

  const handleAddInterest = () => {
    if (newInterest && !interests.includes(newInterest)) {
      setValue('interests', [...interests, newInterest]);
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setValue('interests', interests.filter(i => i !== interest));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Match Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label>Time Window</Label>
            <Select 
              {...register('timeWindow')}
              value={watch('timeWindow')}
              onChange={(value: string) => setValue('timeWindow', value as MatchPreferencesFormData['timeWindow'])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select time window" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="anytime">Anytime</SelectItem>
                <SelectItem value="now">Now</SelectItem>
                <SelectItem value="15min">15 minutes</SelectItem>
                <SelectItem value="30min">30 minutes</SelectItem>
                <SelectItem value="1hour">1 hour</SelectItem>
                <SelectItem value="today">Today</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Privacy Mode</Label>
            <Select 
              {...register('privacyMode')}
              value={watch('privacyMode')}
              onChange={(value: string) => setValue('privacyMode', value as MatchPreferencesFormData['privacyMode'])}
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
            <div className="flex gap-2">
              <Input
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                placeholder="Add an interest"
              />
              <Button type="button" onClick={handleAddInterest}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {interests.map((interest) => (
                <Badge
                  key={interest}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => handleRemoveInterest(interest)}
                >
                  {interest} ×
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Maximum Distance (km)</Label>
            <Slider
              {...register('maxDistance')}
              value={[watch('maxDistance')]}
              onValueChange={(value: number[]) => setValue('maxDistance', value[0])}
              min={0}
              max={100}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Use Bluetooth Proximity</Label>
              <Switch
                checked={watch('useBluetoothProximity')}
                onChange={(checked: boolean) => setValue('useBluetoothProximity', checked)}
              />
            </div>
          </div>

          <Button type="submit">Save Preferences</Button>
        </form>
      </CardContent>
    </Card>
  );
}
