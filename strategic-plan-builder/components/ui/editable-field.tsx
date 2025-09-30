'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Edit2, Check, X } from 'lucide-react';
import { Button } from './button';

interface EditableFieldProps {
  value: string;
  onSave: (newValue: string) => Promise<void> | void;
  canEdit: boolean;
  fieldType?: 'title' | 'description' | 'text';
  className?: string;
  placeholder?: string;
  multiline?: boolean;
  disabled?: boolean;
}

export const EditableField: React.FC<EditableFieldProps> = ({
  value,
  onSave,
  canEdit,
  fieldType = 'text',
  className,
  placeholder = 'Enter text...',
  multiline = false,
  disabled = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Update local value when prop value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Select all text for easier editing
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (localValue.trim() === value.trim()) {
      // No changes, just exit edit mode
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    try {
      await onSave(localValue.trim());
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving field:', error);
      // Reset to original value on error
      setLocalValue(value);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setLocalValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    } else if (e.key === 'Enter' && multiline && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  const getFieldStyles = () => {
    switch (fieldType) {
      case 'title':
        return 'text-lg font-semibold';
      case 'description':
        return 'text-sm text-gray-600';
      default:
        return '';
    }
  };

  const getEditingStyles = () => {
    switch (fieldType) {
      case 'title':
        return 'text-lg font-semibold border-2 border-blue-500 rounded px-2 py-1';
      case 'description':
        return 'text-sm border-2 border-blue-500 rounded px-2 py-1 min-h-[60px] resize-y';
      default:
        return 'border-2 border-blue-500 rounded px-2 py-1';
    }
  };

  if (!canEdit) {
    // Read-only mode
    return (
      <div className={cn(getFieldStyles(), className)}>
        {value || <span className="text-gray-400 italic">{placeholder}</span>}
      </div>
    );
  }

  if (isEditing) {
    // Edit mode
    return (
      <div className="flex items-start gap-2">
        <div className="flex-1">
          {multiline ? (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className={cn(
                'w-full bg-white outline-none resize-none',
                getEditingStyles(),
                className
              )}
              placeholder={placeholder}
              disabled={isLoading}
              rows={multiline ? 3 : 1}
            />
          ) : (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="text"
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className={cn(
                'w-full bg-white outline-none',
                getEditingStyles(),
                className
              )}
              placeholder={placeholder}
              disabled={isLoading}
            />
          )}
        </div>
        <div className="flex gap-1 mt-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSave}
            disabled={isLoading}
            className="h-6 w-6 p-0 hover:bg-green-100"
          >
            <Check className="h-3 w-3 text-green-600" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancel}
            disabled={isLoading}
            className="h-6 w-6 p-0 hover:bg-red-100"
          >
            <X className="h-3 w-3 text-red-600" />
          </Button>
        </div>
      </div>
    );
  }

  // Display mode with edit indicator
  return (
    <div
      className={cn(
        'group relative cursor-pointer hover:bg-gray-50 rounded px-1 py-0.5 transition-colors',
        getFieldStyles(),
        className,
        disabled && 'cursor-not-allowed opacity-50'
      )}
      onClick={() => !disabled && setIsEditing(true)}
    >
      {value || <span className="text-gray-400 italic">{placeholder}</span>}
      {!disabled && (
        <Edit2 className="absolute -right-1 -top-1 h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </div>
  );
};

export default EditableField;