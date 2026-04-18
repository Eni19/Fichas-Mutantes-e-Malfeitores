import { Minus, Plus } from 'lucide-react';

type AttributeKey =
  | 'força'
  | 'agilidade'
  | 'luta'
  | 'vigor'
  | 'destreza'
  | 'intelecto'
  | 'prontidão'
  | 'presença';

type DefenseKey = 'esquiva' | 'aparar' | 'fortitude' | 'resistencia' | 'vontade';

interface DefensePanelProps {
  attributes: Record<AttributeKey, number>;
  defenses: Record<DefenseKey, number>;
  onTrainingChange: (defense: DefenseKey, value: number) => void;
  onRollDefense: (
    defenseKey: DefenseKey,
    defenseName: string,
    attributeLabel: string,
    totalBonus: number
  ) => void;
}

const DEFENSES: Array<{
  key: DefenseKey;
  label: string;
  attribute: AttributeKey;
}> = [
  { key: 'esquiva', label: 'Esquiva', attribute: 'agilidade' },
  { key: 'aparar', label: 'Aparar', attribute: 'luta' },
  { key: 'fortitude', label: 'Fortitude', attribute: 'vigor' },
  { key: 'resistencia', label: 'Resistência', attribute: 'vigor' },
  { key: 'vontade', label: 'Vontade', attribute: 'prontidão' },
];

export default function DefensePanel({
  attributes,
  defenses,
  onTrainingChange,
  onRollDefense,
}: DefensePanelProps) {
  return (
    <div className="card-occult flex flex-col space-y-2">
      <h3 className="font-display text-base md:text-lg text-primary uppercase">Defesas</h3>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-1 overflow-hidden">
        {DEFENSES.map((defense) => {
          const attributeValue = attributes[defense.attribute];
          const training = defenses[defense.key];
          const total = attributeValue + training;

          return (
            <div key={defense.key} className="flex flex-col gap-0.5 min-h-0">
              <div
                onClick={() =>
                  onRollDefense(
                    defense.key,
                    defense.label,
                    'Defesa',
                    total
                  )
                }
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onRollDefense(
                      defense.key,
                      defense.label,
                      'Defesa',
                      total
                    );
                  }
                }}
                className="group border border-primary bg-background px-1 py-1 text-left hover:bg-primary transition-colors cursor-pointer min-h-[110px] overflow-hidden"
                role="button"
                tabIndex={0}
              >
                <div className="flex h-full flex-col items-center justify-center text-center gap-0.5">
                  <div className="font-display text-sm uppercase leading-none text-primary group-hover:text-background">
                    {defense.label}
                  </div>
                  <div className="font-display text-2xl leading-none text-primary group-hover:text-background">
                    {total}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-0.5">
                <button
                  type="button"
                  onClick={() => {
                    onTrainingChange(defense.key, Math.max(0, training - 1));
                  }}
                  className="btn-occult p-0 h-4 w-4 flex items-center justify-center"
                  aria-label={`Diminuir treino de ${defense.label}`}
                >
                  <Minus size={8} />
                </button>

                <div className="w-8 h-4 border border-primary text-primary bg-background text-center text-[9px] font-bold leading-4">
                  +{training}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onTrainingChange(defense.key, training + 1);
                  }}
                  className="btn-occult p-0 h-4 w-4 flex items-center justify-center"
                  aria-label={`Aumentar treino de ${defense.label}`}
                >
                  <Plus size={8} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}