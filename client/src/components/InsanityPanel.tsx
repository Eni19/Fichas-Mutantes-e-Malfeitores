import { useState } from 'react';
import { ChevronLeft, Trash2, Plus } from 'lucide-react';

interface Insanity {
  id: string;
  name: string;
  description: string;
}

interface ParanormalPower {
  id: string;
  name: string;
  description: string;
}

interface InsanityPanelProps {
  insanities: Insanity[];
  paranormalPowers: ParanormalPower[];
  onInsanityAdd: (insanity: Insanity) => void;
  onInsanityRemove: (id: string) => void;
  onInsanityUpdate: (id: string, insanity: Insanity) => void;
  onPowerAdd: (power: ParanormalPower) => void;
  onPowerRemove: (id: string) => void;
  onPowerUpdate: (id: string, power: ParanormalPower) => void;
}

export default function InsanityPanel({
  insanities,
  paranormalPowers,
  onInsanityAdd,
  onInsanityRemove,
  onInsanityUpdate,
  onPowerAdd,
  onPowerRemove,
  onPowerUpdate,
}: InsanityPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newInsanityName, setNewInsanityName] = useState('');
  const [newInsanityDesc, setNewInsanityDesc] = useState('');
  const [newPowerName, setNewPowerName] = useState('');
  const [newPowerDesc, setNewPowerDesc] = useState('');

  const addInsanity = () => {
    if (newInsanityName.trim()) {
      const newInsanity: Insanity = {
        id: Date.now().toString(),
        name: newInsanityName,
        description: newInsanityDesc,
      };
      onInsanityAdd(newInsanity);
      setNewInsanityName('');
      setNewInsanityDesc('');
    }
  };

  const addPower = () => {
    if (newPowerName.trim()) {
      const newPower: ParanormalPower = {
        id: Date.now().toString(),
        name: newPowerName,
        description: newPowerDesc,
      };
      onPowerAdd(newPower);
      setNewPowerName('');
      setNewPowerDesc('');
    }
  };

  return (
    <div className="fixed right-0 top-0 h-screen z-30">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-0 top-24 z-40 h-10 w-10 bg-black border-2 border-primary hover:bg-primary hover:bg-opacity-10 flex items-center justify-center text-primary transition-colors"
      >
        <ChevronLeft size={20} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Panel */}
      <div
        className={`h-full bg-black border-l-2 border-primary overflow-y-auto transition-all duration-300 ${
          isOpen ? 'w-80' : 'w-0'
        }`}
      >
        <div className="p-4 space-y-6">
          {/* Insanities Section */}
          <div>
            <h3 className="font-display text-lg text-primary uppercase mb-3 border-b-2 border-primary pb-2">
              Insanidades
            </h3>

            <div className="space-y-3 max-h-48 overflow-y-auto mb-4">
              {insanities.map((insanity) => (
                <div key={insanity.id} className="bg-black border-2 border-primary p-2 space-y-1">
                  <div className="flex justify-between items-start">
                    <input
                      type="text"
                      value={insanity.name}
                      onChange={(e) =>
                        onInsanityUpdate(insanity.id, { ...insanity, name: e.target.value })
                      }
                      className="bg-black text-primary text-sm font-bold border-b border-primary outline-none flex-1"
                      placeholder="Nome"
                    />
                    <button
                      onClick={() => onInsanityRemove(insanity.id)}
                      className="text-red-500 hover:text-red-400 ml-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <textarea
                    value={insanity.description}
                    onChange={(e) =>
                      onInsanityUpdate(insanity.id, { ...insanity, description: e.target.value })
                    }
                    className="w-full bg-black text-primary text-xs border border-primary p-1 outline-none resize-none"
                    rows={2}
                    placeholder="Descrição"
                  />
                </div>
              ))}
            </div>

            {/* Add Insanity */}
            <div className="space-y-2">
              <input
                type="text"
                value={newInsanityName}
                onChange={(e) => setNewInsanityName(e.target.value)}
                className="w-full bg-black text-primary text-xs border border-primary p-2 outline-none"
                placeholder="Nova Insanidade"
              />
              <textarea
                value={newInsanityDesc}
                onChange={(e) => setNewInsanityDesc(e.target.value)}
                className="w-full bg-black text-primary text-xs border border-primary p-2 outline-none resize-none"
                rows={2}
                placeholder="Descrição"
              />
              <button
                onClick={addInsanity}
                className="w-full bg-primary text-black font-bold py-1 hover:bg-secondary transition-colors flex items-center justify-center gap-1"
              >
                <Plus size={16} />
                ADD
              </button>
            </div>
          </div>

          {/* Paranormal Powers Section */}
          <div>
            <h3 className="font-display text-lg text-primary uppercase mb-3 border-b-2 border-primary pb-2">
              Poderes Paranormais
            </h3>

            <div className="space-y-3 max-h-48 overflow-y-auto mb-4">
              {paranormalPowers.map((power) => (
                <div key={power.id} className="bg-black border-2 border-primary p-2 space-y-1">
                  <div className="flex justify-between items-start">
                    <input
                      type="text"
                      value={power.name}
                      onChange={(e) => onPowerUpdate(power.id, { ...power, name: e.target.value })}
                      className="bg-black text-primary text-sm font-bold border-b border-primary outline-none flex-1"
                      placeholder="Nome"
                    />
                    <button
                      onClick={() => onPowerRemove(power.id)}
                      className="text-red-500 hover:text-red-400 ml-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <textarea
                    value={power.description}
                    onChange={(e) =>
                      onPowerUpdate(power.id, { ...power, description: e.target.value })
                    }
                    className="w-full bg-black text-primary text-xs border border-primary p-1 outline-none resize-none"
                    rows={2}
                    placeholder="Descrição"
                  />
                </div>
              ))}
            </div>

            {/* Add Power */}
            <div className="space-y-2">
              <input
                type="text"
                value={newPowerName}
                onChange={(e) => setNewPowerName(e.target.value)}
                className="w-full bg-black text-primary text-xs border border-primary p-2 outline-none"
                placeholder="Novo Poder Paranormal"
              />
              <textarea
                value={newPowerDesc}
                onChange={(e) => setNewPowerDesc(e.target.value)}
                className="w-full bg-black text-primary text-xs border border-primary p-2 outline-none resize-none"
                rows={2}
                placeholder="Descrição"
              />
              <button
                onClick={addPower}
                className="w-full bg-primary text-black font-bold py-1 hover:bg-secondary transition-colors flex items-center justify-center gap-1"
              >
                <Plus size={16} />
                ADD
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
