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
        <div className="card-occult flex-1 flex flex-col pb-7">
          <h3 className="font-display text-base md:text-lg text-primary uppercase">Pontos Heroicos</h3>

          <div className="mt-auto flex items-center justify-between gap-2">
            <button
              onClick={handleDecrement}
              disabled={current === 0}
              className="btn-occult p-1 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Minus size={16} />
            </button>

            <div className="flex-1 flex items-center justify-center">
              <div className="w-[110px] h-[56px] flex items-center justify-center">
                <div className="grid grid-cols-3 grid-rows-2 gap-1">
                  {Array.from({ length: MAX_HOPE }).map((_, index) => (
                    <div
                      key={index}
                      className={`w-8 h-8 border border-primary flex items-center justify-center text-xs transition-all duration-300 ${
                        index < current
                          ? 'bg-primary text-black'
                          : 'bg-background text-primary'
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
              </div>
            </div>

            <button
              onClick={handleIncrement}
              disabled={current === MAX_HOPE}
              className="btn-occult p-1 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Plus size={16} />
            </button>
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
              <h3 className="font-display text-lg text-primary uppercase tracking-wide">Usar ponto Heroico</h3>
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
                  className="group w-full min-w-0 border-2 border-primary p-2.5 bg-primary text-white hover:bg-background hover:text-primary transition-colors aspect-square min-h-[190px] flex flex-col items-center justify-start text-center"
                >
                  <div className="flex h-12 w-full items-center justify-center text-[13px] font-bold uppercase leading-tight tracking-wide text-center px-1 line-clamp-2">
                    {action.title}
                  </div>
                  <div className="mt-1 w-full flex-1 px-1 text-[11px] leading-tight text-center opacity-90 group-hover:opacity-100 break-words overflow-hidden">
                    {action.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
