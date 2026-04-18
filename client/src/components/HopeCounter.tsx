import { useState } from 'react';
import { Plus, Minus, X } from 'lucide-react';

export type HeroicActionId =
  | 'edit-scene'
  | 'heroic-feats'
  | 'improve-roll'
  | 'inspiration'
  | 'instant-repel'
  | 'recover';

interface HeroicActionOption {
  id: HeroicActionId;
  title: string;
  description: string;
}

interface HopeCounterProps {
  current: number;
  onChange: (value: number) => void;
  onHeroicActionSelected?: (actionId: HeroicActionId) => void;
}

const MAX_HOPE = 6;

const HEROIC_ACTIONS: HeroicActionOption[] = [
  {
    id: 'edit-scene',
    title: 'Editar a Cena',
    description: 'Altera o cenario para obter vantagem (sujeito a aprovacao do mestre).',
  },
  {
    id: 'heroic-feats',
    title: 'Feitos Heroicos',
    description:
      'Ganha os beneficios de uma vantagem (que voce nao possui) ate o fim do proximo turno. Exige que o personagem seja capaz de usar a vantagem e que nao seja uma vantagem de Sorte.',
  },
  {
    id: 'improve-roll',
    title: 'Melhorar Rolagem',
    description:
      'Re-rola um dado e fica com o melhor resultado (se o segundo resultado for 1-10, soma +10). Deve ser usado antes do mestre anunciar o resultado.',
  },
  {
    id: 'inspiration',
    title: 'Inspiracao',
    description: 'Ganha uma dica, pista ou ajuda do mestre para superar um desafio ou misterio.',
  },
  {
    id: 'instant-repel',
    title: 'Repelir Instantaneamente',
    description: 'Usa como reacao para anular um efeito usado contra voce.',
  },
  {
    id: 'recover',
    title: 'Recuperar-se',
    description: 'Remove as condicoes Tonto, Fatigado ou Atordoado instantaneamente.',
  },
];

export default function HopeCounter({ current, onChange, onHeroicActionSelected }: HopeCounterProps) {
  const [isHeroicActionOpen, setIsHeroicActionOpen] = useState(false);

  const handleIncrement = () => {
    if (current < MAX_HOPE) {
      onChange(current + 1);
    }
  };

  const handleDecrement = () => {
    if (current > 0) {
      onChange(current - 1);
    }
  };

  const handleUseHeroicAction = (actionId: HeroicActionId) => {
    if (current <= 0) return;

    onChange(current - 1);
    onHeroicActionSelected?.(actionId);
    setIsHeroicActionOpen(false);
  };

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="card-occult space-y-2 flex-1">
          <h3 className="font-display text-sm text-primary uppercase">Pontos Heroicos</h3>

          <div className="flex items-center justify-between gap-2">
            <button
              onClick={handleDecrement}
              disabled={current === 0}
              className="btn-occult p-1 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Minus size={16} />
            </button>

            <div className="flex gap-1 justify-center flex-1">
              {Array.from({ length: MAX_HOPE }).map((_, index) => (
                <div
                  key={index}
                  className={`w-6 h-6 border border-primary flex items-center justify-center text-xs transition-all duration-300 ${
                    index < current
                      ? 'bg-primary text-black'
                      : 'bg-black text-primary'
                  }`}
                  style={{
                    fontWeight: 700,
                    fontFamily: "'Roboto Mono', monospace",
                  }}
                >
                  {index + 1}
                </div>
              ))}
            </div>

            <button
              onClick={handleIncrement}
              disabled={current === MAX_HOPE}
              className="btn-occult p-1 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="text-center">
            <span
              style={{ fontWeight: 700, fontFamily: "'Roboto Mono', monospace" }}
              className="text-primary text-xs"
            >
              {current} / {MAX_HOPE}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsHeroicActionOpen(true)}
          disabled={current === 0}
          className="mt-2 w-full py-2 border border-primary text-primary text-xs font-bold uppercase hover:bg-primary hover:text-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Usar ponto Heroico
        </button>
      </div>

      {isHeroicActionOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-[96vw] max-w-[1700px] border-2 border-primary bg-background p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-primary pb-2">
              <h3 className="font-display text-base text-primary uppercase">Usar ponto Heroico</h3>
              <button
                type="button"
                onClick={() => setIsHeroicActionOpen(false)}
                className="h-8 w-8 border border-primary text-primary hover:bg-primary hover:text-background transition-colors flex items-center justify-center"
                aria-label="Fechar menu de ponto heroico"
              >
                <X size={14} />
              </button>
            </div>

            <div className="grid grid-cols-6 gap-3">
              {HEROIC_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => handleUseHeroicAction(action.id)}
                  className="w-full min-w-0 text-left border-2 border-primary p-3 bg-background hover:bg-primary/10 transition-colors aspect-square min-h-[190px] flex flex-col justify-start"
                >
                  <div className="text-xs font-bold uppercase text-primary mb-2">{action.title}</div>
                  <div className="text-[11px] text-muted-foreground leading-snug">{action.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
