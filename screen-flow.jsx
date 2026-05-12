// === Validate + Review + Applied + Insights ===
const { useState: useS3, useEffect: useE3 } = React;

function Validate({ state, setState, goto, toast }) {
  const { pendingRule, family } = state;
  const [reviewer, setReviewer] = useS3('Brian W.');
  const [note, setNote] = useS3('');
  const [emailNotify, setEmailNotify] = useS3(true);
  const [resolved, setResolved] = useS3(false);

  if (!pendingRule) {
    useE3(() => goto('create'), []);
    return null;
  }

  const submit = () => {
    if (!resolved) return toast({ msg: 'Resolve the contradiction with R-087 first', kind: 'warn', icon: '!' });
    setState(s => ({ ...s, pendingRule: { ...pendingRule, reviewer, note, emailNotify } }));
    if (emailNotify) toast({ msg: `Email sent to ${reviewer}`, kind: 'success', icon: '✉' });
    goto('reviewDetail');
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">Validate rule</h1>
          <div className="page-sub">AI simulates the rule against all 2,430 configurations and flags conflicts before sync.</div>
        </div>
        <button className="btn ghost" onClick={() => goto('create')}>← Back to edit</button>
      </div>

      <div className="card">
        <div className="card-body">
          <Stepper current={2} steps={['Describe', 'Review rule', 'Validate', 'Reviewer', 'Sync']} />

          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <div className="tiny">Validating</div>
              <div style={{ marginTop: 6 }}><RuleExpression chips={pendingRule.chips} /></div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Pill kind="navy">{pendingRule.id} · {family.name}</Pill>
              <div className="xs mut" style={{ marginTop: 6 }}>Simulated against 2,430 combinations</div>
            </div>
          </div>

          <div className="hr"></div>

          <div className="tiny" style={{ marginBottom: 8 }}>Validation results · 142 rules scanned</div>

          <div className="conf ok"><span className="ic">✓</span>
            <div><b>Syntax valid</b> — parses cleanly into the existing rule grammar.</div>
            <Pill kind="green">passed</Pill></div>
          <div className="conf ok"><span className="ic">✓</span>
            <div><b>No direct conflicts</b> in the {family.name} rule set.</div>
            <Pill kind="green">passed</Pill></div>
          <div className="conf warn"><span className="ic">!</span>
            <div><b>Overlap</b> with rule <span className="mono">R-041</span> — both hide connector C in 12 shared combinations.
              <div className="xs mut" style={{ marginTop: 3 }}>R-041: prevent connector C IF flange = B</div></div>
            <button className="btn sm" onClick={() => toast({ msg: 'Merge flow coming soon', icon: 'ℹ' })}>Merge</button></div>
          <div className={`conf ${resolved ? 'ok' : 'err'}`}><span className="ic">{resolved ? '✓' : '✕'}</span>
            <div>
              <b>{resolved ? 'Contradiction resolved' : 'Contradiction'}</b> with rule <span className="mono">R-087</span>
              {!resolved && <> — same inputs, opposite action (ALLOW).</>}
              <div className="xs mut" style={{ marginTop: 3 }}>
                {resolved ? 'R-087 will be superseded by this rule.' : 'Must be resolved before submitting.'}
              </div>
            </div>
            {!resolved && (
              <button className="btn sm danger" onClick={() => { setResolved(true); toast({ msg: 'Contradiction resolved — R-087 will be superseded', kind: 'success' }); }}>
                Resolve
              </button>
            )}
          </div>
          <div className="conf warn"><span className="ic">!</span>
            <div><b>Side-effect</b> — 8 of 2,430 configurations will now have zero valid connector.
              <div className="xs mut" style={{ marginTop: 3 }}><a>View affected part numbers →</a></div></div></div>
          <div className="conf ok"><span className="ic">✓</span>
            <div><b>Staging preview</b> generated — test the rule on the live staging URL.</div>
            <span className="mono xs" style={{ background: 'var(--grey-2)', padding: '2px 6px', borderRadius: 4 }}>…?draft=R-144</span></div>

          <div className="hr"></div>

          <div style={{ background: 'var(--grey-1)', border: '1px dashed var(--line)', borderRadius: 8, padding: 16 }}>
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
              <div>
                <div className="tiny">Next step · Reviewer approval</div>
                <div style={{ marginTop: 4 }}>
                  <b>Eric D.</b> (you) will submit to <b>{reviewer}</b> — Product Lead.
                  <div className="xs mut" style={{ marginTop: 4 }}>
                    Product Lead must approve before the rule syncs to MySQL. AI suggestions require Lead sign-off too.
                  </div>
                </div>
              </div>
              <div style={{ minWidth: 260 }}>
                <select className="select" style={{ marginBottom: 8 }} value={reviewer} onChange={e => setReviewer(e.target.value)}>
                  <option>Brian W.</option>
                </select>
                <input className="input" placeholder="Note for reviewer (optional)" value={note} onChange={e => setNote(e.target.value)} style={{ marginBottom: 8 }} />
                <label className="xs mut row" style={{ justifyContent: 'flex-end', gap: 6 }}>
                  <input type="checkbox" checked={emailNotify} onChange={e => setEmailNotify(e.target.checked)} />
                  Email reviewer on submit
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="card-foot">
          <div className="row"><button className="btn" onClick={() => goto('create')}>← Back</button>
            <button className="btn">Save as draft (staging only)</button></div>
          <div className="row">
            <span className="xs mut">{resolved ? 'Ready to submit.' : '1 contradiction must be resolved to submit.'}</span>
            <button className="btn navy" disabled={!resolved} onClick={submit}>Submit for review →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Review({ state, setState, goto, toast }) {
  const { pendingRule } = state;
  if (!pendingRule) { useE3(() => goto('dashboard'), []); return null; }

  const [showEmail, setShowEmail] = useS3(false);

  const approve = () => {
    const newRule = {
      id: pendingRule.id, family: pendingRule.family, attribute: pendingRule.attribute,
      action: pendingRule.action, summary: pendingRule.summary,
      status: 'active', review: 'approved', reviewer: pendingRule.reviewer,
      edited: 'Apr 21', scope: pendingRule.scope, chips: pendingRule.chips,
    };
    setState(s => ({
      ...s,
      rules: [...s.rules.filter(r => r.id !== 'R-087'), newRule],
      pendingRule: null,
      lastSync: newRule.id,
      appliedRules: [...(s.appliedRules || []), newRule],
    }));
    toast({ msg: `Rule ${newRule.id} approved & synced to MySQL`, kind: 'success' });
    goto('applied');
  };

  const reject = () => {
    setState(s => ({ ...s, pendingRule: null }));
    toast({ msg: 'Rule rejected — returned to engineer', kind: 'warn', icon: '↩' });
    goto('dashboard');
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">Review rule — <span className="mono">{pendingRule.id}</span></h1>
          <div className="page-sub">As reviewer ({pendingRule.reviewer}), approve or reject before sync.</div>
        </div>
        <button className="btn ghost" onClick={() => goto('dashboard')}>← Cancel</button>
      </div>

      <div className="banner blue">
        <span>✉</span>
        <div className="grow">
          You received an email notification for this review request.
        </div>
        <button className="btn sm" onClick={() => setShowEmail(true)}>View email</button>
      </div>

      <div className="card">
        <div className="card-body">
          <Stepper current={3} steps={['Describe', 'Review rule', 'Validate', 'Reviewer', 'Sync']} />

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr .8fr', gap: 24 }}>
            <div>
              <div className="tiny">Rule under review</div>
              <div style={{ margin: '8px 0 16px' }}><RuleExpression chips={pendingRule.chips} /></div>

              <div className="tiny" style={{ marginBottom: 6 }}>Submission details</div>
              <table className="table" style={{ border: '1px solid var(--line)', borderRadius: 8 }}>
                <tbody>
                  <tr><td className="mut small">Submitted by</td><td><b>{pendingRule.submitter}</b> · Business SME</td></tr>
                  <tr><td className="mut small">Reviewer</td><td>{pendingRule.reviewer} · Product Lead</td></tr>
                  <tr><td className="mut small">Family</td><td>{(MOCK.FAMILIES.find(f => f.id === pendingRule.family) || family).name}</td></tr>
                  <tr><td className="mut small">Created from</td><td className="small">Natural language prompt</td></tr>
                  <tr><td className="mut small">AI confidence</td><td><Pill kind="purple">96%</Pill></td></tr>
                  <tr><td className="mut small">Impact</td><td className="small">360 / 2,430 configs affected · 0 orphaned</td></tr>
                </tbody>
              </table>

              <div className="tiny" style={{ margin: '14px 0 6px' }}>Original prompt</div>
              <div className="ai-note"><span className="ai-badge">EN</span><em>"{pendingRule.prompt}"</em></div>

              <div className="tiny" style={{ margin: '14px 0 6px' }}>Validation summary</div>
              <div className="conf ok"><span className="ic">✓</span><div>No conflicts · contradiction with R-087 resolved</div><Pill kind="green">passed</Pill></div>
              <div className="conf warn"><span className="ic">!</span><div>Overlap with R-041 (12 combos) — acceptable per engineer note</div></div>
            </div>

            <div>
              <div className="tiny">Staging preview</div>
              <div className="card" style={{ padding: 14, marginTop: 6 }}>
                <div className="small">Test the rule before approval:</div>
                <div className="mono xs" style={{ background: 'var(--grey-2)', padding: 6, borderRadius: 4, marginTop: 6, wordBreak: 'break-all' }}>
                  staging.nidec-avtronencoders.com/configurator?draft={pendingRule.id}
                </div>
                <button className="btn sm" style={{ width: '100%', marginTop: 8 }} onClick={() => toast({ msg: 'Opening staging preview in new tab…', icon: '🔗' })}>
                  Open staging ↗
                </button>
              </div>

              <div className="tiny" style={{ marginTop: 16, marginBottom: 6 }}>Reviewer actions</div>
              <textarea className="textarea" placeholder="Reviewer comments (optional)" rows="4"></textarea>
              <div className="row" style={{ marginTop: 10, gap: 8 }}>
                <button className="btn danger grow" onClick={reject}>Reject</button>
                <button className="btn primary grow" onClick={approve}>✓ Approve & sync</button>
              </div>
              <div className="xs mut" style={{ marginTop: 8 }}>
                Approving writes rule to FileMaker → triggers /sync API → stores in MySQL.
              </div>
            </div>
          </div>
        </div>
      </div>

      {showEmail && (
        <Modal title="Email notification" onClose={() => setShowEmail(false)}
          footer={<button className="btn" onClick={() => setShowEmail(false)}>Close</button>}>
          <div className="email-card">
            <div className="eh">
              <div>
                <div className="b">New rule pending your review — R-144</div>
                <div className="xs mut">from: no-reply@nidec-avtronencoders.com · to: brian.w@nidec.com</div>
              </div>
              <div className="xs mut">Apr 21, 13:58</div>
            </div>
            <div className="eb">
              <p>Hi {pendingRule.reviewer},</p>
              <p><b>Eric D.</b> submitted a new rule for your approval:</p>
              <div style={{ background: 'var(--grey-1)', padding: 12, borderRadius: 6, margin: '10px 0' }}>
                <div className="xs mut">Rule <span className="mono">R-144</span> · {(MOCK.FAMILIES.find(f => f.id === pendingRule.family) || family).name}</div>
                <div className="b" style={{ marginTop: 4 }}>{pendingRule.summary}</div>
              </div>
              <p className="small">AI validation: <b>passed</b> (1 overlap noted, contradiction resolved).</p>
              <div className="row" style={{ marginTop: 12 }}>
                <button className="btn primary sm">Open in configurator</button>
                <button className="btn sm">Preview on staging</button>
              </div>
              <div className="sig">— NIDEC AI Rule Configurator · automated notification</div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Applied({ state, goto }) {
  const last = state.appliedRules && state.appliedRules[state.appliedRules.length - 1];
  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">Rule synced ✓</h1>
          <div className="page-sub">Rule is live. Below: the customer-facing Avtron configurator, updated in real time.</div>
        </div>
        <div className="row">
          <button className="btn" onClick={() => goto('dashboard')}>Back to dashboard</button>
          <button className="btn primary" onClick={() => goto('create')}>＋ New rule</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '.8fr 1.4fr', gap: 20, alignItems: 'flex-start' }}>
        <div className="card">
          <div className="card-head">
            <div className="row"><Pill kind="green" dot>Active in production</Pill></div>
            <div className="xs mut">{last ? last.id : 'R-144'} · {(MOCK.FAMILIES.find(f => f.id === (last && last.family)) || state.family).name}</div>
          </div>
          <div className="card-body">
            {last && <RuleExpression chips={last.chips} />}

            <div className="tiny" style={{ margin: '16px 0 6px' }}>Approval & sync trail</div>
            <div className="col" style={{ gap: 4 }}>
              {[
                ['✓', 'Submitted by Eric D.', '13:58'],
                ['✉', 'Email sent to Brian W.', '13:58'],
                ['✓', 'Approved by Brian W. (Product Lead)', '14:01'],
                ['→', 'AI wrote rule to FileMaker', '14:02:11'],
                ['→', 'Laravel /sync API triggered', '14:02:13'],
                ['→', 'MySQL stored proc applied', '14:02:14'],
                ['→', 'CDN cache invalidated', '14:02:15'],
              ].map(([i, m, t], k) => (
                <div key={k} className="small row" style={{ justifyContent: 'space-between' }}>
                  <div><span style={{ display: 'inline-block', width: 18, color: 'var(--green)' }}>{i}</span>{m}</div>
                  <span className="xs mut mono">{t}</span>
                </div>
              ))}
            </div>
            <div className="xs mut" style={{ marginTop: 6 }}>Zero infrastructure changes · existing pipeline.</div>

            <div className="hr-dash"></div>

            <div className="tiny" style={{ marginBottom: 4 }}>Impact</div>
            <div className="small mut2">
              <b>360 of 2,430</b> configurations now filter connector C.<br/>
              <b>8</b> side-effects resolved before sync.
            </div>

            <div className="hr-dash"></div>
            <div className="row" style={{ flexWrap: 'wrap' }}>
              <button className="btn danger" onClick={() => goto('dashboard')}>↶ Undo last sync</button>
              <button className="btn">View in admin</button>
            </div>
            <div className="xs mut" style={{ marginTop: 8 }}>
              <b>Undo</b> reverts to the pre-sync state. No git history — last-sync restore only.
            </div>
          </div>
        </div>

        <div>
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
            <div className="tiny">Live · customer-facing configurator</div>
            <div className="row"><Pill kind="green">production</Pill><a className="xs">View staging →</a></div>
          </div>
          <AvtronPreview appliedRules={state.appliedRules || []} />
        </div>
      </div>
    </div>
  );
}

function Insights({ state, setState, goto, toast }) {
  const [dismissed, setDismissed] = useS3([]);
  const visible = MOCK.INITIAL_SUGGESTIONS.filter(s => !dismissed.includes(s.id));

  const dismiss = (id) => setDismissed([...dismissed, id]);
  const apply = (s) => { dismiss(s.id); toast({ msg: `Suggestion sent for reviewer approval (emailed to Lead)`, kind: 'success', icon: '✉' }); };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">AI Insights</h1>
          <div className="page-sub">Proactive recommendations across your product families. Every suggestion flows through reviewer approval.</div>
        </div>
        <div className="row">
          <button className="btn" onClick={() => goto('dashboard')}>← Back</button>
          <button className="btn primary">Run scan now</button>
        </div>
      </div>

      <div className="row" style={{ gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="stat grow">
          <div className="tiny">Rule-base health</div>
          <div className="n" style={{ color: 'var(--green-dark)' }}>87%</div>
          <div className="delta">↑ 3% vs last week</div>
        </div>
        <div className="stat grow"><div className="tiny">Overlaps detected</div><div className="n">34</div><div className="xs mut">across 22 families</div></div>
        <div className="stat grow"><div className="tiny">Obsolete candidates</div><div className="n">12</div><div className="xs mut">retired attributes</div></div>
        <div className="stat grow"><div className="tiny">Pattern gaps</div><div className="n">7</div><div className="xs mut">symmetric across RUSH</div></div>
        <div className="stat grow"><div className="tiny">Awaiting review</div><div className="n" style={{ color: 'var(--blue)' }}>5</div><div className="xs mut">AI-proposed</div></div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="b">Suggestions for {state.family.name}</div>
          <div className="row"><Pill kind="blue">Weekly scan · Apr 19</Pill><span className="xs mut">{visible.length} active</span></div>
        </div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {visible.map(s => (
            <div key={s.id} className="sug">
              <div className="aiav">AI</div>
              <div>
                <div className="row" style={{ flexWrap: 'wrap' }}>
                  <span className="title">{s.title}</span>
                  <Pill kind={s.scope === 'global' ? 'navy' : s.scope === 'group' ? 'purple' : ''}>{s.scopeLabel}</Pill>
                  <Pill>{s.type}</Pill>
                </div>
                <div className="body">{s.body}</div>
                <div className="meta">{s.meta}</div>
              </div>
              <div className="col" style={{ gap: 6 }}>
                <button className="btn primary sm" onClick={() => apply(s)}>Apply</button>
                <button className="btn sm">Review</button>
                <button className="btn sm ghost" onClick={() => dismiss(s.id)}>Dismiss</button>
              </div>
            </div>
          ))}
          {visible.length === 0 && <div className="center mut" style={{ padding: 30 }}>All suggestions handled.</div>}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Validate, Review, Applied, Insights });
