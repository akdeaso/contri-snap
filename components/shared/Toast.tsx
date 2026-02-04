'use client';

import { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '@/components/ui/button';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="fixed top-4 right-4 z-[100] animate-in slide-in-from-top-2 duration-300">
      <div className={clsx(
        "flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md",
        type === 'success'
          ? "bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400"
          : "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400"
      )}>
        {type === 'success' ? (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ) : (
          <XCircle className="h-5 w-5 text-red-500" />
        )}
        <p className="text-sm font-medium">{message}</p>
        <Button
          variant="ghost"
          size="sm"
          icon={<X />}
          onClick={onClose}
          aria-label="Close toast"
        />
      </div>
    </div>
  );
}
