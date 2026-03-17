import React from 'react';
import { cn } from '@/lib/utils';
import { glass, PageHeader as GlassPageHeader } from '@/components/beeyield/GlassTheme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, LucideIcon } from 'lucide-react';

export function BeeYieldPageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn(glass.page, className)}>{children}</div>;
}

export function BeeYieldCard({
  children,
  className,
  padded = true,
}: {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return <div className={cn(glass.card, padded && 'p-5', className)}>{children}</div>;
}

export function BeeYieldSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={cn(glass.section, className)}>{children}</section>;
}

type HeaderBadge =
  | { text: string; variant?: 'default' | 'success' | 'warning' | 'error' }
  | undefined;

export function BeeYieldPageHeader(props: {
  title: React.ReactNode;
  subtitle?: string;
  icon?: LucideIcon;
  label?: string;
  actions?: React.ReactNode;
  action?: React.ReactNode;
  badge?: HeaderBadge;
  onBack?: () => void;
  onRefresh?: () => void;
}) {
  // We keep the GlassTheme header look, but allow some extra hooks.
  // Badge/back/refresh are implemented as actions to avoid redesigning the header layout.
  const { title, subtitle, icon, label, actions, action, badge, onBack, onRefresh } = props;

  const badgeNode = badge ? (
    <span className={cn(glass.badge, badge.variant === 'success' && 'border-[#1B9157]/30 bg-[#1B9157]/10', badge.variant === 'error' && 'border-red-500/20 bg-red-500/10 text-red-600', badge.variant === 'warning' && 'border-[#F4D03F]/30 bg-[#F4D03F]/10')}>
      {badge.text}
    </span>
  ) : null;

  const headerActions = (
    <div className="flex items-center gap-2.5">
      {badgeNode}
      {onRefresh && (
        <Button variant="outline" size="sm" className="h-9 rounded-lg border-[#F4D03F]/40 bg-[#FFF9F0] hover:bg-[#F4D03F]/10" onClick={onRefresh}>
          Refresh
        </Button>
      )}
      {onBack && (
        <Button variant="outline" size="sm" className="h-9 rounded-lg border-[#F4D03F]/40 bg-[#FFF9F0] hover:bg-[#F4D03F]/10" onClick={onBack}>
          Back
        </Button>
      )}
      {actions || action}
    </div>
  );

  if (!icon) {
    // Fallback to a simple header if no icon is provided
    return (
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-[#F4D03F]/20 relative mb-6">
        <div className="space-y-1.5">
          {label && (
            <div className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border bg-[#F4D03F]/10 text-[#F4D03F] border-[#F4D03F]/20')}>
              {label}
            </div>
          )}
          <h1 className={cn(glass.sectionTitle, 'mt-1')}>{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 max-w-2xl leading-relaxed">{subtitle}</p>}
        </div>
        {headerActions}
      </div>
    );
  }

  return (
    <GlassPageHeader
      icon={icon}
      label={label}
      title={title}
      subtitle={subtitle}
      actions={headerActions}
    />
  );
}

export function BeeYieldTabBar({
  tabs,
  activeTab,
  onChange,
  className,
}: {
  tabs: Array<{ id: string; label: string; disabled?: boolean }>;
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div className={cn('flex bg-white/40 p-1 rounded-xl border border-white/40 gap-1 w-fit', className)}>
      {tabs.map((t) => {
        const isActive = t.id === activeTab;
        return (
          <button
            key={t.id}
            type="button"
            disabled={t.disabled}
            onClick={() => onChange(t.id)}
            className={cn(
              'h-9 px-4 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all flex items-center justify-center',
              isActive ? 'bg-[#F4D03F] text-[#1A1A1A] shadow-sm' : 'text-gray-600 hover:text-[#1A1A1A] hover:bg-[#F4D03F]/10',
              t.disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

export function BeeYieldEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className={glass.emptyState}>
      <div className="w-12 h-12 rounded-xl bg-[#F4D03F]/10 border border-[#F4D03F]/20 flex items-center justify-center">
        <Icon className="w-6 h-6 text-gray-500" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-bold text-[#1A1A1A]">{title}</p>
        {description && <p className="text-sm text-gray-500 max-w-md">{description}</p>}
      </div>
      {action && (
        <Button className={glass.btnPrimary} onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

export function BeeYieldLoading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-10 text-[#1A1A1A]/70">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span className={glass.microLabel}>{label}</span>
    </div>
  );
}

export function BeeYieldFormField({
  id,
  label,
  hint,
  error,
  children,
  className,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={id} className={cn(glass.microLabel, 'text-[#1A1A1A]/70')}>
        {label}
      </Label>
      {children}
      {error ? (
        <p className="text-[11px] font-semibold text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-[11px] text-gray-500">{hint}</p>
      ) : null}
    </div>
  );
}

export function BeeYieldTextInput({
  id,
  icon: Icon,
  className,
  inputClassName,
  ...props
}: React.ComponentProps<typeof Input> & {
  id: string;
  icon?: LucideIcon;
  className?: string;
  inputClassName?: string;
}) {
  if (!Icon) {
    return <Input id={id} className={cn(glass.input, inputClassName)} {...props} />;
  }

  return (
    <div className={cn('relative', className)}>
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <Input id={id} className={cn(glass.input, 'pl-10', inputClassName)} {...props} />
    </div>
  );
}

