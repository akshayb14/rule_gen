// === Mock data ===
//
// FAMILIES are real product codes from ProductRules.xlsx.
// "name" matches both ProductRules.xlsx and ProductsAttributeOptionsCodes.xlsx so attribute lookup works.
// totals/prevent/allow are real rule counts from ProductRules.xlsx.
// pending/draft/conflicts are demo state for the prototype.

const FAMILIES = [
  { id: 'AV4',      name: 'AV4',      total: 504, prevent: 180, allow: 324, pending: 3, draft: 2, conflicts: 2 },
  { id: 'AV6A',     name: 'AV6A',     total: 207, prevent: 70,  allow: 137, pending: 1, draft: 0, conflicts: 1 },
  { id: 'AV6M',     name: 'AV6M',     total: 197, prevent: 77,  allow: 120, pending: 0, draft: 1, conflicts: 0 },
  { id: 'AV850',    name: 'AV850',    total: 469, prevent: 356, allow: 113, pending: 2, draft: 0, conflicts: 3 },
  { id: 'HS4',      name: 'HS4',      total: 223, prevent: 121, allow: 102, pending: 1, draft: 0, conflicts: 0 },
  { id: 'HS45',     name: 'HS45',     total: 339, prevent: 318, allow: 21,  pending: 0, draft: 0, conflicts: 2 },
  { id: 'XR850',    name: 'XR850',    total: 276, prevent: 174, allow: 102, pending: 1, draft: 0, conflicts: 1 },
  { id: 'AV125',    name: 'AV125',    total: 347, prevent: 306, allow: 41,  pending: 0, draft: 0, conflicts: 2 },
  { id: 'XR650',    name: 'XR650',    total: 198, prevent: 142, allow: 56,  pending: 0, draft: 0, conflicts: 0 },
  { id: 'XR485',    name: 'XR485',    total: 162, prevent: 130, allow: 32,  pending: 0, draft: 0, conflicts: 1 },
];

// Real attribute names per family (from ProductsAttributeOptionsCodes.xlsx). Sample 8 codes per attribute.
let ATTR_OPTIONS = {};
fetch('attr_sample.json').then(r => r.json()).then(d => { ATTR_OPTIONS = d; window.MOCK.ATTR_OPTIONS = d; window.dispatchEvent(new Event('attr-options-loaded')); });

// Generated sample rules per family — loaded async from rules_generated.json
fetch('rules_generated.json').then(r => r.json()).then(d => {
  window.MOCK.GENERATED_RULES = d;
  window.dispatchEvent(new Event('generated-rules-loaded'));
});

// All distinct attributes across encoder families (used as a default dropdown).
const ATTRIBUTES = [
  'Connector Options', 'Cover Plates', 'Modifications', 'Flange Style', 'Shaft Size',
  'Wiring Exit', 'PPR', 'Line Driver', 'Left Output PPR', 'Right Output PPR',
  'Rotor Bore Size', 'Channels', 'Seals', 'Housing Size', 'Communication Bus',
];

const OPERATORS = ['AND', 'OR', 'NOT', 'AND NOT', 'IF', 'WHEN', '=', '≠', '≥', '≤', 'IN'];

