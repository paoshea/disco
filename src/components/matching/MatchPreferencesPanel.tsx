import React, { ChangeEvent, KeyboardEvent } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Slider } from '@/components/ui/Slider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { MatchPreferences } from '@/types/match';
import { useToast } from '@/hooks/use-toast';

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
  timeWindow: z
    .enum(['anytime', 'now', '15min', '30min', '1hour', 'today'])
    .optional(),
  activityType: z.string().optional(),
  privacyMode: z.enum(['standard', 'strict'] as const).optional(),
  useBluetoothProximity: z.boolean().optional(),
});

const timeWindowOptions = [
  { value: 'anytime', label: 'Anytime' },
  { value: 'now', label: 'Right Now' },
  { value: '15min', label: 'Next 15 Minutes' },
  { value: '30min', label: 'Next 30 Minutes' },
  { value: '1hour', label: 'Next Hour' },
  { value: 'today', label: 'Today' },
];

const privacyModeOptions = [
  { value: 'standard', label: 'Standard Privacy' },
  { value: 'strict', label: 'Strict Privacy' },
];

export function MatchPreferencesPanel({
  onSubmit,
  initialValues,
}: MatchPreferencesPanelProps) {
  const { register, handleSubmit, watch, setValue } = useForm<MatchPreferences>(
    {
      resolver: zodResolver(schema),
      defaultValues: {
        maxDistance: 50,
        minAge: 18,
        maxAge: 99,
        interests: [],
        verifiedOnly: false,
        withPhoto: true,
        timeWindow: 'anytime',
        privacyMode: 'standard',
        useBluetoothProximity: false,
        ...initialValues,
      },
    }
  );

  const { toast } = useToast();

  const handleSelectChange =
    (name: keyof MatchPreferences) => (value: string) => {
      setValue(name, value);
    };

  const handleInterestAdd = (
    e: KeyboardEvent<HTMLInputElement> | ChangeEvent<HTMLInputElement>
  ) => {
    e.preventDefault();
    const target = e.target as HTMLInputElement;
    const value = target.value.trim();

    if (!value) {
      toast({
        title: 'Invalid Interest',
        description: 'Interest cannot be empty',
        variant: 'error',
      });
      return;
    }

    const currentInterests = watch('interests') || [];
    if (currentInterests.includes(value)) {
      toast({
        title: 'Duplicate Interest',
        description: 'This interest has already been added',
        variant: 'error',
      });
      return;
    }

    setValue('interests', [...currentInterests, value]);
    target.value = '';
  };

  const handleRemoveInterest = (interest: string) => {
    const currentInterests = watch('interests');
    setValue(
      'interests',
      currentInterests.filter(i => i !== interest)
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Match Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={e => {
            void handleSubmit(onSubmit)(e);
          }}
          className="space-y-6"
        >
          <div className="space-y-2">
            <div className="text-sm font-medium">Time Window</div>
            <Select
              value={watch('timeWindow')}
              onValueChange={handleSelectChange('timeWindow')}
              options={timeWindowOptions}
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Privacy Mode</div>
            <Select
              value={watch('privacyMode')}
              onValueChange={handleSelectChange('privacyMode')}
              options={privacyModeOptions}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Interests</label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Add interests (comma separated)"
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    void handleInterestAdd(e);
                  }
                }}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  if (e.target.value.includes(',')) {
                    void handleInterestAdd(e);
                  }
                }}
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {watch('interests')?.map((interest: string) => (
                <div key={interest} className="relative group">
                  <Badge variant="secondary" className="pr-6">
                    {interest}
                  </Badge>
                  <button
                    type="button"
                    onClick={() => handleRemoveInterest(interest)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-500 hover:text-destructive"
                    aria-label={`Remove ${interest}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Maximum Distance (km)</div>
            <Slider
              {...register('maxDistance')}
              value={[watch('maxDistance')]}
              onValueChange={(value: number[]) =>
                setValue('maxDistance', value[0])
              }
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
                onChange={(checked: boolean) =>
                  setValue('verifiedOnly', checked)
                }
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
                onChange={(checked: boolean) =>
                  setValue('useBluetoothProximity', checked)
                }
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
