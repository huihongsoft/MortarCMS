import React from 'react';
import { AuroraList, AuroraPageHeader } from './Shared';
import { t } from '../../lib/i18n';

export default function CategoryLayout(props: any) {
  const { settings, catSlug } = props;
  return React.createElement('div', { className: 'max-w-3xl mx-auto px-6 pb-4' },
    React.createElement(AuroraPageHeader, { kicker: t('category', settings), title: (catSlug || '').replace(/-/g, ' ') }),
    React.createElement(AuroraList, props),
  );
}
