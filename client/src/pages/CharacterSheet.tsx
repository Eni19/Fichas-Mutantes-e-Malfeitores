import { useState } from 'react';
import AttributeHexagon from '@/components/AttributeHexagon';
import SkillsList from '@/components/SkillsList';
import DiceRoller from '@/components/DiceRoller';
import WoundsFrailty from '@/components/WoundsFrailty';
import DefensePanel from '@/components/DefensePanel';
import Pericias from '@/components/Pericias';
import HopeCounter from '@/components/HopeCounter';
import InventoryPanel from '@/components/InventoryPanel';
import InsanityPanel from '@/components/InsanityPanel';
import type { ConditionId } from '@/components/InsanityPanel';
import { CONDITIONS } from '@/components/InsanityPanel';
import SaveLoad from '@/components/SaveLoad';

/**
 * Dark Occult Minimalism - Ficha de RPG Daggerheart
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
  activeConditions: ConditionId[];
}

interface SkillRollRequest {
  id: number;
  periciaName: string;
  attributeLabel: string;
  totalBonus: number;
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
  const [openSidebar, setOpenSidebar] = useState<'attacks' | 'insanity' | null>(null);
  const [character, setCharacter] = useState<CharacterData>({
    name: 'Seu Personagem',
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
    activeConditions: [],
  });

  const hasCondition = (conditionId: ConditionId) => character.activeConditions.includes(conditionId);

  const getGlobalTestModifier = () => {
    let modifier = 0;

    if (hasCondition('prejudicado')) modifier -= 2;
    if (hasCondition('desabilitado')) modifier -= 5;

    return modifier;
  };

  const getConditionEffectsForWounds = () => {
    return CONDITIONS
      .filter((condition) => character.activeConditions.includes(condition.id))
      .map((condition) => `${condition.name}: ${condition.effect}`);
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
    const totalBonus = attributeValue + pericia.graduation + pericia.others + getGlobalTestModifier();

    setPendingRoll({
      id: Date.now(),
      periciaName: pericia.name || 'Pericia sem nome',
      attributeLabel: ATTRIBUTE_LABELS[pericia.attribute],
      totalBonus: totalBonus,
    });
  };

  const handleHopeChange = (value: number) => {
    setCharacter({ ...character, hope: Math.max(0, Math.min(6, value)) });
  };

  const handleEnhancedInitiativeChange = (value: number) => {
    setCharacter((prev) => ({ ...prev, enhancedInitiative: Math.max(0, value) }));
  };

  const handleRollInitiative = () => {
    const initiativeBonus = character.attributes.agilidade + character.enhancedInitiative * 4 + getGlobalTestModifier();

    setPendingRoll({
      id: Date.now(),
      periciaName: 'Iniciativa',
      attributeLabel: 'Iniciativa',
      totalBonus: initiativeBonus,
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
    const adjustedWithWounds = defenseKey === 'resistencia'
      ? adjustedDefense - Math.max(0, character.wounds)
      : adjustedDefense;
    const adjustedTotal = adjustedWithWounds + getGlobalTestModifier();

    setPendingRoll({
      id: Date.now(),
      periciaName: defenseName,
      attributeLabel,
      totalBonus: adjustedTotal,
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

    setPendingRoll({
      id: Date.now(),
      periciaName: attack.name || 'Ataque sem nome',
      attributeLabel: `Resistencia: ${resistanceLabel} | Critico: ${attack.critical}`,
      totalBonus: attack.test + getGlobalTestModifier(),
    });
  };

  const toggleAttacksPanel = () => {
    setOpenSidebar((prev) => (prev === 'attacks' ? null : 'attacks'));
  };

  const toggleInsanityPanel = () => {
    setOpenSidebar((prev) => (prev === 'insanity' ? null : 'insanity'));
  };

  const handleToggleCondition = (conditionId: ConditionId) => {
    setCharacter({
      ...character,
      activeConditions: character.activeConditions.includes(conditionId)
        ? character.activeConditions.filter((id) => id !== conditionId)
        : [...character.activeConditions, conditionId],
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
        <h1 className="font-display text-2xl md:text-4xl text-primary">ORDEM DA VERDADE</h1>
        <input
          type="text"
          value={character.name}
          onChange={handleNameChange}
          className="input-occult text-lg md:text-2xl font-display bg-background border-b-2 border-primary focus:border-primary w-full"
          placeholder="Nome do Personagem"
        />

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
          <div className="w-full md:w-56 flex-shrink-0">
            <HopeCounter current={character.hope} onChange={handleHopeChange} />
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

      {/* Attacks Panel - Retractable Sidebar */}
      <InventoryPanel
        isOpen={openSidebar === 'attacks'}
        showToggle={openSidebar !== 'insanity'}
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

      {/* Insanity Panel - Second Retractable Sidebar */}
      <InsanityPanel
        isOpen={openSidebar === 'insanity'}
        showToggle={openSidebar !== 'attacks'}
        onToggle={toggleInsanityPanel}
        activeConditions={character.activeConditions}
        onToggleCondition={handleToggleCondition}
      />
    </div>
  );
}
