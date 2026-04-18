import { useEffect, useRef, useState } from 'react';
import { Check, Dice6 } from 'lucide-react';

interface DiceResult {
  formula: string;
  total: number;
  rolls: number[];
  timestamp: string;
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

interface DiceRollerProps {
  rollRequest: SkillRollRequest | null;
}

export default function DiceRoller({ rollRequest }: DiceRollerProps) {
  const [isRolling, setIsRolling] = useState(false);
  const [history, setHistory] = useState<DiceResult[]>([]);
  const [displayRolls, setDisplayRolls] = useState<number[]>([]);
  const [displayMessage, setDisplayMessage] = useState<string | null>(null);
  const [displayFlash, setDisplayFlash] = useState<'critical' | 'fail' | null>(null);
  const [numDice, setNumDice] = useState(2);
  const [diceType, setDiceType] = useState(12);
  const lastProcessedRollIdRef = useRef<number | null>(null);
  const [displayMode, setDisplayMode] = useState<'skill' | 'custom'>('skill');
  const [customFormula, setCustomFormula] = useState('');
  const [displaySubtitle, setDisplaySubtitle] = useState<string | null>(null);
  const [displayBaseBonus, setDisplayBaseBonus] = useState(0);
  const [displayModifiers, setDisplayModifiers] = useState<number[]>([]);
  const [showSkillTotal, setShowSkillTotal] = useState(false);

  const diceTypes = [4, 6, 8, 10, 12, 20];
  const maxDice = 10;
  const displayModifierTotal = displayBaseBonus + displayModifiers.reduce((sum, modifier) => sum + modifier, 0);

  const updateCriticalFeedback = (rolls: number[], isD20Roll: boolean, criticalThreshold = 20) => {
    if (!isD20Roll) return;

    const hasCritical = rolls.some((roll) => roll >= criticalThreshold);
    if (hasCritical) {
      setDisplayFlash('critical');
      setDisplayMessage('CRITICO!');
    }
  };

  const rollCustomDice = () => {
    if (isRolling) return;

    setDisplayMode('custom');
    setCustomFormula(`${numDice}d${diceType}`);
    setDisplaySubtitle(null);
    setDisplayBaseBonus(0);
    setDisplayModifiers([]);
    setDisplayMessage(null);
    setDisplayFlash(null);
    setIsRolling(true);
    setDisplayRolls(Array.from({ length: numDice }, () => Math.floor(Math.random() * diceType) + 1));

    const animationDuration = 600;
    const startTime = Date.now();

    const animateRoll = () => {
      const elapsed = Date.now() - startTime;

      if (elapsed < animationDuration) {
        setDisplayRolls(Array.from({ length: numDice }, () => Math.floor(Math.random() * diceType) + 1));
        requestAnimationFrame(animateRoll);
        return;
      }

      const rolls = Array.from({ length: numDice }, () => Math.floor(Math.random() * diceType) + 1);
      const total = rolls.reduce((sum, current) => sum + current, 0);

      const result: DiceResult = {
        formula: `${numDice}d${diceType}`,
        total,
        rolls,
        timestamp: new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      };

      setHistory((prev) => [result, ...prev.slice(0, 4)]);
      setDisplayRolls(rolls);
      updateCriticalFeedback(rolls, diceType === 20, 20);
      setIsRolling(false);
    };

    animateRoll();
  };

  useEffect(() => {
    if (!rollRequest) return;
    if (isRolling) return;
    if (lastProcessedRollIdRef.current === rollRequest.id) return;

    lastProcessedRollIdRef.current = rollRequest.id;
    setDisplayMode('skill');
    setDisplayBaseBonus(rollRequest.baseBonus);
    setDisplayModifiers(rollRequest.modifierBreakdown);

    setDisplayMessage(null);
    setDisplayFlash(null);
    setIsRolling(true);

    const animationDuration = 650;
    const startTime = Date.now();

    const animateRoll = () => {
      const elapsed = Date.now() - startTime;

      if (elapsed < animationDuration) {
        setDisplayRolls([Math.floor(Math.random() * 20) + 1]);
        requestAnimationFrame(animateRoll);
        return;
      }

      const d20Roll = Math.floor(Math.random() * 20) + 1;
      const finalRolls = [d20Roll];
      let total = d20Roll + rollRequest.totalBonus;

      setDisplayRolls(finalRolls);

      const formula = `1d20 ${rollRequest.totalBonus >= 0 ? '+' : '-'} ${Math.abs(rollRequest.totalBonus)}`;

      const result: DiceResult = {
        formula,
        total,
        rolls: finalRolls,
        timestamp: new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      };

      setHistory((prev) => [result, ...prev.slice(0, 4)]);
      updateCriticalFeedback(finalRolls, true, rollRequest.criticalThreshold ?? 20);
      setIsRolling(false);
    };

    animateRoll();
  }, [rollRequest, isRolling]);

  return (
    <div className="space-y-4">
      <div
        className={`border-2 p-4 transition-colors duration-200 ${
          displayFlash === 'critical'
            ? 'border-yellow-400 bg-yellow-950/25'
            : displayFlash === 'fail'
              ? 'border-red-300 bg-red-950/25'
              : 'border-red-500 bg-background'
        }`}
      >
        <h3 className="text-xs font-bold text-red-500 uppercase mb-3">Display de Testes</h3>

        <div className="text-xs text-red-300 border border-red-500 p-2 bg-background/80 mb-3 min-h-14">
          {displayMode === 'skill' && rollRequest ? (
            <>
              <div className="font-bold text-red-400 uppercase">{rollRequest.periciaName}</div>
              <div>{rollRequest.attributeLabel}</div>
              <div className="text-red-400">
                {[
                  '1d20',
                  rollRequest.baseBonus !== 0 ? (rollRequest.baseBonus > 0 ? `+ ${rollRequest.baseBonus}` : `- ${Math.abs(rollRequest.baseBonus)}`) : null,
                  ...rollRequest.modifierBreakdown.map((modifier) => (modifier > 0 ? `+ ${modifier}` : `- ${Math.abs(modifier)}`)),
                ]
                  .filter(Boolean)
                  .join(' ')}
              </div>
            </>
          ) : displayMode === 'custom' && customFormula ? (
            <>
              <div className="font-bold text-red-400 uppercase">{displaySubtitle || 'Rolagem'}</div>
              <div className="text-red-400">{customFormula}</div>
            </>
          ) : (
            <div>Use o botao Rolar em uma pericia para iniciar.</div>
          )}
        </div>

        {displayMode === 'skill' ? (
          <>
            <div className={`h-14 border-2 border-blue-500 bg-background flex items-center justify-center text-xl font-bold ${isRolling ? 'animate-pulse text-blue-300' : 'text-blue-500'}`}>
              {displayRolls[0] === undefined
                ? '-'
                : showSkillTotal
                  ? displayRolls[0] + displayBaseBonus + displayModifiers.reduce((sum, modifier) => sum + modifier, 0)
                  : displayRolls[0]}
            </div>
            <div className="text-[10px] uppercase tracking-wide font-bold text-center text-blue-400 mb-2">
              {showSkillTotal
                ? `Resultado somado (${[
                    displayRolls[0] ?? '-',
                    displayBaseBonus !== 0 ? (displayBaseBonus > 0 ? `+ ${displayBaseBonus}` : `- ${Math.abs(displayBaseBonus)}`) : null,
                    ...displayModifiers.map((modifier) => (modifier > 0 ? `+ ${modifier}` : `- ${Math.abs(modifier)}`)),
                  ]
                    .filter(Boolean)
                    .join(' ')})`
                : 'd20 (valor puro)'}
            </div>

            <div className="flex items-center justify-end">
              <button
                onClick={() => setShowSkillTotal((prev) => !prev)}
                className="inline-flex items-center gap-1 border border-red-500 px-2 py-1 text-[10px] font-bold uppercase text-red-400 hover:bg-red-500 hover:text-background transition-colors"
                title="Alternar entre resultado puro e somado"
              >
                <span
                  className={`flex h-3.5 w-3.5 items-center justify-center border ${
                    showSkillTotal ? 'border-red-500 bg-red-500 text-background' : 'border-red-500 text-transparent'
                  }`}
                >
                  <Check size={10} />
                </span>
                Somado
              </button>
            </div>
          </>
        ) : (
          <>
            <div className={`h-16 mb-1 border-2 border-red-500 bg-background flex flex-col items-center justify-center ${isRolling ? 'animate-pulse' : ''}`}>
              {displayRolls.length > 0 ? (
                <>
                  <div className={`text-3xl font-bold ${isRolling ? 'text-red-300' : 'text-red-400'}`}>
                    {displayRolls.reduce((a, b) => a + b, 0) + displayModifierTotal}
                  </div>
                  {!isRolling && displayRolls.length > 1 && (
                    <div className="text-[9px] text-red-600 font-mono">
                      {displayRolls.join(' + ')}
                      {displayModifierTotal !== 0 && ` ${displayModifierTotal > 0 ? '+' : '-'} ${Math.abs(displayModifierTotal)}`}
                    </div>
                  )}
                </>
              ) : (
                <span className="text-3xl font-bold text-red-600">-</span>
              )}
            </div>
            <div className="mb-3 text-[10px] uppercase tracking-wide font-bold text-center text-red-500">
              {displaySubtitle || customFormula || 'Customizado'}
            </div>
          </>
        )}

        {displayMessage && (
          <div
            className={`mb-3 text-center text-xs font-bold uppercase ${
              displayFlash === 'critical' ? 'text-yellow-300' : 'text-red-300'
            }`}
          >
            {displayMessage}
          </div>
        )}
      </div>

      <div className="border-2 border-red-500 p-4 bg-background">
        <h3 className="text-xs font-bold text-red-500 uppercase mb-4">Rolagem Customizada</h3>

        <div className="mb-4">
          <div className="text-xs font-bold text-red-400 uppercase mb-2">Numero de Dados</div>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: maxDice }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setNumDice(num)}
                className={`py-2 text-xs font-bold border-2 transition-all ${
                  numDice === num
                    ? 'bg-red-600 border-red-500 text-white'
                    : 'border-red-500 text-red-500 hover:bg-red-500 hover:text-foreground'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <div className="text-xs font-bold text-red-400 uppercase mb-2">Lados do Dado</div>
          <div className="grid grid-cols-3 gap-2">
            {diceTypes.map((type) => (
              <button
                key={type}
                onClick={() => setDiceType(type)}
                className={`py-2 text-xs font-bold border-2 transition-all ${
                  diceType === type
                    ? 'bg-red-600 border-red-500 text-white'
                    : 'border-red-500 text-red-500 hover:bg-red-500 hover:text-foreground'
                }`}
              >
                d{type}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={rollCustomDice}
          disabled={isRolling}
          className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-900 text-white font-bold uppercase border-2 border-red-500 transition-all active:scale-95"
        >
          <Dice6 className="inline mr-2" size={20} />
          {isRolling ? 'Rolando...' : `Rolar ${numDice}d${diceType}`}
        </button>
      </div>

      {history.length > 0 && (
        <div className="border-2 border-red-500 p-4 bg-background">
          <h3 className="text-xs font-bold text-red-500 uppercase mb-3">Histórico</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {history.map((roll, idx) => (
              <div key={idx} className="p-3 border-2 border-red-500 bg-background text-xs font-mono transition-all">
                <div className="flex justify-between items-start mb-1">
                  <div className="font-bold text-red-500">{roll.formula}</div>
                  <div className="text-red-400">{roll.timestamp}</div>
                </div>
                <div className="text-red-300 mb-1">Total: {roll.total}</div>
                <div className="text-red-400 text-xs">
                  Dados: {roll.rolls.map((r) => (r < 0 ? `(${r})` : r)).join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
