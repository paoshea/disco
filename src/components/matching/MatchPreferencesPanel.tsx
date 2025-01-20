import { useState } from 'react';
import { MatchPreferences } from '@/types/match';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface MatchPreferencesPanelProps {
  onUpdate: (preferences: MatchPreferences) => void;
}

export function MatchPreferencesPanel({ onUpdate }: MatchPreferencesPanelProps) {
  const [preferences, setPreferences] = useState<MatchPreferences>({
    maxDistance: 10,
    minAge: 18,
    maxAge: 100,
    interests: [],
    verifiedOnly: false,
    withPhoto: true,
    activityType: undefined,
    timeWindow: undefined,
    privacyMode: 'standard',
    useBluetoothProximity: false,
  });

  const [newInterest, setNewInterest] = useState('');

  const handleUpdate = () => {
    onUpdate(preferences);
  };

  const addInterest = () => {
    if (newInterest && !preferences.interests.includes(newInterest)) {
      setPreferences(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest],
      }));
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setPreferences(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest),
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Matching Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Maximum Distance ({preferences.maxDistance}km)</label>
          <Slider
            value={[preferences.maxDistance]}
            onValueChange={([value]) =>
              setPreferences(prev => ({ ...prev, maxDistance: value }))
            }
            min={1}
            max={100}
            step={1}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Minimum Age</label>
            <Input
              type="number"
              min={18}
              max={100}
              value={preferences.minAge}
              onChange={e =>
                setPreferences(prev => ({
                  ...prev,
                  minAge: parseInt(e.target.value),
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Maximum Age</label>
            <Input
              type="number"
              min={18}
              max={100}
              value={preferences.maxAge}
              onChange={e =>
                setPreferences(prev => ({
                  ...prev,
                  maxAge: parseInt(e.target.value),
                }))
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Activity Type</label>
          <Select
            value={preferences.activityType}
            onValueChange={value =>
              setPreferences(prev => ({ ...prev, activityType: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select activity type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="coffee">Coffee</SelectItem>
              <SelectItem value="lunch">Lunch</SelectItem>
              <SelectItem value="dinner">Dinner</SelectItem>
              <SelectItem value="networking">Networking</SelectItem>
              <SelectItem value="coworking">Coworking</SelectItem>
              <SelectItem value="sports">Sports</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Time Window</label>
          <Select
            value={preferences.timeWindow}
            onValueChange={value =>
              setPreferences(prev => ({ ...prev, timeWindow: value }))
            }
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
          <label className="text-sm font-medium">Interests</label>
          <div className="flex gap-2">
            <Input
              value={newInterest}
              onChange={e => setNewInterest(e.target.value)}
              placeholder="Add interest"
              onKeyPress={e => e.key === 'Enter' && addInterest()}
            />
            <Button onClick={addInterest}>Add</Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {preferences.interests.map(interest => (
              <Badge
                key={interest}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => removeInterest(interest)}
              >
                {interest} ×
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Verified Users Only</label>
            <Switch
              checked={preferences.verifiedOnly}
              onCheckedChange={checked =>
                setPreferences(prev => ({ ...prev, verifiedOnly: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Users with Photos Only</label>
            <Switch
              checked={preferences.withPhoto}
              onCheckedChange={checked =>
                setPreferences(prev => ({ ...prev, withPhoto: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Use Bluetooth Proximity</label>
            <Switch
              checked={preferences.useBluetoothProximity}
              onCheckedChange={checked =>
                setPreferences(prev => ({
                  ...prev,
                  useBluetoothProximity: checked,
                }))
              }
            />
          </div>
        </div>

        <Button className="w-full" onClick={handleUpdate}>
          Update Preferences
        </Button>
      </CardContent>
    </Card>
  );
}
