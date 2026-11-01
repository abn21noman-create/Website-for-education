import React from 'react';
import { Lang, Theme } from '../types';
import { DRILL_BANKS } from '../data/drillBanks';
import { DrillView } from './DrillView';

interface GkDrillViewProps {
  lang: Lang;
  theme: Theme;
}

/**
 * Quick-drill route (`/#/gk`).
 *
 * The route dates from when only general knowledge lived here; it now hosts
 * every drill bank (GK for the medical paper, English grammar for both exams)
 * through one shared engine, so new banks never need a new route.
 */
export const GkDrillView: React.FC<GkDrillViewProps> = ({ lang, theme }) => (
  <DrillView lang={lang} theme={theme} banks={DRILL_BANKS} />
);
