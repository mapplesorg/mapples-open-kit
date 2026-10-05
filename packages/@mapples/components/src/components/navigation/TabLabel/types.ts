/** When a tab's label shows. */
export const TAB_LABEL_SHOW_WHEN = ['always', 'active', 'inactive'] as const;
export type TabLabelShowWhen = (typeof TAB_LABEL_SHOW_WHEN)[number];
