import { useEffect, useState } from 'react';

interface CountdownTimerProps {
  expiresAt: number;
}

export function CountdownTimer({ expiresAt }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = expiresAt - now;
      setTimeLeft(remaining > 0 ? remaining : 0);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const formatTime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    parts.push(`${secs}s`);

    return parts.join(' ');
  };

  const isExpired = timeLeft <= 0;
  const isExpiringSoon = timeLeft > 0 && timeLeft <= 300; // 5 minutes

  return (
    <div className="flex items-center gap-2">
      <span className={`font-mono text-sm ${
        isExpired
          ? 'text-red-600 dark:text-red-400'
          : isExpiringSoon
          ? 'text-orange-600 dark:text-orange-400'
          : 'text-green-600 dark:text-green-400'
      }`}>
        {isExpired ? 'EXPIRED' : formatTime(timeLeft)}
      </span>
      {!isExpired && (
        <span className="text-xs text-foreground/60">
          until expiration
        </span>
      )}
    </div>
  );
}
