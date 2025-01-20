import React from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

export interface Emoji {
  id: string;
  name: string;
  native: string;
  unified: string;
  keywords: string[];
  shortcodes: string;
}

export interface EmojiPickerProps {
  onEmojiSelect: (emoji: Emoji) => void;
  theme?: 'light' | 'dark';
}

export function EmojiPicker({ onEmojiSelect, theme = 'light' }: EmojiPickerProps) {
  return (
    <div className="absolute bottom-full mb-2">
      <Picker 
        data={data} 
        onEmojiSelect={onEmojiSelect}
        theme={theme}
        previewPosition="none"
        skinTonePosition="none"
        navPosition="none"
        searchPosition="none"
        perLine={8}
        maxFrequentRows={1}
      />
    </div>
  );
}
