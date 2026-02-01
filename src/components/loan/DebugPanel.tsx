interface DebugPanelProps {
  borrowerId: string;
  isRepeat: boolean;
  docsReused: boolean;
  collateralChanged: boolean;
}

export function DebugPanel({ borrowerId, isRepeat, docsReused, collateralChanged }: DebugPanelProps) {
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-muted/95 backdrop-blur border rounded-lg p-3 text-xs font-mono max-w-lg mx-auto">
      <div className="font-semibold text-foreground mb-1">🔧 Debug Mode</div>
      <div className="grid grid-cols-2 gap-1 text-muted-foreground">
        <span>borrowerId:</span>
        <span className="text-foreground">{borrowerId || '(empty)'}</span>
        <span>isRepeat:</span>
        <span className={isRepeat ? 'text-primary' : 'text-foreground'}>{String(isRepeat)}</span>
        <span>docsReused:</span>
        <span className={docsReused ? 'text-primary' : 'text-foreground'}>{String(docsReused)}</span>
        <span>collateralChanged:</span>
        <span className={collateralChanged ? 'text-destructive' : 'text-foreground'}>{String(collateralChanged)}</span>
      </div>
    </div>
  );
}
