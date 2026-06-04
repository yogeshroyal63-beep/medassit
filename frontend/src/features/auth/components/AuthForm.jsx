/**
 * Generic auth form wrapper — renders a card with a title and subtitle.
 * Used by Login and Signup pages for consistent layout.
 */
const AuthForm = ({ title, subtitle, children, onSubmit }) => (
  <div className="min-h-screen px-4 py-12">
    <div className="mx-auto max-w-md">
      <div className="mb-6 text-center">
        <p className="text-3xl text-[var(--brand-700)]">MedAssist</p>
        {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
      </div>
      <div className="glass-card rounded-3xl p-8">
        {title && <h2 className="text-2xl text-slate-900">{title}</h2>}
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {children}
        </form>
      </div>
    </div>
  </div>
);

export default AuthForm;
