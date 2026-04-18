import { ChevronLeft } from 'lucide-react';

export type ConditionId =
  | 'atordoado'
  | 'compelido'
  | 'controlado'
  | 'debilitado'
  | 'desabilitado'
  | 'desatento'
  | 'enfraquecido'
  | 'fatigado'
  | 'imovel'
  | 'impedido'
  | 'indefeso'
  | 'prejudicado'
  | 'tonto'
  | 'vulneravel';

interface ConditionDefinition {
  id: ConditionId;
  name: string;
  effect: string;
}

interface InsanityPanelProps {
  isOpen: boolean;
  showToggle: boolean;
  onToggle: () => void;
  activeConditions: ConditionId[];
  onToggleCondition: (conditionId: ConditionId) => void;
}

export const CONDITIONS: ConditionDefinition[] = [
  { id: 'atordoado', name: 'Atordoado', effect: 'Nao pode realizar nenhuma acao.' },
  { id: 'compelido', name: 'Compelido', effect: 'So pode fazer acoes livres + 1 acao padrao por turno, controladas por outro.' },
  { id: 'controlado', name: 'Controlado', effect: 'Todas as acoes sao decididas por outro personagem.' },
  { id: 'debilitado', name: 'Debilitado', effect: 'Uma ou mais habilidades ficam abaixo de -5.' },
  { id: 'desabilitado', name: 'Desabilitado', effect: '-5 em todos os testes.' },
  { id: 'desatento', name: 'Desatento', effect: 'Nao percebe o ambiente, nao faz testes de Percepcao nem acoes relacionadas; alvos tem cobertura total contra ele.' },
  { id: 'enfraquecido', name: 'Enfraquecido', effect: 'Perde pontos de poder em uma caracteristica temporariamente.' },
  { id: 'fatigado', name: 'Fatigado', effect: 'Fica impedido; recupera apos 1 hora de descanso.' },
  { id: 'imovel', name: 'Imovel', effect: 'Nao pode se mover, mas ainda pode agir.' },
  { id: 'impedido', name: 'Impedido', effect: 'Movimento reduzido a metade.' },
  { id: 'indefeso', name: 'Indefeso', effect: 'Defesas ativas (Aparar e Esquiva) = 0.' },
  { id: 'prejudicado', name: 'Prejudicado', effect: '-2 em todos os testes.' },
  { id: 'tonto', name: 'Tonto', effect: 'So acoes livres + 1 acao padrao por turno.' },
  { id: 'vulneravel', name: 'Vulneravel', effect: 'Defesas ativas (Aparar e Esquiva) reduzidas pela metade.' },
];

export default function InsanityPanel({
  isOpen,
  showToggle,
  onToggle,
  activeConditions,
  onToggleCondition,
}: InsanityPanelProps) {
  return (
    <div className="fixed right-0 top-0 h-screen z-30">
      {showToggle && (
        <button
          onClick={onToggle}
          className={`group fixed top-28 z-40 h-12 w-12 hover:w-40 overflow-hidden bg-black border-2 border-orange-500 hover:bg-orange-500 hover:bg-opacity-10 flex items-center justify-start text-orange-300 transition-all duration-300 ${
            isOpen ? 'right-80' : 'right-0'
          }`}
        >
          <span className="flex h-full w-12 flex-shrink-0 items-center justify-center">
            <ChevronLeft size={20} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </span>
          <span className="pr-4 text-sm font-display uppercase tracking-wide whitespace-nowrap opacity-0 -translate-x-2 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
            Condicoes
          </span>
        </button>
      )}

      <div
        className={`h-full bg-black overflow-y-auto transition-all duration-300 ${
          isOpen ? 'w-80 border-l-2 border-orange-500' : 'w-0 border-l-0'
        }`}
      >
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between border-b-2 border-orange-500 pb-2">
            <h3 className="font-display text-lg text-orange-300 uppercase">Condicoes</h3>
            <span className="text-[10px] uppercase tracking-wide text-orange-400">
              {activeConditions.length} ativas
            </span>
          </div>

          <div className="space-y-2">
            {CONDITIONS.map((condition) => {
              const isActive = activeConditions.includes(condition.id);

              return (
                <label
                  key={condition.id}
                  className={`flex items-center gap-3 border p-2 cursor-pointer transition-colors ${
                    isActive
                      ? 'border-orange-300 bg-orange-900/20 text-orange-100'
                      : 'border-orange-500/60 bg-black text-orange-300 hover:bg-orange-950/20'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={() => onToggleCondition(condition.id)}
                    className="h-4 w-4 accent-orange-500"
                  />
                  <span className="text-sm font-bold uppercase tracking-wide">{condition.name}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
