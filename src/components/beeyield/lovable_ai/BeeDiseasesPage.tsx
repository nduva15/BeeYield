import React from 'react';
import { X, Search, AlertTriangle, Activity, Microscope, ShieldCheck, Bug, Waves, Leaf } from 'lucide-react';
import { BeeYieldBadge, BeeYieldCard, BeeYieldEmptyState, BeeYieldPageHeader, BeeYieldPageShell, BeeYieldSection } from '../BeeYieldUI';
import { beeHealthData, SymptomDetail } from '@/data/beeHealthData';
import { cn } from '@/lib/utils';

type RiskLevel = SymptomDetail['riskLevel'];
type PathogenCategory = 'Bacterial' | 'Viral' | 'Fungal' | 'Microsporidian' | 'Parasitic' | 'Predator' | 'Environmental';

interface DiseaseEntry extends SymptomDetail {
  name: string;
  category: PathogenCategory;
}

interface BeeDiseasesPageProps {
  isOpen: boolean;
  onClose: () => void;
  embedded?: boolean;
}

const RISK_ORDER: Record<RiskLevel, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

const CATEGORY_ICONS: Record<PathogenCategory, React.ElementType> = {
  Bacterial: Microscope,
  Viral: Activity,
  Fungal: Leaf,
  Microsporidian: Waves,
  Parasitic: Bug,
  Predator: AlertTriangle,
  Environmental: ShieldCheck,
};

const inferCategory = (name: string, detail: SymptomDetail): PathogenCategory => {
  const source = `${name} ${detail.scientificName || ''} ${detail.signs} ${detail.symptoms} ${detail.transmission}`.toLowerCase();

  if (source.includes('nosema') || source.includes('microsporidia')) return 'Microsporidian';
  if (source.includes('virus') || source.includes('cbpv') || source.includes('iapv') || source.includes('sbv') || source.includes('kbv') || source.includes('dwv') || source.includes('lsv')) return 'Viral';
  if (source.includes('foulbrood') || source.includes('serratia') || source.includes('bacillus') || source.includes('pseudomonas')) return 'Bacterial';
  if (source.includes('ascosphaera') || source.includes('aspergillus') || source.includes('fungal') || source.includes('mycelial')) return 'Fungal';
  if (source.includes('hornet') || source.includes('wasp') || source.includes('fly') || source.includes('bird') || source.includes('bear')) return 'Predator';
  if (source.includes('varroa') || source.includes('mite') || source.includes('beetle') || source.includes('moth') || source.includes('acarapis') || source.includes('louse') || source.includes('nematode') || source.includes('parasite')) return 'Parasitic';
  return 'Environmental';
};

const RISK_BADGE_VARIANT: Record<RiskLevel, 'error' | 'warning' | 'success' | 'default'> = {
  CRITICAL: 'error',
  HIGH: 'warning',
  MEDIUM: 'default',
  LOW: 'success',
};

const DISEASE_ENTRIES: DiseaseEntry[] = Object.entries(beeHealthData)
  .map(([name, detail]) => ({
    name,
    ...detail,
    category: inferCategory(name, detail),
  }))
  .sort((left, right) => {
    const riskDifference = RISK_ORDER[left.riskLevel] - RISK_ORDER[right.riskLevel];
    if (riskDifference !== 0) return riskDifference;
    return left.name.localeCompare(right.name);
  });

const PATHOGEN_CATEGORIES: Array<PathogenCategory | 'All'> = [
  'All',
  'Bacterial',
  'Viral',
  'Fungal',
  'Microsporidian',
  'Parasitic',
  'Predator',
  'Environmental',
];

