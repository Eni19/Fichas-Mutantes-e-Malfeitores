import { useMemo, useState } from 'react';
import { ChevronLeft, Search } from 'lucide-react';

export type ConditionId =
  | 'abatido'
  | 'adormecido'
  | 'amarrado'
  | 'atordoado'
  | 'caido'
  | 'cego'
  | 'compelido'
  | 'controlado'
  | 'debilitado'
  | 'desabilitado'
  | 'desatento'
  | 'enfraquecido'
  | 'exausto'
  | 'fatigado'
  | 'incapacitado'
  | 'imovel'
  | 'impedido'
  | 'indefeso'
  | 'moribundo'
  | 'paralisado'
  | 'prejudicado'
  | 'restrito'
  | 'surdo'
  | 'surpreso'
  | 'tonto'
  | 'transe'
  | 'vulneravel';

interface ConditionDefinition {
  id: ConditionId;
  name: string;
  effect: string;
  details?: string;
  components?: ConditionId[];
}

interface InsanityPanelProps {
  isOpen: boolean;
  showToggle: boolean;
  onToggle: () => void;
  activeConditions: ConditionId[];
  onToggleCondition: (conditionId: ConditionId) => void;
}

export const CONDITIONS: ConditionDefinition[] = [
  {
    id: 'abatido',
    name: 'Abatido',
    effect: 'Tonto e Impedido.',
    components: ['tonto', 'impedido'],
  },
  {
    id: 'adormecido',
    name: 'Adormecido',
    effect: 'Indefeso, Atordoado e Desatento.',
    details: 'Acorda com Percepcao 3+ graus, dano ou movimento brusco.',
    components: ['indefeso', 'atordoado', 'desatento'],
  },
  {
    id: 'amarrado',
    name: 'Amarrado',
    effect: 'Indefeso, Imovel e Prejudicado.',
    components: ['indefeso', 'imovel', 'prejudicado'],
  },
  { id: 'atordoado', name: 'Atordoado', effect: 'Nao pode realizar nenhuma acao.' },
  {
    id: 'caido',
    name: 'Caido',
    effect: 'Impedido.',
    details:
      '-5 em ataques corpo-a-corpo; +5 dos atacantes corpo-a-corpo contra ele; -5 dos atacantes a distancia contra ele (cobertura total). Levantar: Acao de Movimento.',
    components: ['impedido'],
  },
  {
    id: 'cego',
    name: 'Cego',
    effect: 'Impedido, Desatento (visual), Vulneravel e Prejudicado/Desabilitado em atividades visuais.',
    components: ['impedido', 'desatento', 'vulneravel', 'prejudicado'],
  },
  { id: 'compelido', name: 'Compelido', effect: 'So pode fazer acoes livres + 1 acao padrao por turno, controladas por outro.' },
  { id: 'controlado', name: 'Controlado', effect: 'Todas as acoes sao decididas por outro personagem.' },
  { id: 'debilitado', name: 'Debilitado', effect: 'Uma ou mais habilidades ficam abaixo de -5.' },
  { id: 'desabilitado', name: 'Desabilitado', effect: '-5 em todos os testes.' },
  { id: 'desatento', name: 'Desatento', effect: 'Nao percebe o ambiente, nao faz testes de Percepcao nem acoes relacionadas; alvos tem cobertura total contra ele.' },
  { id: 'enfraquecido', name: 'Enfraquecido', effect: 'Perde pontos de poder em uma caracteristica temporariamente.' },
  {
    id: 'exausto',
    name: 'Exausto',
    effect: 'Prejudicado e Impedido.',
    details: 'Recuperacao: 1h de descanso confortavel.',
    components: ['prejudicado', 'impedido'],
  },
  { id: 'fatigado', name: 'Fatigado', effect: 'Fica impedido; recupera apos 1 hora de descanso.' },
  {
    id: 'incapacitado',
    name: 'Incapacitado',
    effect: 'Indefeso, Atordoado e Desatento.',
    details: 'Normalmente Caido.',
    components: ['indefeso', 'atordoado', 'desatento'],
  },
  { id: 'imovel', name: 'Imovel', effect: 'Nao pode se mover, mas ainda pode agir.' },
  { id: 'impedido', name: 'Impedido', effect: 'Movimento reduzido a metade.' },
  { id: 'indefeso', name: 'Indefeso', effect: 'Defesas ativas (Aparar e Esquiva) = 0.' },
  {
    id: 'moribundo',
    name: 'Moribundo',
    effect: 'Incapacitado (Indefeso, Atordoado e Desatento).',
    details:
      'Fortitude (CD 15) todo turno: 1 grau (sem efeito), 2 graus (estabilizado), 3+ graus ou 3 falhas (morte). Cura estabiliza.',
    components: ['incapacitado'],
  },
  {
    id: 'paralisado',
    name: 'Paralisado',
    effect: 'Indefeso, Imovel e Atordoado (fisico).',
    details: 'Permite apenas acoes mentais sem movimento.',
    components: ['indefeso', 'imovel', 'atordoado'],
  },
  { id: 'prejudicado', name: 'Prejudicado', effect: '-2 em todos os testes.' },
  {
    id: 'restrito',
    name: 'Restrito',
    effect: 'Impedido e Vulneravel.',
    details: 'Se preso a objeto: Imovel. Se preso por alguem: Imovel e movivel pelo captor.',
    components: ['impedido', 'vulneravel'],
  },
  {
    id: 'surdo',
    name: 'Surdo',
    effect: 'Desatento (auditivo).',
    details: 'Interacao limitada; ataques de surpresa permitidos.',
    components: ['desatento'],
  },
  {
    id: 'surpreso',
    name: 'Surpreso',
    effect: 'Atordoado e Vulneravel.',
    components: ['atordoado', 'vulneravel'],
  },
  { id: 'tonto', name: 'Tonto', effect: 'So acoes livres + 1 acao padrao por turno.' },
  {
    id: 'transe',
    name: 'Transe',
    effect: 'Atordoado. Acoes restritas ao foco do transe.',
    details: 'Quebra: ameaca obvia ou teste de interacao CD 10 + graduacoes do efeito.',
    components: ['atordoado'],
  },
  { id: 'vulneravel', name: 'Vulneravel', effect: 'Defesas ativas (Aparar e Esquiva) reduzidas pela metade.' },
];

