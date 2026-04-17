import { Minus, Plus } from 'lucide-react';

interface WoundsFrailtyProps {
  wounds: number;
  onWoundsChange: (value: number) => void;
}

export default function WoundsFrailty({ wounds, onWoundsChange }: WoundsFrailtyProps) {
  const frailty = -Math.max(0, wounds);

  return (
    <div className="grid grid-cols-1 gap-2">
      <div className="card-occult space-y-3">
        <h3 className="font-display text-sm text-primary uppercase">Ferimentos</h3>

        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1">
            <div className="flex flex-col gap-1">
              <button
                onClick={() => onWoundsChange(wounds + 1)}
                className="btn-occult p-0.5 h-6 w-6 flex items-center justify-center"
                aria-label="Aumentar ferimentos"
              >
                <Plus size={10} />
              </button>
              <button
                onClick={() => onWoundsChange(Math.max(0, wounds - 1))}
                className="btn-occult p-0.5 h-6 w-6 flex items-center justify-center"
                aria-label="Diminuir ferimentos"
              >
                <Minus size={10} />
              </button>
            </div>

            <input
              type="number"
              value={wounds}
              onChange={(e) => onWoundsChange(parseInt(e.target.value) || 0)}
              style={{ fontWeight: 700, fontFamily: "'Roboto Mono', monospace" }}
              className="w-16 h-[52px] bg-input border-2 border-primary text-primary text-center focus:outline-none focus:ring-2 focus:ring-primary text-sm p-1"
              min="0"
            />

            <div className="w-16 h-[52px] border-2 border-primary bg-input text-center flex flex-col items-center justify-center">
              <div className="text-[9px] uppercase tracking-wide text-red-300 font-bold leading-none">Penalidade</div>
              <div className="font-display text-lg text-red-200 leading-none mt-1">{frailty}</div>
            </div>
          </div>
        </div>

        <div className="w-full bg-black border border-primary h-3 overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300"
            style={{ width: `${Math.min(100, wounds * 20)}%` }}
          />
        </div>
      </div>
    </div>
  );
}