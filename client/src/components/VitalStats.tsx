interface VitalStatsProps {
  hp: { current: number; max: number };
  sanity: { current: number; max: number };
  onHpChange: (field: 'current' | 'max', value: number) => void;
  onSanityChange: (field: 'current' | 'max', value: number) => void;
}

export default function VitalStats({
  hp,
  sanity,
  onHpChange,
  onSanityChange,
}: VitalStatsProps) {
  const hpPercent = hp.max > 0 ? (hp.current / hp.max) * 100 : 0;
  const sanityPercent = sanity.max > 0 ? (sanity.current / sanity.max) * 100 : 0;

  return (
    <div className="card-occult space-y-3">
      <h3 className="font-display text-sm text-primary uppercase">Vitals</h3>

      {/* HP */}
      <div className="space-y-1">
        <label className="font-display text-xs text-primary uppercase block">HP</label>
        <div className="flex gap-1 items-center">
          <input
            type="number"
            value={hp.current}
            onChange={(e) => onHpChange('current', parseInt(e.target.value) || 0)}
            style={{ fontWeight: 700, fontFamily: "'Roboto Mono', monospace" }}
            className="w-10 bg-input border-2 border-primary text-primary text-center focus:outline-none focus:ring-2 focus:ring-primary text-xs p-1"
            min="0"
          />
          <span className="text-xs text-muted-foreground">/</span>
          <input
            type="number"
            value={hp.max}
            onChange={(e) => onHpChange('max', parseInt(e.target.value) || 0)}
            style={{ fontWeight: 700, fontFamily: "'Roboto Mono', monospace" }}
            className="w-10 bg-input border-2 border-primary text-primary text-center focus:outline-none focus:ring-2 focus:ring-primary text-xs p-1"
            min="0"
          />
        </div>
        <div className="w-full bg-black border border-primary h-3 overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300"
            style={{ width: `${hpPercent}%` }}
          />
        </div>
      </div>

      {/* Sanity */}
      <div className="space-y-1">
        <label className="font-display text-xs text-primary uppercase block">Sanidade</label>
        <div className="flex gap-1 items-center">
          <input
            type="number"
            value={sanity.current}
            onChange={(e) => onSanityChange('current', parseInt(e.target.value) || 0)}
            style={{ fontWeight: 700, fontFamily: "'Roboto Mono', monospace" }}
            className="w-10 bg-input border-2 border-primary text-primary text-center focus:outline-none focus:ring-2 focus:ring-primary text-xs p-1"
            min="0"
          />
          <span className="text-xs text-muted-foreground">/</span>
          <input
            type="number"
            value={sanity.max}
            onChange={(e) => onSanityChange('max', parseInt(e.target.value) || 0)}
            style={{ fontWeight: 700, fontFamily: "'Roboto Mono', monospace" }}
            className="w-10 bg-input border-2 border-primary text-primary text-center focus:outline-none focus:ring-2 focus:ring-primary text-xs p-1"
            min="0"
          />
        </div>
        <div className="w-full bg-black border border-primary h-3 overflow-hidden">
          <div
            className="bg-secondary h-full transition-all duration-300"
            style={{ width: `${sanityPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
