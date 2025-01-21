import React, { ChangeEvent } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select, SelectProps } from '@/components/ui/Select';
import { Switch } from "@/components/ui/Switch";
import { Slider } from '@/components/ui/Slider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { MatchPreferences } from '@/types/match';
import { toast } from '@/hooks/use-toast';
import type { ToastProps } from '@/components/ui/Toast';

interface MatchPreferencesPanelProps {
  onSubmit: (data: MatchPreferences) => void;
  initialValues?: Partial<MatchPreferences>;
}

const schema = z.object({
  maxDistance: z.number().min(0).max(100),
  minAge: z.number().min(18).max(100),
  maxAge: z.number().min(18).max(100),
  interests: z.array(z.string()),
  verifiedOnly: z.boolean(),
  withPhoto: z.boolean(),
  timeWindow: z.enum(['anytime', 'now', '15min', '30min', '1hour', 'today']).optional(),
  activityType: z.string().optional(),
  privacyMode: z.enum(['standard', 'strict']).optional(),
  useBluetoothProximity: z.boolean().optional()
});

const timeWindowOptions = [
  { value: 'anytime', label: 'Anytime' },
  { value: 'now', label: 'Right Now' },
  { value: '15min', label: 'Next 15 Minutes' },
  { value: '30min', label: 'Next 30 Minutes' },
  { value: '1hour', label: 'Next Hour' },
  { value: 'today', label: 'Today' }
];

const privacyModeOptions = [
  { value: 'standard', label: 'Standard' },
  { value: 'strict', label: 'Strict' }
];

export function MatchPreferencesPanel({ onSubmit, initialValues }: MatchPreferencesPanelProps) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<MatchPreferences>({
    resolver: zodResolver(schema),
    defaultValues: {
      maxDistance: 50,
      minAge: 18,
      maxAge: 99,
      interests: [],
      verifiedOnly: false,
      withPhoto: true,
      useBluetoothProximity: false,
      ...initialValues
    }
  });

  const [newInterest, setNewInterest] = React.useState('');
  const interests = watch('interests');

  const handleAddInterest = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    if (!value) {
      toast({
        title: "Invalid Interest",
        description: "Interest cannot be empty",
        variant: "destructive"
      } satisfies ToastProps);
      return;
    }
    
    const currentInterests = watch('interests');
    if (currentInterests.includes(value)) {
      toast({
        title: "Duplicate Interest",
        description: "This interest has already been added",
        variant: "destructive"
      } satisfies ToastProps);
      return;
    }

    setValue('interests', [...currentInterests, value]);
    setNewInterest('');
    toast({
      title: "Interest Added",
      description: `Added "${value}" to your interests`,
      variant: "default"
    } satisfies ToastProps);
  };

  const handleRemoveInterest = (interest: string) => {
    const currentInterests = watch('interests');
    setValue('interests', currentInterests.filter(i => i !== interest));
  };

  const handleTimeWindowChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setValue('timeWindow', value as MatchPreferences['timeWindow']);
  };

  const handlePrivacyModeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setValue('privacyMode', value as MatchPreferences['privacyMode']);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Match Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <div className="text-sm font-medium">Time Window</div>
            <Select
              {...register('timeWindow')}
              options={timeWindowOptions}
              value={watch('timeWindow') || ''}
              onChange={handleTimeWindowChange}
              placeholder="Select time window"
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Privacy Mode</div>
            <Select
              {...register('privacyMode')}
              options={privacyModeOptions}
              value={watch('privacyMode') || ''}
              onChange={handlePrivacyModeChange}
              placeholder="Select privacy mode"
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Interests</div>
            <div className="flex gap-2">
              <Input
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                placeholder="Add an interest"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest(e))}
              />
              <Button type="button" onClick={() => handleAddInterest({ target: { value: newInterest } } as any)}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {interests.map((interest) => (
                <Badge
                  key={interest}
                  variant="secondary"
                  className="cursor-pointer group"
                >
                  <span className="group-hover:text-destructive-foreground">
                    {interest}{' '}
                    <button
                      type="button"
                      className="hover:text-destructive"
                      onClick={() => handleRemoveInterest(interest)}
                    >
                      ×
                    </button>
                  </span>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Maximum Distance (km)</div>
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
            <div className="text-sm font-medium">Age Range</div>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="number"
                  {...register('minAge', { valueAsNumber: true })}
                  placeholder="Min Age"
                />
              </div>
              <div className="flex-1">
                <Input
                  type="number"
                  {...register('maxAge', { valueAsNumber: true })}
                  placeholder="Max Age"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Verified Users Only</div>
              <Switch
                checked={watch('verifiedOnly') ?? false}
                onChange={(checked: boolean) => setValue('verifiedOnly', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Users with Photos Only</div>
              <Switch
                checked={watch('withPhoto') ?? false}
                onChange={(checked: boolean) => setValue('withPhoto', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Use Bluetooth Proximity</div>
              <Switch
                checked={watch('useBluetoothProximity') ?? false}
                onChange={(checked: boolean) => setValue('useBluetoothProximity', checked)}
              />
            </div>
          </div>

          <Button type="submit" className="w-full">
            Save Preferences
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
