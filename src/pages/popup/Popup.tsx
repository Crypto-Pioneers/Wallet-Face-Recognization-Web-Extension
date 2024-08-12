import React from 'react';
import Home from '@src/components/home';

export default function Popup(): JSX.Element {
  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 text-center h-full bg-[#07385e]">
      {
        <Home />
      }
    </div>
  );
}
