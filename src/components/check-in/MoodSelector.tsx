'use client'

import { MOOD_OPTIONS, type MoodType } from '@/types/database'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MoodSelectorProps {
  selectedMood: MoodType | null
  onMoodSelect: (mood: MoodType) => void
  disabled?: boolean
}

export function MoodSelector({ selectedMood, onMoodSelect, disabled = false }: MoodSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {MOOD_OPTIONS.map((mood) => (
        <Button
          key={mood.value}
          type="button"
          variant={selectedMood === mood.value ? 'default' : 'outline'}
          className={cn(
            'h-auto p-4 flex flex-col items-center space-y-2 transition-all',
            selectedMood === mood.value && 'ring-2 ring-primary ring-offset-2',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          onClick={() => !disabled && onMoodSelect(mood.value)}
          disabled={disabled}
        >
          <span className="text-2xl">{mood.emoji}</span>
          <span className="text-sm font-medium">{mood.label}</span>
        </Button>
      ))}
    </div>
  )
}
