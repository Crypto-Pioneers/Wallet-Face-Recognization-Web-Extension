// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import { styled } from '../../styled.js';

interface Props {
  content: React.ReactChild;
  className?: string;
  visible?: boolean;
}

function Toast ({ className, content }: Props): React.ReactElement<Props> {
  return (
    <div className={className}>
      <p className='snackbar-content'>{content}</p>
    </div>
  );
}

export default styled(Toast)<Props>`
  position: fixed;
  display: ${({ visible }): string => visible ? 'block' : 'none'};
  height: auto;  // Allow height to adjust based on content
  max-width: 300px;  // Maximum width of the toast
  padding: 0px 20px;  // Padding around the text for better formatting
  text-align: center;
  vertical-align: middle;
  // line-height: 7px;  // Appropriate line height for potential multi-line text
  top: 460px;
  left: 50%;  // Set left to 50% of the viewport width
  transform: translateX(-50%);  // Shift it left by 50% of its own width
  && {
    margin: auto;
    border-radius: 25px;
    background: var(--highlightedAreaBackground);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);  // Optional: Adds shadow for better visibility
    overflow: hidden;  // Ensures text stays within the rounded corners
  }
`;
