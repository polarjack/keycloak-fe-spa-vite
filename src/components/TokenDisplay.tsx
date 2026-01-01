import { CountdownTimer } from './CountdownTimer';

interface DecodedToken {
  [key: string]: unknown;
  exp?: number;
}

interface TokenDisplayProps {
  token: string;
  decodedToken: DecodedToken | null;
  title: string;
}

export function TokenDisplay({ token, decodedToken, title }: TokenDisplayProps) {
  const renderTokenValue = (key: string, value: unknown): React.ReactElement => {
    const isExpField = key === 'exp';
    const valueStr = typeof value === 'string' ? `"${value}"` : JSON.stringify(value);

    if (isExpField && typeof value === 'number') {
      const date = new Date(value * 1000);
      return (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded px-2 py-1 inline-block">
          <span className="text-yellow-600 dark:text-yellow-400 font-semibold">
            "{key}": {value}
          </span>
          <span className="text-foreground/60 text-xs ml-2">
            ({date.toLocaleString()})
          </span>
        </div>
      );
    }

    return <span className={isExpField ? 'font-semibold' : ''}>{`"${key}": ${valueStr}`}</span>;
  };

  const renderDecodedToken = (decoded: DecodedToken) => {
    const entries = Object.entries(decoded);

    return (
      <div className="space-y-1">
        <div className="text-foreground/70">{'{'}</div>
        {entries.map(([key, value], index) => (
          <div key={key} className="ml-4">
            {renderTokenValue(key, value)}
            {index < entries.length - 1 && ','}
          </div>
        ))}
        <div className="text-foreground/70">{'}'}</div>
      </div>
    );
  };

  return (
    <div className="bg-foreground/5 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        {decodedToken?.exp && (
          <CountdownTimer expiresAt={decodedToken.exp} />
        )}
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-medium mb-2 text-foreground/80">Raw Token:</h3>
        <div className="bg-background border border-foreground/10 rounded p-4 overflow-x-auto">
          <code className="text-xs text-foreground/70 break-all">
            {token || 'No token available'}
          </code>
        </div>
      </div>

      {decodedToken && (
        <div>
          <h3 className="text-sm font-medium mb-2 text-foreground/80">Decoded Token:</h3>
          <div className="bg-background border border-foreground/10 rounded p-4 overflow-x-auto">
            <pre className="text-xs text-foreground/70">
              {renderDecodedToken(decodedToken)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
