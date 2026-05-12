// === Review queue — summary list with inline expand + approve/decline ===
const { useState: useRQ } = React;

function ReviewQueue({ state, setState, goto, toast, user }) {
  const pending = state.rules.filter(r => r.review === 'pending');
  const [expandedId, setExpandedId] = useRQ((state.pendingRule && state.pendingRule.id) || (pending[0] ? pending[0].id : null));
  const [filter, setFilter] = useRQ('all'); // all | mine | thisweek
  const isLead = user && user.role === 'Product Lead';

  const filtered = pending.filter(r => {
    if (filter === 'mine') return r.reviewer === (user ? user.name : 'Brian W.');
    if (filter === 'thisweek') return true; // demo
    return true;
  });

  const familyName = (id) => (MOCK.FAMILIES.find(f => f.id === id) || {}).name || id;

  const approve = (rule) => {
    const newRule = { ...rule, status: 'active', review: 'approved', edited: 'May 12' };
    setState(s => ({
      ...s,
      rules: s.rules.map(r => r.id === rule.id ? newRule : r),
      appliedRules: [...(s.appliedRules || []), newRule],
      lastSync: newRule.id,
    }));
    toast({ msg: `Rule ${rule.id} approved — syncing to production`, kind: 'success', icon: '✓' });
    setTimeout(() => toast({ msg: `Rule ${rule.id} live on nidec-avtronencoders.com`, kind: 'success', icon: '↯' }), 1200);
    // Move to next pending
    const remaining = pending.filter(p => p.id !== rule.id);
    setExpandedId(remaining[0] ? remaining[0].id : null);
  };

  const reject = (rule, reason) => {
    setState(s => ({
      ...s,
      rules: s.rules.map(r => r.id === rule.id ? { ...r, review: 'rejected', status: 'draft', rejectReason: reason || 'See reviewer comments' } : r),
    }));
    toast({ msg: `Rule ${rule.id} returned to ${rule.submitter || 'submitter'}`, kind: 'warn', icon: '↩' });
    const remaining = pending.filter(p => p.id !== rule.id);
    setExpandedId(remaining[0] ? remaining[0].id : null);
  };

  return (
    <div className="screen">
      <div className="page-head">
        <div>
          <h1 className="page-title">Review queue</h1>
          <div className="page-sub">
            {isLead
              ? <>Rules awaiting your sign-off before they sync to production.</>
              : <>Rules you have submitted that are waiting on Product Lead approval.</>}
          </div>
        </div>
        <div className="row">
          <button className={`btn sm ${filter === 'all' ? 'navy' : ''}`} onClick={() => setFilter('all')}>All ({pending.length})</button>
          <button className={`btn sm ${filter === 'mine' ? 'navy' : ''}`} onClick={() => setFilter('mine')}>Assigned to me</button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="row" style={{ gap: 10, marginBottom: 16 }}>
        <div className="stat grow"><div className="tiny">Awaiting review</div><div className="n" style={{ color: 'var(--blue)' }}>{pending.length}</div><div className="xs mut">across {new Set(pending.map(p => p.family)).size} families</div></div>
        <div className="stat grow"><div className="tiny">Avg AI confidence</div><div className="n">{pending.length ? Math.round(pending.reduce((a, r) => a + (r.confidence || 90), 0) / pending.length) : 0}%</div><div className="xs mut">simulated against full catalog</div></div>
        <div className="stat grow"><div className="tiny">Oldest</div><div className="n" style={{ fontSize: 22 }}>2&nbsp;<span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-2)' }}>days</span></div><div className="xs mut">SLA target · 3 business days</div></div>
        <div className="stat grow"><div className="tiny">From SMEs</div><div className="n">{new Set(pending.map(p => p.submitter || 'Eric D.')).size}</div><div className="xs mut">distinct submitters</div></div>
      </div>

      {filtered.length === 0 ? (
        <div className="card"><div className="card-body" style={{ textAlign: 'center', padding: '48px 20px' }}>
          <div style={{ fontSize: 32, color: 'var(--green)', marginBottom: 8 }}>✓</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Inbox zero</div>
          <div className="mut2 small">No rules waiting for approval.</div>
        </div></div>
      ) : (
        <div className="rq-list">
          {filtered.map(r => {
            const open = expandedId === r.id;
            return (
              <div key={r.id} className={`rq-row card ${open ? 'rq-open' : ''}`}>
                {/* Summary row */}
                <button className="rq-head" onClick={() => setExpandedId(open ? null : r.id)}>
                  <span className="rq-chev">{open ? '▾' : '▸'}</span>
                  <span className="mono small rq-id">{r.id}</span>
                  <span className="rq-action-pill">
                    <Pill kind={r.action === 'PREVENT' ? 'red' : 'green'}>{r.action}</Pill>
                  </span>
                  <span className="rq-summary">{r.summary}</span>
                  <span className="rq-meta">
                    <span className="xs mut rq-fam">{familyName(r.family)}</span>
                    <span className="xs mut rq-sub">by {r.submitter || 'Eric D.'}</span>
                    <span className="xs mut rq-age">{r.age || r.edited}</span>
                    <Pill kind="purple">{r.confidence || 92}%</Pill>
                  </span>
                </button>

                {/* Expanded body */}
                {open && (
                  <div className="rq-body">
                    <div className="rq-grid">
                      <div>
                        <div className="tiny">Rule expression</div>
                        <div style={{ margin: '8px 0 16px' }}><RuleExpression chips={r.chips} /></div>

                        <div className="tiny" style={{ marginBottom: 6 }}>Original prompt</div>
                        <div className="ai-note"><span className="ai-badge">EN</span><em>"{r.prompt || 'Submitted via natural-language prompt'}"</em></div>

                        <div className="tiny" style={{ margin: '16px 0 6px' }}>AI validation summary</div>
                        <div className="col" style={{ gap: 6 }}>
                          <div className="conf ok"><span className="ic">✓</span><div><b>{(r.simulatedAgainst || 2430).toLocaleString()} configurations</b> simulated — rule applies cleanly.</div></div>
                          {(r.overlapCount || 0) > 0 && (
                            <div className="conf warn"><span className="ic">~</span><div><b>{r.overlapCount} overlap</b> with existing rule{r.overlapCount > 1 ? 's' : ''} — non-blocking.</div></div>
                          )}
                          {(r.conflictCount || 0) > 0 && (
                            <div className="conf bad"><span className="ic">!</span><div><b>{r.conflictCount} contradiction</b> resolved before submission.</div></div>
                          )}
                          {!(r.overlapCount || r.conflictCount) && (
                            <div className="conf ok"><span className="ic">✓</span><div>No conflicts or overlaps detected.</div></div>
                          )}
                        </div>

                        <div className="tiny" style={{ margin: '16px 0 6px' }}>Submission</div>
                        <table className="table" style={{ border: '1px solid var(--line)', borderRadius: 8 }}>
                          <tbody>
                            <tr><td className="mut small" style={{ width: 140 }}>Submitted by</td><td><b>{r.submitter || 'Eric D.'}</b> · Business SME</td></tr>
                            <tr><td className="mut small">Reviewer</td><td>{r.reviewer} · Product Lead</td></tr>
                            <tr><td className="mut small">Family</td><td>{familyName(r.family)}</td></tr>
                            <tr><td className="mut small">Attribute</td><td>{r.attribute}</td></tr>
                            <tr><td className="mut small">Submitted</td><td>{r.edited} <span className="xs mut">· {r.age || ''}</span></td></tr>
                          </tbody>
                        </table>
                      </div>

                      <div>
                        <div className="tiny">Staging preview</div>
                        <div className="card" style={{ padding: 14, marginTop: 6 }}>
                          <div className="small">Test the rule before approval:</div>
                          <div className="mono xs" style={{ background: 'var(--grey-2)', padding: 6, borderRadius: 4, marginTop: 6, wordBreak: 'break-all' }}>
                            staging.nidec-avtronencoders.com/configurator?draft={r.id}
                          </div>
                          <button className="btn sm" style={{ width: '100%', marginTop: 8 }} onClick={() => toast({ msg: 'Opening staging preview in new tab…', icon: '🔗' })}>
                            Open staging ↗
                          </button>
                        </div>

                        <div className="tiny" style={{ marginTop: 16, marginBottom: 6 }}>
                          {isLead ? 'Reviewer decision' : 'Status'}
                        </div>
                        {isLead ? (
                          <ReviewerActions rule={r} onApprove={approve} onReject={reject} />
                        ) : (
                          <div className="card" style={{ padding: 14 }}>
                            <div className="row" style={{ gap: 8 }}>
                              <Pill kind="blue">Awaiting review</Pill>
                              <span className="xs mut">Reviewer: <b>{r.reviewer}</b></span>
                            </div>
                            <div className="xs mut" style={{ marginTop: 8 }}>
                              You will be notified by email when the reviewer approves or returns this rule.
                            </div>
                            <button className="btn sm" style={{ marginTop: 10, width: '100%' }} onClick={() => toast({ msg: `Reminder sent to ${r.reviewer}`, icon: '✉' })}>
                              Send reminder
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .rq-list{ display:flex; flex-direction:column; gap:10px; }
        .rq-row{ overflow:hidden; transition: box-shadow .15s ease; }
        .rq-row.rq-open{ box-shadow: 0 2px 0 rgba(0,0,0,0.03), 0 0 0 1.5px var(--blue) inset; }
        .rq-head{ width:100%; display:flex; align-items:center; gap:12px; padding:14px 16px; background:#fff; border:none; cursor:pointer; text-align:left; min-width:0; }
        .rq-head:hover{ background: var(--grey-1); }
        .rq-open .rq-head{ background: var(--grey-1); border-bottom:1px solid var(--line); }
        .rq-chev{ flex:0 0 14px; color: var(--ink-2); font-size:12px; }
        .rq-id{ flex:0 0 56px; color: var(--ink-2); }
        .rq-action-pill{ flex:0 0 auto; }
        .rq-summary{ flex:1 1 auto; min-width:0; font-size:14px; color: var(--ink-1); font-weight:500;
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .rq-meta{ flex:0 0 auto; display:flex; align-items:center; gap:14px; }
        .rq-fam{ display:inline-block; text-align:right; }
        .rq-sub{ display:inline-block; text-align:right; }
        .rq-age{ display:inline-block; text-align:right; }
        @media (max-width: 1280px){ .rq-fam, .rq-sub{ display:none; } }
        @media (max-width: 1000px){ .rq-age{ display:none; } }
        .rq-body{ padding: 18px 18px 18px 42px; background:#fff; }
        .rq-grid{ display:grid; grid-template-columns: 1.3fr .9fr; gap: 24px; }
        @media (max-width: 1100px){ .rq-grid{ grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}

function ReviewerActions({ rule, onApprove, onReject }) {
  const [note, setNote] = useRQ('');
  const [confirm, setConfirm] = useRQ(null); // 'approve' | 'reject' | null

  if (confirm === 'approve') {
    return (
      <div className="card" style={{ padding: 14, borderColor: 'var(--green)' }}>
        <div className="small"><b>Approve and sync {rule.id}?</b></div>
        <div className="xs mut" style={{ margin: '6px 0 10px' }}>
          The rule will go live on production within 5 seconds. Undo is available for the last sync only.
        </div>
        <div className="row" style={{ gap: 6 }}>
          <button className="btn sm ghost grow" onClick={() => setConfirm(null)}>Cancel</button>
          <button className="btn sm primary grow" onClick={() => onApprove(rule)}>Approve & sync</button>
        </div>
      </div>
    );
  }
  if (confirm === 'reject') {
    return (
      <div className="card" style={{ padding: 14, borderColor: 'var(--red)' }}>
        <div className="small"><b>Return {rule.id} to {rule.submitter || 'submitter'}?</b></div>
        <textarea className="textarea" rows="3" placeholder="Reason (sent to submitter)…" value={note} onChange={e => setNote(e.target.value)} style={{ marginTop: 8 }}></textarea>
        <div className="row" style={{ gap: 6, marginTop: 8 }}>
          <button className="btn sm ghost grow" onClick={() => setConfirm(null)}>Cancel</button>
          <button className="btn sm danger grow" onClick={() => onReject(rule, note)}>Decline</button>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 14 }}>
      <textarea className="textarea" rows="3" placeholder="Comments (optional)…" value={note} onChange={e => setNote(e.target.value)}></textarea>
      <div className="row" style={{ gap: 6, marginTop: 8 }}>
        <button className="btn sm danger grow" onClick={() => setConfirm('reject')}>Decline</button>
        <button className="btn sm primary grow" onClick={() => setConfirm('approve')}>Approve</button>
      </div>
      <div className="xs mut" style={{ marginTop: 8 }}>
        Approval triggers sync to production. <a>View sync pipeline</a>
      </div>
    </div>
  );
}
