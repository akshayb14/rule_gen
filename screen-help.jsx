// === How to use screen ===
const { useState: useSH } = React;

function HowToUse({ goto, state }) {
  const [active, setActive] = useSH('start');

  const sections = [
    { id: 'start', label: 'Quick start', icon: '▶' },
    { id: 'create', label: 'Creating rules', icon: '✨' },
    { id: 'validate', label: 'Validation & conflicts', icon: '✓' },
    { id: 'review', label: 'Review & approval', icon: '✉' },
    { id: 'sync', label: 'Sync & undo', icon: '↺' },
    { id: 'ai', label: 'AI insights', icon: '✦' },
    { id: 'faq', label: 'FAQ', icon: '?' },
  ];

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">How to use</h1>
          <div className="page-sub">Guided walkthrough of the rule configurator — from writing your first rule to syncing it live.</div>
        </div>
        <button className="btn primary" onClick={() => goto('create')}>Try it now →</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20, alignItems: 'flex-start' }}>
        {/* Sticky TOC */}
        <div className="card" style={{ position: 'sticky', top: 16 }}>
          <div className="card-body" style={{ padding: 10 }}>
            <div className="tiny" style={{ padding: '4px 10px 6px' }}>On this page</div>
            {sections.map(s => (
              <button key={s.id} className={`item ${active === s.id ? 'active' : ''}`}
                style={{ padding: '7px 10px', borderRadius: 6, background: active === s.id ? 'var(--navy-soft)' : 'transparent',
                  color: active === s.id ? 'var(--navy)' : 'var(--ink-2)', fontWeight: active === s.id ? 600 : 400,
                  border: 'none', width: '100%', textAlign: 'left', fontSize: 13, display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer' }}
                onClick={() => setActive(s.id)}>
                <span style={{ width: 16, color: 'var(--ink-3)' }}>{s.icon}</span>{s.label}
              </button>
            ))}
            <div className="hr" style={{ margin: '10px 4px' }}></div>
            <div className="xs mut" style={{ padding: '0 10px 6px' }}>Need help?</div>
            <button className="btn sm" style={{ width: '100%', margin: '0 0 6px' }}>📧 Email support</button>
            <button className="btn sm ghost" style={{ width: '100%' }}>Open playground</button>
          </div>
        </div>

        {/* Content */}
        <div className="col" style={{ gap: 16 }}>

          {active === 'start' && (
            <>
              <div className="card"><div className="card-body">
                <div className="tiny">01 · Quick start</div>
                <h2 style={{ margin: '6px 0 8px', fontSize: 22 }}>Write your first rule in 90 seconds</h2>
                <p className="mut2">The configurator turns plain-English descriptions into formal rules, checks them against every existing rule in the family, and syncs them to the live Avtron site after a single reviewer approval.</p>

                <div className="row" style={{ gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
                  {[
                    ['1', 'Describe', 'Type what the rule should do in plain English.'],
                    ['2', 'Review', 'AI turns it into chips. Click any chip to tweak.'],
                    ['3', 'Validate', 'AI simulates against 2,430 configurations.'],
                    ['4', 'Approve', 'Product Lead signs off (email sent).'],
                    ['5', 'Sync', 'Rule goes live. Undo is one click.'],
                  ].map(([n, t, d]) => (
                    <div key={n} style={{ flex: '1 1 160px', background: 'var(--grey-1)', border: '1px solid var(--line)', borderRadius: 8, padding: 14 }}>
                      <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--navy)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>{n}</div>
                      <div className="b" style={{ marginTop: 8 }}>{t}</div>
                      <div className="xs mut" style={{ marginTop: 4 }}>{d}</div>
                    </div>
                  ))}
                </div>

                <div className="banner blue" style={{ marginTop: 16 }}>
                  <span>ℹ</span>
                  <div>New here? Start with the <b>Rules</b> tab, pick <b>New rule (AI)</b>, and follow the stepper. Every step is undoable until sync — and sync itself is reversible via "Undo last sync".</div>
                </div>
              </div></div>

              <div className="card"><div className="card-body">
                <div className="tiny">Your role</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8 }}>
                  <div style={{ border: '1px solid var(--line)', borderRadius: 8, padding: 14 }}>
                    <Pill kind="green">Business SME</Pill>
                    <div className="b" style={{ marginTop: 8 }}>You write rules.</div>
                    <ul className="small mut2" style={{ paddingLeft: 18, marginTop: 6, lineHeight: 1.7 }}>
                      <li>Create, validate, and submit rules for approval</li>
                      <li>Test drafts on staging before review</li>
                      <li>Respond to reviewer comments if rejected</li>
                    </ul>
                  </div>
                  <div style={{ border: '1px solid var(--line)', borderRadius: 8, padding: 14 }}>
                    <Pill kind="navy">Product Lead</Pill>
                    <div className="b" style={{ marginTop: 8 }}>You approve rules.</div>
                    <ul className="small mut2" style={{ paddingLeft: 18, marginTop: 6, lineHeight: 1.7 }}>
                      <li>Get email when a rule is submitted</li>
                      <li>Review validation report + staging preview</li>
                      <li>Approve → live sync, Reject → back to engineer</li>
                    </ul>
                  </div>
                </div>
              </div></div>
            </>
          )}

          {active === 'create' && (
            <>
              <div className="card"><div className="card-body">
                <div className="tiny">02 · Creating rules</div>
                <h2 style={{ margin: '6px 0 8px', fontSize: 22 }}>Natural-language to formal grammar</h2>
                <p className="mut2">Rules follow the existing NIDEC grammar: an action (<b>PREVENT</b> or <b>ALLOW</b>), an attribute/value, and conditions joined with <b>AND / OR / NOT / AND NOT</b>. The AI maps your sentence to this exact shape — nothing invented.</p>

                <div className="tiny" style={{ margin: '14px 0 6px' }}>Example prompts</div>
                <div className="col" style={{ gap: 8 }}>
                  {[
                    ['"Prevent connector C when wiring is radial and phasing is standard."', 'PREVENT connector = C IF wiring = R AND phasing = std'],
                    ['"Allow PPR 2048+ only for line driver IC-HD2."', 'ALLOW PPR ≥ 2048 WHEN driver = IC-HD2'],
                    ['"Hide mounting options 2 and 3 if tether is X."', 'PREVENT mounting = 2, 3 IF tether = X'],
                  ].map(([p, r], i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: 12, background: 'var(--grey-1)', border: '1px solid var(--line)', borderRadius: 8 }}>
                      <div className="small"><em>"{p.replace(/^"|"$/g, '')}"</em></div>
                      <div className="mono xs" style={{ color: 'var(--ink-2)' }}>→ {r}</div>
                    </div>
                  ))}
                </div>

                <div className="hr-dash"></div>

                <div className="tiny" style={{ marginBottom: 6 }}>Pick the right family</div>
                <div className="small mut2">Every rule belongs to exactly one product family — the family dropdown at the top of the Create screen sets which family's attributes and values the AI will reference.</div>

                <div className="banner purple" style={{ marginTop: 14 }}>
                  <span>✨</span>
                  <div>If the same constraint applies to a sibling family, AI will surface it as a cross-family insight for you to duplicate — no global scope needed.</div>
                </div>
              </div></div>
            </>
          )}

          {active === 'validate' && (
            <div className="card"><div className="card-body">
              <div className="tiny">03 · Validation & conflicts</div>
              <h2 style={{ margin: '6px 0 8px', fontSize: 22 }}>Every rule runs against all 2,430 configurations</h2>
              <p className="mut2">Before a rule can be submitted, the AI simulates it against the entire configuration space for the family and reports six types of result:</p>

              <div className="col" style={{ gap: 8, marginTop: 10 }}>
                <div className="conf ok"><span className="ic">✓</span><div><b>Syntax</b> — parses cleanly into the rule grammar.</div><Pill kind="green">auto</Pill></div>
                <div className="conf ok"><span className="ic">✓</span><div><b>No direct conflicts</b> — no rule forces the opposite outcome on identical inputs.</div></div>
                <div className="conf warn"><span className="ic">!</span><div><b>Overlap</b> — another rule produces the same effect on some shared inputs. Usually fine, sometimes mergeable.</div></div>
                <div className="conf err"><span className="ic">✕</span><div><b>Contradiction</b> — a rule forces the opposite outcome on identical inputs. <b>Must be resolved</b> before submitting.</div></div>
                <div className="conf warn"><span className="ic">!</span><div><b>Side-effect</b> — configurations where the rule leaves an attribute with zero valid values (orphaned parts).</div></div>
                <div className="conf ok"><span className="ic">✓</span><div><b>Staging preview</b> — a unique URL lets you test the rule on a real configurator page before sync.</div></div>
              </div>

              <div className="banner" style={{ marginTop: 14 }}>
                <span>⚠</span>
                <div><b>Contradictions block submission.</b> You must either resolve (supersede the older rule) or edit your new rule until they no longer clash.</div>
              </div>
            </div></div>
          )}

          {active === 'review' && (
            <div className="card"><div className="card-body">
              <div className="tiny">04 · Review & approval</div>
              <h2 style={{ margin: '6px 0 8px', fontSize: 22 }}>One approver — Product Lead</h2>
              <p className="mut2">Rules can't sync without sign-off. When you submit, the assigned reviewer gets an email with the rule, its validation report, and a staging URL.</p>

              <div className="tiny" style={{ margin: '14px 0 6px' }}>What the reviewer sees</div>
              <ul className="small mut2" style={{ paddingLeft: 18, lineHeight: 1.8 }}>
                <li>The rule as chips — same view you built</li>
                <li>Submitter, scope, AI confidence, impact (configs affected)</li>
                <li>Your original prompt and any note you attached</li>
                <li>Validation summary with conflicts/overlaps called out</li>
                <li>A staging URL to try the rule on the live configurator</li>
                <li><b>Approve</b> (sync immediately) or <b>Reject</b> (with comment, back to you)</li>
              </ul>

              <div className="banner blue" style={{ marginTop: 14 }}>
                <span>✉</span>
                <div>Email notification is on by default. You can turn it off per-submission, but the rule still appears in the reviewer's queue.</div>
              </div>
            </div></div>
          )}

          {active === 'sync' && (
            <div className="card"><div className="card-body">
              <div className="tiny">05 · Sync & undo</div>
              <h2 style={{ margin: '6px 0 8px', fontSize: 22 }}>Production sync in under 5 seconds</h2>
              <p className="mut2">Approval triggers the existing NIDEC sync pipeline — no new infrastructure:</p>

              <div className="col" style={{ gap: 4, marginTop: 10, background: 'var(--grey-1)', border: '1px solid var(--line)', borderRadius: 8, padding: 14 }}>
                {[
                  ['AI writes the rule to FileMaker', 'T+0.0s'],
                  ['Laravel /sync API fires', 'T+0.2s'],
                  ['MySQL stored procedure applied', 'T+0.3s'],
                  ['CDN cache invalidated', 'T+0.4s'],
                  ['Live on nidec-avtronencoders.com', 'T+0.5s'],
                ].map(([m, t], i) => (
                  <div key={i} className="row small" style={{ justifyContent: 'space-between' }}>
                    <div><span style={{ display: 'inline-block', width: 18, color: 'var(--green)' }}>→</span>{m}</div>
                    <span className="xs mut mono">{t}</span>
                  </div>
                ))}
              </div>

              <div className="tiny" style={{ margin: '16px 0 6px' }}>Undoing a sync</div>
              <p className="small mut2">Every sync is reversible with <b>Undo last sync</b> on the dashboard. Only the most recent sync is restorable — for older changes, create a new rule or roll back manually in admin.</p>
            </div></div>
          )}

          {active === 'ai' && (
            <div className="card"><div className="card-body">
              <div className="tiny">06 · AI insights</div>
              <h2 style={{ margin: '6px 0 8px', fontSize: 22 }}>Proactive suggestions, never auto-applied</h2>
              <p className="mut2">Every week, AI scans every family and suggests improvements. You see them in the <b>AI insights</b> tab. Four kinds:</p>

              <div className="row" style={{ gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
                {[
                  ['Overlap merges', 'Two rules doing the same work — combine them.'],
                  ['Pattern gaps', 'A rule exists in 3 of 4 sibling families — worth adding?'],
                  ['Obsolete candidates', 'Rules referencing retired attributes or unused parts.'],
                  ['Simplifications', 'Logically equivalent, shorter rewrites.'],
                ].map(([t, d]) => (
                  <div key={t} style={{ flex: '1 1 220px', border: '1px solid var(--line)', borderRadius: 8, padding: 12 }}>
                    <div className="b">{t}</div>
                    <div className="xs mut2" style={{ marginTop: 4 }}>{d}</div>
                  </div>
                ))}
              </div>

              <div className="banner purple" style={{ marginTop: 14 }}>
                <span>✦</span>
                <div><b>Applying a suggestion is still a submission.</b> It goes through the same validation → reviewer-approval → sync flow as a hand-written rule. AI never edits the live rule base directly.</div>
              </div>
            </div></div>
          )}

          {active === 'faq' && (
            <div className="card"><div className="card-body">
              <div className="tiny">FAQ</div>
              <h2 style={{ margin: '6px 0 16px', fontSize: 22 }}>Frequently asked</h2>

              {[
                ['Does this replace the existing rule database?', 'No. Rules still live in FileMaker → MySQL. The AI only proposes changes; the existing sync pipeline is unchanged.'],
                ['What if the AI mis-parses my prompt?', 'Every chip is editable. You can also regenerate with a clearer prompt, or save as draft and hand-tune on staging.'],
                ['Can I bypass reviewer approval for small changes?', 'No. Every production change requires a Lead sign-off. Drafts can be tested freely on staging without approval.'],
                ['How is "Undo last sync" different from version history?', 'Undo only reverts the most recent sync. There is no git-style history — older states aren\'t restorable from this screen.'],
                ['Who gets the reviewer email?', 'The reviewer you pick in the Validate step. You can also disable the email per-submission; the rule still shows up in their queue.'],
                ['Can two engineers edit the same rule at once?', 'Drafts are per-user. If two rules target the same attribute in the same family, the Validate step will flag the overlap.'],
              ].map(([q, a], i) => (
                <details key={i} style={{ borderTop: '1px solid var(--line)', padding: '12px 0' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>{q}</summary>
                  <div className="small mut2" style={{ marginTop: 8, paddingLeft: 2, lineHeight: 1.7 }}>{a}</div>
                </details>
              ))}
            </div></div>
          )}

        </div>
      </div>
    </div>
  );
}

window.HowToUse = HowToUse;
