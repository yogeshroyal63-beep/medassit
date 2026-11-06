import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, CheckCircle2, Loader2, AlertTriangle, Sparkles } from "lucide-react";
import { modelService } from "../model.service";

// ── Small helpers ────────────────────────────────────────────────────────────
const pct = (v) => (typeof v === "number" ? `${(v * 100).toFixed(1)}%` : "n/a");
const num = (v, d = 3) => (typeof v === "number" ? v.toFixed(d) : "n/a");

const card = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "16px",
  padding: "1.5rem",
  boxShadow: "var(--shadow)",
};
const h2 = { fontSize: "1.15rem", fontFamily: "'Fraunces', serif", color: "var(--text)", margin: "0 0 0.75rem" };
const muted = { color: "var(--text-muted)", fontSize: "13.5px", lineHeight: 1.7, margin: 0 };
const th = { textAlign: "left", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-subtle)", padding: "0.5rem 0.75rem", fontWeight: 700 };
const td = { fontSize: "13px", color: "var(--text)", padding: "0.55rem 0.75rem", borderTop: "1px solid var(--border)" };

const STATE_LABEL = {
  unknown:     "Not contacted yet",
  waking:      "Waking the AI service",
  loading:     "Loading the model",
  ready:       "Ready",
  degraded:    "Running in rule-based fallback",
  unreachable: "Unreachable",
};

const SAMPLES = [
  "I have a runny nose, sneezing and a mild sore throat for two days",
  "Burning sensation while urinating and frequent urge to pass urine",
  "Severe headache with sensitivity to light and nausea",
  "I have chest pain and sweating",
];

