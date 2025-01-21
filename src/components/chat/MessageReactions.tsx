import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile, Heart, ThumbsUp, Star, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';

interface Reaction {
  id: string;
  emoji: string;
  count: number;
  users: string[];
}

interface MessageReactionsProps {
  messageId: string;
  reactions: Reaction[];
  currentUserId: string;
  onReactionAdd: (messageId: string, emoji: string) => void;
  onReactionRemove: (messageId: string, emoji: string) => void;
}

const commonEmojis = [
  { emoji: '❤️', label: 'Heart' },
  { emoji: '👍', label: 'Thumbs Up' },
  { emoji: '⭐', label: 'Star' },
  { emoji: '😊', label: 'Smile' },
  { emoji: '🎉', label: 'Party' },
  { emoji: '👏', label: 'Clap' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '💯', label: 'Perfect' },
];

export function MessageReactions({
  messageId,
  reactions,
  currentUserId,
  onReactionAdd,
  onReactionRemove,
}: MessageReactionsProps) {
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  const handleReactionClick = (emoji: string) => {
    const existingReaction = reactions.find(r => r.emoji === emoji);
    if (existingReaction?.users.includes(currentUserId)) {
      onReactionRemove(messageId, emoji);
    } else {
      onReactionAdd(messageId, emoji);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <AnimatePresence>
        {reactions.map(reaction => (
          <motion.div
            key={reaction.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="relative"
          >
            <Button
              variant={
                reaction.users.includes(currentUserId) ? 'secondary' : 'ghost'
              }
              size="sm"
              onClick={() => handleReactionClick(reaction.emoji)}
              className="flex items-center gap-1 px-2 py-1 text-sm"
            >
              <span>{reaction.emoji}</span>
              {reaction.count > 1 && (
                <span className="text-xs text-muted-foreground">
                  {reaction.count}
                </span>
              )}
            </Button>
          </motion.div>
        ))}
      </AnimatePresence>

      <Popover open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="px-2 py-1">
            <Plus className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2">
          <div className="grid grid-cols-4 gap-2">
            {commonEmojis.map(item => (
              <Button
                key={item.emoji}
                variant="ghost"
                size="sm"
                className="flex items-center justify-center p-2"
                onClick={() => {
                  handleReactionClick(item.emoji);
                  setIsEmojiPickerOpen(false);
                }}
              >
                <span className="text-lg">{item.emoji}</span>
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
