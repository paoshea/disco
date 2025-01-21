import React from 'react';
import { Switch } from './Switch';

interface LabeledSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}

export function LabeledSwitch({ checked, onChange, label, description }: LabeledSwitchProps) {
  return (
    <div className="flex items-center justify-between space-x-4">
      <div className="space-y-0.5">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <Switch checked={checked} onChange={onChange} />
    </div>
  );
}
