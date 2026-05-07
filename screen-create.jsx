// === Create Rule (Natural Language) ===
const { useState: useS2, useEffect: useE2, useRef: useR2 } = React;

function CreateRule({ state, setState, goto, toast }) {
  const { family } = state;
  const initialDemo = (MOCK.FAMILY_DEMOS && MOCK.FAMILY_DEMOS[family.id]) || { prompt: MOCK.DEMO_PROMPT, generated: MOCK.DEMO_GENERATED };
  const [prompt, setPrompt] = useS2(initialDemo.prompt);
  const ruleFamily = family.id;
  const setRuleFamily = (id) => {
    const next = MOCK.FAMILIES.find(f => f.id === id);
    if (next) setState(s => ({ ...s, family: next }));
  };
  const [stage, setStage] = useS2('input'); // input | generating | generated
  const [generated, setGenerated] = useS2(null);

  // When family changes (and we're still on the input stage), swap the demo prompt
  useE2(() => {
    const demo = (MOCK.FAMILY_DEMOS && MOCK.FAMILY_DEMOS[ruleFamily]) || { prompt: MOCK.DEMO_PROMPT, generated: MOCK.DEMO_GENERATED };
    setPrompt(demo.prompt);
    if (stage === 'generated') {
      // Re-run the AI generation against the new family so chips + formal stay in sync
      setGenerated({ ...demo.generated, family: ruleFamily });
    }
  }, [ruleFamily]);

  const onGenerate = () => {
    if (!prompt.trim()) return toast({ msg: 'Please describe the rule', kind: 'warn', icon: '!' });
    setStage('generating');
    setTimeout(() => {
      const demo = (MOCK.FAMILY_DEMOS && MOCK.FAMILY_DEMOS[ruleFamily]) || { generated: MOCK.DEMO_GENERATED };
      setGenerated({ ...demo.generated, family: ruleFamily });
      setStage('generated');
    }, 1400);
  };

  const onChipsChange = (next) => {
    setGenerated(g => ({ ...g, chips: next }));
  };

  const onValidate = () => {
    setState(s => ({ ...s, pendingRule: { ...generated, prompt, submitter: 'Eric D.', family: ruleFamily } }));
    goto('validate');
  };

  const onReset = () => {
    setStage('input'); setGenerated(null);
    const demo = (MOCK.FAMILY_DEMOS && MOCK.FAMILY_DEMOS[ruleFamily]) || { prompt: MOCK.DEMO_PROMPT };
    setPrompt(demo.prompt);
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">Create rule</h1>
          <div className="page-sub">Describe the rule in plain English. AI parses it into the formal prevent/allow grammar.</div>
        </div>
        <button className="btn ghost" onClick={() => goto('dashboard')}>← Cancel</button>
      </div>

      <div className="card">
        <div className="card-body">
          <Stepper current={stage === 'input' ? 0 : stage === 'generating' ? 0 : 1}
            steps={['Describe', 'Review rule', 'Validate', 'Reviewer', 'Sync']} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* LEFT */}
            <div>
              <label className="label">Family</label>
              <select className="select" value={ruleFamily} onChange={e => setRuleFamily(e.target.value)} style={{ marginBottom: 16 }}>
                {MOCK.FAMILIES.map(f => <option key={f.id} value={f.id}>{f.name} · {f.total} rules</option>)}
              </select>

              <label className="label">Describe the rule</label>
              <textarea className="textarea" rows="5" value={prompt} onChange={e => setPrompt(e.target.value)}
                placeholder="e.g. If tether is X, prevent mounting options 2 and 3." />

              <div className="row" style={{ justifyContent: 'space-between', marginTop: 10 }}>
                <div className="xs mut">
                  {(MOCK.FAMILIES.find(f => f.id === ruleFamily) || family).name} loaded · {(MOCK.FAMILIES.find(f => f.id === ruleFamily) || family).total} rules indexed
                </div>
                {stage === 'input' ? (
                  <button className="btn primary" onClick={onGenerate}>✨ Generate rule →</button>
                ) : (
                  <button className="btn" onClick={onReset}>Start over</button>
                )}
              </div>

              <div className="hr-dash"></div>

              <div className="tiny" style={{ marginBottom: 6 }}>Prompt tips</div>
              <ul className="small mut" style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
                <li>Use attribute names: tether, mounting, connector, wiring, PPR…</li>
                <li>Be explicit about action — "prevent" (hide) or "allow" (show)</li>
                <li>Combine with: <b>and</b>, <b>or</b>, <b>not</b>, <b>and not</b></li>
                <li>AI will ask a follow-up if ambiguous</li>
              </ul>
            </div>

            {/* RIGHT */}
            <div style={{ borderLeft: '1px solid var(--line)', paddingLeft: 24 }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <label className="label" style={{ margin: 0 }}>AI-generated rule</label>
                {generated && <Pill kind="purple">AI · 96% confidence</Pill>}
              </div>

              {stage === 'input' && (
                <div className="center" style={{ minHeight: 220, color: 'var(--ink-4)', fontSize: 13, textAlign: 'center', padding: 20 }}>
                  <div>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>✨</div>
                    Type your rule on the left, then press <b>Generate</b>.<br/>
                    AI will parse it into the formal prevent/allow + operators grammar.
                  </div>
                </div>
              )}

              {stage === 'generating' && (
                <div className="center" style={{ minHeight: 220 }}>
                  <div className="ai-note" style={{ flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
                    <div className="row"><span className="ai-badge">AI</span> <b>Parsing your request…</b></div>
                    <div className="small" style={{ marginTop: 8 }}>
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                    </div>
                    <div className="xs mut" style={{ marginTop: 8 }}>
                      Identifying attributes · mapping to code values · composing operators
                    </div>
                  </div>
                </div>
              )}

              {stage === 'generated' && generated && (
                <>
                  <div className="xs mut" style={{ margin: '6px 0 10px' }}>
                    Click any chip to edit — attribute and value dropdowns show the real option codes for {(MOCK.FAMILIES.find(f => f.id === ruleFamily) || family).name}.
                  </div>
                  <RuleExpression chips={generated.chips} editable onChange={onChipsChange} family={ruleFamily} />

                  {(() => {
                    // Derive formal expression + detected attrs from the actual chips
                    const chips = generated.chips || [];
                    const action = (chips.find(c => c.t === 'act') || {}).v || 'PREVENT';
                    const attrs = chips.filter(c => c.t === 'attr').map(c => c.v);
                    const head = chips[0] && chips[0].t === 'act'
                      ? `${chips[1] && chips[1].v} = ${chips[2] && chips[2].v}`
                      : '';
                    // Build the conditional tail (everything after the head value, joined)
                    const tail = chips.slice(3).map(c => {
                      if (c.t === 'op') {
                        const map = { 'AND': '∧', 'OR': '∨', 'NOT': '¬', 'AND NOT': '∧ ¬',
                                      'IF': '⟵', 'WHEN': '⟵', '=': '=', '≠': '≠',
                                      '≥': '≥', '≤': '≤', 'IN': '∈' };
                        return map[c.v] || c.v;
                      }
                      return c.v;
                    }).join(' ');
                    const verb = action === 'ALLOW' ? 'allow' : 'prevent';
                    const formal = `${verb}(${head}) ${tail}`;
                    const dedupAttrs = [...new Set(attrs)];
                    const sameAttrCount = (state.rules || []).filter(r =>
                      r.family === ruleFamily && dedupAttrs.includes(r.attribute)
                    ).length;
                    const otherFamilies = MOCK.FAMILIES.filter(f => f.id !== ruleFamily).map(f => f.id);
                    const crossFamily = otherFamilies[Math.abs(ruleFamily.length) % otherFamilies.length];

                    return (
                      <>
                        <div className="xs mut" style={{ marginTop: 12 }}>
                          <b>Formal:</b> <span className="mono">{formal}</span>
                        </div>
                        <div className="xs mut" style={{ marginTop: 4 }}>
                          <b>Rule ID:</b> {generated.id} · <b>Family:</b> {(MOCK.FAMILIES.find(f => f.id === ruleFamily) || family).name}
                        </div>

                        <div className="hr-dash"></div>

                        <div className="ai-note">
                          <span className="ai-badge">AI</span>
                          <div>
                            <div className="b">Notes</div>
                            <ul style={{ margin: '4px 0 0 18px', padding: 0, lineHeight: 1.7 }}>
                              <li>
                                Detected attributes:{' '}
                                {dedupAttrs.map(a => (
                                  <span key={a} style={{ marginRight: 4 }}><Pill kind="blue">{a}</Pill></span>
                                ))}
                              </li>
                              <li>
                                {sameAttrCount > 0
                                  ? <>{sameAttrCount} existing rule{sameAttrCount === 1 ? '' : 's'} in {ruleFamily} also touch <b>{dedupAttrs[0]}</b> — checked in next step.</>
                                  : <>No existing rules in {ruleFamily} touch <b>{dedupAttrs[0] || 'these attributes'}</b> — clean addition.</>}
                              </li>
                              <li>Similar pattern found in {crossFamily} — consider cross-family review.</li>
                            </ul>
                          </div>
                        </div>
                      </>
                    );
                  })()}

                  <div className="row" style={{ justifyContent: 'space-between', marginTop: 14 }}>
                    <button className="btn ghost" onClick={onGenerate}>↻ Regenerate</button>
                    <div className="row">
                      <button className="btn">Save as draft</button>
                      <button className="btn primary" onClick={onValidate}>Validate →</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.CreateRule = CreateRule;
