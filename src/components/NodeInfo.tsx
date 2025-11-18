import { Node } from './GlobeNodes';
import { Card } from './ui/card';
import { X } from 'lucide-react';
import { Button } from './ui/button';

interface NodeInfoProps {
  node: Node | null;
  onClose: () => void;
}

export default function NodeInfo({ node, onClose }: NodeInfoProps) {
  if (!node) return null;

  const statusColors = {
    white: 'bg-white',
    green: 'bg-accent',
    red: 'bg-destructive',
    yellow: 'bg-[hsl(var(--node-yellow))]',
  };

  const statusLabels = {
    white: 'Active',
    green: 'Online',
    red: 'Critical',
    yellow: 'Warning',
  };

  return (
    <Card className="absolute top-4 right-4 w-80 p-4 bg-card/95 backdrop-blur-sm border-border">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-foreground">
          {node.name || `Node ${node.id}`}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-6 w-6 -mt-1 -mr-1"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Status:</span>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${statusColors[node.status]}`} />
            <span className="text-foreground">{statusLabels[node.status]}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">ID:</span>
          <span className="text-foreground font-mono text-xs">{node.id}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Coordinates:</span>
          <span className="text-foreground font-mono text-xs">
            {node.lat.toFixed(2)}°, {node.lon.toFixed(2)}°
          </span>
        </div>
      </div>
    </Card>
  );
}
