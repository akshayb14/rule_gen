// === Library screens: Families, Drafts, Conflicts ===
const { useState: useSL } = React;

function FamiliesLibrary({ state, setState, goto }) {
  const [search, setSearch] = useSL('');
  const fams = MOCK.FAMILIES.filter(f => !search || f.name.toLowerCase().includes(search.toLowerCase()));

  const openFamily = (f) => {
    setState(s => ({ ...s, family: f }));
    goto('dashboard');
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">Families</h1>
          <div className="page-sub">{MOCK.FAMILIES.length} encoder families imported from FileMaker. Click to open its rule set.</div>
        </div>
        <input className="input" style={{ width: 260 }} placeholder="Search families…"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 140 }}>Family</th>
              <th style={{ width: 100 }}>Total</th>
              <th style={{ width: 100 }}>Prevent</th>
              <th style={{ width: 100 }}>Allow</th>
              <th style={{ width: 110 }}>Pending</th>
              <th style={{ width: 110 }}>Drafts</th>
              <th style={{ width: 110 }}>Conflicts</th>
              <th></th>
              <th style={{ width: 90 }}></th>
            </tr>
          </thead>
          <tbody>
            {fams.map(f => (
              <tr key={f.id}>
                <td><b>{f.name}</b></td>
                <td>{f.total}</td>
                <td><span style={{ color: 'var(--navy)' }}>{f.prevent}</span></td>
                <td><span style={{ color: 'var(--green-dark)' }}>{f.allow}</span></td>
                <td>{f.pending > 0 ? <Pill kind="blue" dot>{f.pending}</Pill> : <span className="mut">0</span>}</td>
                <td>{f.draft > 0 ? <Pill kind="purple" dot>{f.draft}</Pill> : <span className="mut">0</span>}</td>
                <td>{f.conflicts > 0 ? <Pill kind="amber" dot>{f.conflicts}</Pill> : <span className="mut">0</span>}</td>
                <td className="xs mut2">
                  {/* Bar chart of prevent vs allow */}
                  <div style={{ display: 'flex', width: 160, height: 6, borderRadius: 3, overflow: 'hidden', background: 'var(--grey-2)' }}>
                    <div style={{ background: 'var(--navy)', width: `${(f.prevent/f.total)*100}%` }}></div>
                    <div style={{ background: 'var(--green)', width: `${(f.allow/f.total)*100}%` }}></div>
                  </div>
                </td>
                <td><button className="btn sm" onClick={() => openFamily(f)}>Open →</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="card-foot">
          <div className="small mut">{fams.length} of {MOCK.FAMILIES.length} families</div>
          <div className="xs mut2">Prevent <span style={{ color: 'var(--navy)' }}>■</span> &nbsp; Allow <span style={{ color: 'var(--green)' }}>■</span></div>
        </div>
      </div>
    </div>
  );
}

function LibraryView({ kind, state, goto, toast }) {
  const { rules } = state;
  const filter = kind === 'draft'
    ? (r) => r.status === 'draft'
    : (r) => r.status === 'conflict';
  const matched = rules.filter(filter);

  const title = kind === 'draft' ? 'Drafts on staging' : 'Conflicts';
  const sub = kind === 'draft'
    ? 'Rules that have been authored but are still on staging — test them before submitting for approval.'
    : 'Rules with a contradiction or overlap that must be resolved before sync.';

  const openRule = (r) => {
    if (r.review === 'pending') goto('review', { ruleId: r.id });
    else toast({ msg: `Opening ${r.id} in editor…`, icon: '✎' });
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">{title}</h1>
          <div className="page-sub">{sub}</div>
        </div>
        <button className="btn" onClick={() => goto('dashboard')}>← Back to rules</button>
      </div>

      {matched.length === 0 ? (
        <div className="card">
          <div className="card-body center" style={{ padding: 60, color: 'var(--ink-4)' }}>
            <div style={{ fontSize: 42, marginBottom: 12 }}>{kind === 'draft' ? '✓' : '✓'}</div>
            <div className="b" style={{ fontSize: 16, color: 'var(--ink-1)' }}>
              No {kind === 'draft' ? 'drafts' : 'conflicts'} across any family.
            </div>
            <div className="small" style={{ marginTop: 6 }}>
              {kind === 'draft'
                ? 'Every authored rule has been submitted for review or synced to production.'
                : 'All rules are consistent. AI will re-scan on next import.'}
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 90 }}>ID</th>
                <th style={{ width: 120 }}>Family</th>
                <th>Rule</th>
                <th style={{ width: 180 }}>Attribute</th>
                <th style={{ width: 150 }}>Status</th>
                <th style={{ width: 100 }}>Edited</th>
                <th style={{ width: 100 }}></th>
              </tr>
            </thead>
            <tbody>
              {matched.map(r => (
                <tr key={r.id}>
                  <td className="mono small">{r.id}</td>
                  <td><b>{r.family}</b></td>
                  <td>{r.summary}</td>
                  <td className="small mut2">{r.attribute}</td>
                  <td>{kind === 'draft'
                    ? <Pill kind="purple" dot>draft · staging</Pill>
                    : <Pill kind="amber" dot>conflict</Pill>}</td>
                  <td className="xs mut">{r.edited}</td>
                  <td><button className="btn sm" onClick={() => openRule(r)}>
                    {kind === 'draft' ? 'Edit' : 'Resolve'}
                  </button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="card-foot">
            <div className="small mut">{matched.length} {kind === 'draft' ? 'draft' : 'conflict'}{matched.length !== 1 ? 's' : ''} across {new Set(matched.map(r=>r.family)).size} famil{new Set(matched.map(r=>r.family)).size !== 1 ? 'ies' : 'y'}</div>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { FamiliesLibrary, LibraryView });
