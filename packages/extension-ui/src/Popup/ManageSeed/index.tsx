// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import { useTranslation } from '../../hooks/index.js';
import { Header } from '../../partials/index.js';
import { styled } from '../../styled.js';

interface Props {
  className?: string;
}

function ManageSeed ({ className }: Props): React.ReactElement {
  const { t } = useTranslation();

  return (
    <>
      <Header
        className={className}
        text={t('Manage seed')}
      />
    </>
  );
}

export default styled(ManageSeed)<Props>`
  margin-bottom: 16px;

  label::after {
    right: 36px;
  }
`;
