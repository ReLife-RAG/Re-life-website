'use client';

interface TimeSlotPickerProps {
  slots: string[];
  selected: string | null;
  onSelect: (slot: string) => void;
}

export default function TimeSlotPicker({ slots, selected, onSelect }: TimeSlotPickerProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {slots.map((slot) => (
        <button
          key={slot}
          onClick={() => onSelect(slot)}
          className={`py-2 px-3 rounded-lg text-sm font-medium border transition ${
            selected === slot
              ? 'bg-[#40738E] text-white border-[#40738E]'
              : 'bg-white text-[#1B2A3D] border-[#E8F0F5] hover:border-[#40738E] hover:text-[#40738E]'
          }`}
        >
          {slot}
        </button>
      ))}
    </div>
  );
}