// Seeded rules — based on real xlsx entries
const INITIAL_RULES = [
  { id: 'R-041', family: 'AV4', attribute: 'Connector Options',
    action: 'PREVENT', summary: 'Prevent Connector C IF Flange = 4 (2.63 in. Square)',
    status: 'active', review: 'approved', reviewer: 'Brian W.',
    edited: 'Apr 15',
    chips: [{t:'act',v:'PREVENT'},{t:'attr',v:'Connector Options'},{t:'val',v:'C'},{t:'op',v:'IF'},{t:'attr',v:'Flange Style'},{t:'op',v:'='},{t:'val',v:'4'}] },
  { id: 'R-087', family: 'AV4', attribute: 'Modifications',
    action: 'PREVENT', summary: 'Prevent Mounting 2, 3 IF Tether = X',
    status: 'active', review: 'approved', reviewer: 'Brian W.',
    edited: 'Apr 18',
    chips: [{t:'act',v:'PREVENT'},{t:'attr',v:'Modifications'},{t:'val',v:'2, 3'},{t:'op',v:'IF'},{t:'attr',v:'Anti-Rotation Tether'},{t:'op',v:'='},{t:'val',v:'X'}] },
  { id: 'R-104', family: 'AV4', attribute: 'Connector Options',
    action: 'ALLOW', summary: 'Allow Connector A, B only WHEN PPR ≥ AN (256 PPR)',
    status: 'active', review: 'approved', reviewer: 'Brian W.',
    edited: 'Apr 17',
    chips: [{t:'act',v:'ALLOW'},{t:'attr',v:'Connector Options'},{t:'val',v:'A, B'},{t:'op',v:'WHEN'},{t:'attr',v:'PPR'},{t:'op',v:'≥'},{t:'val',v:'AN'}] },
  { id: 'R-128', family: 'AV4', attribute: 'Wiring Exit',
    action: 'PREVENT', summary: 'Prevent Wiring R (Radial) IF Flange = 1 (58mm Round)',
    status: 'conflict', review: 'approved',
    edited: 'Apr 19',
    chips: [{t:'act',v:'PREVENT'},{t:'attr',v:'Wiring Exit'},{t:'val',v:'R'},{t:'op',v:'IF'},{t:'attr',v:'Flange Style'},{t:'op',v:'='},{t:'val',v:'1'}] },
  { id: 'R-019', family: 'AV4', attribute: 'Line Driver',
    action: 'PREVENT', summary: 'Prevent Connector C IF Line Driver = 9 (5-30V In, 5V Out 7272)',
    status: 'active', review: 'approved', reviewer: 'Brian W.',
    edited: 'Apr 12',
    chips: [{t:'act',v:'PREVENT'},{t:'attr',v:'Connector Options'},{t:'val',v:'C'},{t:'op',v:'IF'},{t:'attr',v:'Line Driver'},{t:'op',v:'='},{t:'val',v:'9'}] },
  { id: 'R-212', family: 'AV4', attribute: 'Seals',
    action: 'ALLOW', summary: 'Allow Seals K (IP69K SS) only WHEN Shaft = T (6mm OD)',
    status: 'draft', review: 'draft',
    edited: 'Apr 20',
    chips: [{t:'act',v:'ALLOW'},{t:'attr',v:'Seals'},{t:'val',v:'K'},{t:'op',v:'WHEN'},{t:'attr',v:'Shaft Size'},{t:'op',v:'='},{t:'val',v:'T'}] },
  { id: 'R-218', family: 'AV4', attribute: 'Modifications',
    action: 'PREVENT', summary: 'Prevent Mod 704 (Magnetic Shielding) IF Channels = A',
    status: 'active', review: 'pending', submitter: 'Eric D.', reviewer: 'Brian W.',
    edited: 'Apr 21', age: '2 days ago', confidence: 96, simulatedAgainst: 2430, overlapCount: 1, conflictCount: 0,
    prompt: 'Prevent magnetic shielding mod 704 whenever single channel A is selected — incompatible per QA bulletin Apr-19.',
    chips: [{t:'act',v:'PREVENT'},{t:'attr',v:'Modifications'},{t:'val',v:'704'},{t:'op',v:'IF'},{t:'attr',v:'Channels'},{t:'op',v:'='},{t:'val',v:'A'}] },
  { id: 'R-301', family: 'HS35', attribute: 'Connector Options',
    action: 'PREVENT', summary: 'Prevent Connector W IF Wiring Exit = Radial',
    status: 'active', review: 'pending', submitter: 'Eric D.', reviewer: 'Brian W.',
    edited: 'Apr 22', age: '1 day ago', confidence: 94, simulatedAgainst: 1820, overlapCount: 0, conflictCount: 0,
    prompt: 'Block 10-pin MS connector W on radial wiring exit — mechanical clearance issue flagged by sales.',
    chips: [{t:'act',v:'PREVENT'},{t:'attr',v:'Connector Options'},{t:'val',v:'W'},{t:'op',v:'IF'},{t:'attr',v:'Wiring Exit'},{t:'op',v:'='},{t:'val',v:'R'}] },
  { id: 'R-318', family: 'HS45', attribute: 'Channels',
    action: 'PREVENT', summary: 'Prevent Channels D IF Connector = G',
    status: 'active', review: 'pending', submitter: 'Eric D.', reviewer: 'Brian W.',
    edited: 'Apr 23', age: '20 hours ago', confidence: 91, simulatedAgainst: 2104, overlapCount: 2, conflictCount: 0,
    prompt: 'Dual-channel option D not buildable with 10-pin G connector — pin count insufficient.',
    chips: [{t:'act',v:'PREVENT'},{t:'attr',v:'Channels'},{t:'val',v:'D'},{t:'op',v:'IF'},{t:'attr',v:'Connector Options'},{t:'op',v:'='},{t:'val',v:'G'}] },
  { id: 'R-332', family: 'XR850', attribute: 'Right Output Line Driver',
    action: 'PREVENT', summary: 'Prevent Right Line Driver F IF Rotor Bore = UQ',
    status: 'active', review: 'pending', submitter: 'Eric D.', reviewer: 'Brian W.',
    edited: 'Apr 23', age: '14 hours ago', confidence: 88, simulatedAgainst: 3120, overlapCount: 0, conflictCount: 1,
    prompt: '7272 line driver F unsupported on UQ bore variant — coupling diameter mismatch.',
    chips: [{t:'act',v:'PREVENT'},{t:'attr',v:'Right Output Line Driver'},{t:'val',v:'F'},{t:'op',v:'IF'},{t:'attr',v:'Rotor Bore'},{t:'op',v:'='},{t:'val',v:'UQ'}] },
  { id: 'R-355', family: 'AV125', attribute: 'Modifications',
    action: 'PREVENT', summary: 'Prevent Mod 901 IF Connector = A',
    status: 'active', review: 'pending', submitter: 'Eric D.', reviewer: 'Brian W.',
    edited: 'Apr 24', age: '6 hours ago', confidence: 97, simulatedAgainst: 1860, overlapCount: 0, conflictCount: 0,
    prompt: 'Inverted phasing (Mod 901) not compatible with 7-pin MS connector A — wiring map collision.',
    chips: [{t:'act',v:'PREVENT'},{t:'attr',v:'Modifications'},{t:'val',v:'901'},{t:'op',v:'IF'},{t:'attr',v:'Connector Options'},{t:'op',v:'='},{t:'val',v:'A'}] },
  { id: 'R-371', family: 'XR650', attribute: 'Seals',
    action: 'ALLOW', summary: 'Allow Seals K IF Shaft Size = Y',
    status: 'active', review: 'pending', submitter: 'Eric D.', reviewer: 'Brian W.',
    edited: 'Apr 24', age: '3 hours ago', confidence: 92, simulatedAgainst: 2240, overlapCount: 1, conflictCount: 0,
    prompt: 'Sealed bearing K now qualified for the Y shaft variant per engineering memo EN-2031.',
    chips: [{t:'act',v:'ALLOW'},{t:'attr',v:'Seals'},{t:'val',v:'K'},{t:'op',v:'WHEN'},{t:'attr',v:'Shaft Size'},{t:'op',v:'='},{t:'val',v:'Y'}] },
];