export default function BeeDiseasesPage({ isOpen, onClose, embedded = false }: BeeDiseasesPageProps) {
  const [search, setSearch] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState<PathogenCategory | 'All'>('All');
  const [riskFilter, setRiskFilter] = React.useState<RiskLevel | 'All'>('All');
  const [selectedName, setSelectedName] = React.useState<string>(DISEASE_ENTRIES[0]?.name || '');

  const filteredEntries = React.useMemo(() => {
    const needle = search.trim().toLowerCase();

    return DISEASE_ENTRIES.filter((entry) => {
      const matchesSearch = !needle || [
        entry.name,
        entry.scientificName,
        entry.signs,
        entry.symptoms,
        entry.detection,
        entry.treatment,
        entry.prevention,
        entry.transmission,
        entry.category,
      ].some((value) => String(value || '').toLowerCase().includes(needle));

      const matchesCategory = categoryFilter === 'All' || entry.category === categoryFilter;
      const matchesRisk = riskFilter === 'All' || entry.riskLevel === riskFilter;

      return matchesSearch && matchesCategory && matchesRisk;
    });
  }, [categoryFilter, riskFilter, search]);

  React.useEffect(() => {
    if (filteredEntries.length === 0) return;
    if (!filteredEntries.some((entry) => entry.name === selectedName)) {
      setSelectedName(filteredEntries[0].name);
    }
  }, [filteredEntries, selectedName]);

  const selectedEntry = filteredEntries.find((entry) => entry.name === selectedName)
    || DISEASE_ENTRIES.find((entry) => entry.name === selectedName)
    || filteredEntries[0]
    || null;

  const riskCounts = React.useMemo(() => ({
    CRITICAL: DISEASE_ENTRIES.filter((entry) => entry.riskLevel === 'CRITICAL').length,
    HIGH: DISEASE_ENTRIES.filter((entry) => entry.riskLevel === 'HIGH').length,
    MEDIUM: DISEASE_ENTRIES.filter((entry) => entry.riskLevel === 'MEDIUM').length,
    LOW: DISEASE_ENTRIES.filter((entry) => entry.riskLevel === 'LOW').length,
  }), []);

  const content = (
    <BeeYieldPageShell className={embedded ? 'p-0 md:p-0 -m-0 min-h-0 pb-0' : ''}>
      <BeeYieldPageHeader
        icon={Activity}
        label="Health Database"
        title="Pathogen Database"
        subtitle={`${DISEASE_ENTRIES.length} pathogen, pest, and hive-risk records with detection, treatment, and prevention protocols.`}
        onBack={onClose}
      />

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {([
            { label: 'Critical', value: riskCounts.CRITICAL, variant: 'error' as const },
            { label: 'High', value: riskCounts.HIGH, variant: 'warning' as const },
            { label: 'Medium', value: riskCounts.MEDIUM, variant: 'default' as const },
            { label: 'Low', value: riskCounts.LOW, variant: 'success' as const },
          ]).map((item) => (
            <BeeYieldCard key={item.label} className="space-y-2">
              <BeeYieldBadge variant={item.variant}>{item.label} risk</BeeYieldBadge>
              <div className="text-3xl font-black tracking-tight text-foreground">{item.value}</div>
            </BeeYieldCard>
          ))}
        </div>

        <BeeYieldSection className="p-5 space-y-5">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.7fr)_220px_180px]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search disease, pathogen, symptom, treatment, or transmission..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-12 w-full rounded-2xl border border-border bg-card pl-11 pr-4 text-sm font-semibold text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value as PathogenCategory | 'All')}
              className="h-12 rounded-2xl border border-border bg-card px-4 text-sm font-semibold text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
              aria-label="Filter by pathogen category"
            >
              {PATHOGEN_CATEGORIES.map((option) => (
                <option key={option} value={option}>{option === 'All' ? 'All categories' : option}</option>
              ))}
            </select>

            <select
              value={riskFilter}
              onChange={(event) => setRiskFilter(event.target.value as RiskLevel | 'All')}
              className="h-12 rounded-2xl border border-border bg-card px-4 text-sm font-semibold text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
              aria-label="Filter by risk level"
            >
              {(['All', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as Array<RiskLevel | 'All'>).map((option) => (
                <option key={option} value={option}>{option === 'All' ? 'All risk levels' : option}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <BeeYieldBadge>{filteredEntries.length} matching records</BeeYieldBadge>
            <span className="text-xs text-muted-foreground">
              Search matches signs, symptoms, detection, treatment, prevention, and transmission notes.
            </span>
          </div>
        </BeeYieldSection>

        {filteredEntries.length === 0 ? (
          <BeeYieldEmptyState
            icon={AlertTriangle}
            title="No pathogen records match the current filters"
            description="Reset the search or broaden the category and risk filters to bring records back into view."
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(340px,0.9fr)_minmax(0,1.1fr)]">
            <BeeYieldSection className="overflow-hidden">
              <div className="border-b border-border px-5 py-4">
                <h3 className="text-sm font-black tracking-tight text-foreground">Database Records</h3>
                <p className="mt-1 text-xs text-muted-foreground">Select a condition to inspect the full protocol.</p>
              </div>
              <div className="max-h-[760px] overflow-y-auto p-3">
                <div className="space-y-2">
                  {filteredEntries.map((entry) => {
                    const CategoryIcon = CATEGORY_ICONS[entry.category];
                    const isSelected = entry.name === selectedName;

                    return (
                      <button
                        key={entry.name}
                        type="button"
                        onClick={() => setSelectedName(entry.name)}
                        className={cn(
                          'w-full rounded-2xl border p-4 text-left transition-all',
                          isSelected
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-border bg-card hover:border-primary/30 hover:bg-muted/20'
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                              <CategoryIcon className="h-4 w-4 shrink-0 text-primary" />
                              <h4 className="truncate text-sm font-black tracking-tight text-foreground">{entry.name}</h4>
                            </div>
                            <p className="truncate text-xs font-semibold text-muted-foreground">{entry.scientificName || 'Scientific classification pending'}</p>
                          </div>
                          <BeeYieldBadge variant={RISK_BADGE_VARIANT[entry.riskLevel]}>{entry.riskLevel}</BeeYieldBadge>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <BeeYieldBadge className="border-border bg-muted/20 text-foreground">{entry.category}</BeeYieldBadge>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </BeeYieldSection>

            {selectedEntry ? (
              <div className="space-y-6">
                <BeeYieldSection className="p-6 space-y-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <BeeYieldBadge variant={RISK_BADGE_VARIANT[selectedEntry.riskLevel]}>{selectedEntry.riskLevel}</BeeYieldBadge>
                        <BeeYieldBadge className="border-border bg-muted/20 text-foreground">{selectedEntry.category}</BeeYieldBadge>
                      </div>
                      <div>
                        <h2 className="text-2xl font-black tracking-tight text-foreground">{selectedEntry.name}</h2>
                        <p className="mt-1 text-sm font-semibold text-muted-foreground">
                          {selectedEntry.scientificName || 'Scientific classification pending'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <BeeYieldCard className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/70">Visible signs</p>
                      <p className="text-sm text-foreground">{selectedEntry.signs}</p>
                    </BeeYieldCard>
                    <BeeYieldCard className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/70">Colony symptoms</p>
                      <p className="text-sm text-foreground">{selectedEntry.symptoms}</p>
                    </BeeYieldCard>
                    <BeeYieldCard className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/70">Detection protocol</p>
                      <p className="text-sm text-foreground">{selectedEntry.detection}</p>
                    </BeeYieldCard>
                    <BeeYieldCard className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/70">Transmission path</p>
                      <p className="text-sm text-foreground">{selectedEntry.transmission}</p>
                    </BeeYieldCard>
                  </div>
                </BeeYieldSection>

                <BeeYieldSection className="p-6 space-y-5">
                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    <div className="space-y-3">
                      <h3 className="text-sm font-black tracking-tight text-foreground">Treatment</h3>
                      <div className="rounded-2xl border border-border bg-card p-4">
                        <p className="text-sm text-foreground leading-relaxed">{selectedEntry.treatment}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-sm font-black tracking-tight text-foreground">Prevention</h3>
                      <div className="rounded-2xl border border-border bg-card p-4">
                        <p className="text-sm text-foreground leading-relaxed">{selectedEntry.prevention}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-black tracking-tight text-foreground">Immediate field steps</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedEntry.steps.map((step) => (
                        <span
                          key={step}
                          className="rounded-xl border border-border bg-muted/20 px-3 py-2 text-xs font-bold text-foreground"
                        >
                          {step}
                        </span>
                      ))}
                    </div>
                  </div>

                  {selectedEntry.references && selectedEntry.references.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-black tracking-tight text-foreground">References</h3>
                      <div className="space-y-2">
                        {selectedEntry.references.map((reference) => (
                          <div key={reference} className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground">
                            {reference}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </BeeYieldSection>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </BeeYieldPageShell>
  );

  if (embedded) return content;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-opacity p-4 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`bg-white rounded-3xl w-full h-[90vh] max-w-6xl shadow-2xl relative transition-all transform overflow-hidden ${isOpen ? 'scale-100' : 'scale-95'}`}>
        <button onClick={onClose} className="absolute top-8 right-8 p-2 rounded-full hover:bg-muted transition-colors z-50" aria-label="Close pathogen database">
          <X className="w-5 h-5" />
        </button>
        <div className="h-full overflow-y-auto custom-scroll p-8">{content}</div>
      </div>
    </div>
  );
}
