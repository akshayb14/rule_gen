// === Shared UI primitives ===

const { useState, useEffect, useMemo, useRef, useCallback, Fragment } = React;

function Chip({ type, value, editable, onClick }) {
  const cls = `chip ${type || 'val'} ${editable ? 'editable' : ''}`;
  return <span className={cls} onClick={(e) => onClick && onClick(e)}>{value}{editable && <span className="chip-caret"> ▾</span>}</span>;
}

// Editable rule expression — chips can be edited via popover with dropdown of valid options.
// `onChange(nextChips)` fires when any chip changes. `family` optional — used to pull real attribute names/codes.
function RuleExpression({ chips, editable = false, onChange, family }) {
  const [edit, setEdit] = useState(null); // { idx, rect } of editing chip
  const popRef = useRef(null);

  useEffect(() => {
    if (edit == null) return;
    const onDoc = (e) => { if (popRef.current && !popRef.current.contains(e.target)) setEdit(null); };
    const onKey = (e) => { if (e.key === 'Escape') setEdit(null); };
    const onScroll = () => setEdit(null);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [edit]);

  // Choices per chip type
  const choicesFor = (chip, idx) => {
    if (chip.t === 'act') return ['PREVENT', 'ALLOW'];
    if (chip.t === 'op') return ['IF', 'WHEN', 'AND', 'OR', 'NOT', 'AND NOT', '=', '≠', '≥', '≤', 'IN'];
    if (chip.t === 'attr') {
      const famKey = family || (window.MOCK && window.MOCK.ATTR_OPTIONS && Object.keys(window.MOCK.ATTR_OPTIONS)[0]);
      const famAttrs = (window.MOCK && window.MOCK.ATTR_OPTIONS && window.MOCK.ATTR_OPTIONS[famKey]) || {};
      const keys = Object.keys(famAttrs);
      return keys.length ? keys : (window.MOCK ? window.MOCK.ATTRIBUTES : []);
    }
    if (chip.t === 'val') {
      for (let i = idx - 1; i >= 0; i--) {
        if (chips[i].t === 'attr') {
          const attrName = chips[i].v;
          const famKey = family || (window.MOCK && window.MOCK.ATTR_OPTIONS && Object.keys(window.MOCK.ATTR_OPTIONS)[0]);
          const famAttrs = (window.MOCK && window.MOCK.ATTR_OPTIONS && window.MOCK.ATTR_OPTIONS[famKey]) || {};
          const opts = famAttrs[attrName];
          if (opts) return opts.map(o => ({ val: o.c, desc: o.d }));
          return [];
        }
      }
      return [];
    }
    return [];
  };

  const update = (idx, newVal) => {
    if (!onChange) { setEdit(null); return; }
    const next = chips.map((c, i) => i === idx ? { ...c, v: newVal } : c);
    onChange(next);
    setEdit(null);
  };

  const openAt = (idx, evt) => {
    const rect = evt.currentTarget.getBoundingClientRect();
    setEdit({ idx, rect });
  };

  const popover = edit !== null && ReactDOM.createPortal(
    (() => {
      const c = chips[edit.idx];
      const opts = choicesFor(c, edit.idx);
      const label = c.t === 'act' ? 'Action' : c.t === 'op' ? 'Operator' : c.t === 'attr' ? 'Attribute' : 'Value';
      // position: below chip, clamp to viewport
      const top = Math.min(edit.rect.bottom + 6, window.innerHeight - 320);
      const left = Math.min(edit.rect.left, window.innerWidth - 360);
      return (
        <div className="chip-pop" ref={popRef} style={{ position: 'fixed', top, left }}>
          <div className="chip-pop-head xs mut">{label}</div>
          <div className="chip-pop-list">
            {opts.map((opt, k) => {
              const val = typeof opt === 'string' ? opt : opt.val;
              const desc = typeof opt === 'string' ? null : opt.desc;
              return (
                <button key={k} className={`chip-pop-item ${val === c.v ? 'active' : ''}`}
                  onClick={() => update(edit.idx, val)}>
                  <span className="mono small" style={{ minWidth: 46 }}>{val}</span>
                  {desc && <span className="xs mut2" style={{ marginLeft: 8, textAlign: 'left' }}>{desc}</span>}
                </button>
              );
            })}
            {opts.length === 0 && (
              <div className="chip-pop-item xs mut" style={{ padding: 10 }}>No options defined for this attribute.</div>
            )}
          </div>
        </div>
      );
    })(),
    document.body
  );

  return (
    <div className="rule">
      {chips.map((c, i) => (
        <Chip key={i} type={c.t} value={c.v} editable={editable}
          onClick={(e) => { if (editable) edit && edit.idx === i ? setEdit(null) : openAt(i, e); }} />
      ))}
      {popover}
    </div>
  );
}

function Pill({ kind, children, dot }) {
  return <span className={`pill ${kind || ''} ${dot ? 'dot' : ''}`}>{children}</span>;
}

function Stepper({ current, steps }) {
  return (
    <div className="stepper">
      {steps.map((s, i) => (
        <div key={i} className="st-group">
          <div className={`st ${i < current ? 'done' : i === current ? 'cur' : ''}`}>
            <span className="dot">{i < current ? '✓' : i + 1}</span>
            <span className="lbl">{s}</span>
          </div>
          {i < steps.length - 1 && <span className="line"></span>}
        </div>
      ))}
    </div>
  );
}

function Toast({ toasts, remove }) {
  return (
    <div className="toast-wrap">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.kind || ''}`} onClick={() => remove(t.id)}>
          <span>{t.icon || '✓'}</span>
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

function Modal({ title, children, onClose, footer }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="mhead">
          <div className="mtitle">{title}</div>
          <button className="x" onClick={onClose}>×</button>
        </div>
        <div className="mbody">{children}</div>
        {footer && <div className="mfoot">{footer}</div>}
      </div>
    </div>
  );
}

// ===== Avtron live preview =====
function AvtronPreview({ appliedRules = [] }) {
  const connectorHidden = appliedRules.some(r => r.id === 'R-144');
  return (
    <div>
      <div className="chrome">
        <div className="url"><span className="dot"></span>nidec-avtronencoders.com/configurator</div>
        <div className="topnav">
          <div className="logo">AVTRON<em>·</em>ENCODERS</div>
          <span className="small mut" style={{ fontFamily: "'Arial Narrow', sans-serif" }}>A Nidec BRAND</span>
          <div className="nlink">INDUSTRIES</div>
          <div className="nlink">PRODUCTS</div>
          <div className="nlink active">GET A QUOTE</div>
          <div className="nlink">CROSS REFERENCE</div>
          <div className="nlink">ACCOUNT</div>
          <div className="hamb">≡</div>
        </div>
      </div>
      <div className="avt-body">
        <div className="avt-card">
          <div className="avt-title">SEARCH BY PART NUMBER</div>
          <div className="avt-field">
            <div className="avt-label">ENTER PART NUMBER</div>
            <div className="avt-select">&nbsp;</div>
          </div>
          <button className="btn primary" style={{ width: '100%' }}>🔍 FIND EXPERT PART</button>
        </div>
        <div className="avt-or">OR</div>
        <div className="avt-card">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div className="avt-title">CONFIGURE PART</div>
            <a className="small">Clear Item</a>
          </div>
          <div className="avt-field">
            <div className="avt-label">PRODUCT</div>
            <div className="avt-select">AV4 ▾</div>
          </div>
          <div className="avt-field">
            <div className="avt-label">PPR</div>
            <div className="avt-select">AH — 120 PPR ▾</div>
          </div>
          <div className="avt-field">
            <div className="avt-label">WIRING EXIT</div>
            <div className="avt-select">R — Radial Side Exit ▾</div>
          </div>
          <div className="avt-field">
            <div className="avt-label">PHASING</div>
            <div className="avt-select">Standard Avtron phasing ▾</div>
          </div>
          <div className={`avt-field ${connectorHidden ? 'newly-filtered' : ''}`}>
            <div className="avt-label" style={connectorHidden ? { color: 'var(--red)' } : {}}>
              CONNECTOR OPTIONS
              {connectorHidden && <Pill kind="red" style={{ marginLeft: 6 }}>&nbsp;filtered · R-144</Pill>}
            </div>
            <div className="avt-select">
              {connectorHidden ? 'A — 10 pin MS w/ Plug Std ▾' : 'C — 10 pin MS w/ Plug Std/Avtron Phasing ▾'}
            </div>
            {connectorHidden && (
              <div className="xs mut" style={{ marginTop: 4 }}>
                Option C hidden — incompatible with wiring R + phasing std
              </div>
            )}
          </div>
          <div className="avt-field">
            <div className="avt-label">SHAFT SIZE</div>
            <div className="avt-select">B — 0.375 in. OD x 0.625 in. Shaft ▾</div>
          </div>
          <div className="avt-field">
            <div className="avt-label">FLANGE STYLE</div>
            <div className="avt-select">A — 2.06 in. Square Flange ▾</div>
          </div>
        </div>
        <div className="avt-card">
          <div className="avt-title">AVTRON PART NUMBER</div>
          <div className="avt-pn">AV4AH4B{connectorHidden ? 'A' : 'C'}RA3AAC5E</div>
          <div className="avt-field" style={{ marginTop: 16 }}>
            <div className="avt-label">SELECT QUANTITY</div>
            <div className="avt-qty">
              <button className="btn">−</button>
              <input className="input" defaultValue="1" />
              <button className="btn">＋</button>
            </div>
          </div>
          <button className="btn primary lg" style={{ width: '100%', marginTop: 10 }}>🛒 ADD TO QUOTE</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  Chip, RuleExpression, Pill, Stepper, Toast, Modal, AvtronPreview, EditRuleModal,
});

// === Edit Rule modal — reuses the Create rule layout in a dialog ===
function EditRuleModal({ rule, onClose, onSave, onSubmit }) {
  const [chips, setChips] = useState(rule.chips);
  const [summary, setSummary] = useState(rule.summary);
  const [note, setNote] = useState('');

  // Keep summary roughly in sync with chips
  const recomputeSummary = (nextChips) => {
    const act = nextChips.find(c => c.t === 'act')?.v || '';
    const parts = [act];
    let i = 0;
    while (i < nextChips.length) {
      const c = nextChips[i];
      if (c.t === 'act') { i++; continue; }
      parts.push(c.v);
      i++;
    }
    setSummary(parts.join(' '));
  };

  const onChipsChange = (next) => {
    setChips(next);
    recomputeSummary(next);
  };

  const save = () => {
    onSave({ ...rule, chips, summary, edited: 'just now' });
  };
  const submit = () => {
    onSubmit({ ...rule, chips, summary, edited: 'just now', status: 'active', review: 'pending' });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal wide" onClick={e => e.stopPropagation()} style={{ maxWidth: 820 }}>
        <div className="mhead">
          <div>
            <div className="mtitle">Edit rule · <span className="mono">{rule.id}</span></div>
            <div className="xs mut" style={{ marginTop: 2 }}>
              {rule.family} · {rule.attribute} · last edited {rule.edited}
            </div>
          </div>
          <button className="x" onClick={onClose}>×</button>
        </div>
        <div className="mbody">
          <div className="tiny" style={{ marginBottom: 6 }}>Rule expression</div>
          <div className="xs mut" style={{ marginBottom: 8 }}>Click any chip to change its attribute, operator, or value. Valid codes for <b>{rule.family}</b> are shown.</div>
          <RuleExpression chips={chips} editable onChange={onChipsChange} family={rule.family} />

          <div className="tiny" style={{ marginTop: 14, marginBottom: 4 }}>Summary</div>
          <input className="input" value={summary} onChange={e => setSummary(e.target.value)} style={{ width: '100%' }} />

          <div className="tiny" style={{ marginTop: 14, marginBottom: 4 }}>Note (optional)</div>
          <textarea className="textarea" rows="2" placeholder="Reason for change — shown to reviewer on resubmit."
            value={note} onChange={e => setNote(e.target.value)} />

          <div className="banner blue" style={{ marginTop: 14 }}>
            <span>ℹ</span>
            <div className="grow">
              Saving updates the draft on staging. <b>Submit</b> runs validation and sends to <b>Brian W.</b> for approval.
            </div>
          </div>
        </div>
        <div className="mfoot">
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <div className="grow"></div>
          <button className="btn" onClick={save}>Save to staging</button>
          <button className="btn primary" onClick={submit}>Submit for review →</button>
        </div>
      </div>
    </div>
  );
}