const INITIAL_SUGGESTIONS = [
  { id: 's1', title: 'Merge two overlapping rules', type: 'overlap', scopeLabel: 'AV4',
    body: 'Rules R-041 and R-143 both hide Connector C in 12 shared combinations. Merging removes 1 rule with no behavior change.',
    meta: 'Confidence 94% · simulation verified · requires Product Lead approval', confidence: 94 },
  { id: 's2', title: 'Missing symmetric rule across AV family', type: 'gap', scopeLabel: 'AV850 ↔ AV685',
    body: 'AV685 prevents Connector E when Line Driver = 9. AV850 has the same constraint but AV685 lacks the symmetric rule for Line Driver 9 on Right Output. Likely oversight.',
    meta: 'Pattern match across 3 AV families · confidence 88%', confidence: 88 },
  { id: 's3', title: 'Obsolete rule candidate', type: 'obsolete', scopeLabel: 'HS35X',
    body: 'Rule references Cover Plate variant retired in 2024. Last matched: never · no active parts use it.',
    meta: 'Confidence 99% · safe to retire', confidence: 99 },
  { id: 's4', title: 'Simplification available', type: 'rewrite', scopeLabel: 'AV4',
    body: 'R-088\'s nested NOT-NOT can be flattened. Equivalent logic, 40% shorter. Already on staging as a draft.',
    meta: 'Safe rewrite · 0 side effects in 2,430 combos · confidence 97%', confidence: 97 },
];

const DEMO_PROMPT = 'Prevent Connector C when Wiring Exit is Radial and Flange is square, but not if PPR is AN (256) or higher.';

