import { useState } from 'react';
import { BookOpenText, X } from 'lucide-react';
import AttributeHexagon from '@/components/AttributeHexagon';
import SkillsList from '@/components/SkillsList';
import DiceRoller from '@/components/DiceRoller';
import WoundsFrailty from '@/components/WoundsFrailty';
import DefensePanel from '@/components/DefensePanel';
import Pericias from '@/components/Pericias';
import HopeCounter from '@/components/HopeCounter';
import type { HeroicActionId } from '@/components/HopeCounter';
import InventoryPanel from '@/components/InventoryPanel';
import AdvantagesPanel from '@/components/AdvantagesPanel';
import InsanityPanel from '@/components/InsanityPanel';
import type { ConditionId } from '@/components/InsanityPanel';
import { CONDITIONS } from '@/components/InsanityPanel';
import { CONDITION_BY_ID } from '@/components/InsanityPanel';
import SaveLoad from '@/components/SaveLoad';

/**
 * Dark Occult Minimalism - Ficha de RPG Academia de Lyon
 * 
 * Estrutura:
 * - Topo: Nome do personagem
 * - Abaixo do nome: Thresholds em linha + Vitals + Hope Counter + Armor/Evasion
 * - Coluna esquerda: Atributos em hexágonos vermelhos
 * - Centro: Habilidades com scroll fixo, Expertises abaixo com scroll
 * - Direita: Rolagem de dados + Menu retrátil (Inventário/Equipamentos)
 */

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

interface SkillModifier {
  id: string;
  name: string;
  description: string;
  cost: number;
  isFixed: boolean;
}

type DefenseKey = 'esquiva' | 'aparar' | 'fortitude' | 'resistencia' | 'vontade';

interface Pericia {
  id: string;
  name: string;
  attribute: 'força' | 'agilidade' | 'luta' | 'vigor' | 'destreza' | 'intelecto' | 'prontidão' | 'presença';
  graduation: number;
  others: number;
}

interface DamageThreshold {
  minor: number;
  major: number;
  severe: number;
}

interface InventoryItem {
  id: string;
  name: string;
  description: string;
}

interface Advantage {
  id: string;
  name: string;
  description: string;
  graduation: number;
}

interface Attack {
  id: string;
  name: string;
  test: number;
  effect: string;
  resistanceTest: string;
  critical: number;
}

interface CharacterData {
  name: string;
  story: string;
  trauma: string;
  powerFlaw: string;
  attributes: {
    força: number;
    agilidade: number;
    luta: number;
    vigor: number;
    destreza: number;
    intelecto: number;
    prontidão: number;
    presença: number;
  };
  skills: Skill[];
  pericias: Pericia[];
  wounds: number;
  defenses: Record<DefenseKey, number>;
  hp: { current: number; max: number };
  sanity: { current: number; max: number };
  damageThresholds: DamageThreshold;
  hope: number;
  enhancedInitiative: number;
  armor: number;
  evasion: number;
  attacks: Attack[];
  advantages: Advantage[];
  inventoryItems: InventoryItem[];
  activeConditions: ConditionId[];
}

interface SkillRollRequest {
  id: number;
  periciaName: string;
  attributeLabel: string;
  baseBonus: number;
  modifierBreakdown: number[];
  totalBonus: number;
  criticalThreshold?: number;
}

const ATTRIBUTE_LABELS: Record<keyof CharacterData['attributes'], string> = {
  força: 'Força',
  agilidade: 'Agilidade',
  luta: 'Luta',
  vigor: 'Vigor',
  destreza: 'Destreza',
  intelecto: 'Intelecto',
  prontidão: 'Prontidão',
  presença: 'Presença',
};

