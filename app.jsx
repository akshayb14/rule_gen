// === App shell + routing ===
const { useState: useSA, useEffect: useEA } = React;

function Sidebar({ screen, goto, state, user, onSignOut }) {
  const pending = state.rules.filter(r => r.review === 'pending').length;
  const drafts = state.rules.filter(r => r.status === 'draft').length;
  const conflicts = state.rules.filter(r => r.status === 'conflict').length;

  const item = (id, icon, label, count, countKind) => (
    <button className={`item ${screen === id ? 'active' : ''}`} onClick={() => goto(id)}>
      <span className="ic">{icon}</span>
      <span>{label}</span>
      {count != null && count > 0 && <span className={`count ${countKind || ''}`}>{count}</span>}
    </button>
  );

  return (
    <aside className="side">
      <div className="brand">
        <img src="avtron-logo.png" alt="Avtron Encoders" style={{ width: '100%', maxWidth: 170, height: 'auto', display: 'block' }} />
        <div className="tag" style={{ marginTop: 6 }}>AI Rule configurator</div>
      </div>
      <nav>
        <div className="nav-section">Workspace</div>
        {item('dashboard', '▤', 'Rules', state.rules.length)}
        {item('insights', '✦', 'AI insights', 5, 'purple')}
        {item('review', '✉', 'Review queue', pending, 'blue')}
        {item('help', '?', 'How to use')}
        <div className="nav-section" style={{ marginTop: 8 }}>Library</div>
        <button className={`item ${screen === 'families' ? 'active' : ''}`} onClick={() => goto('families')}><span className="ic">▦</span><span>Families</span><span className="count">{MOCK.FAMILIES.length}</span></button>
        <button className={`item ${screen === 'drafts' ? 'active' : ''}`} onClick={() => goto('drafts')}><span className="ic">⚐</span><span>Drafts</span>{drafts > 0 && <span className="count purple">{drafts}</span>}</button>
        <button className={`item ${screen === 'conflicts' ? 'active' : ''}`} onClick={() => goto('conflicts')}><span className="ic">⚠</span><span>Conflicts</span>{conflicts > 0 && <span className="count amber">{conflicts}</span>}</button>
        <button className="item"><span className="ic">↺</span><span>Sync history</span></button>
        <div className="nav-section" style={{ marginTop: 8 }}>Admin</div>
        <button className="item"><span className="ic">◉</span><span>Reviewers</span></button>
        <button className="item"><span className="ic">⚙</span><span>Settings</span></button>
      </nav>
      <div className="user">
        <div className="avatar">{user ? user.initials : 'ED'}</div>
        <div style={{ flex: 1 }}>
          <div className="uname">{user ? user.name : 'Eric D.'}</div>
          <div className="urole">{user ? user.role : 'Business SME'}</div>
        </div>
        <button className="btn sm ghost" onClick={onSignOut} title="Sign out" style={{ padding: '4px 8px' }}>↪</button>
      </div>
    </aside>
  );
}

