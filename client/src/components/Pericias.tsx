import { Plus, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

type AttributeKey = 'força' | 'agilidade' | 'luta' | 'vigor' | 'destreza' | 'intelecto' | 'prontidão' | 'presença';

interface Pericia {
  id: string;
  name: string;
  attribute: AttributeKey;
  graduation: number;
  others: number;
}

interface PericiasProps {
  pericias: Pericia[];
  onAddPericia: () => void;
  onUpdatePericia: (id: string, field: keyof Pericia, value: string | number) => void;
  onDeletePericia: (id: string) => void;
  onRollPericia: (id: string) => void;
}

const ATTRIBUTE_OPTIONS: Array<{ value: AttributeKey; label: string }> = [
  { value: 'força', label: 'Força' },
  { value: 'agilidade', label: 'Agilidade' },
  { value: 'luta', label: 'Luta' },
  { value: 'vigor', label: 'Vigor' },
  { value: 'destreza', label: 'Destreza' },
  { value: 'intelecto', label: 'Intelecto' },
  { value: 'prontidão', label: 'Prontidão' },
  { value: 'presença', label: 'Presença' },
];

export default function Pericias({
  pericias,
  onAddPericia,
  onUpdatePericia,
  onDeletePericia,
  onRollPericia,
}: PericiasProps) {
  return (
    <div className="card-occult flex flex-col gap-2 h-full min-h-0">
      <div className="flex items-center justify-between flex-shrink-0">
        <h3 className="font-display text-base text-primary uppercase">Pericias</h3>
        <button
          onClick={onAddPericia}
          className="btn-occult text-sm px-2 py-1 flex items-center gap-1 flex-shrink-0"
        >
          <Plus size={12} />
          ADD
        </button>
      </div>

      <ScrollArea className="flex-1 border border-primary bg-background p-2 min-h-0">
        <div className="space-y-2 pr-3">
          {pericias.length === 0 ? (
            <div className="flex items-center justify-center text-muted-foreground text-center py-4">
              <p className="font-mono text-xs">Adicione pericias para rolar testes.</p>
            </div>
          ) : (
            pericias.map((pericia) => (
              <div
                key={pericia.id}
                className="group border border-primary p-1 transition-colors duration-200 bg-background hover:bg-primary flex items-center gap-1"
              >
                {/* Nome */}
                <input
                  type="text"
                  value={pericia.name}
                  onChange={(e) => onUpdatePericia(pericia.id, 'name', e.target.value)}
                  className="w-24 bg-transparent border border-primary font-display text-xs focus:outline-none focus:ring-0 uppercase px-1 py-0.5 h-7 text-foreground group-hover:border-background"
                  placeholder="Nome"
                />

                {/* Atributo */}
                <select
                  value={pericia.attribute}
                  onChange={(e) => onUpdatePericia(pericia.id, 'attribute', e.target.value)}
                  className="w-20 border border-primary text-xs p-0.5 focus:outline-none h-7 bg-transparent text-primary group-hover:border-background"
                >
                  {ATTRIBUTE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value} className="bg-background text-primary">
                      {option.label}
                    </option>
                  ))}
                </select>

                {/* Graduação */}
                <input
                  type="number"
                  value={pericia.graduation === 0 ? '' : pericia.graduation}
                  onChange={(e) =>
                    onUpdatePericia(
                      pericia.id,
                      'graduation',
                      e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0
                    )
                  }
                  style={{ fontWeight: 700, fontFamily: "'Roboto Mono', monospace" }}
                  className="w-12 h-7 bg-transparent border border-primary text-primary text-center focus:outline-none focus:ring-1 focus:ring-primary p-0.5 text-xs group-hover:border-background placeholder:text-primary/50"
                  min="0"
                  title="Graduação"
                  placeholder="grad"
                />

                {/* Outros */}
                <input
                  type="number"
                  value={pericia.others === 0 ? '' : pericia.others}
                  onChange={(e) =>
                    onUpdatePericia(
                      pericia.id,
                      'others',
                      e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0
                    )
                  }
                  style={{ fontWeight: 700, fontFamily: "'Roboto Mono', monospace" }}
                  className="w-12 h-7 bg-transparent border border-primary text-primary text-center focus:outline-none focus:ring-1 focus:ring-primary p-0.5 text-xs group-hover:border-background placeholder:text-primary/50"
                  title="Outros"
                  placeholder="out"
                />

                {/* Botão Rolar */}
                <button
                  onClick={() => onRollPericia(pericia.id)}
                  className="flex-1 h-7 font-bold uppercase text-xs border border-primary bg-primary text-background transition-all hover:bg-background hover:text-primary group-hover:bg-background group-hover:text-primary px-1"
                >
                  Rolar
                </button>

                {/* Botão Deletar */}
                <button
                  onClick={() => onDeletePericia(pericia.id)}
                  className="transition-colors p-0 flex-shrink-0 h-7 w-7 border border-primary text-primary flex items-center justify-center hover:text-secondary group-hover:border-background text-xs"
                  aria-label="Remover pericia"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
