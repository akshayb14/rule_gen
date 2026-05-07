// === Dashboard screen ===
const { useState: useS1, useMemo: useM1 } = React;

function Dashboard({ state, setState, goto, toast }) {
  const { rules, family } = state;
  const [search, setSearch] = useS1('');
  const [statusFilter, setStatusFilter] = useS1('All');
  const [showAll, setShowAll] = useS1(false);
  const [editing, setEditing] = useS1(null); // rule object being edited

  // Rules visible in the table — seeded rules for this family (if any) + authored pending/draft rules
  const familyRules = useM1(() => rules.filter(r => r.family === family.id), [rules, family]);

  const filtered = useM1(() => {
    return familyRules.filter(r => {
      if (search && !(r.summary.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase()))) return false;
      if (statusFilter !== 'All') {
        const s = statusFilter.toLowerCase();
        if (r.status !== s && r.review !== s) return false;
      }
      return true;
    });
  }, [familyRules, search, statusFilter]);

  // Headline counts come from the family's real xlsx totals, + deltas from authored rules in this session
  const authoredPending = familyRules.filter(r => r.review === 'pending').length;
  const authoredDraft = familyRules.filter(r => r.status === 'draft').length;
  const counts = {
    total: family.total || 0,
    active: (family.total || 0) - (family.conflicts || 0) - (family.pending || 0) - (family.draft || 0),
    conflict: family.conflicts || 0,
    pending: Math.max(family.pending || 0, authoredPending),
    draft: Math.max(family.draft || 0, authoredDraft),
    prevent: family.prevent || 0,
    allow: family.allow || 0,
  };

  const onUndo = () => {
    if (!state.lastSync) return toast({ msg: 'Nothing to undo', kind: 'warn', icon: '!' });
    const rolled = rules.filter(r => r.id !== state.lastSync);
    setState(s => ({ ...s, rules: rolled, lastSync: null, appliedRules: (s.appliedRules || []).filter(r => r.id !== state.lastSync) }));
    toast({ msg: `Rolled back — ${state.lastSync} removed. Avtron page restored.`, kind: 'success' });
  };

  const statusPill = (r) => {
    if (r.review === 'pending') return <Pill kind="blue" dot>pending review</Pill>;
    if (r.status === 'conflict') return <Pill kind="amber" dot>conflict</Pill>;
    if (r.status === 'draft') return <Pill kind="purple" dot>draft · staging</Pill>;
    return <Pill kind="green" dot>active</Pill>;
  };

  const copyStaging = () => toast({ msg: 'Staging URL copied to clipboard', kind: 'success' });

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">Rules · {family.name}</h1>
          <div className="page-sub">{family.total} rules imported from ProductRules.xlsx · {family.prevent} Prevent · {family.allow} Allow Only</div>
        </div>
        <div className="row">
          <button className="btn" onClick={onUndo} disabled={!state.lastSync}>↶ Undo last sync</button>
          <button className="btn primary" onClick={() => goto('create')}>＋ New rule (AI)</button>
        </div>
      </div>

      <div className="row" style={{ gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="stat grow">
          <div className="tiny">Total rules</div>
          <div className="n">{counts.total}</div>
          <div className="xs mut">from FileMaker</div>
        </div>
        <div className="stat grow">
          <div className="tiny">Active</div>
          <div className="n" style={{ color: 'var(--green-dark)' }}>{counts.active}</div>
          <div className="xs mut">live on Avtron</div>
        </div>
        <div className="stat grow">
          <div className="tiny">Conflicts</div>
          <div className="n" style={{ color: 'var(--amber)' }}>{counts.conflict}</div>
          <div className="xs mut">need resolution</div>
        </div>
        <div className="stat grow">
          <div className="tiny">Pending review</div>
          <div className="n" style={{ color: 'var(--blue)' }}>{counts.pending}</div>
          <div className="xs mut">emailed to Product Lead</div>
        </div>
        <div className="stat grow">
          <div className="tiny">Drafts on staging</div>
          <div className="n" style={{ color: 'var(--purple)' }}>{counts.draft}</div>
          <div className="xs mut">testable before sync</div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <input className="input" style={{ width: 240 }} placeholder="Search rules…"
              value={search} onChange={e => setSearch(e.target.value)} />
            <select className="select" style={{ width: 150 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option>All</option><option>Active</option><option>Conflict</option><option>Pending</option><option>Draft</option>
            </select>
            <select className="select" style={{ width: 200 }} defaultValue="All attributes">
              <option>All attributes</option>
              {MOCK.ATTRIBUTES.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div className="row small mut" style={{ gap: 8 }}>
            <span>Staging:</span>
            <span className="mono" style={{ background: 'var(--grey-2)', padding: '3px 8px', borderRadius: 4 }}>
              staging.nidec-avtronencoders.com/configurator?family={family.id}
            </span>
            <button className="btn sm" onClick={copyStaging}>Copy</button>
          </div>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 90 }}>ID</th>
              <th>Rule</th>
              <th style={{ width: 160 }}>Attribute</th>
              <th style={{ width: 160 }}>Status</th>
              <th style={{ width: 180 }}>Review</th>
              <th style={{ width: 100 }}>Edited</th>
              <th style={{ width: 100 }}></th>
            </tr>
          </thead>
          <tbody>
            {(showAll ? filtered : filtered.slice(0, 5)).map(r => (
              <tr key={r.id} className={r.review === 'pending' ? 'pending' : ''}>
                <td className="mono small">{r.id}</td>
                <td>{r.summary}</td>
                <td className="small mut2">{r.attribute}</td>
                <td>{statusPill(r)}</td>
                <td className="xs mut">
                  {r.review === 'pending' ? <>by {r.submitter || 'Eric D.'} → {r.reviewer || 'Brian W.'} <br/><span style={{ color: 'var(--blue)' }}>✉ emailed</span></>
                    : r.review === 'approved' ? <>approved · {r.reviewer || 'Brian W.'}</>
                    : r.review === 'draft' ? 'unsubmitted draft'
                    : r.review}
                </td>
                <td className="xs mut">{r.edited}</td>
                <td>
                  {r.review === 'pending' ? (
                    <button className="btn sm navy" onClick={() => goto('review', { ruleId: r.id })}>Review</button>
                  ) : r.status === 'conflict' ? (
                    <button className="btn sm" onClick={() => setEditing(r)}>Resolve</button>
                  ) : (
                    <button className="btn sm" onClick={() => setEditing(r)}>Edit</button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="7" className="center mut" style={{ padding: 40 }}>
                No seeded samples for this family yet. Create one with AI, or browse the full {counts.total} in FileMaker.
              </td></tr>
            )}
          </tbody>
        </table>

        <div className="card-foot">
          <div className="small mut">
            {filtered.length > 5 && !showAll
              ? <>Showing <b>5</b> of {filtered.length} seeded samples · {counts.total} total rules in FileMaker</>
              : <>Showing {filtered.length} of {counts.total} total rules in FileMaker</>}
          </div>
          <div className="row">
            {filtered.length > 5 && (
              <button className="btn sm" onClick={() => setShowAll(a => !a)}>
                {showAll ? `↑ Show less` : `↓ Show all ${filtered.length} sampled`}
              </button>
            )}
            <button className="btn sm ghost">Export CSV</button>
            <button className="btn sm" onClick={() => goto('insights')}>View AI insights →</button>
          </div>
        </div>
      </div>

      {editing && (
        <EditRuleModal rule={editing} onClose={() => setEditing(null)}
          onSave={(updated) => {
            setState(s => ({ ...s, rules: s.rules.map(r => r.id === updated.id ? updated : r) }));
            setEditing(null);
            toast({ msg: `${updated.id} updated — on staging, submit for review when ready`, kind: 'success' });
          }}
          onSubmit={(updated) => {
            // Move to review flow: set pendingRule and navigate
            setState(s => ({
              ...s,
              rules: s.rules.map(r => r.id === updated.id ? updated : r),
              pendingRule: { ...updated, prompt: 'Edited rule resubmitted for review', submitter: 'Eric D.', reviewer: 'Brian W.' },
            }));
            setEditing(null);
            goto('validate');
          }}
        />
      )}
    </div>
  );
}

window.Dashboard = Dashboard;
