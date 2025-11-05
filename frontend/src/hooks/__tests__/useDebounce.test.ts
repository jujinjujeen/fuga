import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('test', 500));

    expect(result.current).toBe('test');
  });

  it('debounces value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    );

    expect(result.current).toBe('initial');

    // Update value
    rerender({ value: 'updated', delay: 500 });

    // Value should not change immediately
    expect(result.current).toBe('initial');

    // Fast-forward time by 400ms (not enough)
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current).toBe('initial');

    // Fast-forward remaining time
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe('updated');
  });

  it('cancels previous timeout on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      {
        initialProps: { value: 'first' },
      }
    );

    // Rapid updates
    rerender({ value: 'second' });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    rerender({ value: 'third' });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Should still have first value
    expect(result.current).toBe('first');

    // Complete the timeout
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Should have the last value
    expect(result.current).toBe('third');
  });

  it('uses custom delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 1000),
      {
        initialProps: { value: 'initial' },
      }
    );

    rerender({ value: 'updated' });

    // 500ms is not enough with 1000ms delay
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe('initial');

    // 1000ms should be enough
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe('updated');
  });

  it('handles different value types', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      {
        initialProps: { value: 123 },
      }
    );

    expect(result.current).toBe(123);

    rerender({ value: 456 });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe(456);
  });
});
