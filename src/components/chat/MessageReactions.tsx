import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ThumbsUp, Star, Smile, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}

interface MessageReactionsProps {
  messageId: string;
  reactions: Record<string, Reaction>;
  onReact: (messageId: string, emoji: string) => void;
  currentUserId: string;
}

const QUICK_REACTIONS = [
  { emoji: '❤️', icon: Heart },
  { emoji: '👍', icon: ThumbsUp },
  { emoji: '⭐', icon: Star },
  { emoji: '😊', icon: Smile },
];

const ALL_REACTIONS = [
  '❤️', '👍', '⭐', '😊', '😂', '🎉', '👏', '🔥', 
  '💯', '🙌', '💪', '💭', '💡', '💫', '✨', '🌟'
];

export function MessageReactions({
  messageId,
  reactions,
  onReact,
  currentUserId,
}: MessageReactionsProps) {
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const handleReaction = (emoji: string) => {
    onReact(messageId, emoji);
    setShowReactionPicker(false);
  };

  const reactionsList = Object.entries(reactions).map(([emoji, data]) => ({
    emoji,
    count: data.count,
    hasReacted: data.users.includes(currentUserId),
  }));

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      <AnimatePresence>
        {reactionsList.map(({ emoji, count, hasReacted }) => (
          <motion.button
            key={emoji}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleReaction(emoji)}
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs
              ${hasReacted 
                ? 'bg-primary/10 text-primary' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            <span className="mr-1">{emoji}</span>
            <span>{count}</span>
          </motion.button>
        ))}
      </AnimatePresence>

      <Popover open={showReactionPicker} onOpenChange={setShowReactionPicker}>
        <PopoverTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200"
          >
            <Plus className="w-4 h-4 text-gray-600" />
          </motion.button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" sideOffset={5}>
          <div className="space-y-2">
            <div className="flex gap-1">
              {QUICK_REACTIONS.map(({ emoji, icon: Icon }) => (
                <Button
                  key={emoji}
                  variant="ghost"
                  size="icon"
                  className="hover:bg-primary/10 hover:text-primary"
                  onClick={() => handleReaction(emoji)}
                >
                  <Icon className="w-4 h-4" />
                </Button>
              ))}
            </div>
            <div className="grid grid-cols-8 gap-1">
              {ALL_REACTIONS.map((emoji) => (
                <motion.button
                  key={emoji}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleReaction(emoji)}
                  className="w-6 h-6 flex items-center justify-center hover:bg-primary/10 rounded"
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
