import React from 'react';
import { STORE_BRANDS } from '../data/storeData';

export const BrandMarquee: React.FC = () => {
  return (
    <div className="bg-zinc-950 text-white py-4 overflow-hidden border-y-2 border-zinc-900 relative select-none">
      <div className="flex items-center gap-8 whitespace-nowrap animate-marquee relative z-10">
        {/* Double the list for infinite marquee */}
        {[...STORE_BRANDS, ...STORE_BRANDS].map((brand, idx) => (
          <div
            key={`${brand.name}-${idx}`}
            className="flex items-center gap-3 text-zinc-300 font-black tracking-widest text-xs sm:text-sm uppercase hover:text-white transition-colors"
          >
            <span className="font-heading tracking-wider">
              {brand.name}
            </span>
            <span className="text-red-600 text-xs">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
};

