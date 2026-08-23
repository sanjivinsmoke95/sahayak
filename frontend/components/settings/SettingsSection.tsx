import type { ReactNode } from 'react';
import { Card } from '@/components/ui';
import { Icon } from '@/components/common';

interface SettingsSectionProps {
  icon: string;
  title: string;
  description?: string;
  iconClassName?: string;
  children?: ReactNode;
}

export function SettingsSection({
  icon, title, description, iconClassName = 'text-navy-600', children,
}: SettingsSectionProps) {
  return (
    <Card className="p-5">
      <h2 className="flex items-center gap-3 text-xl font-bold">
        <Icon name={icon} className={`h-6 w-6 ${iconClassName}`} />
        {title}
      </h2>
      {description && <p className="mt-2 text-base leading-relaxed text-muted">{description}</p>}
      {children && <div className="mt-4">{children}</div>}
    </Card>
  );
}
