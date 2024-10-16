// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Keyring } from '@polkadot/keyring';

declare module '*.svg' {
  import React = require('react');

  export const ReactComponent: React.SFC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module '*.json' {
  const content: string;
  export default content;
}

declare global {
  interface Window {
    api?: ApiPromise;
    keyring?: Keyring;
  }
}
