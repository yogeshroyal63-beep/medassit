const DEFAULT_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
];

const SlotSelector = ({ selected, onChange, slots = DEFAULT_SLOTS }) => (
  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
    {slots.map((slot) => (
      <button
        key={slot}
        type="button"
        onClick={() => onChange(slot)}
        className={`rounded-lg border px-3 py-2 text-sm transition
          ${selected === slot
            ? "border-[var(--brand-700)] bg-[var(--brand-700)] text-white"
            : "border-slate-200 bg-white text-slate-700 hover:border-[var(--brand-400)]"
          }`}
      >
        {slot}
      </button>
    ))}
  </div>
);

export default SlotSelector;