export default function CharacterSheet() {
  const [pendingRoll, setPendingRoll] = useState<SkillRollRequest | null>(null);
  const [openSidebar, setOpenSidebar] = useState<'attacks' | 'insanity' | 'advantages' | null>(null);
  const [isPersonalDetailsOpen, setIsPersonalDetailsOpen] = useState(false);
  const [character, setCharacter] = useState<CharacterData>({
    name: 'Seu Personagem',
    story: '',
    trauma: '',
    powerFlaw: '',
    attributes: {
      força: 0,
      agilidade: 0,
      luta: 0,
      vigor: 0,
      destreza: 0,
      intelecto: 0,
      prontidão: 0,
      presença: 0,
    },
    skills: [],
    pericias: [
      { id: '1', name: 'Luta', attribute: 'luta', graduation: 2, others: 0 },
      { id: '2', name: 'Pontaria', attribute: 'destreza', graduation: 1, others: 0 },
    ],
    wounds: 0,
    defenses: {
      esquiva: 0,
      aparar: 0,
      fortitude: 0,
      resistencia: 0,
      vontade: 0,
    },
    hp: { current: 20, max: 20 },
    sanity: { current: 10, max: 10 },
    damageThresholds: { minor: 7, major: 14, severe: 21 },
    hope: 3,
    enhancedInitiative: 0,
    armor: 0,
    evasion: 0,
    attacks: [],
    advantages: [],
    inventoryItems: [],
    activeConditions: [],
  });

  const hasCondition = (conditionId: ConditionId) => character.activeConditions.includes(conditionId);

  const getGlobalTestModifierBreakdown = () => {
    const modifiers: number[] = [];

    if (hasCondition('prejudicado')) modifiers.push(-2);
    if (hasCondition('desabilitado')) modifiers.push(-5);

    return modifiers;
  };

  const getGlobalTestModifier = () => {
    return getGlobalTestModifierBreakdown().reduce((total, modifier) => total + modifier, 0);
  };

  const getConditionEffectsForWounds = () => {
    return CONDITIONS
      .filter((condition) => character.activeConditions.includes(condition.id))
      .map((condition) => `${condition.name}: ${condition.effect}${condition.details ? ` (${condition.details})` : ''}`);
  };

  const getPointDistribution = () => {
    const attributePoints = Object.values(character.attributes).reduce((total, value) => total + value, 0) * 2;
    const periciaPoints = character.pericias.reduce((total, pericia) => total + pericia.graduation * 0.5, 0);
    const skillPoints = character.skills.reduce((total, skill) => total + Number(skill.cost ?? 0), 0);
    const defensePoints = Object.values(character.defenses).reduce((total, value) => total + value, 0);
    const advantagePoints = character.advantages.reduce((total, advantage) => total + Number(advantage.graduation ?? 0), 0);

    return {
      attributePoints,
      periciaPoints,
      skillPoints,
      defensePoints,
      advantagePoints,
      total: attributePoints + periciaPoints + skillPoints + defensePoints + advantagePoints,
    };
  };

  const formatPoints = (value: number) => {
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
  };

  const expandConditionIds = (ids: ConditionId[]) => {
    const expanded = new Set<ConditionId>();

    const visit = (conditionId: ConditionId) => {
      if (expanded.has(conditionId)) return;

      expanded.add(conditionId);

      const condition = CONDITION_BY_ID[conditionId];
      if (!condition?.components) return;

      condition.components.forEach((componentId) => visit(componentId));
    };

    ids.forEach((conditionId) => visit(conditionId));
    return [...expanded];
  };

  const applyActiveDefenseCondition = (defenseKey: DefenseKey, total: number) => {
    if (defenseKey !== 'aparar' && defenseKey !== 'esquiva') return total;

    if (hasCondition('indefeso')) return 0;
    if (hasCondition('vulneravel')) return Math.floor(total / 2);

    return total;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCharacter({ ...character, name: e.target.value });
  };

  const handleAttributeChange = (attr: keyof typeof character.attributes, value: number) => {
    setCharacter({
      ...character,
      attributes: { ...character.attributes, [attr]: value },
    });
  };

  const handleAddSkill = () => {
    const newSkill: Skill = {
      id: Date.now().toString(),
      name: 'Nova Habilidade',
      description: 'Descricao da habilidade',
      powerType: '',
      isCritical: false,
      modifiers: [],
      graduation: 0,
      cost: 0,
      saveTest: '',
    };
    setCharacter((prev) => ({ ...prev, skills: [...prev.skills, newSkill] }));
  };

  const handleUpdateSkill = (
    id: string,
    field: keyof Skill,
    value: string | number | boolean | SkillModifier[]
  ) => {
    setCharacter((prev) => ({
      ...prev,
      skills: prev.skills.map((skill) =>
        skill.id === id ? { ...skill, [field]: value } : skill
      ),
    }));
  };

  const handleDeleteSkill = (id: string) => {
    setCharacter((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill.id !== id),
    }));
  };

  const handleReorderSkills = (draggedId: string, targetId: string) => {
    if (draggedId === targetId) return;

    setCharacter((prev) => {
      const fromIndex = prev.skills.findIndex((skill) => skill.id === draggedId);
      const toIndex = prev.skills.findIndex((skill) => skill.id === targetId);

      if (fromIndex === -1 || toIndex === -1) return prev;

      const reordered = [...prev.skills];
      const [moved] = reordered.splice(fromIndex, 1);
      reordered.splice(toIndex, 0, moved);

      return {
        ...prev,
        skills: reordered,
      };
    });
  };

  const handleAddPericia = () => {
    const newPericia: Pericia = {
      id: Date.now().toString(),
      name: 'Nova Pericia',
      attribute: 'força',
      graduation: 0,
      others: 0,
    };
    setCharacter({ ...character, pericias: [...character.pericias, newPericia] });
  };

  const handleUpdatePericia = (id: string, field: keyof Pericia, value: string | number) => {
    setCharacter({
      ...character,
      pericias: character.pericias.map((pericia) =>
        pericia.id === id ? { ...pericia, [field]: value } : pericia
      ),
    });
  };

  const handleDeletePericia = (id: string) => {
    setCharacter({
      ...character,
      pericias: character.pericias.filter((pericia) => pericia.id !== id),
    });
  };

  const handleRollPericia = (id: string) => {
    const pericia = character.pericias.find((p) => p.id === id);
    if (!pericia) return;

    const attributeValue = character.attributes[pericia.attribute];
    const baseBonus = attributeValue + pericia.graduation + pericia.others;
    const modifierBreakdown = getGlobalTestModifierBreakdown();
    const totalBonus = baseBonus + modifierBreakdown.reduce((total, modifier) => total + modifier, 0);

    setPendingRoll({
      id: Date.now(),
      periciaName: pericia.name || 'Pericia sem nome',
      attributeLabel: ATTRIBUTE_LABELS[pericia.attribute],
      baseBonus,
      modifierBreakdown,
      totalBonus: totalBonus,
      criticalThreshold: 20,
    });
  };

  const handleHopeChange = (value: number) => {
    setCharacter({ ...character, hope: Math.max(0, Math.min(6, value)) });
  };

  const handleHeroicActionSelected = (actionId: HeroicActionId) => {
    if (actionId !== 'recover') return;

    const removableConditions: ConditionId[] = ['tonto', 'fatigado', 'atordoado'];
    const shouldRemove = (conditionId: ConditionId) => {
      const expanded = expandConditionIds([conditionId]);
      return expanded.some((id) => removableConditions.includes(id));
    };

    setCharacter((prev) => ({
      ...prev,
      activeConditions: prev.activeConditions.filter((conditionId) => !shouldRemove(conditionId)),
    }));
  };

  const handleEnhancedInitiativeChange = (value: number) => {
    setCharacter((prev) => ({ ...prev, enhancedInitiative: Math.max(0, value) }));
  };

  const handleRollInitiative = () => {
    const baseBonus = character.attributes.agilidade + character.enhancedInitiative * 4;
    const modifierBreakdown = getGlobalTestModifierBreakdown();
    const initiativeBonus = baseBonus + modifierBreakdown.reduce((total, modifier) => total + modifier, 0);

    setPendingRoll({
      id: Date.now(),
      periciaName: 'Iniciativa',
      attributeLabel: 'Iniciativa',
      baseBonus,
      modifierBreakdown,
      totalBonus: initiativeBonus,
      criticalThreshold: 20,
    });
  };

  const handleWoundsChange = (value: number) => {
    const wounds = Math.max(0, value);
    setCharacter({ ...character, wounds });
  };

  const handleDefenseTrainingChange = (defense: DefenseKey, value: number) => {
    setCharacter({
      ...character,
      defenses: {
        ...character.defenses,
        [defense]: Math.max(0, value),
      },
    });
  };

  const handleRollDefense = (
    defenseKey: DefenseKey,
    defenseName: string,
    attributeLabel: string,
    totalBonus: number
  ) => {
    const adjustedDefense = applyActiveDefenseCondition(defenseKey, totalBonus);
    const modifierBreakdown = [
      ...getGlobalTestModifierBreakdown(),
      ...(defenseKey === 'resistencia' && character.wounds > 0 ? [-Math.max(0, character.wounds)] : []),
    ];
    const adjustedTotal = adjustedDefense + modifierBreakdown.reduce((total, modifier) => total + modifier, 0);

    setPendingRoll({
      id: Date.now(),
      periciaName: defenseName,
      attributeLabel,
      baseBonus: adjustedDefense,
      modifierBreakdown,
      totalBonus: adjustedTotal,
      criticalThreshold: 20,
    });
  };

  const handleAddAttack = () => {
    const newAttack: Attack = {
      id: Date.now().toString(),
      name: 'Novo Ataque',
      test: 0,
      effect: '',
      resistanceTest: '',
      critical: 0,
    };
    setCharacter((prev) => ({ ...prev, attacks: [...prev.attacks, newAttack] }));
  };

  const handleUpdateAttack = (id: string, field: keyof Attack, value: string | number) => {
    setCharacter((prev) => ({
      ...prev,
      attacks: prev.attacks.map((attack) =>
        attack.id === id ? { ...attack, [field]: value } : attack
      ),
    }));
  };

  const handleDeleteAttack = (id: string) => {
    setCharacter((prev) => ({
      ...prev,
      attacks: prev.attacks.filter((attack) => attack.id !== id),
    }));
  };

  const handleRollAttack = (id: string) => {
    const attack = character.attacks.find((item) => item.id === id);
    if (!attack) return;

    const resistanceLabel = attack.resistanceTest.trim() || '-';
    const baseBonus = attack.test;
    const modifierBreakdown = getGlobalTestModifierBreakdown();
    const totalBonus = baseBonus + modifierBreakdown.reduce((total, modifier) => total + modifier, 0);
    const criticalThreshold = Math.min(20, Math.max(1, attack.critical || 20));

    setPendingRoll({
      id: Date.now(),
      periciaName: attack.name || 'Ataque sem nome',
      attributeLabel: `Resistencia: ${resistanceLabel} | Critico: ${attack.critical}`,
      baseBonus,
      modifierBreakdown,
      totalBonus,
      criticalThreshold,
    });
  };

  const toggleAttacksPanel = () => {
    setOpenSidebar((prev) => (prev === 'attacks' ? null : 'attacks'));
  };

  const toggleInsanityPanel = () => {
    setOpenSidebar((prev) => (prev === 'insanity' ? null : 'insanity'));
  };

  const toggleAdvantagesPanel = () => {
    setOpenSidebar((prev) => (prev === 'advantages' ? null : 'advantages'));
  };

  const handleAddAdvantage = () => {
    const newAdvantage: Advantage = {
      id: Date.now().toString(),
      name: 'Nova Vantagem',
      description: '',
      graduation: 0,
    };

    setCharacter((prev) => ({
      ...prev,
      advantages: [...prev.advantages, newAdvantage],
    }));
  };

  const handleUpdateAdvantage = (id: string, field: keyof Advantage, value: string | number) => {
    setCharacter((prev) => ({
      ...prev,
      advantages: prev.advantages.map((advantage) =>
        advantage.id === id ? { ...advantage, [field]: value } : advantage
      ),
    }));
  };

  const handleDeleteAdvantage = (id: string) => {
    setCharacter((prev) => ({
      ...prev,
      advantages: prev.advantages.filter((advantage) => advantage.id !== id),
    }));
  };

  const handleAddInventoryItem = () => {
    const newItem: InventoryItem = {
      id: Date.now().toString(),
      name: 'Novo Item',
      description: '',
    };

    setCharacter((prev) => ({
      ...prev,
      inventoryItems: [...prev.inventoryItems, newItem],
    }));
  };

  const handleUpdateInventoryItem = (id: string, field: keyof InventoryItem, value: string) => {
    setCharacter((prev) => ({
      ...prev,
      inventoryItems: prev.inventoryItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleDeleteInventoryItem = (id: string) => {
    setCharacter((prev) => ({
      ...prev,
      inventoryItems: prev.inventoryItems.filter((item) => item.id !== id),
    }));
  };

  const handleToggleCondition = (conditionId: ConditionId) => {
    const isActive = character.activeConditions.includes(conditionId);
    const relatedConditionIds = expandConditionIds([conditionId]);

    setCharacter({
      ...character,
      activeConditions: isActive
        ? character.activeConditions.filter((id) => !relatedConditionIds.includes(id))
        : [...new Set([...character.activeConditions, ...relatedConditionIds])],
    });
  };

  const handleLoadCharacter = (
    data: Partial<CharacterData> & {
      expertises?: Array<{ id: string; name: string }>;
      initiative?: number;
      iniciativaAprimorada?: number;
      initiativeAprimorada?: number;
      attacks?: Array<
        Partial<Attack> & {
          id: string;
          teste?: number;
          efeito?: string;
          testeResistencia?: string;
          critico?: number;
        }
      >;
      skills?: Array<
        Partial<Skill> & {
          id: string;
          name?: string;
          effect?: string;
          damage?: string;
          hasCounter?: boolean;
          counter?: number;
          modifiers?: SkillModifier[] | string;
        }
      >;
      advantages?: Advantage[];
      inventoryItems?: InventoryItem[];
      activeConditions?: ConditionId[];
      conditions?: ConditionId[];
    }
  ) => {
    type LegacySkill = Partial<Skill> & {
      id: string;
      effect?: string;
      damage?: string;
      hasCounter?: boolean;
      counter?: number;
      modifiers?: SkillModifier[] | string;
    };

    type LegacyAttack = Partial<Attack> & {
      id: string;
      teste?: number;
      efeito?: string;
      testeResistencia?: string;
      critico?: number;
    };

    const rawSkills: LegacySkill[] = Array.isArray(data.skills)
      ? (data.skills as LegacySkill[])
      : [];

    const rawAttacks: LegacyAttack[] = Array.isArray(data.attacks)
      ? (data.attacks as LegacyAttack[])
      : [];

    const loadedSkills: Skill[] = rawSkills.length > 0
      ? rawSkills.map((skill) => ({
          id: skill.id,
          name: skill.name ?? 'Habilidade',
          description: skill.description ?? skill.effect ?? '',
          powerType: skill.powerType ?? '',
          isCritical: Boolean(skill.isCritical),
          modifiers: Array.isArray(skill.modifiers)
            ? skill.modifiers.map((modifier) => ({
                id: modifier.id,
                name: modifier.name,
                description: modifier.description,
                cost: Number(modifier.cost ?? 0),
                isFixed: Boolean(modifier.isFixed),
              }))
            : [],
          graduation: Number(skill.graduation ?? 0),
          cost: Number(skill.cost ?? skill.counter ?? 0),
          saveTest: skill.saveTest ?? '',
        }))
      : [];

    const loadedAttacks: Attack[] = rawAttacks.length > 0
      ? rawAttacks.map((attack) => ({
          id: attack.id,
          name: attack.name ?? 'Ataque',
          test: Number(attack.test ?? attack.teste ?? 0),
          effect: attack.effect ?? attack.efeito ?? '',
          resistanceTest: attack.resistanceTest ?? attack.testeResistencia ?? '',
          critical: Number(attack.critical ?? attack.critico ?? 0),
        }))
      : [];

    const loadedPericias: Pericia[] = Array.isArray(data.pericias)
      ? data.pericias.map((pericia) => ({
          id: pericia.id,
          name: pericia.name,
          attribute: pericia.attribute ?? 'força',
          graduation: pericia.graduation ?? 0,
          others: pericia.others ?? 0,
        }))
      : (data.expertises || []).map((expertise) => ({
          id: expertise.id,
          name: expertise.name,
          attribute: 'força' as const,
          graduation: 0,
          others: 0,
        }));

    setCharacter((prev) => ({
      ...prev,
      ...data,
      attributes: {
        ...prev.attributes,
        ...data.attributes,
      },
      enhancedInitiative: Number(
        data.enhancedInitiative ??
        data.iniciativaAprimorada ??
        data.initiativeAprimorada ??
        Math.max(
          0,
          Math.floor(
            (Number(data.initiative ?? prev.attributes.agilidade) - Number(data.attributes?.agilidade ?? prev.attributes.agilidade)) / 4
          )
        )
      ),
      skills: loadedSkills.length > 0 ? loadedSkills : prev.skills,
      attacks: loadedAttacks.length > 0 ? loadedAttacks : prev.attacks,
      pericias: loadedPericias.length > 0 ? loadedPericias : prev.pericias,
      advantages: Array.isArray(data.advantages) ? data.advantages : prev.advantages,
      inventoryItems: Array.isArray(data.inventoryItems) ? data.inventoryItems : prev.inventoryItems,
      defenses: {
        esquiva: Number(data.defenses?.esquiva ?? prev.defenses.esquiva),
        aparar: Number(data.defenses?.aparar ?? prev.defenses.aparar),
        fortitude: Number(data.defenses?.fortitude ?? prev.defenses.fortitude),
        resistencia: Number(data.defenses?.resistencia ?? prev.defenses.resistencia),
        vontade: Number(data.defenses?.vontade ?? prev.defenses.vontade),
      },
      activeConditions: Array.isArray(data.activeConditions)
        ? data.activeConditions
        : Array.isArray(data.conditions)
          ? data.conditions
          : prev.activeConditions,
    }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-mono overflow-hidden flex flex-col">
      {/* Header */}
      <div className="border-b-2 border-primary bg-background p-2 md:p-4 flex-shrink-0 space-y-2 md:space-y-3 overflow-y-auto max-h-screen md:max-h-none">
        <h1 className="font-display text-2xl md:text-4xl text-primary">ACADEMIA DE LYON</h1>
        <div className="flex items-end gap-2">
          <input
            type="text"
            value={character.name}
            onChange={handleNameChange}
            className="input-occult text-lg md:text-2xl font-display bg-background border-b-2 border-primary focus:border-primary w-full"
            placeholder="Nome do Personagem"
          />
          <button
            type="button"
            onClick={() => setIsPersonalDetailsOpen(true)}
            className="h-10 w-10 mr-14 md:mr-16 border-2 border-primary text-primary hover:bg-primary hover:text-background transition-colors flex items-center justify-center flex-shrink-0"
            title="Abrir detalhes pessoais"
            aria-label="Abrir detalhes pessoais"
          >
            <BookOpenText size={16} />
          </button>
        </div>

        {/* Save/Load Buttons */}
        <SaveLoad
          characterData={character}
          onLoadCharacter={handleLoadCharacter}
        />

        {/* Wounds + Hope Row - Stack on mobile */}
        <div className="flex flex-col md:flex-row gap-2 md:gap-4">
          <div className="flex-1 min-w-0">
            <WoundsFrailty
              wounds={character.wounds}
              onWoundsChange={handleWoundsChange}
              conditionEffects={getConditionEffectsForWounds()}
            />
          </div>
          <div className="flex-1 min-w-0">
            <DefensePanel
              attributes={character.attributes}
              defenses={character.defenses}
              onTrainingChange={handleDefenseTrainingChange}
              onRollDefense={handleRollDefense}
            />
          </div>
          <div className="w-full md:w-56 flex-shrink-0 self-stretch">
            <HopeCounter
              current={character.hope}
              onChange={handleHopeChange}
              onHeroicActionSelected={handleHeroicActionSelected}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row flex-1 gap-2 md:gap-4 p-2 md:p-4 overflow-hidden pr-0">
        {/* Left Column - Attributes */}
        <div className="flex-shrink-0 w-full md:w-40">
          <h2 className="font-display text-xs md:text-sm text-primary uppercase mb-2 md:mb-3">Atributos</h2>
          <div className="grid grid-cols-3 md:grid-cols-2 gap-2 md:gap-3">
            {Object.entries(character.attributes).map(([attr, value]) => (
              <AttributeHexagon
                key={attr}
                attribute={attr}
                value={value}
                onChange={(val) => handleAttributeChange(attr as keyof typeof character.attributes, val)}
              />
            ))}
          </div>
        </div>

        {/* Center Column - Skills & Pericias */}
        <div className="flex-1 flex flex-col min-w-0 gap-2 md:gap-4 md:ml-3">
          {/* Pericias Section */}
          <div className="h-80 md:h-[32rem] flex flex-col min-h-0 flex-shrink-0">
            <Pericias
              pericias={character.pericias}
              onAddPericia={handleAddPericia}
              onUpdatePericia={handleUpdatePericia}
              onDeletePericia={handleDeletePericia}
              onRollPericia={handleRollPericia}
            />
          </div>

          {/* Skills Section - Fixed Height with Scroll */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-2 flex-shrink-0">
              <h2 className="font-display text-sm md:text-lg text-primary">HABILIDADES</h2>
              <button
                onClick={handleAddSkill}
                className="btn-occult text-xs px-2 py-1"
              >
                + ADD
              </button>
            </div>
            <SkillsList
              skills={character.skills}
              onUpdateSkill={handleUpdateSkill}
              onDeleteSkill={handleDeleteSkill}
              onReorderSkills={handleReorderSkills}
            />
          </div>
        </div>

        {/* Right Column - Dice */}
        <div className="flex-shrink-0 w-full md:w-56 pr-0 md:pr-4">
          <DiceRoller rollRequest={pendingRoll} />
        </div>
      </div>

      <AdvantagesPanel
        isOpen={openSidebar === 'advantages'}
        showToggle={openSidebar !== 'attacks' && openSidebar !== 'insanity'}
        onToggle={toggleAdvantagesPanel}
        advantages={character.advantages}
        onAddAdvantage={handleAddAdvantage}
        onUpdateAdvantage={handleUpdateAdvantage}
        onDeleteAdvantage={handleDeleteAdvantage}
        inventoryItems={character.inventoryItems}
        onAddInventoryItem={handleAddInventoryItem}
        onUpdateInventoryItem={handleUpdateInventoryItem}
        onDeleteInventoryItem={handleDeleteInventoryItem}
      />

      {/* Attacks Panel - Retractable Sidebar */}
      <InventoryPanel
        isOpen={openSidebar === 'attacks'}
        showToggle={openSidebar !== 'insanity' && openSidebar !== 'advantages'}
        onToggle={toggleAttacksPanel}
        initiative={character.attributes.agilidade + character.enhancedInitiative * 4}
        enhancedInitiative={character.enhancedInitiative}
        onEnhancedInitiativeChange={handleEnhancedInitiativeChange}
        onRollInitiative={handleRollInitiative}
        attacks={character.attacks}
        onAddAttack={handleAddAttack}
        onUpdateAttack={handleUpdateAttack}
        onDeleteAttack={handleDeleteAttack}
        onRollAttack={handleRollAttack}
      />

      {/* Insanity Panel - Third Retractable Sidebar */}
      <InsanityPanel
        isOpen={openSidebar === 'insanity'}
        showToggle={openSidebar !== 'attacks' && openSidebar !== 'advantages'}
        onToggle={toggleInsanityPanel}
        activeConditions={character.activeConditions}
        onToggleCondition={handleToggleCondition}
      />

      {isPersonalDetailsOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl border-2 border-primary bg-background p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-primary pb-2">
              <h3 className="font-display text-base text-primary uppercase">Detalhes Pessoais</h3>
              <button
                type="button"
                onClick={() => setIsPersonalDetailsOpen(false)}
                className="h-8 w-8 border border-primary text-primary hover:bg-primary hover:text-background transition-colors flex items-center justify-center"
                aria-label="Fechar detalhes pessoais"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-sm uppercase tracking-wide text-primary font-bold">Historia</div>
              <textarea
                value={character.story}
                onChange={(e) => setCharacter({ ...character, story: e.target.value })}
                className="w-full bg-transparent border border-primary text-muted-foreground text-xs p-2 focus:outline-none focus:ring-1 focus:ring-primary resize-y"
                rows={4}
                placeholder="Escreva sua historia"
              />
            </div>

            <div className="space-y-2">
              <div className="text-sm uppercase tracking-wide text-primary font-bold">Trauma</div>
              <textarea
                value={character.trauma}
                onChange={(e) => setCharacter({ ...character, trauma: e.target.value })}
                className="w-full bg-transparent border border-primary text-muted-foreground text-xs p-2 focus:outline-none focus:ring-1 focus:ring-primary resize-y"
                rows={3}
                placeholder="Escreva seu trauma"
              />
            </div>

            <div className="space-y-2">
              <div className="text-sm uppercase tracking-wide text-primary font-bold">Falha dos Poderes</div>
              <textarea
                value={character.powerFlaw}
                onChange={(e) => setCharacter({ ...character, powerFlaw: e.target.value })}
                className="w-full bg-transparent border border-primary text-muted-foreground text-xs p-2 focus:outline-none focus:ring-1 focus:ring-primary resize-y"
                rows={3}
                placeholder="Escreva a falha dos poderes"
              />
            </div>

            <div className="border border-primary p-3 space-y-2 bg-primary text-background">
              <div className="text-sm uppercase tracking-wide font-bold">Distribuicao dos pontos</div>

              {(() => {
                const distribution = getPointDistribution();

                return (
                  <div className="space-y-1 text-xs font-mono">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-background uppercase font-bold">Atributos</span>
                      <span className="text-background font-bold">{formatPoints(distribution.attributePoints)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-background uppercase font-bold">Pericias</span>
                      <span className="text-background font-bold">{formatPoints(distribution.periciaPoints)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-background uppercase font-bold">Habilidades</span>
                      <span className="text-background font-bold">{formatPoints(distribution.skillPoints)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-background uppercase font-bold">Defesa</span>
                      <span className="text-background font-bold">{formatPoints(distribution.defensePoints)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-background uppercase font-bold">Vantagens</span>
                      <span className="text-background font-bold">{formatPoints(distribution.advantagePoints)}</span>
                    </div>

                    <div className="pt-2 mt-2 border-t border-background flex items-center justify-between gap-3">
                      <span className="text-background uppercase font-bold">Total</span>
                      <span className="text-background font-bold">{formatPoints(distribution.total)}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
