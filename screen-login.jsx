// === Login screens — separate flows per role ===
const { useState: useSLog } = React;

function Login({ onLogin }) {
  // stage: 'chooser' | 'sme' | 'lead'
  const [stage, setStage] = useSLog('chooser');

  if (stage === 'chooser') return <RoleChooser onPick={setStage} />;
  if (stage === 'sme') return <SmeLogin onBack={() => setStage('chooser')} onLogin={onLogin} />;
  if (stage === 'lead') return <LeadLogin onBack={() => setStage('chooser')} onLogin={onLogin} />;
  return null;
}

/* ───────────────────── ROLE CHOOSER ───────────────────── */

function RoleChooser({ onPick }) {
  return (
    <div className="lc-shell">
      <div className="lc-bg" />
      <div className="lc-topbar">
        <div className="lc-logo">AVTRON<em>·</em>ENCODERS</div>
        <div className="lc-tag">A NIDEC BRAND</div>
      </div>

      <div className="lc-body">
        <div className="lc-eyebrow">AI RULE CONFIGURATOR</div>
        <h1 className="lc-h1">Sign in to continue.</h1>
        <p className="lc-sub">Two roles, two workspaces. Pick the one that matches your access.</p>

        <div className="lc-cards">
          {/* SME card */}
          <button className="lc-card sme" onClick={() => onPick('sme')}>
            <div className="lc-card-head">
              <div className="lc-pill green">Business SME</div>
              <div className="lc-arrow">→</div>
            </div>
            <h2 className="lc-card-title">I write &amp; submit rules</h2>
            <p className="lc-card-body">Author rules in plain English, validate against existing logic, test on staging, and submit to a Product Lead for sign-off.</p>
            <div className="lc-card-foot">
              <ul className="lc-bullets">
                <li>Create &amp; edit drafts</li>
                <li>Run AI validation</li>
                <li>Submit for approval</li>
              </ul>
              <div className="lc-card-meta">
                <div className="lc-avatar green">ED</div>
                <div>
                  <div className="lc-name">Eric Davis</div>
                  <div className="lc-mail">eric.davis@avtronencoders.com</div>
                </div>
              </div>
            </div>
          </button>

          {/* Lead card */}
          <button className="lc-card lead" onClick={() => onPick('lead')}>
            <div className="lc-card-head">
              <div className="lc-pill navy">Product Lead</div>
              <div className="lc-arrow">→</div>
            </div>
            <h2 className="lc-card-title">I review &amp; approve rules</h2>
            <p className="lc-card-body">Approve, reject, or comment on submissions. Sign-off pushes rules from staging to the live MySQL configurator.</p>
            <div className="lc-card-foot">
              <ul className="lc-bullets">
                <li>Review queue &amp; approvals</li>
                <li>Sync to production</li>
                <li>Manage reviewers</li>
              </ul>
              <div className="lc-card-meta">
                <div className="lc-avatar navy">BW</div>
                <div>
                  <div className="lc-name">Brian Wilson</div>
                  <div className="lc-mail">brian.wilson@avtronencoders.com</div>
                </div>
              </div>
            </div>
            <div className="lc-mfa-flag">
              <span>🔒</span> Requires MFA on each sign-in
            </div>
          </button>
        </div>

        <div className="lc-foot">
          <div className="xs mut">
            Need access? Contact <a>it-support@avtronencoders.com</a>
          </div>
          <div className="xs mut">© 2026 Nidec · Avtron Encoders — Internal tool</div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────── SME LOGIN ───────────────────── */

function SmeLogin({ onBack, onLogin }) {
  const [email, setEmail] = useSLog('eric.davis@avtronencoders.com');
  const [pwd, setPwd] = useSLog('••••••••••');
  const [keep, setKeep] = useSLog(true);
  const [loading, setLoading] = useSLog(false);
  const [err, setErr] = useSLog('');

  const submit = (e) => {
    e && e.preventDefault();
    if (!email.includes('@')) { setErr('Enter a valid email'); return; }
    if (!pwd || pwd.length < 4) { setErr('Password is required'); return; }
    setErr('');
    setLoading(true);
    setTimeout(() => {
      onLogin({ name: 'Eric D.', initials: 'ED', role: 'Business SME', email });
    }, 700);
  };

  return (
    <div className="login-shell">
      {/* LEFT — SME-flavored hero (green accent) */}
      <div className="login-left sme-left">
        <div className="login-brand">
          <div className="login-logo">AVTRON<em>·</em>ENCODERS</div>
          <div className="login-tag">A NIDEC BRAND</div>
        </div>

        <div className="login-hero">
          <div className="login-eyebrow">BUSINESS SME WORKSPACE</div>
          <h1 className="login-h1">Author rules in plain English.</h1>
          <p className="login-sub">
            Describe a constraint the way you'd say it out loud. The AI converts it into formal chips, runs it against every existing rule in the family, and tests <b>2,430 configurations</b> before you submit.
          </p>

          <div className="sme-flow">
            {[
              ['1', 'Describe', 'Plain-English prompt'],
              ['2', 'Validate', 'AI checks 2,430 combos'],
              ['3', 'Submit', 'Sent to Product Lead'],
            ].map(([n, t, d]) => (
              <div key={n} className="sme-step">
                <div className="sme-step-n">{n}</div>
                <div>
                  <div className="sme-step-t">{t}</div>
                  <div className="sme-step-d">{d}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="login-stats">
            <div className="login-stat"><div className="ls-num">12</div><div className="ls-lbl">drafts on staging</div></div>
            <div className="login-stat"><div className="ls-num">3</div><div className="ls-lbl">awaiting your edits</div></div>
            <div className="login-stat"><div className="ls-num">98%</div><div className="ls-lbl">approval rate · 90d</div></div>
          </div>
        </div>

        <div className="login-foot xs">© 2026 Nidec · Avtron Encoders &nbsp;·&nbsp; Internal tool — authorized users only</div>
      </div>

      {/* RIGHT — SME login card */}
      <div className="login-right">
        <div className="login-back" onClick={onBack}>← Choose a different role</div>
        <form className="login-card" onSubmit={submit}>
          <div className="login-card-head">
            <div className="login-role-tag green">
              <span className="lc-avatar green sm">ED</span>
              <div>
                <div className="lrt-role">Business SME</div>
                <div className="xs mut">Sign in as Eric Davis</div>
              </div>
            </div>
            <h2 style={{ marginTop: 14 }}>Welcome back, Eric.</h2>
            <div className="small mut">Use your Avtron SSO credentials.</div>
          </div>

          <label className="login-field">
            <span>Email</span>
            <input className="input" type="email" autoComplete="email"
              value={email} onChange={e => setEmail(e.target.value)} />
          </label>

          <label className="login-field">
            <span className="row" style={{ justifyContent: 'space-between', width: '100%' }}>
              <span>Password</span>
              <a className="xs">Forgot?</a>
            </span>
            <input className="input" type="password" autoComplete="current-password"
              value={pwd} onChange={e => setPwd(e.target.value)} />
          </label>

          <label className="login-check">
            <input type="checkbox" checked={keep} onChange={e => setKeep(e.target.checked)} />
            Keep me signed in for 8 hours
          </label>

          {err && <div className="login-err xs">{err}</div>}

          <button className="btn primary lg" type="submit" disabled={loading} style={{ width: '100%', marginTop: 4 }}>
            {loading ? <span><span className="spinner"></span> Authenticating…</span> : 'Sign in to author rules →'}
          </button>

          <div className="login-sso row" style={{ justifyContent: 'center', marginTop: 14, gap: 14 }}>
            <span className="xs mut">or continue with</span>
            <button type="button" className="btn sm ghost">Microsoft 365</button>
            <button type="button" className="btn sm ghost">Okta SSO</button>
          </div>

          <div className="login-help xs mut" style={{ textAlign: 'center', marginTop: 18 }}>
            You'll land on <b>Rules · AV4</b> with your drafts pinned to the top.
          </div>
        </form>
      </div>
    </div>
  );
}

/* ───────────────────── LEAD LOGIN (simple) ───────────────────── */

function LeadLogin({ onBack, onLogin }) {
  const [email, setEmail] = useSLog('brian.wilson@avtronencoders.com');
  const [pwd, setPwd] = useSLog('••••••••••');
  const [keep, setKeep] = useSLog(true);
  const [loading, setLoading] = useSLog(false);
  const [err, setErr] = useSLog('');

  const submit = (e) => {
    e && e.preventDefault();
    if (!email.includes('@')) { setErr('Enter a valid email'); return; }
    if (!pwd || pwd.length < 4) { setErr('Password is required'); return; }
    setErr('');
    setLoading(true);
    setTimeout(() => {
      onLogin({ name: 'Brian W.', initials: 'BW', role: 'Product Lead', email });
    }, 700);
  };

  return (
    <div className="login-shell">
      {/* LEFT — Lead-flavored hero (deeper navy + amber accent) */}
      <div className="login-left lead-left">
        <div className="login-brand">
          <div className="login-logo">AVTRON<em>·</em>ENCODERS</div>
          <div className="login-tag">A NIDEC BRAND</div>
        </div>

        <div className="login-hero">
          <div className="login-eyebrow amber">PRODUCT LEAD WORKSPACE</div>
          <h1 className="login-h1">Approvals gate every<br/>production sync.</h1>
          <p className="login-sub">
            Submitted rules land in your queue with the AI validation report attached. Approve, request changes, or reject — sign-off is what moves a rule from staging to the live MySQL configurator.
          </p>

          <div className="lead-queue">
            <div className="lq-head">
              <span>📥 Awaiting your review</span>
              <span className="lq-count">7</span>
            </div>
            <div className="lq-list">
              {[
                ['R-218', 'PREVENT Mod 704 IF Channels = A', 'Eric D.', '2h'],
                ['R-301', 'PREVENT Connector C IF Flange = 9', 'Eric D.', '5h'],
                ['R-289', 'ALLOW Connector A,B WHEN PPR ≥ AN', 'Eric D.', '1d'],
              ].map(([id, sum, who, when]) => (
                <div key={id} className="lq-row">
                  <span className="mono lq-id">{id}</span>
                  <span className="lq-sum">{sum}</span>
                  <span className="lq-meta">{who} · {when}</span>
                </div>
              ))}
              <div className="lq-more xs mut">+ 4 more in queue</div>
            </div>
          </div>

          <div className="login-stats">
            <div className="login-stat"><div className="ls-num">7</div><div className="ls-lbl">pending approval</div></div>
            <div className="login-stat"><div className="ls-num">142</div><div className="ls-lbl">approved · 90d</div></div>
            <div className="login-stat"><div className="ls-num">3</div><div className="ls-lbl">conflicts to resolve</div></div>
          </div>
        </div>

        <div className="login-foot xs">© 2026 Nidec · Avtron Encoders &nbsp;·&nbsp; Internal tool — authorized users only</div>
      </div>

      {/* RIGHT — Lead login card */}
      <div className="login-right">
        <div className="login-back" onClick={onBack}>← Choose a different role</div>
        <form className="login-card" onSubmit={submit}>
          <div className="login-card-head">
            <div className="login-role-tag navy">
              <span className="lc-avatar navy sm">BW</span>
              <div>
                <div className="lrt-role">Product Lead</div>
                <div className="xs mut">Sign in as Brian Wilson</div>
              </div>
            </div>
            <h2 style={{ marginTop: 14 }}>Welcome back, Brian.</h2>
            <div className="small mut">Use your Avtron SSO credentials.</div>
          </div>

          <label className="login-field">
            <span>Email</span>
            <input className="input" type="email" autoComplete="email"
              value={email} onChange={e => setEmail(e.target.value)} />
          </label>

          <label className="login-field">
            <span className="row" style={{ justifyContent: 'space-between', width: '100%' }}>
              <span>Password</span>
              <a className="xs">Forgot?</a>
            </span>
            <input className="input" type="password" autoComplete="current-password"
              value={pwd} onChange={e => setPwd(e.target.value)} />
          </label>

          <label className="login-check">
            <input type="checkbox" checked={keep} onChange={e => setKeep(e.target.checked)} />
            Keep me signed in for 8 hours
          </label>

          {err && <div className="login-err xs">{err}</div>}

          <button className="btn primary lg" type="submit" disabled={loading} style={{ width: '100%', marginTop: 4 }}>
            {loading ? <span><span className="spinner"></span> Authenticating…</span> : 'Sign in to review queue →'}
          </button>

          <div className="login-sso row" style={{ justifyContent: 'center', marginTop: 14, gap: 14 }}>
            <span className="xs mut">or continue with</span>
            <button type="button" className="btn sm ghost">Microsoft 365</button>
            <button type="button" className="btn sm ghost">Okta SSO</button>
          </div>

          <div className="login-help xs mut" style={{ textAlign: 'center', marginTop: 18 }}>
            You'll land on <b>Review queue · 7 pending</b>.
          </div>
        </form>
      </div>
    </div>
  );
}

window.Login = Login;