const DEMO_GENERATED = {
  id: 'R-144', family: 'AV4', attribute: 'Connector Options', action: 'PREVENT',
  summary: 'Prevent Connector C IF Wiring Exit = R AND Flange Style = 4 AND NOT PPR ≥ AN',
  chips: [
    { t: 'act', v: 'PREVENT' }, { t: 'attr', v: 'Connector Options' }, { t: 'val', v: 'C' },
    { t: 'op', v: 'IF' },
    { t: 'attr', v: 'Wiring Exit' }, { t: 'op', v: '=' }, { t: 'val', v: 'R' },
    { t: 'op', v: 'AND' },
    { t: 'attr', v: 'Flange Style' }, { t: 'op', v: '=' }, { t: 'val', v: '4' },
    { t: 'op', v: 'AND NOT' },
    { t: 'attr', v: 'PPR' }, { t: 'op', v: '≥' }, { t: 'val', v: 'AN' },
  ],
};

// Per-family demo prompts + AI-generated rules — each grounded in a real ProductRules.xlsx entry
const FAMILY_DEMOS = {
  'AV4': {
    prompt: 'When connector is 10-pin MS without plug, Avtron phasing (A) AND wiring exit is radial side (R), allow only the 58mm round flange with 36mm pilot (Flange = 1).',
    generated: {
      id: 'R-144', family: 'AV4', attribute: 'Flange Style', action: 'ALLOW',
      summary: 'Allow Flange Style = 1 only IF Connector Options = A AND Wiring Exit = R',
      chips: [
        {t:'act',v:'ALLOW'},{t:'attr',v:'Flange Style'},{t:'val',v:'1'},
        {t:'op',v:'IF'},
        {t:'attr',v:'Connector Options'},{t:'op',v:'='},{t:'val',v:'A'},
        {t:'op',v:'AND'},
        {t:'attr',v:'Wiring Exit'},{t:'op',v:'='},{t:'val',v:'R'},
      ],
    },
  },
  'AV6A': {
    prompt: 'For POWERLINK communication (Bus = K), allow only 8192 counts per revolution / 13 bits (CPR = 3).',
    generated: {
      id: 'R-145', family: 'AV6A', attribute: 'CPR/bits Per Turn/ST', action: 'ALLOW',
      summary: 'Allow CPR/bits Per Turn/ST = 3 (8192 counts / 13 bits) only IF Communication Bus = K (POWERLINK)',
      chips: [
        {t:'act',v:'ALLOW'},{t:'attr',v:'CPR/bits Per Turn/ST'},{t:'val',v:'3'},
        {t:'op',v:'IF'},
        {t:'attr',v:'Communication Bus'},{t:'op',v:'='},{t:'val',v:'K'},
      ],
    },
  },
  'AV6M': {
    prompt: 'When the connector is NOT W (cable, 1m or special length), prevent modification 901 (1 ft / 0.3 m cable built into encoder).',
    generated: {
      id: 'R-146', family: 'AV6M', attribute: 'Modifications', action: 'PREVENT',
      summary: 'Prevent Modifications = 901 (1ft built-in cable) IF Connector ≠ W (Cable 1m)',
      chips: [
        {t:'act',v:'PREVENT'},{t:'attr',v:'Modifications'},{t:'val',v:'901'},
        {t:'op',v:'IF'},
        {t:'attr',v:'Connector'},{t:'op',v:'≠'},{t:'val',v:'W'},
      ],
    },
  },
  'AV850': {
    prompt: 'If the right output line driver is 9 (5-24V in, 5V out, 7272), prevent the 6-pin MS connector with plug that replaces M940 (Connector = 3).',
    generated: {
      id: 'R-147', family: 'AV850', attribute: 'Connector Options', action: 'PREVENT',
      summary: 'Prevent Connector Options = 3 (6-pin MS w/ plug) IF Right Output Line Driver = 9',
      chips: [
        {t:'act',v:'PREVENT'},{t:'attr',v:'Connector Options'},{t:'val',v:'3'},
        {t:'op',v:'IF'},
        {t:'attr',v:'Right Output Line Driver'},{t:'op',v:'='},{t:'val',v:'9'},
      ],
    },
  },
  'HS4': {
    prompt: 'When connector is 6-pin MS with plug, reverse phasing (H), allow only the 36mm OD housing with 18mm hollow shaft depth (Housing = 3).',
    generated: {
      id: 'R-148', family: 'HS4', attribute: 'Housing Size', action: 'ALLOW',
      summary: 'Allow Housing Size = 3 only IF Connector Options = H (6-pin MS w/ plug, reverse phasing)',
      chips: [
        {t:'act',v:'ALLOW'},{t:'attr',v:'Housing Size'},{t:'val',v:'3'},
        {t:'op',v:'IF'},
        {t:'attr',v:'Connector Options'},{t:'op',v:'='},{t:'val',v:'H'},
      ],
    },
  },
  'HS45': {
    prompt: 'For 10-pin MS with plug, Avtron/BEI phasing (Connector = C), allow only all channels (Channels = A: A, A/, B, B/, Z, Z/).',
    generated: {
      id: 'R-149', family: 'HS45', attribute: 'Channels', action: 'ALLOW',
      summary: 'Allow Channels = A (all channels) only IF Connector Options = C',
      chips: [
        {t:'act',v:'ALLOW'},{t:'attr',v:'Channels'},{t:'val',v:'A'},
        {t:'op',v:'IF'},
        {t:'attr',v:'Connector Options'},{t:'op',v:'='},{t:'val',v:'C'},
      ],
    },
  },
  'XR850': {
    prompt: 'When the left output line driver is 7 (Level 2 ATEX/IECEx Zone 2 & 22, 5-24V in, 5-24V out), allow only no right output (Right Line Driver = X).',
    generated: {
      id: 'R-150', family: 'XR850', attribute: 'Right Output Line Driver', action: 'ALLOW',
      summary: 'Allow Right Output Line Driver = X (No Right Output) only IF Left Output Line Driver = 7',
      chips: [
        {t:'act',v:'ALLOW'},{t:'attr',v:'Right Output Line Driver'},{t:'val',v:'X'},
        {t:'op',v:'IF'},
        {t:'attr',v:'Left Output Line Driver'},{t:'op',v:'='},{t:'val',v:'7'},
      ],
    },
  },
  'AV125': {
    prompt: 'For special PPR (Left Output PPR = 0), allow only modification 009 — super magnetic shielded sensors with 6000 PPR and 25mm bore.',
    generated: {
      id: 'R-151', family: 'AV125', attribute: 'Modifications', action: 'ALLOW',
      summary: 'Allow Modifications = 009 (Super Mag Shielded, 6000 PPR, 25mm bore) only IF Left Output PPR = 0',
      chips: [
        {t:'act',v:'ALLOW'},{t:'attr',v:'Modifications'},{t:'val',v:'009'},
        {t:'op',v:'IF'},
        {t:'attr',v:'Left Output PPR'},{t:'op',v:'='},{t:'val',v:'0'},
      ],
    },
  },
  'XR650': {
    prompt: 'If the connector is 10-pin MS without mating plug (A), prevent the special 1 ft / 0.3 m built-in cable modification (Mod 901).',
    generated: {
      id: 'R-152', family: 'XR650', attribute: 'Modifications', action: 'PREVENT',
      summary: 'Prevent Modifications = 901 (1ft built-in cable) IF Connector Options = A',
      chips: [
        {t:'act',v:'PREVENT'},{t:'attr',v:'Modifications'},{t:'val',v:'901'},
        {t:'op',v:'IF'},
        {t:'attr',v:'Connector Options'},{t:'op',v:'='},{t:'val',v:'A'},
      ],
    },
  },
  'XR485': {
    prompt: 'When connector is 7-pin MS with plug, A/A//B/B/ standard phasing (K), prevent the special 1 ft / 0.3 m built-in cable mod (Mod 901).',
    generated: {
      id: 'R-153', family: 'XR485', attribute: 'Modifications', action: 'PREVENT',
      summary: 'Prevent Modifications = 901 (1ft built-in cable) IF Connector Options = K',
      chips: [
        {t:'act',v:'PREVENT'},{t:'attr',v:'Modifications'},{t:'val',v:'901'},
        {t:'op',v:'IF'},
        {t:'attr',v:'Connector Options'},{t:'op',v:'='},{t:'val',v:'K'},
      ],
    },
  },
};

window.MOCK = { FAMILIES, ATTRIBUTES, OPERATORS, INITIAL_RULES, INITIAL_SUGGESTIONS, DEMO_PROMPT, DEMO_GENERATED, FAMILY_DEMOS, ATTR_OPTIONS, GENERATED_RULES: [] };
