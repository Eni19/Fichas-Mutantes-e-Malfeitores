import { useState } from 'react';

interface AttributeHexagonProps {
  attribute: string;
  value: number;
  onChange: (value: number) => void;
}

const attributeLabels: Record<string, string> = {
  agilidade: 'AGI',
  força: 'FOR',
  finesse: 'FIN',
  instinto: 'INS',
  presença: 'PRE',
  conhecimento: 'CON',
};

export default function AttributeHexagon({ attribute, value, onChange }: AttributeHexagonProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value.toString());

  const handleSave = () => {
    const numValue = parseInt(tempValue) || 0;
    onChange(numValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="hexagon bg-black border-2 border-primary hover:border-secondary transition-colors duration-300 cursor-pointer group"
        onClick={() => setIsEditing(true)}
      >
        {isEditing ? (
          <input
            type="number"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            autoFocus
            style={{ fontWeight: 700, fontFamily: "'Roboto Mono', monospace" }}
            className="w-12 h-12 bg-black text-primary text-center text-lg border-none outline-none"
          />
        ) : (
          <div className="text-center">
            <div style={{ fontWeight: 700, fontFamily: "'Roboto Mono', monospace" }} className="text-2xl text-primary">{value}</div>
          </div>
        )}
      </div>
      <span className="text-sm font-display text-primary uppercase tracking-wider font-bold">
        {attributeLabels[attribute]}
      </span>
    </div>
  );
}
