// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { notification } from 'antd';

type NotificationType = 'success' | 'info' | 'warning' | 'error';

export const Notification = (
  type: NotificationType,
  title: string,
  description: string
): void => {
  notification[type]({
    message: title,
    description,
    duration: 2
  });
};
