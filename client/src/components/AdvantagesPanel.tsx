import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Advantage {
  id: string;
  name: string;
  description: string;
  graduation: number;
}

interface InventoryItem {
  id: string;
  name: string;
  description: string;
}

interface AdvantagesPanelProps {
  isOpen: boolean;
  showToggle: boolean;
  onToggle: () => void;
  advantages: Advantage[];
  onAddAdvantage: () => void;
  onUpdateAdvantage: (id: string, field: keyof Advantage, value: string | number) => void;
  onDeleteAdvantage: (id: string) => void;
  inventoryItems: InventoryItem[];
  onAddInventoryItem: () => void;
  onUpdateInventoryItem: (id: string, field: keyof InventoryItem, value: string) => void;
  onDeleteInventoryItem: (id: string) => void;
}

export default function AdvantagesPanel({
  isOpen,
  showToggle,
  onToggle,
  advantages,
  onAddAdvantage,
  onUpdateAdvantage,
  onDeleteAdvantage,
  inventoryItems,
  onAddInventoryItem,
  onUpdateInventoryItem,
  onDeleteInventoryItem,
}: AdvantagesPanelProps) {
  const autoResizeTextarea = (target: HTMLTextAreaElement) => {
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  };

  return (
    <>
      {showToggle && (
        <button
          onClick={onToggle}
          className={`group fixed top-40 z-40 h-12 w-12 hover:w-40 overflow-hidden bg-background border-2 border-primary hover:bg-primary hover:bg-opacity-10 flex items-center justify-start text-primary transition-all duration-300 ${
            isOpen ? 'right-[21rem]' : 'right-0'
          }`}
        >
          <span className="flex h-full w-12 flex-shrink-0 items-center justify-center">
            {isOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </span>
          <span className="pr-4 text-sm font-display uppercase tracking-wide whitespace-nowrap opacity-0 -translate-x-2 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
            Vantagens
          </span>
        </button>
      )}

      <div
        className={`fixed right-0 top-0 h-screen bg-background transition-all duration-300 flex flex-col ${
          isOpen ? 'w-[21rem] border-l-2 border-primary' : 'w-0 border-l-0'
        }`}
        style={{ paddingTop: '3rem' }}
      >
        {isOpen && (
          <ScrollArea className="flex-1 overflow-hidden">
            <div className="p-4 pr-4 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base text-primary uppercase">Vantagens</h3>
                  <button
                    onClick={onAddAdvantage}
                    className="btn-occult text-xs px-1.5 py-0.5 flex items-center gap-0.5 flex-shrink-0"
                  >
                    <Plus size={10} />
                    ADD
                  </button>
                </div>

                <div className="space-y-2">
                  {advantages.map((advantage) => (
                    <div key={advantage.id} className="border border-primary bg-background p-2 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0 flex items-center gap-2">
                          <input
                            type="text"
                            value={advantage.name}
                            onChange={(event) => onUpdateAdvantage(advantage.id, 'name', event.target.value)}
                            className="flex-1 min-w-0 bg-transparent border-b border-primary text-primary font-display text-sm focus:outline-none focus:ring-0 uppercase py-0.5"
                            placeholder="Nome da vantagem"
                          />
                          <input
                            type="number"
                            value={advantage.graduation}
                            onChange={(event) => onUpdateAdvantage(advantage.id, 'graduation', parseInt(event.target.value, 10) || 0)}
                            className="w-14 bg-input border border-primary text-primary text-center focus:outline-none focus:ring-1 focus:ring-primary text-xs p-1"
                            min="0"
                            title="Graduacao"
                          />
                        </div>
                        <button
                          onClick={() => onDeleteAdvantage(advantage.id)}
                          className="text-primary hover:text-secondary transition-colors p-0 flex-shrink-0"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      <textarea
                        value={advantage.description}
                        onChange={(event) => onUpdateAdvantage(advantage.id, 'description', event.target.value)}
                        onInput={(event) => autoResizeTextarea(event.currentTarget)}
                        className="w-full bg-transparent border border-primary text-muted-foreground text-xs p-1 focus:outline-none focus:ring-1 focus:ring-primary resize-none overflow-hidden"
                        placeholder="Descricao"
                        rows={2}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-primary/50 pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base text-primary uppercase">Inventario</h3>
                  <button
                    onClick={onAddInventoryItem}
                    className="btn-occult text-xs px-1.5 py-0.5 flex items-center gap-0.5 flex-shrink-0"
                  >
                    <Plus size={10} />
                    ADD
                  </button>
                </div>

                <div className="space-y-2">
                  {inventoryItems.map((item) => (
                    <div key={item.id} className="border border-primary bg-background p-2 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(event) => onUpdateInventoryItem(item.id, 'name', event.target.value)}
                          className="flex-1 min-w-0 bg-transparent border-b border-primary text-primary font-display text-sm focus:outline-none focus:ring-0 uppercase py-0.5"
                          placeholder="Nome do item"
                        />
                        <button
                          onClick={() => onDeleteInventoryItem(item.id)}
                          className="text-primary hover:text-secondary transition-colors p-0 flex-shrink-0"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      <textarea
                        value={item.description}
                        onChange={(event) => onUpdateInventoryItem(item.id, 'description', event.target.value)}
                        onInput={(event) => autoResizeTextarea(event.currentTarget)}
                        className="w-full bg-transparent border border-primary text-muted-foreground text-xs p-1 focus:outline-none focus:ring-1 focus:ring-primary resize-none overflow-hidden"
                        placeholder="Descricao"
                        rows={2}
                      />
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
