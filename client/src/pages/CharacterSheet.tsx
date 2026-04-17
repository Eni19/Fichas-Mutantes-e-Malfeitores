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

interface Weapon {
  id: string;
  name: string;
  traits: string;
  damage?: string;
  damageDie: number;
  hasDamageBonus: boolean;
  damageBonus: number;
  proficiency: number;
  feature: string;
}

interface DamageRollRequest {
  id: number;
  weaponName: string;
  diceCount: number;
  diceType: number;
  modifier: number;
}

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
  armor: number;
  evasion: number;
  inventory: InventoryItem[];
  primaryWeapon: Weapon;
  secondaryWeapon: Weapon;
  insanities: Insanity[];
  paranormalPowers: ParanormalPower[];
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
  const [pendingDamageRoll, setPendingDamageRoll] = useState<DamageRollRequest | null>(null);
  const [openSidebar, setOpenSidebar] = useState<'inventory' | 'insanity' | null>(null);
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
    armor: 0,
    evasion: 0,
    inventory: [],
    primaryWeapon: {
      id: '1',
      name: '',
      traits: '',
      damageDie: 6,
      hasDamageBonus: false,
      damageBonus: 0,
      proficiency: 0,
      feature: '',
    },
    secondaryWeapon: {
      id: '2',
      name: '',
      traits: '',
      damageDie: 6,
      hasDamageBonus: false,
      damageBonus: 0,
      proficiency: 0,
      feature: '',
    },
    insanities: [],
    paranormalPowers: [],
  });

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
    const totalBonus = attributeValue + pericia.graduation + pericia.others;

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
    const adjustedTotal = defenseKey === 'resistencia'
      ? totalBonus - Math.max(0, character.wounds)
      : totalBonus;

    setPendingRoll({
      id: Date.now(),
      periciaName: defenseName,
      attributeLabel,
      totalBonus: adjustedTotal,
    });
  };

  const handleAddInventoryItem = () => {
    const newItem: InventoryItem = {
      id: Date.now().toString(),
      name: 'Novo Item',
      description: '',
    };
    setCharacter({ ...character, inventory: [...character.inventory, newItem] });
  };

  const handleUpdateInventoryItem = (id: string, field: keyof InventoryItem, value: string) => {
    setCharacter({
      ...character,
      inventory: character.inventory.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    });
  };

  const handleDeleteInventoryItem = (id: string) => {
    setCharacter({
      ...character,
      inventory: character.inventory.filter((item) => item.id !== id),
    });
  };

  const handleUpdatePrimaryWeapon = (field: keyof Weapon, value: string | number | boolean) => {
    setCharacter({
      ...character,
      primaryWeapon: { ...character.primaryWeapon, [field]: value },
    });
  };

  const handleUpdateSecondaryWeapon = (field: keyof Weapon, value: string | number | boolean) => {
    setCharacter({
      ...character,
      secondaryWeapon: { ...character.secondaryWeapon, [field]: value },
    });
  };

  const handleRollWeaponDamage = (weapon: Weapon) => {
    const diceCount = Math.max(1, weapon.proficiency || 0);
    const modifier = weapon.hasDamageBonus ? weapon.damageBonus : 0;

    setPendingDamageRoll({
      id: Date.now(),
      weaponName: weapon.name || 'Arma sem nome',
      diceCount,
      diceType: weapon.damageDie,
      modifier,
    });
  };

  const toggleInventoryPanel = () => {
    setOpenSidebar((prev) => (prev === 'inventory' ? null : 'inventory'));
  };

  const toggleInsanityPanel = () => {
    setOpenSidebar((prev) => (prev === 'insanity' ? null : 'insanity'));
  };

  const handleAddInsanity = (insanity: Insanity) => {
    setCharacter({ ...character, insanities: [...character.insanities, insanity] });
  };

  const handleUpdateInsanity = (id: string, insanity: Insanity) => {
    setCharacter({
      ...character,
      insanities: character.insanities.map((i) => (i.id === id ? insanity : i)),
    });
  };

  const handleRemoveInsanity = (id: string) => {
    setCharacter({
      ...character,
      insanities: character.insanities.filter((i) => i.id !== id),
    });
  };

  const handleAddPower = (power: ParanormalPower) => {
    setCharacter({ ...character, paranormalPowers: [...character.paranormalPowers, power] });
  };

  const handleUpdatePower = (id: string, power: ParanormalPower) => {
    setCharacter({
      ...character,
      paranormalPowers: character.paranormalPowers.map((p) => (p.id === id ? power : p)),
    });
  };

  const handleRemovePower = (id: string) => {
    setCharacter({
      ...character,
      paranormalPowers: character.paranormalPowers.filter((p) => p.id !== id),
    });
  };

  const handleLoadCharacter = (
    data: Partial<CharacterData> & {
      expertises?: Array<{ id: string; name: string }>;
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
    }
  ) => {
    const normalizeWeapon = (weapon: Partial<Weapon> | undefined, fallback: Weapon): Weapon => {
      const parsedLegacyDie =
        typeof weapon?.damage === 'string'
          ? Number((weapon.damage.match(/d(\d+)/i) || [])[1] || 0)
          : 0;

      const candidateDie = Number(weapon?.damageDie ?? parsedLegacyDie ?? fallback.damageDie);
      const supportedDice = [4, 6, 8, 10, 12, 20];
      const safeDie = supportedDice.includes(candidateDie) ? candidateDie : 6;

      return {
        ...fallback,
        ...weapon,
        damageDie: safeDie,
        hasDamageBonus: Boolean(weapon?.hasDamageBonus),
        damageBonus: Number(weapon?.damageBonus ?? 0),
        proficiency: Number(weapon?.proficiency ?? fallback.proficiency),
      };
    };

    const loadedSkills: Skill[] = Array.isArray(data.skills)
      ? data.skills.map((skill) => ({
          id: skill.id,
          name: skill.name ?? 'Habilidade',
          description: skill.description ?? skill.effect ?? '',
          powerType: skill.powerType ?? '',
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
      skills: loadedSkills.length > 0 ? loadedSkills : prev.skills,
      pericias: loadedPericias.length > 0 ? loadedPericias : prev.pericias,
      defenses: {
        esquiva: Number(data.defenses?.esquiva ?? prev.defenses.esquiva),
        aparar: Number(data.defenses?.aparar ?? prev.defenses.aparar),
        fortitude: Number(data.defenses?.fortitude ?? prev.defenses.fortitude),
        resistencia: Number(data.defenses?.resistencia ?? prev.defenses.resistencia),
        vontade: Number(data.defenses?.vontade ?? prev.defenses.vontade),
      },
      primaryWeapon: normalizeWeapon(data.primaryWeapon, prev.primaryWeapon),
      secondaryWeapon: normalizeWeapon(data.secondaryWeapon, prev.secondaryWeapon),
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
            <WoundsFrailty wounds={character.wounds} onWoundsChange={handleWoundsChange} />
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
          <DiceRoller rollRequest={pendingRoll} damageRollRequest={pendingDamageRoll} />
        </div>
      </div>

      {/* Inventory Panel - Retractable Sidebar */}
      <InventoryPanel
        isOpen={openSidebar === 'inventory'}
        showToggle={openSidebar !== 'insanity'}
        onToggle={toggleInventoryPanel}
        inventory={character.inventory}
        onAddItem={handleAddInventoryItem}
        onUpdateItem={handleUpdateInventoryItem}
        onDeleteItem={handleDeleteInventoryItem}
        primaryWeapon={character.primaryWeapon}
        onUpdatePrimaryWeapon={handleUpdatePrimaryWeapon}
        secondaryWeapon={character.secondaryWeapon}
        onUpdateSecondaryWeapon={handleUpdateSecondaryWeapon}
        onRollPrimaryDamage={() => handleRollWeaponDamage(character.primaryWeapon)}
        onRollSecondaryDamage={() => handleRollWeaponDamage(character.secondaryWeapon)}
      />

      {/* Insanity Panel - Second Retractable Sidebar */}
      <InsanityPanel
        isOpen={openSidebar === 'insanity'}
        showToggle={openSidebar !== 'inventory'}
        onToggle={toggleInsanityPanel}
        insanities={character.insanities}
        paranormalPowers={character.paranormalPowers}
        onInsanityAdd={handleAddInsanity}
        onInsanityRemove={handleRemoveInsanity}
        onInsanityUpdate={handleUpdateInsanity}
        onPowerAdd={handleAddPower}
        onPowerRemove={handleRemovePower}
        onPowerUpdate={handleUpdatePower}
      />
    </div>
  );
}