export const CONDITION_BY_ID: Record<ConditionId, ConditionDefinition> = CONDITIONS.reduce(
  (acc, condition) => {
    acc[condition.id] = condition;
    return acc;
  },
  {} as Record<ConditionId, ConditionDefinition>
);

export default function InsanityPanel({
  isOpen,
  showToggle,
  onToggle,
  activeConditions,
  onToggleCondition,
}: InsanityPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const matchesSearch = (condition: ConditionDefinition) => {
    if (!normalizedSearch) return true;

    return (
      condition.name.toLowerCase().includes(normalizedSearch) ||
      condition.effect.toLowerCase().includes(normalizedSearch)
    );
  };

  const compoundConditions = useMemo(
    () => CONDITIONS.filter((condition) => condition.components && condition.components.length > 0).filter(matchesSearch),
    [normalizedSearch]
  );

  const basicConditions = useMemo(
    () => CONDITIONS.filter((condition) => !condition.components || condition.components.length === 0).filter(matchesSearch),
    [normalizedSearch]
  );

  return (
    <div className="fixed right-0 top-0 h-screen z-30">
      {showToggle && (
        <button
          onClick={onToggle}
          className={`group fixed top-40 z-40 h-12 w-12 hover:w-40 overflow-hidden bg-background border-2 border-[#00524e] hover:bg-[#00524e] hover:text-white flex items-center justify-start text-[#00524e] transition-all duration-300 ${
            isOpen ? 'right-[28rem]' : 'right-0'
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
        className={`h-full bg-background overflow-y-auto transition-all duration-300 ${
          isOpen ? 'w-[28rem] max-w-[94vw] border-l-2 border-[#00524e]' : 'w-0 border-l-0'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90 border-b-2 border-[#00524e]/35 px-4 pt-4 pb-3 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl text-[#00524e] uppercase tracking-wide">Condicoes</h3>
              <span className="rounded-full border border-[#00524e] bg-[#00524e]/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[#00524e]">
                Ativas
              </span>
            </div>

            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00524e]/70" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar condicao"
                className="w-full rounded-md bg-background border border-[#00524e]/70 pl-10 pr-3 py-2 text-sm text-[#00524e] placeholder:text-[#00524e]/55 focus:outline-none focus:ring-2 focus:ring-[#00524e]/35"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            <div className="space-y-2.5">
              <div className="rounded-md border border-[#00524e]/35 bg-[#00524e]/6 px-2.5 py-1.5">
                <div className="text-[11px] uppercase tracking-wide text-[#00524e] font-bold">
                  Compostas
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {compoundConditions.map((condition) => {
                  const isActive = activeConditions.includes(condition.id);

                  return (
                    <label
                      key={condition.id}
                      title={`${condition.effect}${condition.details ? ` | ${condition.details}` : ''}`}
                      onClick={() => onToggleCondition(condition.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          onToggleCondition(condition.id);
                        }
                      }}
                      className={`rounded-md border p-2.5 cursor-pointer transition-colors min-h-[86px] ${
                        isActive
                          ? 'border-[#00524e] bg-[#00524e] text-background'
                          : 'border-[#00524e]/55 bg-background text-[#00524e] hover:bg-[#00524e]/10'
                      }`}
                    >
                      <div className="w-full">
                        <div className="text-sm font-bold uppercase tracking-wide truncate">{condition.name}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="rounded-md border border-[#00524e]/35 bg-[#00524e]/6 px-2.5 py-1.5">
                <div className="text-[11px] uppercase tracking-wide text-[#00524e] font-bold">
                  Basicas
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {basicConditions.map((condition) => {
                  const isActive = activeConditions.includes(condition.id);

                  return (
                    <label
                      key={condition.id}
                      title={condition.effect}
                      onClick={() => onToggleCondition(condition.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          onToggleCondition(condition.id);
                        }
                      }}
                      className={`rounded-md border p-2.5 cursor-pointer transition-colors min-h-[86px] ${
                        isActive
                          ? 'border-[#00524e] bg-[#00524e] text-background'
                          : 'border-[#00524e]/55 bg-background text-[#00524e] hover:bg-[#00524e]/10'
                      }`}
                    >
                      <div className="w-full">
                        <div className="text-sm font-bold uppercase tracking-wide truncate">{condition.name}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {compoundConditions.length === 0 && basicConditions.length === 0 && (
              <div className="rounded-md text-sm text-[#00524e]/80 border border-[#00524e]/40 bg-[#00524e]/6 p-3 text-center">
                Nenhuma condicao encontrada para a busca.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
