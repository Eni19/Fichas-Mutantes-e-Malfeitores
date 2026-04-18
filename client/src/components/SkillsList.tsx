import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

interface SkillModifier {
  id: string;
  name: string;
  description: string;
  cost: number;
  isFixed: boolean;
}

interface Skill {
  id: string;
  name: string;
  description: string;
  powerType: string;
  isCritical: boolean;
  modifiers: SkillModifier[];
  graduation: number;
  cost: number;
  saveTest: string;
}

interface SkillsListProps {
  skills: Skill[];
  onUpdateSkill: (id: string, field: keyof Skill, value: string | number | boolean | SkillModifier[]) => void;
  onDeleteSkill: (id: string) => void;
  onReorderSkills: (draggedId: string, targetId: string) => void;
}

export default function SkillsList({ skills, onUpdateSkill, onDeleteSkill, onReorderSkills }: SkillsListProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [draggedSkillId, setDraggedSkillId] = useState<string | null>(null);
  const [modifierEditorSkillId, setModifierEditorSkillId] = useState<string | null>(null);
  const [selectedModifier, setSelectedModifier] = useState<SkillModifier | null>(null);
  const [draftModifier, setDraftModifier] = useState({
    name: '',
    description: '',
    costInput: '0',
    isFixed: false,
  });

  const scrollCards = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const amount = direction === 'left' ? -340 : 340;
    carouselRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  const openModifierEditor = (skillId: string) => {
    setModifierEditorSkillId(skillId);
    setDraftModifier({ name: '', description: '', costInput: '0', isFixed: false });
  };

  const closeModifierEditor = () => {
    setModifierEditorSkillId(null);
    setDraftModifier({ name: '', description: '', costInput: '0', isFixed: false });
  };

  const handleCreateModifier = () => {
    if (!modifierEditorSkillId) return;
    const targetSkill = skills.find((skill) => skill.id === modifierEditorSkillId);
    if (!targetSkill) return;

    const name = draftModifier.name.trim();
    if (!name) return;

    const parsedCost = /^[-+]?\d+$/.test(draftModifier.costInput.trim())
      ? parseInt(draftModifier.costInput, 10)
      : 0;

    const newModifier: SkillModifier = {
      id: Date.now().toString(),
      name,
      description: draftModifier.description.trim(),
      cost: parsedCost,
      isFixed: draftModifier.isFixed,
    };

    onUpdateSkill(modifierEditorSkillId, 'modifiers', [...targetSkill.modifiers, newModifier]);
    closeModifierEditor();
  };

  return (
    <div className="flex-1 border-2 border-primary bg-background p-3 min-h-0 flex flex-col gap-3">
      {skills.length > 0 && (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => scrollCards('left')}
            className="w-8 h-8 border border-primary text-primary hover:bg-primary hover:text-foreground transition-colors flex items-center justify-center"
            aria-label="Mover carrossel para a esquerda"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => scrollCards('right')}
            className="w-8 h-8 border border-primary text-primary hover:bg-primary hover:text-foreground transition-colors flex items-center justify-center"
            aria-label="Mover carrossel para a direita"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      <div ref={carouselRef} className="flex-1 overflow-x-auto overflow-y-hidden pb-2">
        <div className="flex gap-4 pr-6 min-w-max items-stretch">
        {skills.length === 0 ? (
          <div className="flex items-center justify-center text-muted-foreground text-center py-10 w-full min-w-[20rem]">
            <p className="font-mono text-sm">Nenhuma habilidade adicionada ainda.</p>
          </div>
        ) : (
          skills.map((skill) => (
            <div
              key={skill.id}
              draggable
              onDragStart={(e) => {
                setDraggedSkillId(skill.id);
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', skill.id);
              }}
              onDragEnd={() => setDraggedSkillId(null)}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
              }}
              onDrop={(e) => {
                e.preventDefault();
                const draggedId = e.dataTransfer.getData('text/plain') || draggedSkillId;
                if (!draggedId) return;
                onReorderSkills(draggedId, skill.id);
                setDraggedSkillId(null);
              }}
              className={`border-2 p-5 bg-background space-y-3 flex-shrink-0 w-[20rem] min-h-[19rem] cursor-grab active:cursor-grabbing transition-colors flex flex-col ${
                draggedSkillId === skill.id ? 'border-secondary opacity-80' : 'border-primary'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <input
                    type="text"
                    value={skill.name}
                    onChange={(e) => onUpdateSkill(skill.id, 'name', e.target.value)}
                    className="flex-1 min-w-0 bg-transparent border-b border-primary text-primary font-display text-base focus:outline-none focus:ring-0 uppercase"
                    placeholder="Nome da Habilidade"
                  />

                  <input
                    type="number"
                    value={skill.graduation}
                    onChange={(e) => onUpdateSkill(skill.id, 'graduation', parseInt(e.target.value, 10) || 0)}
                    style={{ fontWeight: 700, fontFamily: "'Roboto Mono', monospace" }}
                    className="w-9 h-9 bg-input border border-primary text-primary text-center focus:outline-none focus:ring-1 focus:ring-primary text-xs p-1"
                    min="0"
                    title="Graduação"
                  />
                </div>

                <button
                  onClick={() => onDeleteSkill(skill.id)}
                  className="text-primary hover:text-secondary transition-colors p-0 flex-shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase text-primary mb-1">Descrição</div>
                <textarea
                  value={skill.description}
                  onChange={(e) => {
                    onUpdateSkill(skill.id, 'description', e.target.value);
                    // Auto-expand textarea
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                  }}
                  onInput={(e) => {
                    e.currentTarget.style.height = 'auto';
                    e.currentTarget.style.height = Math.min(e.currentTarget.scrollHeight, 120) + 'px';
                  }}
                  className="w-full bg-transparent border border-primary text-muted-foreground text-xs p-1 focus:outline-none focus:ring-1 focus:ring-primary resize-none overflow-hidden"
                  placeholder="Descrição do efeito"
                  rows={3}
                  style={{ minHeight: '84px' }}
                />
              </div>

              <div className="flex items-end gap-2">
                <div className="w-32">
                  <div className="text-[10px] font-bold uppercase text-primary mb-1">Tipo de poder</div>
                  <input
                    type="text"
                    value={skill.powerType}
                    onChange={(e) => onUpdateSkill(skill.id, 'powerType', e.target.value)}
                    style={{ fontWeight: 700, fontFamily: "'Roboto Mono', monospace" }}
                    className="w-full bg-input border border-primary text-primary text-center focus:outline-none focus:ring-1 focus:ring-primary text-xs p-1"
                    placeholder="Tipo de poder"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold uppercase text-primary mb-1">Teste de salvamento</div>
                  <input
                    type="number"
                    value={skill.saveTest}
                    onChange={(e) => onUpdateSkill(skill.id, 'saveTest', e.target.value)}
                    className="w-full bg-input border border-primary text-primary text-center focus:outline-none focus:ring-1 focus:ring-primary text-xs p-1"
                    placeholder="Teste de salvamento"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-[10px] font-bold uppercase text-primary">
                <input
                  type="checkbox"
                  checked={skill.isCritical}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    const currentSaveTest = Number(skill.saveTest);
                    const safeSaveTest = Number.isFinite(currentSaveTest) ? currentSaveTest : 0;
                    const nextSaveTest = safeSaveTest + (isChecked ? 5 : -5);

                    onUpdateSkill(skill.id, 'isCritical', isChecked);
                    onUpdateSkill(skill.id, 'saveTest', String(nextSaveTest));
                  }}
                  className="accent-red-500"
                />
                Critico
              </label>

              <div className="grid grid-cols-1 gap-2">
                <div>
                  <div className="text-[10px] font-bold uppercase text-primary mb-1">Custo</div>
                  <input
                    type="number"
                    value={skill.cost}
                    onChange={(e) => onUpdateSkill(skill.id, 'cost', parseInt(e.target.value, 10) || 0)}
                    style={{ fontWeight: 700, fontFamily: "'Roboto Mono', monospace" }}
                    className="w-full bg-input border border-primary text-primary text-center focus:outline-none focus:ring-1 focus:ring-primary text-xs p-1"
                    min="0"
                    placeholder="Custo"
                  />
                </div>
              </div>

              <div className="mt-auto pt-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-[10px] font-bold uppercase text-primary">Modificadores</div>
                  <button
                    onClick={() => openModifierEditor(skill.id)}
                    className="text-[10px] uppercase border border-primary px-1 py-0.5 text-primary hover:bg-primary hover:text-background transition-colors"
                  >
                    + Tag
                  </button>
                </div>

                <div className="flex flex-wrap gap-1 min-h-[1.25rem]">
                  {skill.modifiers.length === 0 ? (
                    <span className="text-[9px] text-muted-foreground uppercase">Sem tags</span>
                  ) : (
                    skill.modifiers.map((modifier) => (
                      <button
                        key={modifier.id}
                        onClick={() => setSelectedModifier(modifier)}
                        className="text-[9px] px-1.5 py-0.5 border border-primary/50 text-primary/90 bg-background/60 hover:bg-primary hover:text-background transition-colors"
                        title="Ver especificações"
                      >
                        {modifier.name}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        </div>
      </div>

      {modifierEditorSkillId && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-md border-2 border-primary bg-background p-4 space-y-3">
            <h4 className="font-display text-sm uppercase text-primary">Novo Modificador</h4>

            <div>
              <div className="text-[10px] uppercase font-bold text-primary mb-1">Nome</div>
              <input
                type="text"
                value={draftModifier.name}
                onChange={(e) => setDraftModifier((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full bg-input border border-primary text-primary focus:outline-none focus:ring-1 focus:ring-primary text-xs p-2"
                placeholder="Nome do modificador"
              />
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold text-primary mb-1">Descrição</div>
              <textarea
                value={draftModifier.description}
                onChange={(e) => setDraftModifier((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full bg-input border border-primary text-primary focus:outline-none focus:ring-1 focus:ring-primary text-xs p-2 resize-none"
                rows={3}
                placeholder="Descrição do modificador"
              />
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold text-primary mb-1">Custo</div>
              <input
                type="text"
                value={draftModifier.costInput}
                onChange={(e) => setDraftModifier((prev) => ({ ...prev, costInput: e.target.value }))}
                className="w-28 bg-input border border-primary text-primary text-center focus:outline-none focus:ring-1 focus:ring-primary text-xs p-1"
                placeholder="+2 ou -2"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-primary uppercase font-bold">
              <input
                type="checkbox"
                checked={draftModifier.isFixed}
                onChange={(e) => setDraftModifier((prev) => ({ ...prev, isFixed: e.target.checked }))}
                className="accent-red-500"
              />
              Fixo
            </label>

            <div className="flex justify-end gap-2">
              <button
                onClick={closeModifierEditor}
                className="border border-primary px-2 py-1 text-xs uppercase text-primary hover:bg-primary hover:text-background transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateModifier}
                className="border border-primary bg-primary px-2 py-1 text-xs uppercase text-background hover:bg-background hover:text-primary transition-colors"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedModifier && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-md border-2 border-primary bg-background p-4 space-y-3">
            <h4 className="font-display text-sm uppercase text-primary">{selectedModifier.name}</h4>

            <div>
              <div className="text-[10px] uppercase font-bold text-primary mb-1">Descrição</div>
              <div className="border border-primary bg-input text-xs text-primary p-2 min-h-12">
                {selectedModifier.description || 'Sem descrição'}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold text-primary mb-1">Custo</div>
              <div className="border border-primary bg-input text-xs text-primary p-2 w-28 text-center font-bold">
                {selectedModifier.cost}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold text-primary mb-1">Fixo</div>
              <div className="border border-primary bg-input text-xs text-primary p-2 w-28 text-center font-bold">
                {selectedModifier.isFixed ? 'Sim' : 'Nao'}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedModifier(null)}
                className="border border-primary px-2 py-1 text-xs uppercase text-primary hover:bg-primary hover:text-background transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
