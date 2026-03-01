// ============================================
// Groundwork - Debounced TextField
// ============================================
// A TextField wrapper that buffers keystrokes locally
// and flushes to the parent after a configurable delay.
// Prevents per-keystroke store updates and re-render cascades.
// ============================================

import { useState, useEffect, useRef } from 'react';
import { TextField, type TextFieldProps } from '@mui/material';

type DebouncedTextFieldProps = Omit<TextFieldProps, 'onChange' | 'value'> & {
  value: string;
  onChange: (value: string) => void;
  debounceMs?: number;
};

export function DebouncedTextField({
  value: externalValue,
  onChange,
  debounceMs = 300,
  onBlur: externalOnBlur,
  ...props
}: DebouncedTextFieldProps) {
  const [localValue, setLocalValue] = useState(externalValue);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const lastSentRef = useRef(externalValue);

  // Sync from external only when value changed externally (not from our own flush)
  useEffect(() => {
    if (externalValue !== lastSentRef.current) {
      setLocalValue(externalValue);
      lastSentRef.current = externalValue;
    }
  }, [externalValue]);

  // Cleanup timer on unmount
  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return (
    <TextField
      {...props}
      value={localValue}
      onChange={(e) => {
        const v = e.target.value;
        setLocalValue(v);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          lastSentRef.current = v;
          onChange(v);
        }, debounceMs);
      }}
      onBlur={(e) => {
        // Flush immediately on blur
        if (timerRef.current) clearTimeout(timerRef.current);
        if (localValue !== lastSentRef.current) {
          lastSentRef.current = localValue;
          onChange(localValue);
        }
        externalOnBlur?.(e);
      }}
    />
  );
}
