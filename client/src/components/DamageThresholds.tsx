interface DamageThreshold {
  minor: number;
  major: number;
  severe: number;
}

interface DamageThresholdsProps {
  thresholds: DamageThreshold;
  onChange: (field: keyof DamageThreshold, value: number) => void;
}

export default function DamageThresholds({ thresholds, onChange }: DamageThresholdsProps) {
  return (
    <div className="flex gap-1 md:gap-3 items-center flex-1 flex-wrap md:flex-nowrap">
      <h3 className="font-display text-xs text-primary uppercase flex-shrink-0">Limiares</h3>

      {/* Minor Damage */}
      <div className="flex items-center gap-1">
        <label className="font-display text-xs text-primary uppercase flex-shrink-0 hidden md:inline">Menor</label>
        <label className="font-display text-xs text-primary uppercase flex-shrink-0 md:hidden">M</label>
        <input
          type="number"
          value={thresholds.minor}
          onChange={(e) => onChange('minor', parseInt(e.target.value) || 0)}
          style={{ fontWeight: 700, fontFamily: "'Roboto Mono', monospace" }}
          className="w-8 md:w-10 bg-input border-2 border-primary text-primary text-center focus:outline-none focus:ring-2 focus:ring-primary p-1 text-xs"
          min="0"
        />
      </div>

      {/* Major Damage */}
      <div className="flex items-center gap-1">
        <label className="font-display text-xs text-primary uppercase flex-shrink-0 hidden md:inline">Maior</label>
        <label className="font-display text-xs text-primary uppercase flex-shrink-0 md:hidden">Ma</label>
        <input
          type="number"
          value={thresholds.major}
          onChange={(e) => onChange('major', parseInt(e.target.value) || 0)}
          style={{ fontWeight: 700, fontFamily: "'Roboto Mono', monospace" }}
          className="w-8 md:w-10 bg-input border-2 border-primary text-primary text-center focus:outline-none focus:ring-2 focus:ring-primary p-1 text-xs"
          min="0"
        />
      </div>

      {/* Severe Damage */}
      <div className="flex items-center gap-1">
        <label className="font-display text-xs text-primary uppercase flex-shrink-0 hidden md:inline">Severo</label>
        <label className="font-display text-xs text-primary uppercase flex-shrink-0 md:hidden">S</label>
        <input
          type="number"
          value={thresholds.severe}
          onChange={(e) => onChange('severe', parseInt(e.target.value) || 0)}
          style={{ fontWeight: 700, fontFamily: "'Roboto Mono', monospace" }}
          className="w-8 md:w-10 bg-input border-2 border-primary text-primary text-center focus:outline-none focus:ring-2 focus:ring-primary p-1 text-xs"
          min="0"
        />
      </div>
    </div>
  );
}