// ── Runtime status (cold-start visibility) ───────────────────────────────────
function RuntimeStatus({ runtime }) {
  const state = runtime?.state || "unknown";
  const steps = ["Backend awake", "AI service awake", "Model loaded"];
  // Getting any runtime back means the backend is awake.
  const reached = !runtime ? 0 :
    state === "ready" || state === "degraded" ? 3 :
    state === "loading" ? 2 : 1;
  const ok = state === "ready";
  const bad = state === "unreachable";

  return (
    <div style={card}>
      <h2 style={h2}>Live runtime</h2>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1rem" }}>
        {ok ? <CheckCircle2 size={18} color="#16a34a" /> :
         bad ? <AlertTriangle size={18} color="#dc2626" /> :
         <Loader2 size={18} style={{ animation: "ma-spin 1s linear infinite" }} color="var(--brand-500)" />}
        <strong style={{ fontSize: "14px", color: "var(--text)" }}>{STATE_LABEL[state] || state}</strong>
        {runtime?.mode && (
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            mode: {runtime.mode === "bert" ? "BERT" : "rule-based"}
          </span>
        )}
        {typeof runtime?.loadSeconds === "number" && (
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>model load {runtime.loadSeconds}s</span>
        )}
      </div>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {steps.map((label, i) => {
          const done = i < reached;
          return (
            <span key={label} style={{
              fontSize: "12px", padding: "4px 10px", borderRadius: "999px",
              border: "1px solid var(--border-strong)",
              background: done ? "var(--brand-50)" : "transparent",
              color: done ? "var(--brand-700)" : "var(--text-subtle)",
              fontWeight: 600,
            }}>
              {done ? "✓ " : ""}{label}
            </span>
          );
        })}
      </div>
      <p style={{ ...muted, marginTop: "0.9rem", fontSize: "12.5px" }}>
        Free-tier hosting puts idle services to sleep. Opening the login page (or this page) wakes the backend and
        loads the model in the background, so the first symptom check after sign-in is not a cold start.
      </p>
      <style>{`@keyframes ma-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Evaluation tables (rendered only from real numbers) ──────────────────────
function Evaluation({ metrics }) {
  if (!metrics) {
    return (
      <div style={card}>
        <h2 style={h2}>Evaluation</h2>
        <p style={muted}>
          Evaluation pending. Results appear here once the evaluation notebook has been run and its output added to
          the model card. No numbers are shown until they are measured.
        </p>
      </div>
    );
  }
  return (
    <div style={card}>
      <h2 style={h2}>Evaluation</h2>
      {metrics.evaluated_on && <p style={{ ...muted, marginBottom: "0.75rem" }}>Measured on {metrics.evaluated_on}, {metrics.n_classes} conditions.</p>}

      {Array.isArray(metrics.splits) && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><th style={th}>Test set</th><th style={th}>Accuracy</th><th style={th}>Macro F1</th><th style={th}>Top-3</th><th style={th}>n</th></tr></thead>
            <tbody>
              {metrics.splits.map((s) => (
                <tr key={s.name}><td style={td}>{s.name}</td><td style={td}>{pct(s.accuracy)}</td><td style={td}>{num(s.macro_f1)}</td><td style={td}>{pct(s.top3)}</td><td style={td}>{s.n ?? "n/a"}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {Array.isArray(metrics.baselines) && metrics.baselines.length > 0 && (
        <>
          <h3 style={{ ...h2, fontSize: "0.95rem", marginTop: "1.25rem" }}>Baselines (same split)</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><th style={th}>Model</th><th style={th}>Accuracy</th><th style={th}>Macro F1</th></tr></thead>
              <tbody>
                {metrics.baselines.map((b) => (
                  <tr key={b.name}><td style={td}>{b.name}</td><td style={td}>{pct(b.accuracy)}</td><td style={td}>{num(b.macro_f1)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem", marginTop: "1.25rem" }}>
        {metrics.calibration && (
          <div style={{ background: "var(--surface-elevated)", borderRadius: "12px", padding: "0.9rem" }}>
            <div style={{ fontSize: "11.5px", color: "var(--text-subtle)", fontWeight: 700, textTransform: "uppercase" }}>Calibration (ECE)</div>
            <div style={{ fontSize: "1.3rem", color: "var(--text)", fontWeight: 700 }}>{num(metrics.calibration.ece)}</div>
            {Array.isArray(metrics.calibration.selective) && metrics.calibration.selective.map((p) => (
              <div key={p.coverage} style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                answers {Math.round(p.coverage * 100)}% of queries: {pct(p.accuracy)} accurate
              </div>
            ))}
          </div>
        )}
        {metrics.emergency_rules && (
          <div style={{ background: "var(--surface-elevated)", borderRadius: "12px", padding: "0.9rem" }}>
            <div style={{ fontSize: "11.5px", color: "var(--text-subtle)", fontWeight: 700, textTransform: "uppercase" }}>Emergency rules</div>
            <div style={{ fontSize: "1.3rem", color: "var(--text)", fontWeight: 700 }}>recall {pct(metrics.emergency_rules.recall)}</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              precision {pct(metrics.emergency_rules.precision)} on {metrics.emergency_rules.n_pos} emergency and {metrics.emergency_rules.n_neg} non-emergency phrases
            </div>
          </div>
        )}
        {metrics.latency_ms && (
          <div style={{ background: "var(--surface-elevated)", borderRadius: "12px", padding: "0.9rem" }}>
            <div style={{ fontSize: "11.5px", color: "var(--text-subtle)", fontWeight: 700, textTransform: "uppercase" }}>Latency (batch 1)</div>
            <div style={{ fontSize: "1.3rem", color: "var(--text)", fontWeight: 700 }}>
              {typeof metrics.latency_ms.cpu === "number" ? `${metrics.latency_ms.cpu.toFixed(0)} ms CPU` : "n/a"}
            </div>
            {typeof metrics.latency_ms.gpu === "number" && (
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{metrics.latency_ms.gpu.toFixed(0)} ms GPU</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Explain demo ─────────────────────────────────────────────────────────────
function Highlighted({ tokens, emergency }) {
  return (
    <p style={{ fontSize: "15px", lineHeight: 2.1, margin: "0.5rem 0 0", color: "var(--text)" }}>
      {tokens.map((t, i) => {
        const a = Math.max(0, Math.min(1, t.importance || 0));
        const bg = emergency
          ? `rgba(239, 68, 68, ${a * 0.45})`
          : `rgba(14, 165, 183, ${a * 0.7})`;
        const title = emergency
          ? (a > 0 ? "Matched an emergency rule" : undefined)
          : (typeof t.drop === "number" ? `Removing this word lowers the top prediction by ${(t.drop * 100).toFixed(1)} points` : undefined);
        return (
          <span key={`${t.word}-${i}`} title={title}
            style={{ background: bg, borderRadius: "6px", padding: "2px 4px", marginRight: "4px", display: "inline-block" }}>
            {t.word}
          </span>
        );
      })}
    </p>
  );
}

function ExplainDemo({ onRuntime }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const run = async (value) => {
    const symptoms = (value ?? text).trim();
    if (symptoms.length < 5) { setError("Describe the symptoms in a little more detail."); return; }
    setBusy(true); setError(""); setResult(null);
    try {
      const data = await modelService.explain(symptoms);
      if (data.runtime) onRuntime?.(data.runtime);
      setResult(data);
    } catch (err) {
      const status = err.response?.status;
      setError(
        status === 503 ? "The AI service is waking up. Give it a few seconds and press Explain again." :
        status === 429 ? "Too many requests. Please wait a few minutes." :
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={card}>
      <h2 style={{ ...h2, display: "flex", alignItems: "center", gap: "8px" }}>
        <Sparkles size={17} color="var(--brand-500)" /> Explain a prediction
      </h2>
      <p style={{ ...muted, marginBottom: "0.9rem" }}>
        Type a symptom description. The highlighted words are the ones that most changed the model's top prediction
        (occlusion: remove a word, see how much the probability drops). Nothing you type here is stored.
      </p>

      <textarea
        className="input-ui" rows={3} maxLength={300} value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="e.g. I have a runny nose, sneezing and a sore throat for two days"
        style={{ width: "100%", resize: "vertical" }}
        aria-label="Symptom description"
      />
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", margin: "0.6rem 0 0.9rem" }}>
        {SAMPLES.map((s) => (
          <button key={s} type="button" disabled={busy}
            onClick={() => { setText(s); run(s); }}
            style={{ fontSize: "12px", padding: "4px 10px", borderRadius: "999px", border: "1px solid var(--border-strong)", background: "var(--surface)", color: "var(--text-muted)", cursor: "pointer" }}>
            {s.length > 42 ? `${s.slice(0, 42)}…` : s}
          </button>
        ))}
      </div>
      <button type="button" className="btn-primary" disabled={busy} onClick={() => run()} style={{ padding: "0.65rem 1.4rem" }}>
        {busy ? "Explaining…" : "Explain"}
      </button>

      {error && <p role="alert" style={{ color: "#b91c1c", fontSize: "13px", marginTop: "0.9rem" }}>{error}</p>}

      {result && result.status === "invalid_input" && (
        <p style={{ ...muted, marginTop: "1rem" }}>{result.message}</p>
      )}

      {result && result.status === "emergency" && (
        <div style={{ marginTop: "1.1rem", border: "1px solid #fca5a5", background: "rgba(239,68,68,0.08)", borderRadius: "12px", padding: "1rem" }}>
          <strong style={{ color: "#b91c1c", fontSize: "14px" }}>Emergency pattern detected</strong>
          <p style={{ ...muted, marginTop: "0.35rem" }}>{result.message}</p>
          <Highlighted tokens={result.tokens} emergency />
          <p style={{ ...muted, marginTop: "0.6rem", fontSize: "12.5px" }}>
            If this were real, call your local emergency number (108 / 112 in India) now.
          </p>
        </div>
      )}

      {result && result.status === "success" && (
        <div style={{ marginTop: "1.1rem" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "baseline" }}>
            <strong style={{ fontSize: "1.1rem", color: "var(--text)" }}>{result.top_condition}</strong>
            <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>{pct(result.confidence)} confidence</span>
            {result.severity && <span className="badge badge-blue">{result.severity}</span>}
            {result.specialty?.primary && <span style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>see: {result.specialty.primary}</span>}
          </div>

          {result.low_confidence && (
            <p style={{ ...muted, marginTop: "0.5rem", color: "#b45309" }}>
              Low confidence. A real deployment should ask for more detail or suggest seeing a clinician.
            </p>
          )}
          {result.mode === "rules" && (
            <p style={{ ...muted, marginTop: "0.5rem", color: "#b45309" }}>
              The BERT model is not loaded right now, so this answer comes from the keyword fallback.
            </p>
          )}

          <div style={{ margin: "0.9rem 0" }}>
            {result.predictions.map((p) => (
              <div key={p.condition} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                <span style={{ width: "130px", fontSize: "12.5px", color: "var(--text)" }}>{p.condition}</span>
                <div style={{ flex: 1, height: "8px", background: "var(--border)", borderRadius: "999px" }}>
                  <div style={{ width: `${Math.round(p.confidence * 100)}%`, height: "100%", background: "var(--brand-500)", borderRadius: "999px" }} />
                </div>
                <span style={{ width: "48px", textAlign: "right", fontSize: "12px", color: "var(--text-muted)" }}>{pct(p.confidence)}</span>
              </div>
            ))}
          </div>

          <div style={{ fontSize: "11.5px", color: "var(--text-subtle)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Words that drove the prediction
          </div>
          <Highlighted tokens={result.tokens} />
          <p style={{ ...muted, marginTop: "0.6rem", fontSize: "12px" }}>
            {result.occlusion_passes} model passes in {result.latency_ms} ms. This shows what the classifier reacted to, not medical causation.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
const ModelCard = () => {
  const [info, setInfo] = useState(null);
  const [runtime, setRuntime] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const pollsLeft = useRef(40);

  useEffect(() => {
    let alive = true;
    let timer;

    const poll = async () => {
      try {
        const data = await modelService.info();
        if (!alive) return;
        setInfo(data.card);
        setRuntime(data.runtime);
        setLoadError(false);
        const finished = ["ready", "degraded", "unreachable"].includes(data.runtime?.state);
        if (!finished && pollsLeft.current-- > 0) timer = setTimeout(poll, 4000);
      } catch {
        if (!alive) return;
        // Backend itself may still be waking up. Keep trying for a while.
        setLoadError(true);
        if (pollsLeft.current-- > 0) timer = setTimeout(poll, 4000);
      }
    };
    poll();
    return () => { alive = false; clearTimeout(timer); };
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface)" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.5rem", borderBottom: "1px solid var(--border)", background: "var(--card)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "30px", height: "30px", borderRadius: "9px", background: "linear-gradient(135deg, #0ea5b7, #71d9df)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Heart size={15} color="#061227" fill="#061227" />
          </div>
          <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--text)", fontFamily: "'Fraunces', serif" }}>MedAssist</span>
        </div>
        <Link to="/login" style={{ fontSize: "13px", color: "var(--brand-700)", fontWeight: 700 }}>Sign in</Link>
      </header>

      <main style={{ maxWidth: "880px", margin: "0 auto", padding: "2rem 1.25rem 4rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div>
          <p style={{ fontSize: "0.7rem", color: "var(--brand-500)", textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 700, margin: "0 0 0.5rem" }}>AI transparency</p>
          <h1 style={{ fontSize: "1.9rem", fontFamily: "'Fraunces', serif", color: "var(--text)", margin: "0 0 0.5rem" }}>
            {info?.name || "MedAssist symptom triage"} <span style={{ fontSize: "0.9rem", color: "var(--text-subtle)" }}>{info ? `v${info.version}` : ""}</span>
          </h1>
          <p style={muted}>{info?.summary || "Loading model card…"}</p>
        </div>

        <RuntimeStatus runtime={runtime} />

        {loadError && !info && (
          <div style={card}><p style={muted}>The backend is waking up. This page retries automatically.</p></div>
        )}

        {info && (
          <>
            <div style={card}>
              <h2 style={h2}>How a request flows</h2>
              <ol style={{ margin: 0, paddingLeft: "1.2rem", color: "var(--text-muted)", fontSize: "13.5px", lineHeight: 1.9 }}>
                {info.architecture.map((a) => <li key={a}>{a}</li>)}
              </ol>
              <p style={{ ...muted, marginTop: "0.9rem" }}>
                <strong style={{ color: "var(--text)" }}>Training data:</strong> {info.training_data?.source}. {info.training_data?.note}
              </p>
            </div>

            <Evaluation metrics={info.metrics} />
          </>
        )}

        <ExplainDemo onRuntime={setRuntime} />

        {info && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
            <div style={card}>
              <h2 style={h2}>Intended use</h2>
              <p style={muted}>{info.intended_use}</p>
              <h2 style={{ ...h2, marginTop: "1.1rem" }}>Safety measures</h2>
              <ul style={{ margin: 0, paddingLeft: "1.2rem", color: "var(--text-muted)", fontSize: "13.5px", lineHeight: 1.8 }}>
                {info.safety.map((s) => <li key={s}>{s}</li>)}
              </ul>
            </div>
            <div style={card}>
              <h2 style={h2}>Limitations</h2>
              <ul style={{ margin: 0, paddingLeft: "1.2rem", color: "var(--text-muted)", fontSize: "13.5px", lineHeight: 1.8 }}>
                {info.limitations.map((l) => <li key={l}>{l}</li>)}
              </ul>
            </div>
          </div>
        )}

        <p style={{ ...muted, fontSize: "12px", textAlign: "center" }}>
          MedAssist AI provides triage guidance only and does not replace professional medical advice.
        </p>
      </main>
    </div>
  );
};

export default ModelCard;
