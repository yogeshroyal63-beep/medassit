/**
 * Reusable role selection card used on the RoleSelection page.
 * Props: icon, title, description, features[], badge, selected, onClick
 */
const RoleCard = ({ icon: Icon, title, description, features = [], badge, selected, onClick }) => (
  <div
    onClick={onClick}
    className={`glass-card cursor-pointer rounded-3xl p-7 transition
      ${selected ? "ring-2 ring-cyan-500" : "hover:-translate-y-1 hover:shadow-xl"}`}
  >
    <div className="flex items-center gap-3 mb-4">
      {Icon && (
        <div className="rounded-xl bg-cyan-100 p-3">
          <Icon className="text-blue-600" />
        </div>
      )}
      <h3 className="text-xl">{title}</h3>
    </div>
    <p className="mb-4 text-slate-600">{description}</p>
    <ul className="space-y-2 text-sm text-slate-700">
      {features.map((f) => <li key={f}>✓ {f}</li>)}
    </ul>
    {badge && (
      <div className="mt-4 rounded-lg bg-cyan-100 p-2 text-xs text-cyan-700">{badge}</div>
    )}
  </div>
);

export default RoleCard;
