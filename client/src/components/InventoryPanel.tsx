import { useState } from 'react';
import { ChevronLeft, ChevronRight, Trash2, Plus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface InventoryItem {
  id: string;
  name: string;
  description: string;
}

interface Weapon {
  id: string;
  name: string;
  traits: string;
  damage: string;
  proficiency: number;
  feature: string;
}

interface InventoryPanelProps {
  inventory: InventoryItem[];
  onAddItem: () => void;
  onUpdateItem: (id: string, field: keyof InventoryItem, value: string) => void;
  onDeleteItem: (id: string) => void;
  primaryWeapon: Weapon;
  onUpdatePrimaryWeapon: (field: keyof Weapon, value: string | number) => void;
  secondaryWeapon: Weapon;
  onUpdateSecondaryWeapon: (field: keyof Weapon, value: string | number) => void;
}

export default function InventoryPanel({
  inventory,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  primaryWeapon,
  onUpdatePrimaryWeapon,
  secondaryWeapon,
  onUpdateSecondaryWeapon,
}: InventoryPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Toggle Button - Always visible, positioned outside the panel */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-0 top-16 z-40 h-10 w-10 bg-black border-2 border-primary hover:bg-primary hover:bg-opacity-10 flex items-center justify-center text-primary transition-colors"
      >
        {isOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      {/* Panel Content */}
      <div className={`fixed right-0 top-0 h-screen bg-black border-l-2 border-primary transition-all duration-300 flex flex-col ${isOpen ? 'w-80' : 'w-0'}`} style={{ paddingTop: '3rem' }}>

      {/* Content */}
      {isOpen && (
        <ScrollArea className="flex-1 overflow-hidden">
          <div className="p-3 space-y-4 pr-4">
            {/* Active Weapons Section */}
            <div className="space-y-2">
              <h3 className="font-display text-xs text-primary uppercase">Equipamentos</h3>

              {/* Primary Weapon */}
              <div className="border border-primary bg-black p-2 space-y-1">
                <div className="font-display text-xs text-primary uppercase">Primária</div>
                <input
                  type="text"
                  value={primaryWeapon.name}
                  onChange={(e) => onUpdatePrimaryWeapon('name', e.target.value)}
                  className="w-full bg-transparent border-b border-primary text-primary text-xs focus:outline-none focus:ring-0 uppercase"
                  placeholder="Nome"
                />
                <div className="flex gap-1 items-center">
                  <label className="font-display text-xs text-primary uppercase flex-shrink-0">Prof:</label>
                  <input
                    type="number"
                    value={primaryWeapon.proficiency}
                    onChange={(e) => onUpdatePrimaryWeapon('proficiency', parseInt(e.target.value) || 0)}
                    style={{ fontWeight: 700, fontFamily: "'Roboto Mono', monospace" }}
                    className="w-10 bg-input border border-primary text-primary text-center focus:outline-none focus:ring-1 focus:ring-primary text-xs p-0.5"
                    min="0"
                  />
                </div>
                <input
                  type="text"
                  value={primaryWeapon.traits}
                  onChange={(e) => onUpdatePrimaryWeapon('traits', e.target.value)}
                  className="w-full bg-transparent border-b border-primary text-primary text-xs focus:outline-none focus:ring-0"
                  placeholder="Traits & Range"
                />
                <input
                  type="text"
                  value={primaryWeapon.damage}
                  onChange={(e) => onUpdatePrimaryWeapon('damage', e.target.value)}
                  className="w-full bg-transparent border-b border-primary text-primary text-xs focus:outline-none focus:ring-0"
                  placeholder="Damage Dice & Type"
                />
                <input
                  type="text"
                  value={primaryWeapon.feature}
                  onChange={(e) => onUpdatePrimaryWeapon('feature', e.target.value)}
                  className="w-full bg-transparent border-b border-primary text-primary text-xs focus:outline-none focus:ring-0"
                  placeholder="Feature"
                />
              </div>

              {/* Secondary Weapon */}
              <div className="border border-primary bg-black p-2 space-y-1">
                <div className="font-display text-xs text-primary uppercase">Secundária</div>
                <input
                  type="text"
                  value={secondaryWeapon.name}
                  onChange={(e) => onUpdateSecondaryWeapon('name', e.target.value)}
                  className="w-full bg-transparent border-b border-primary text-primary text-xs focus:outline-none focus:ring-0 uppercase"
                  placeholder="Nome"
                />
                <div className="flex gap-1 items-center">
                  <label className="font-display text-xs text-primary uppercase flex-shrink-0">Prof:</label>
                  <input
                    type="number"
                    value={secondaryWeapon.proficiency}
                    onChange={(e) => onUpdateSecondaryWeapon('proficiency', parseInt(e.target.value) || 0)}
                    style={{ fontWeight: 700, fontFamily: "'Roboto Mono', monospace" }}
                    className="w-10 bg-input border border-primary text-primary text-center focus:outline-none focus:ring-1 focus:ring-primary text-xs p-0.5"
                    min="0"
                  />
                </div>
                <input
                  type="text"
                  value={secondaryWeapon.traits}
                  onChange={(e) => onUpdateSecondaryWeapon('traits', e.target.value)}
                  className="w-full bg-transparent border-b border-primary text-primary text-xs focus:outline-none focus:ring-0"
                  placeholder="Traits & Range"
                />
                <input
                  type="text"
                  value={secondaryWeapon.damage}
                  onChange={(e) => onUpdateSecondaryWeapon('damage', e.target.value)}
                  className="w-full bg-transparent border-b border-primary text-primary text-xs focus:outline-none focus:ring-0"
                  placeholder="Damage Dice & Type"
                />
                <input
                  type="text"
                  value={secondaryWeapon.feature}
                  onChange={(e) => onUpdateSecondaryWeapon('feature', e.target.value)}
                  className="w-full bg-transparent border-b border-primary text-primary text-xs focus:outline-none focus:ring-0"
                  placeholder="Feature"
                />
              </div>
            </div>

            {/* Inventory Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xs text-primary uppercase">Inventário</h3>
                <button
                  onClick={onAddItem}
                  className="btn-occult text-xs px-1.5 py-0.5 flex items-center gap-0.5 flex-shrink-0"
                >
                  <Plus size={10} />
                  ADD
                </button>
              </div>

              <div className="space-y-1">
                {inventory.map((item) => (
                  <div key={item.id} className="border border-primary bg-black p-1.5 space-y-0.5">
                    <div className="flex items-start justify-between gap-1">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => onUpdateItem(item.id, 'name', e.target.value)}
                        className="flex-1 min-w-0 bg-transparent border-b border-primary text-primary font-display text-xs focus:outline-none focus:ring-0 uppercase"
                        placeholder="Item"
                      />
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="text-primary hover:text-secondary transition-colors p-0 flex-shrink-0"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                    <textarea
                      value={item.description}
                      onChange={(e) => onUpdateItem(item.id, 'description', e.target.value)}
                      className="w-full bg-transparent border border-primary text-muted-foreground text-xs p-0.5 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                      placeholder="Descrição"
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
