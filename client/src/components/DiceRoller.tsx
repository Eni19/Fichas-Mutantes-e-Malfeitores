import { useState } from 'react';
import { Dice6 } from 'lucide-react';
import DiceRoller2d12 from './DiceRoller2d12';

interface DiceResult {
  formula: string;
  total: number;
  rolls: number[];
  timestamp: string;
  isCritical?: boolean;
  advantage?: number;
  disadvantage?: number;
}

export default function DiceRoller() {
  const [numDice, setNumDice] = useState(2);
  const [diceType, setDiceType] = useState(12);
  const [isRolling, setIsRolling] = useState(false);
  const [history, setHistory] = useState<DiceResult[]>([]);
  const [animatingRolls, setAnimatingRolls] = useState<number[]>([]);

  const diceTypes = [4, 6, 8, 10, 12, 20];
  const maxDice = 10;

  const rollCustomDice = async () => {
    if (isRolling) return;

    setIsRolling(true);
    setAnimatingRolls(Array(numDice).fill(0).map(() => Math.floor(Math.random() * diceType) + 1));

    // Animação de rolagem
    const animationDuration = 600;
    const startTime = Date.now();

    const animateRoll = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed < animationDuration) {
        setAnimatingRolls(Array(numDice).fill(0).map(() => Math.floor(Math.random() * diceType) + 1));
        requestAnimationFrame(animateRoll);
      } else {
        // Resultado final
        const rolls = Array(numDice)
          .fill(0)
          .map(() => Math.floor(Math.random() * diceType) + 1);
        const total = rolls.reduce((a, b) => a + b, 0);

        const result: DiceResult = {
          formula: `${numDice}d${diceType}`,
          total,
          rolls,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        };

        setHistory([result, ...history.slice(0, 4)]);
        setAnimatingRolls([]);
        setIsRolling(false);
      }
    };

    animateRoll();
  };

  const handleRoll2d12 = (result: DiceResult) => {
    setHistory([result, ...history.slice(0, 4)]);
  };

  return (
    <div className="space-y-6">
      {/* 2d12 Rápido */}
      <div className="border-2 border-red-500 p-4 bg-black">
        <h3 className="text-xs font-bold text-red-500 uppercase mb-4">Rolagem Rápida 2d12</h3>
        <DiceRoller2d12 onRoll={handleRoll2d12} />
      </div>

      {/* Rolagem Customizada */}
      <div className="border-2 border-red-500 p-4 bg-black">
        <h3 className="text-xs font-bold text-red-500 uppercase mb-4">Rolagem Customizada</h3>

        {/* Número de Dados */}
        <div className="mb-4">
          <div className="text-xs font-bold text-red-400 uppercase mb-2">Número de Dados</div>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: maxDice }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setNumDice(num)}
                className={`py-2 text-xs font-bold border-2 transition-all ${
                  numDice === num
                    ? 'bg-red-600 border-red-500 text-white'
                    : 'border-red-500 text-red-500 hover:bg-red-500 hover:text-black'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Tipo de Dado */}
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
                    : 'border-red-500 text-red-500 hover:bg-red-500 hover:text-black'
                }`}
              >
                d{type}
              </button>
            ))}
          </div>
        </div>

        {/* Botão Rolar */}
        <button
          onClick={rollCustomDice}
          disabled={isRolling}
          className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-900 text-white font-bold uppercase border-2 border-red-500 transition-all active:scale-95"
        >
          <Dice6 className="inline mr-2" size={20} />
          {isRolling ? 'Rolando...' : `Rolar ${numDice}d${diceType}`}
        </button>
      </div>

      {/* Histórico */}
      {history.length > 0 && (
        <div className="border-2 border-red-500 p-4 bg-black">
          <h3 className="text-xs font-bold text-red-500 uppercase mb-3">Histórico</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {history.map((roll, idx) => (
              <div
                key={idx}
                className={`p-3 border-2 border-red-500 bg-black text-xs font-mono transition-all ${
                  roll.isCritical ? 'border-yellow-400 bg-yellow-900 bg-opacity-20' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="font-bold text-red-500">
                    {roll.formula}
                    {roll.isCritical && <span className="text-yellow-400 ml-2">⭐ CRÍTICO!</span>}
                  </div>
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
