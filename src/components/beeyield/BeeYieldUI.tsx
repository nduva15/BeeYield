import React from 'react';
import { cn } from '@/lib/utils';
import { glass, PageHeader as GlassPageHeader } from '@/components/beeyield/GlassTheme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, LucideIcon, Hexagon } from 'lucide-react';

export function BeeYieldPageShell({
  children,
  className,
  embedded
}: {
  children: React.ReactNode;
  className?: string;
  embedded?: boolean;
}) {
  return <div className={cn(glass.page, embedded && "p-0 md:p-0 -m-0 min-h-0 pb-0", className)}>{children}</div>;
}

export function BeeYieldCard({
  children,
  className,
  padded = true,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
  onClick?: () => void;
}) {
  return (
    <div 
      className={cn(glass.card, padded && 'p-5', onClick && "cursor-pointer", className)} 
      onClick={onClick}
    >
      {children}
    </div>
  );
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
  onTabChange?: (tab: string) => void;
}) {
  const { title, subtitle, icon, label, actions, action, badge, onBack, onRefresh, onTabChange } = props;

  const badgeNode = badge ? (
    <span className={cn(
      glass.badge, 
      badge.variant === 'success' && 'border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400', 
      badge.variant === 'error' && 'border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400', 
      badge.variant === 'warning' && 'border-primary/30 bg-primary/10 text-primary-foreground dark:text-primary'
    )}>
      {badge.text}
    </span>
  ) : null;

  const headerActions = (
    <div className="flex items-center gap-2.5">
      {badgeNode}
      {onTabChange && (
        <button
          onClick={() => onTabChange('assistant')}
          className={cn(glass.btnPrimary, "gap-2 shadow-lg shadow-primary/20 h-9 px-4 text-sm")}
        >
          <Hexagon className="w-4 h-4" />
          BeeYield AI
        </button>
      )}
      {onRefresh && (
        <Button variant="outline" size="sm" className={cn(glass.btnSecondary, "h-9")} onClick={onRefresh}>
          Refresh
        </Button>
      )}
      {onBack && (
        <Button variant="outline" size="sm" className={cn(glass.btnSecondary, "h-9")} onClick={onBack}>
          Back
        </Button>
      )}
      {actions || action}
    </div>
  );

  if (!icon) {
    return (
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-border relative mb-6">
        <div className="space-y-1.5">
          {label && (
            <div className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border bg-primary/10 text-foreground/70 border-primary/20')}>
              {label}
            </div>
          )}
          <h1 className={cn(glass.sectionTitle, 'mt-1')}>{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">{subtitle}</p>}
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

export function BeeYieldSectionHeader(props: {
  title: React.ReactNode;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
}) {
  const { title, subtitle, icon: Icon, actions } = props;
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-3 border-b border-border/50 mb-4">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary" />
          </div>
        )}
        <div className="space-y-0.5">
          <h3 className="text-sm font-black text-foreground tracking-tight">{title}</h3>
          {subtitle && <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
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
    <div className={cn('flex bg-muted/30 p-1 rounded-xl border border-border/40 gap-1 w-fit', className)}>
      {tabs.map((t) => {
        const isActive = t.id === activeTab;
        return (
          <button
            key={t.id}
            type="button"
            disabled={t.disabled}
            onClick={() => onChange(t.id)}
            className={cn(
              'h-9 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center',
              isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-primary/10',
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
      <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
        <Icon className="w-6 h-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-bold text-foreground">{title}</p>
        {description && <p className="text-sm text-muted-foreground max-w-md">{description}</p>}
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
    <div className="flex items-center justify-center gap-3 py-10 text-muted-foreground">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span className="text-sm font-medium">{label}</span>
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
      <Label htmlFor={id} className="text-sm font-semibold text-muted-foreground">
        {label}
      </Label>
      {children}
      {error ? (
        <p className="text-[11px] font-semibold text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
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
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input id={id} className={cn(glass.input, 'pl-10', inputClassName)} {...props} />
    </div>
  );
}

export function BeeYieldBadge({
  children,
  variant = 'default',
  className,
}: {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
  className?: string;
}) {
  return (
    <span
      className={cn(
        glass.badge,
        variant === 'success' && 'border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400',
        variant === 'error' && 'border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400',
        variant === 'warning' && 'border-primary/30 bg-primary/10 text-primary-foreground dark:text-primary',
        className
      )}
    >
      {children}
    </span>
  );
}

