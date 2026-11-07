import React, { useEffect, useState } from 'react';
import type { ActiveTab, Lang, Theme } from '../types';
import {
  LIFE_DATA_EVENT,
  LIFE_STORAGE_KEY,
  loadLifeData,
  type LifeData,
} from '../lib/lifeStore';
import { ReminderCard } from './ReminderCard';

interface DashboardReminderCardProps {
  lang: Lang;
  theme: Theme;
  onNavigate: (tab: ActiveTab) => void;
}

/**
 * Keeps the dashboard reminder surface in lock-step with Life Hub edits from
 * this view, another route, or another browser tab.
 */
export const DashboardReminderCard: React.FC<DashboardReminderCardProps> = ({
  lang,
  theme,
  onNavigate,
}) => {
  const [data, setData] = useState<LifeData>(() => loadLifeData());

  useEffect(() => {
    const reload = () => setData(loadLifeData());
    const onStorage = (event: StorageEvent) => {
      if (event.key === LIFE_STORAGE_KEY || event.key === null) reload();
    };
    window.addEventListener(LIFE_DATA_EVENT, reload);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(LIFE_DATA_EVENT, reload);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return (
    <ReminderCard
      data={data}
      lang={lang}
      theme={theme}
      onOpenLife={() => onNavigate('life')}
    />
  );
};

export default DashboardReminderCard;
