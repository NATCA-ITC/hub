// Source list of NATCA "topics" — councils, standing committees, and cross-cutting
// areas that surface as discussion / news / documents in Hub. Mirrors the Discord
// TOPICS category. Lead names are placeholders from Nick's council-structure draft
// and will be backfilled from the MyNATCA position registry once that wiring lands.

export type TopicType = 'council' | 'standing-committee' | 'cross-cutting'

export interface TopicLead {
  role: string
  name: string
}

export interface TopicCommittee {
  name: string
  abbr?: string
  lead?: string
}

export interface Topic {
  slug: string
  name: string
  type: TopicType
  icon: string
  description: string
  leads?: TopicLead[]
  committees?: TopicCommittee[]
}

export const topics: Topic[] = [
  // ---------------- Councils ----------------
  {
    slug: 'training-education',
    name: 'Training & Education Council',
    type: 'council',
    icon: 'mdi-school-outline',
    description: 'Coordinates representative training, leadership development, and member education programs.',
    leads: [
      { role: 'Council Lead (RVP)', name: 'Clint' },
      { role: 'Co-Lead', name: 'NTC Chair' },
    ],
    committees: [
      { name: 'National Training Committee', abbr: 'NTC', lead: '4 RVPs — Mike, Clint, Mark, Steph' },
      { name: 'Reloaded', lead: 'Chair' },
    ],
  },
  {
    slug: 'employee-wellness',
    name: 'Employee Wellness Council',
    type: 'council',
    icon: 'mdi-heart-pulse',
    description: 'Member health, mental wellness, family support, and benefits programs.',
    leads: [
      { role: 'Council Lead (RVP)', name: 'Kevin' },
      { role: 'Co-Lead', name: 'CISM Chair' },
    ],
    committees: [
      { name: 'Critical Incident Stress Management', abbr: 'CISM', lead: 'Chair' },
      { name: 'Employee Assistance Program', abbr: 'EAP', lead: 'Chair' },
      { name: 'Drug & Alcohol', abbr: 'DAC', lead: 'Chair (2 RVPs by Charter — Kevin & Aaron)' },
      { name: 'Childcare', lead: 'A114' },
      { name: 'Union Synergy', lead: 'Chair (1 RVP by Charter — Mark; EVP ex-officio)' },
      { name: 'Benefits', lead: 'Chair' },
      { name: 'Human Performance Rep' },
    ],
  },
  {
    slug: 'representation-advocacy',
    name: 'Representation & Advocacy Council',
    type: 'council',
    icon: 'mdi-account-tie-voice',
    description: 'Grievance handling, FacRep coordination, onboarding, and elections.',
    leads: [
      { role: 'Council Lead (RVP)', name: 'John' },
      { role: 'Co-Lead', name: 'Onboarding Co-Chair' },
    ],
    committees: [
      { name: 'Grievance Review Team', abbr: 'GRT', lead: '2 RVPs — John & Joel' },
      { name: 'Core 30 Group', lead: 'Chair' },
      { name: 'Center FacRep Group', lead: 'Chair' },
      { name: 'TRACON FacRep Group', lead: 'Chair' },
      { name: 'Level 4-9 Group', lead: 'NEB Member (temporary)' },
      { name: 'FCT Group', lead: 'NEB Member (temporary)' },
      { name: 'Onboarding', lead: 'Chair (2 RVPs by Charter — Dan & John)' },
      { name: 'National Election Committee', abbr: 'NEC', lead: 'Chair' },
      { name: 'Election Support Committee', abbr: 'ESC', lead: 'Chair (1 RVP — Steph)' },
    ],
  },
  {
    slug: 'collaboration-professionalism',
    name: 'Collaboration & Professionalism Council',
    type: 'council',
    icon: 'mdi-handshake-outline',
    description: 'Labor-management collaboration, professional standards, and the early-career pipeline.',
    leads: [
      { role: 'Council Lead (RVP)', name: 'Joel' },
      { role: 'Co-Lead', name: 'Collaboration Lead' },
    ],
    committees: [
      { name: 'Collaboration Oversight Group', abbr: 'COG', lead: 'Up to 7 reps; 2 RVPs — Joel & John' },
      { name: 'Collaboration Facilitators', abbr: 'CF', lead: 'Member Lead' },
      { name: 'Right From the Start', abbr: 'RFTS', lead: 'Member Lead' },
      { name: 'Professional Standards', abbr: 'ProStan', lead: 'Member Lead' },
    ],
  },
  {
    slug: 'safety-technology',
    name: 'Safety & Technology Council',
    type: 'council',
    icon: 'mdi-shield-star-outline',
    description: 'National safety, airspace procedures, and security/ASI oversight.',
    leads: [
      { role: 'Council Lead (RVP)', name: 'Aaron' },
      { role: 'Co-Lead', name: 'National Safety Rep' },
    ],
    committees: [
      { name: 'Safety & Technology Leadership Council', abbr: 'NSTLC', lead: '2 RVPs — Aaron & Mike' },
      { name: 'National Safety Committee', abbr: 'NSC', lead: 'Chair' },
      { name: 'National Airspace Procedures Committee', abbr: 'NAPC', lead: 'Chair' },
      { name: 'Security Breach', lead: 'Member Lead' },
      { name: 'Air Safety Investigations', abbr: 'ASI', lead: 'Chair' },
    ],
  },
  {
    slug: 'employee-movement',
    name: 'Employee Movement Council',
    type: 'council',
    icon: 'mdi-swap-horizontal-bold',
    description: 'NCEPT, NEST, hardships, academy oversight, and reasonable accommodations.',
    leads: [
      { role: 'Council Lead (RVP)', name: 'Dan' },
      { role: 'Co-Lead', name: 'National Training Rep' },
    ],
    committees: [
      { name: 'NCEPT', lead: 'Member Lead' },
      { name: 'NEST', lead: 'Member Lead or RVP' },
      { name: 'Hardships', lead: 'Member Lead' },
      { name: 'Academy Oversight', lead: 'National Training Rep' },
      { name: 'Reasonable Accommodations', lead: 'Point of Contact (to be created)' },
      { name: 'Deviations', lead: 'Point of Contact' },
    ],
  },
  {
    slug: 'facility-issues',
    name: 'Facility Issues Council',
    type: 'council',
    icon: 'mdi-office-building-cog',
    description: 'Workplace health & safety, OWCP, and facility-level CBA articles.',
    leads: [
      { role: 'Council Lead (RVP)', name: 'Steph' },
      { role: 'Co-Lead', name: 'OSHA Chair' },
    ],
    committees: [
      { name: 'Occupational Safety & Health', abbr: 'OSHA', lead: 'Chair' },
      { name: 'Office of Workers’ Comp Programs', abbr: 'OWCP', lead: 'Chair' },
      { name: 'Article 804 / 76', lead: 'CBA / Member Lead' },
    ],
  },
  {
    slug: 'metrics',
    name: 'Metrics Council',
    type: 'council',
    icon: 'mdi-chart-box',
    description: 'Operational metrics, validation, and data-driven oversight.',
    leads: [
      { role: 'Council Lead', name: 'TBD' },
    ],
    committees: [
      { name: 'ABACUS', lead: 'Member Lead — Dan (5 members currently; 4 by agreement)' },
      { name: 'National Validation Team', abbr: 'NVT', lead: 'Member Lead — Mike' },
    ],
  },
  {
    slug: 'membership-services',
    name: 'Membership Services Council',
    type: 'council',
    icon: 'mdi-card-account-details',
    description: 'Veterans, communications, IT, pay review, and member services programs.',
    leads: [
      { role: 'Council Lead (RVP)', name: 'Mark' },
      { role: 'Co-Lead', name: 'Communications Chair' },
    ],
    committees: [
      { name: 'Veterans Committee', lead: 'Kevin (also serves on AFL-CIO Veteran Council)' },
      { name: 'Pay Review Team', lead: 'Chair' },
      { name: 'Historical Committee', lead: 'Chair' },
      { name: 'Seniority Team', lead: '1 RVP — Drew' },
      { name: 'Information Technology Committee', abbr: 'ITC', lead: 'Member Lead (2 RVPs — Aaron & Dan); chair status TBD' },
      { name: 'Communications Committee', abbr: 'Comms', lead: 'Drew' },
      { name: 'Disaster Response Committee', abbr: 'DRC', lead: 'Chair' },
      { name: 'RNAV', lead: 'Chair' },
    ],
  },

  // ---------------- Standing Committees ----------------
  {
    slug: 'finance',
    name: 'Finance',
    type: 'standing-committee',
    icon: 'mdi-cash',
    description: 'Standing committee — NATCA financial operations, budget, and audit.',
    leads: [{ role: 'Lead', name: 'Mick' }],
  },
  {
    slug: 'organizing',
    name: 'Organizing',
    type: 'standing-committee',
    icon: 'mdi-account-multiple-plus',
    description: 'Standing committee — new bargaining units and organizing support.',
    leads: [{ role: 'Lead', name: 'Mick' }],
  },
  {
    slug: 'legislative-committee',
    name: 'Legislative (Standing Committee)',
    type: 'standing-committee',
    icon: 'mdi-bank-outline',
    description: 'Standing committee — congressional advocacy and legislative strategy.',
    leads: [{ role: 'Lead', name: 'Nick' }],
  },
  {
    slug: 'safety-committee',
    name: 'Safety (Standing Committee)',
    type: 'standing-committee',
    icon: 'mdi-shield-outline',
    description: 'Standing committee — overall safety policy and FAA collaboration.',
    leads: [{ role: 'Lead', name: 'Nick' }],
  },
  {
    slug: 'constitution',
    name: 'Constitution',
    type: 'standing-committee',
    icon: 'mdi-gavel',
    description: 'Standing committee — interprets and amends the NATCA constitution.',
    leads: [{ role: 'Lead', name: 'Nick' }],
  },

  // ---------------- Cross-cutting Topics ----------------
  {
    slug: 'national',
    name: 'National',
    type: 'cross-cutting',
    icon: 'mdi-flag-variant',
    description: 'Member-wide announcements, NEB updates, and organization-level news.',
  },
  {
    slug: 'legislative',
    name: 'Legislative',
    type: 'cross-cutting',
    icon: 'mdi-bank',
    description: 'Broader legislative discussion — bills, calls to action, NATCA PAC, NIW.',
  },
  {
    slug: 'events',
    name: 'Events',
    type: 'cross-cutting',
    icon: 'mdi-calendar-star',
    description: 'NATCA national events — Convention, CFS, NIW, ATX, regional gatherings.',
  },
  {
    slug: 'labor-relations',
    name: 'Labor Relations',
    type: 'cross-cutting',
    icon: 'mdi-scale-balance',
    description: 'Contract enforcement, grievances, MOUs, and FAA labor-relations posture.',
  },
]

export const topicsBySlug: Record<string, Topic> = Object.fromEntries(
  topics.map(t => [t.slug, t]),
)

export const topicTypeLabel: Record<TopicType, string> = {
  council: 'Council',
  'standing-committee': 'Standing Committee',
  'cross-cutting': 'Topic',
}
