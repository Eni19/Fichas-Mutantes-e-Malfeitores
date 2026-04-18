import { ChevronLeft, ChevronRight, Trash2, Plus, Dice6 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Attack {
  id: string;
  name: string;
  test: number;
  effect: string;
  resistanceTest: string;
  critical: number;
}

interface InventoryPanelProps {
  isOpen: boolean;
  showToggle: boolean;
  onToggle: () => void;
  initiative: number;
  enhancedInitiative: number;
  onEnhancedInitiativeChange: (value: number) => void;
  onRollInitiative: () => void;
  attacks: Attack[];
  onAddAttack: () => void;
  onUpdateAttack: (id: string, field: keyof Attack, value: string | number) => void;
  onDeleteAttack: (id: string) => void;
  onRollAttack: (id: string) => void;
}

export default function InventoryPanel({
  isOpen,
  showToggle,
  onToggle,
  initiative,
  enhancedInitiative,
  onEnhancedInitiativeChange,
  onRollInitiative,
  attacks,
  onAddAttack,
  onUpdateAttack,
  onDeleteAttack,
  onRollAttack,
}: InventoryPanelProps) {
  const autoResizeTextarea = (target: HTMLTextAreaElement) => {
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  };

  const handleRollAndClose = (attackId: string) => {
    onRollAttack(attackId);
    if (isOpen) onToggle();
  };

  const handleRollInitiativeAndClose = () => {
    onRollInitiative();
    if (isOpen) onToggle();
  };

  return (
    <>
      {/* Toggle Button - Always visible, positioned outside the panel */}
      {showToggle && (
        <button
          onClick={onToggle}
          className={`group fixed top-16 z-40 h-12 w-12 hover:w-40 overflow-hidden bg-background border-2 border-primary hover:bg-primary hover:bg-opacity-10 flex items-center justify-start text-primary transition-all duration-300 ${
            isOpen ? 'right-[21rem]' : 'right-0'
          }`}
        >
          <span className="flex h-full w-12 flex-shrink-0 items-center justify-center">
            {isOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </span>
          <span className="pr-4 text-sm font-display uppercase tracking-wide whitespace-nowrap opacity-0 -translate-x-2 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
            Ataques
          </span>
        </button>
      )}

      {/* Panel Content */}
      <div className={`fixed right-0 top-0 h-screen bg-background transition-all duration-300 flex flex-col ${isOpen ? 'w-[21rem] border-l-2 border-primary' : 'w-0 border-l-0'}`} style={{ paddingTop: '3rem' }}>

      {/* Content */}
      {isOpen && (
        <ScrollArea className="flex-1 overflow-hidden">
          <div className="p-4 space-y-4 pr-4">
            <div className="border border-primary bg-background p-2 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="text-[10px] font-bold uppercase text-primary">Iniciativa</div>

                <button
                  type="button"
                  onClick={handleRollInitiativeAndClose}
                  className="h-8 w-8 border border-primary bg-background text-primary font-display text-sm leading-none hover:bg-primary hover:text-background transition-colors flex items-center justify-center"
                  title="Rolar iniciativa"
                >
                  {initiative >= 0 ? `+${initiative}` : initiative}
                </button>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="text-[10px] uppercase text-primary">Bonus</div>
                <select
                  value={enhancedInitiative}
                  onChange={(e) => onEnhancedInitiativeChange(parseInt(e.target.value, 10) || 0)}
                  className="w-16 bg-input border border-primary text-primary text-center focus:outline-none focus:ring-1 focus:ring-primary text-[10px] p-1"
                >
                  {Array.from({ length: 6 }, (_, index) => index).map((value) => (
                    <option key={value} value={value} className="bg-background text-primary">
                      {value}
                    </option>
                  ))}
                </select>
                <div className="text-[9px] uppercase text-primary/80">+4</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base text-primary uppercase">Ataques</h3>
                <button
                  onClick={onAddAttack}
                  className="btn-occult text-xs px-1.5 py-0.5 flex items-center gap-0.5 flex-shrink-0"
                >
                  <Plus size={10} />
                  ADD
                </button>
              </div>

              <div className="space-y-2">
                {attacks.map((attack) => (
                  <div key={attack.id} className="border border-primary bg-background p-2 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <input
                        type="text"
                        value={attack.name}
                        onChange={(e) => onUpdateAttack(attack.id, 'name', e.target.value)}
                        className="flex-1 min-w-0 bg-transparent border-b border-primary text-primary font-display text-sm focus:outline-none focus:ring-0 uppercase py-0.5"
                        placeholder="Nome do ataque"
                      />
                      <button
                        onClick={() => onDeleteAttack(attack.id)}
                        className="text-primary hover:text-secondary transition-colors p-0 flex-shrink-0"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-[10px] font-bold uppercase text-primary mb-1">Teste</div>
                        <input
                          type="number"
                          value={attack.test}
                          onChange={(e) => onUpdateAttack(attack.id, 'test', parseInt(e.target.value, 10) || 0)}
                          className="w-full bg-input border border-primary text-primary text-center focus:outline-none focus:ring-1 focus:ring-primary text-xs p-1"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <div className="text-[10px] font-bold uppercase text-primary mb-1">Critico</div>
                        <input
                          type="number"
                          value={attack.critical}
                          onChange={(e) => onUpdateAttack(attack.id, 'critical', parseInt(e.target.value, 10) || 0)}
                          className="w-full bg-input border border-primary text-primary text-center focus:outline-none focus:ring-1 focus:ring-primary text-xs p-1"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-bold uppercase text-primary mb-1">Teste de resistencia</div>
                      <input
                        type="text"
                        value={attack.resistanceTest}
                        onChange={(e) => onUpdateAttack(attack.id, 'resistanceTest', e.target.value)}
                        className="w-full bg-input border border-primary text-primary text-xs p-1 focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="Ex: Fortitude DT 15"
                      />
                    </div>

                    <textarea
                      value={attack.effect}
                      onChange={(e) => onUpdateAttack(attack.id, 'effect', e.target.value)}
                      onInput={(e) => autoResizeTextarea(e.currentTarget)}
                      className="w-full bg-transparent border border-primary text-muted-foreground text-xs p-1 focus:outline-none focus:ring-1 focus:ring-primary resize-none overflow-hidden"
                      placeholder="Efeito"
                      rows={2}
                    />

                    <button
                      onClick={() => handleRollAndClose(attack.id)}
                      className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold uppercase border border-red-500 transition-all text-xs"
                    >
                      <Dice6 className="inline mr-1" size={14} />
                      Rolar d20 + Teste
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      )}
      </div>
    </>
  );
}
