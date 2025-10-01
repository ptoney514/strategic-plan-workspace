import React from 'react';
import { Goal } from '../lib/types';
import {
  getProgressQualitativeLabel,
  getProgressScoreOutOf5,
  getProgressColor
} from '../lib/types';

interface OverallProgressBarProps {
  goal: Goal;
  showLabel?: boolean;
  onClick?: () => void;
  isAdmin?: boolean;
}

export function OverallProgressBar({
  goal,
  showLabel = true,
  onClick,
  isAdmin = false
}: OverallProgressBarProps) {
  // Determine which progress value to use (override takes precedence)
  const progress = goal.overall_progress_override ?? goal.overall_progress ?? 0;
  const displayMode = goal.overall_progress_display_mode || 'percentage';
  const isManual = goal.overall_progress_source === 'manual';

  // Get color based on progress level
  const progressColor = getProgressColor(progress);

  // Don't render if mode is 'hidden'
  if (displayMode === 'hidden') {
    return null;
  }

  // Render different display based on mode
  const renderProgressLabel = () => {
    switch (displayMode) {
      case 'percentage':
        return `${Math.round(progress)}%`;
      case 'qualitative':
        return getProgressQualitativeLabel(progress);
      case 'score':
        return `${getProgressScoreOutOf5(progress)}/5.00`;
      case 'color-only':
        return null; // No label for color-only mode
      default:
        return `${Math.round(progress)}%`;
    }
  };

  const label = renderProgressLabel();

  // Tooltip content showing breakdown
  const tooltipContent = `
Overall Progress: ${Math.round(progress)}%
${isManual ? '(Manual Override)' : '(Auto-calculated)'}
${goal.overall_progress_override_reason ? `\nReason: ${goal.overall_progress_override_reason}` : ''}
  `.trim();

  return (
    <div
      className={`flex items-center gap-3 ${isAdmin && onClick ? 'cursor-pointer hover:opacity-80' : ''}`}
      onClick={onClick}
      title={tooltipContent}
    >
      {/* Progress Bar */}
      <div className="flex-1 min-w-[120px] max-w-[200px]">
        <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{
              width: `${Math.min(Math.max(progress, 0), 100)}%`,
              backgroundColor: progressColor
            }}
          />
        </div>
      </div>

      {/* Label */}
      {showLabel && label && (
        <div className="flex items-center gap-2">
          <span
            className="text-sm font-semibold whitespace-nowrap"
            style={{ color: progressColor }}
          >
            {label}
          </span>
          {isManual && (
            <span className="text-xs text-muted-foreground" title="Manually overridden by admin">
              (Manual)
            </span>
          )}
        </div>
      )}

      {/* Admin Edit Indicator */}
      {isAdmin && onClick && (
        <button
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Edit progress override"
        >
          ✏️
        </button>
      )}
    </div>
  );
}
