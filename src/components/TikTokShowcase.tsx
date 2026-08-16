import React from 'react';
import { TrendingUp, Play, Heart, Eye, ArrowUpRight, ExternalLink } from 'lucide-react';
import { TikTokVideo } from '../types';
import { TIKTOK_VIDEOS, STORE_INFO } from '../data/storeData';

interface TikTokShowcaseProps {
  videos?: TikTokVideo[];
}

export const TikTokShowcase: React.FC<TikTokShowcaseProps> = ({ videos = TIKTOK_VIDEOS }) => {
  return (
    <section id="tiktok" className="py-16 bg-white relative border-t-2 border-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-950 text-white text-xs font-black uppercase tracking-widest border border-zinc-800">
              <span className="w-2 h-2 rounded-full bg-red-600" />
              Comunidad &amp; Redes Sociales
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tighter uppercase font-heading">
              Síguenos en TikTok <span className="text-red-600">{STORE_INFO.tiktokHandle}</span>
            </h2>
            
            <p className="text-zinc-600 text-sm sm:text-base font-medium">
              Descubre los nuevos drops antes que nadie, outfits virales y el ambiente de nuestra tienda física en El Roble, Puntarenas.
            </p>
          </div>

          {/* Follow Stats Card with clean design */}
          <div className="flex items-center gap-4 p-4 rounded-3xl bg-zinc-50 border-2 border-zinc-950 shrink-0 shadow-sm">
            <div className="text-center px-3 border-r-2 border-zinc-200">
              <div className="text-xl font-black text-zinc-950 font-mono">{STORE_INFO.followersTikTok}</div>
              <div className="text-[11px] text-zinc-500 uppercase font-black">Seguidores</div>
            </div>

            <div className="text-center px-3 border-r-2 border-zinc-200">
              <div className="text-xl font-black text-red-600 font-mono">{STORE_INFO.likesTikTok}</div>
              <div className="text-[11px] text-zinc-500 uppercase font-black">Me Gusta</div>
            </div>

            <a
              href={STORE_INFO.tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-2xl bg-zinc-950 hover:bg-zinc-900 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all hover:scale-105 border border-zinc-800"
            >
              <span>Seguir en TikTok</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-red-500" />
            </a>
          </div>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {videos.map((video) => (
            <a
              key={video.id}
              href={video.url || STORE_INFO.tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative rounded-3xl overflow-hidden bg-zinc-950 border-2 border-zinc-950 hover:border-red-600 transition-all duration-300 hover:shadow-xl flex flex-col justify-end aspect-[9/14]"
            >
              {/* Video Thumbnail Background */}
              <img
                src={video.thumbnail}
                alt={video.title}
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Gradient Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-black/20 group-hover:opacity-90 transition-opacity" />

              {/* Top Video Badges */}
              <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
                <span className="px-2.5 py-0.5 rounded-md bg-zinc-950 text-white text-[10px] font-black uppercase tracking-wide border border-zinc-800 shadow">
                  {video.tag}
                </span>

                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] text-white font-mono font-bold">
                  <Play className="w-2.5 h-2.5 fill-white text-white" />
                  <span>{video.duration}</span>
                </div>
              </div>

              {/* Play Center Icon on Hover */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl transform scale-75 group-hover:scale-100 transition-transform">
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                </div>
              </div>

              {/* Video Information Body */}
              <div className="relative z-10 p-4 space-y-2 text-white">
                <p className="text-xs font-bold line-clamp-2 leading-relaxed">
                  {video.title}
                </p>

                <div className="flex items-center justify-between text-xs pt-1.5 border-t border-white/20 text-zinc-300">
                  <span className="flex items-center gap-1 font-mono font-black text-white">
                    <Eye className="w-3.5 h-3.5 text-zinc-400" />
                    {video.views} vistas
                  </span>
                  <span className="flex items-center gap-1 font-mono text-red-400 font-black">
                    <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                    {video.likes}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

