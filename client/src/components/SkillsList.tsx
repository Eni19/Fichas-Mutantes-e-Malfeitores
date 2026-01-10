import { Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Skill {
  id: string;
  name: string;
  effect: string;
  cost: number;
}

interface SkillsListProps {
  skills: Skill[];
  onUpdateSkill: (id: string, field: keyof Skill, value: string | number) => void;
  onDeleteSkill: (id: string) => void;
}

export default function SkillsList({ skills, onUpdateSkill, onDeleteSkill }: SkillsListProps) {
  return (
    <ScrollArea className="flex-1 border-2 border-primary bg-black p-3 min-h-0">
      <div className="space-y-3 pr-4">
        {skills.length === 0 ? (
          <div className="flex items-center justify-center text-muted-foreground text-center py-8">
            <p className="font-mono text-sm">Nenhuma habilidade adicionada ainda.</p>
          </div>
        ) : (
          skills.map((skill) => (
            <div
              key={skill.id}
              className="border border-primary p-2 bg-black space-y-1 flex-shrink-0"
            >
              <div className="flex items-start justify-between gap-2">
                <input
                  type="text"
                  value={skill.name}
                  onChange={(e) => onUpdateSkill(skill.id, 'name', e.target.value)}
                  className="flex-1 min-w-0 bg-transparent border-b border-primary text-primary font-display text-sm focus:outline-none focus:ring-0 uppercase"
                  placeholder="Nome da Habilidade"
                />
                <button
                  onClick={() => onDeleteSkill(skill.id)}
                  className="text-primary hover:text-secondary transition-colors p-0 flex-shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <textarea
                value={skill.effect}
                onChange={(e) => {
                  onUpdateSkill(skill.id, 'effect', e.target.value);
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
                rows={1}
                style={{ minHeight: '24px' }}
              />

              <div className="flex items-center gap-2">
                <label className="font-display text-xs text-primary uppercase">Custo:</label>
                <input
                  type="number"
                  value={skill.cost}
                  onChange={(e) => onUpdateSkill(skill.id, 'cost', parseInt(e.target.value) || 0)}
                  style={{ fontWeight: 700, fontFamily: "'Roboto Mono', monospace" }}
                  className="w-12 bg-input border border-primary text-primary text-center focus:outline-none focus:ring-1 focus:ring-primary text-xs p-1"
                  min="0"
                />
              </div>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
}