function Topbar({ screen, state, setState }) {
  const crumb = {
    dashboard: <><b>Rules</b> · {state.family.name}</>,
    create: <>Rules › <b>Create (AI)</b></>,
    validate: <>Rules › Create › <b>Validate</b></>,
    review: <><b>Review queue</b></>,
    reviewDetail: <>Review queue › <b>Detail</b> {state.pendingRule && <span className="mono"> · {state.pendingRule.id}</span>}</>,
    applied: <>Rules › <b>Synced</b></>,
    insights: <><b>AI insights</b></>,
    help: <><b>How to use</b></>,
    families: <><b>Families</b> · library</>,
    drafts: <><b>Drafts</b> · on staging</>,
    conflicts: <><b>Conflicts</b> · need resolution</>,
  }[screen] || '';

  return (
    <div className="topbar">
      <div className="crumb">{crumb}</div>
      <div className="grow"></div>
      <select className="select" style={{ width: 180 }} value={state.family.id}
        onChange={e => setState(s => ({ ...s, family: MOCK.FAMILIES.find(f => f.id === e.target.value) }))}>
        {MOCK.FAMILIES.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
      </select>
      <button className="btn sm">Docs</button>
      <button className="bell">🔔<span className="dot"></span></button>
    </div>
  );
}

// Clear any stale session data so every fresh load starts at login
try { localStorage.removeItem('nidec_user'); localStorage.removeItem('nidec_screen'); } catch(e) {}

function App() {
  const [user, setUser] = useSA(null);
  const [screen, setScreen] = useSA('dashboard');
  const [state, setState] = useSA({
    family: MOCK.FAMILIES[0],
    rules: MOCK.INITIAL_RULES,
    pendingRule: null,
    appliedRules: [],
    lastSync: null,
    libraryFilter: null, // 'drafts' | 'conflicts' | null
  });
  const [toasts, setToasts] = useSA([]);

  // Merge generated sample rules once they load
  useEA(() => {
    const merge = () => {
      if (window.MOCK.GENERATED_RULES && window.MOCK.GENERATED_RULES.length) {
        setState(s => ({ ...s, rules: [...MOCK.INITIAL_RULES, ...window.MOCK.GENERATED_RULES] }));
      }
    };
    window.addEventListener('generated-rules-loaded', merge);
    if (window.MOCK.GENERATED_RULES && window.MOCK.GENERATED_RULES.length) merge();
    return () => window.removeEventListener('generated-rules-loaded', merge);
  }, []);

  const toast = (t) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(ts => [...ts, { id, ...t }]);
    setTimeout(() => setToasts(ts => ts.filter(x => x.id !== id)), 3800);
  };
  const removeToast = (id) => setToasts(ts => ts.filter(x => x.id !== id));

  const goto = (id, extra) => {
    if (extra && extra.ruleId) {
      const pending = state.rules.find(r => r.id === extra.ruleId);
      if (pending) setState(s => ({ ...s, pendingRule: { ...pending, submitter: pending.submitter || 'Eric D.', prompt: 'Existing rule under review' } }));
    }
    setScreen(id);
    try { localStorage.setItem('nidec_screen', id); } catch(e) {}
    window.scrollTo(0, 0);
  };


  const screens = {
    dashboard: <Dashboard state={state} setState={setState} goto={goto} toast={toast} />,
    create: <CreateRule state={state} setState={setState} goto={goto} toast={toast} />,
    validate: <Validate state={state} setState={setState} goto={goto} toast={toast} />,
    review: <ReviewQueue state={state} setState={setState} goto={goto} toast={toast} user={user} />,
    reviewDetail: <Review state={state} setState={setState} goto={goto} toast={toast} />,
    applied: <Applied state={state} goto={goto} />,
    insights: <Insights state={state} setState={setState} goto={goto} toast={toast} />,
    help: <HowToUse goto={goto} state={state} />,
    families: <FamiliesLibrary state={state} setState={setState} goto={goto} />,
    drafts: <LibraryView kind="draft" state={state} goto={goto} toast={toast} />,
    conflicts: <LibraryView kind="conflict" state={state} goto={goto} toast={toast} />,
  };



  if (!user) {
    return <Login onLogin={(u) => {
      setUser(u);
      try { localStorage.setItem('nidec_user', JSON.stringify(u)); } catch(e) {}
      // Land each role on its primary surface
      const landing = u.role === 'Product Lead' ? 'review' : 'dashboard';
      // If a Lead signs in and there's a pending rule, surface the first one
      if (u.role === 'Product Lead') {
        setState(s => {
          const firstPending = s.rules.find(r => r.review === 'pending');
          return firstPending
            ? { ...s, pendingRule: { ...firstPending, submitter: firstPending.submitter || 'Eric D.', prompt: 'Existing rule under review' } }
            : s;
        });
      }
      setScreen(landing);
      try { localStorage.setItem('nidec_screen', landing); } catch(e) {}
    }} />;
  }

  const onSignOut = () => {
    try { localStorage.removeItem('nidec_user'); localStorage.removeItem('nidec_screen'); } catch(e) {}
    setUser(null);
    setScreen('dashboard');
  };

  return (
    <div className="app">
      <Sidebar screen={screen} goto={goto} state={state} user={user} onSignOut={onSignOut} />
      <div className="main">
        <Topbar screen={screen} state={state} setState={setState} />
        <div className="content" data-screen-label={`screen-${screen}`}>
          {screens[screen]}
        </div>
      </div>
      <Toast toasts={toasts} remove={removeToast} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('app')).render(<App />);
