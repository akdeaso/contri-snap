'use client';

import { MessageSquare, FileText, Heart, Star, TrendingUp, Award, Calendar } from 'lucide-react';
import { clsx } from 'clsx';
import type { ContributorData } from '@/types';
import { BADGE_COLORS, LEADERBOARD_WIDTH, LEADERBOARD_HEIGHT, BADGE_TYPES, DEFAULT_GROUP_NAME } from '@/constants';
import { getCurrentMonth, getCurrentYear } from '@/utils/date';

interface LeaderboardProps {
  data: ContributorData;
}

export function Leaderboard({ data }: LeaderboardProps) {
  const getBadgeColor = (badge: string | null) => {
    return badge ? BADGE_COLORS[badge] || BADGE_COLORS.default : BADGE_COLORS.default;
  };

  const getBadgeIcon = (badge: string | null) => {
    switch (badge) {
      case BADGE_TYPES.ALL_STAR:
        return <Star className="h-3.5 w-3.5" />;
      case BADGE_TYPES.TOP:
        return <Award className="h-3.5 w-3.5" />;
      case BADGE_TYPES.RISING:
        return <TrendingUp className="h-3.5 w-3.5" />;
      default:
        return null;
    }
  };

  const top1 = data.contributors[0];
  const top2 = data.contributors[1];
  const top3 = data.contributors[2];
  const remaining = data.contributors.slice(3, 10);

  const backgroundImage = data.backgroundImage;
  const scale = data.backgroundScale || 1;
  const position = data.backgroundPosition || { x: 0, y: 0 };

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-slate-900"
      style={{
        width: `${LEADERBOARD_WIDTH}px`,
        height: `${LEADERBOARD_HEIGHT}px`,
      }}
    >
      {/* Background Image Layer */}
      {backgroundImage ? (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            src={backgroundImage}
            alt="Background"
            crossOrigin="anonymous"
            className="absolute inset-0 w-full h-full object-contain transition-transform duration-75 ease-linear origin-center"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            }}
          />
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/85 via-slate-900/75 to-slate-900/85"></div>
        </div>
      ) : (
        /* Fallback Gradient Background */
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_50%,#0f172a_100%)]">
          {/* Ambient background effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
            <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl transform -translate-x-1/2"></div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col px-8 py-6">
        {/* Date Badge - Top Right */}
        <div className="absolute top-6 right-6 z-20">
          <div className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-600/50 shadow-2xl">
            <div className="p-1.5 bg-blue-500/20 rounded-lg">
              <Calendar className="h-4 w-4 text-blue-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-300 leading-tight uppercase tracking-wide">
                {data.month || getCurrentMonth()}
              </span>
              <span className="text-lg font-bold text-white leading-tight">
                {data.year || getCurrentYear()}
              </span>
            </div>
          </div>
        </div>

        {/* Header - Dynamic Title */}
        <div className="text-center mb-6">
          <div className="mb-2">
            <span className="text-3xl font-bold text-white tracking-tight">
              {data.title || DEFAULT_GROUP_NAME}
            </span>
            <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 ml-3 tracking-tight">
              Top Contributors
            </span>
          </div>
        </div>

        {/* Top 1 - Hero Section */}
        {top1 && (
          <div className="mb-5">
            <div className="relative">
              {/* Decorative accent */}
              <div className="absolute -top-2 -left-2 w-24 h-24 bg-yellow-500/10 rounded-full blur-xl"></div>

              <div className="relative bg-gradient-to-br from-yellow-500/15 via-yellow-600/10 to-transparent backdrop-blur-sm rounded-3xl p-6 border border-yellow-500/20">
                <div className="flex items-start gap-5">
                  {/* Avatar Section */}
                  <div className="relative flex-shrink-0">
                    <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400/50 to-yellow-600/50 rounded-full blur opacity-75"></div>
                    {top1.avatar_url ? (
                      <img
                        src={top1.avatar_url}
                        alt={top1.name}
                        crossOrigin="anonymous"
                        className="relative w-32 h-32 rounded-2xl object-cover shadow-2xl"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const placeholder = target.nextElementSibling as HTMLElement;
                          if (placeholder) placeholder.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="relative w-32 h-32 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-5xl font-bold text-white shadow-2xl" style={{ display: top1.avatar_url ? 'none' : 'flex' }}>
                      {top1.name ? top1.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    {/* Rank badge */}
                    <div className="absolute -top-2 -right-2 w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg border-2 border-yellow-300/50">
                      #1
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="flex-1 pt-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-3xl font-bold text-white mb-2">
                          {top1.name}
                        </h3>
                        {top1.badge && (
                          <span
                            className={clsx(
                              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border',
                              getBadgeColor(top1.badge)
                            )}
                          >
                            {getBadgeIcon(top1.badge)}
                            <span className="capitalize">{top1.badge.replace('-', ' ')}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-slate-800/50 rounded-lg">
                          <FileText className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-white">{top1.posts}</div>
                          <div className="text-xs text-slate-400">Posts</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-slate-800/50 rounded-lg">
                          <MessageSquare className="h-5 w-5 text-green-400" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-white">{top1.comments}</div>
                          <div className="text-xs text-slate-400">Comments</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-slate-800/50 rounded-lg">
                          <Heart className="h-5 w-5 text-red-400" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-white">{top1.reactions}</div>
                          <div className="text-xs text-slate-400">Reactions</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top 2 & 3 - Side by Side */}
        <div className="flex gap-4 mb-5">
          {/* Top 2 */}
          {top2 && (
            <div className="flex-1 relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-2xl blur opacity-50 group-hover:opacity-75 transition"></div>
              <div className="relative bg-slate-800/40 backdrop-blur-sm rounded-2xl p-5 border border-blue-500/20">
                <div className="flex items-center gap-5">
                  <div className="relative flex-shrink-0">
                    <div className="absolute -inset-0.5 bg-blue-500/30 rounded-xl blur"></div>
                    {top2.avatar_url ? (
                      <img
                        src={top2.avatar_url}
                        alt={top2.name}
                        crossOrigin="anonymous"
                        className="relative rounded-xl object-cover shadow-lg"
                        style={{ width: '88px', height: '88px' }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const placeholder = target.nextElementSibling as HTMLElement;
                          if (placeholder) placeholder.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="relative rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-4xl font-bold text-white shadow-lg" style={{ width: '88px', height: '88px', display: top2.avatar_url ? 'none' : 'flex' }}>
                      {top2.name ? top2.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div className="absolute -top-2 -right-2 w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-xl">
                      #2
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-white mb-2 truncate">
                      {top2.name}
                    </h3>
                    {top2.badge && (
                      <span
                        className={clsx(
                          'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border mb-3',
                          getBadgeColor(top2.badge)
                        )}
                      >
                        {getBadgeIcon(top2.badge)}
                      </span>
                    )}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-slate-800/50 rounded-lg">
                          <FileText className="h-4 w-4 text-blue-400" />
                        </div>
                        <span className="text-base font-bold text-white">{top2.posts}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-slate-800/50 rounded-lg">
                          <MessageSquare className="h-4 w-4 text-green-400" />
                        </div>
                        <span className="text-base font-bold text-white">{top2.comments}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-slate-800/50 rounded-lg">
                          <Heart className="h-4 w-4 text-red-400" />
                        </div>
                        <span className="text-base font-bold text-white">{top2.reactions}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Top 3 */}
          {top3 && (
            <div className="flex-1 relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-2xl blur opacity-50 group-hover:opacity-75 transition"></div>
              <div className="relative bg-slate-800/40 backdrop-blur-sm rounded-2xl p-5 border border-purple-500/20">
                <div className="flex items-center gap-5">
                  <div className="relative flex-shrink-0">
                    <div className="absolute -inset-0.5 bg-purple-500/30 rounded-xl blur"></div>
                    {top3.avatar_url ? (
                      <img
                        src={top3.avatar_url}
                        alt={top3.name}
                        crossOrigin="anonymous"
                        className="relative rounded-xl object-cover shadow-lg"
                        style={{ width: '88px', height: '88px' }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const placeholder = target.nextElementSibling as HTMLElement;
                          if (placeholder) placeholder.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="relative rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-4xl font-bold text-white shadow-lg" style={{ width: '88px', height: '88px', display: top3.avatar_url ? 'none' : 'flex' }}>
                      {top3.name ? top3.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div className="absolute -top-2 -right-2 w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-xl">
                      #3
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-white mb-2 truncate">
                      {top3.name}
                    </h3>
                    {top3.badge && (
                      <span
                        className={clsx(
                          'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border mb-3',
                          getBadgeColor(top3.badge)
                        )}
                      >
                        {getBadgeIcon(top3.badge)}
                      </span>
                    )}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-slate-800/50 rounded-lg">
                          <FileText className="h-4 w-4 text-blue-400" />
                        </div>
                        <span className="text-base font-bold text-white">{top3.posts}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-slate-800/50 rounded-lg">
                          <MessageSquare className="h-4 w-4 text-green-400" />
                        </div>
                        <span className="text-base font-bold text-white">{top3.comments}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-slate-800/50 rounded-lg">
                          <Heart className="h-4 w-4 text-red-400" />
                        </div>
                        <span className="text-base font-bold text-white">{top3.reactions}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Remaining Contributors (4-10) - Grid Layout */}
        <div className="flex-1 grid grid-cols-1 gap-3 overflow-hidden">
          {remaining.map((contributor) => (
            <div
              key={contributor.rank}
              className="flex items-center gap-5 px-5 py-4 bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/30 hover:border-slate-600/50 transition-colors"
            >
              {/* Rank */}
              <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center rounded-xl bg-slate-700/50 text-white font-bold text-lg shadow-lg">
                #{contributor.rank}
              </div>

              {/* Avatar */}
              <div className="flex-shrink-0 relative">
                <div className="absolute -inset-0.5 bg-slate-500/30 rounded-xl blur"></div>
                {contributor.avatar_url ? (
                  <img
                    src={contributor.avatar_url}
                    alt={contributor.name}
                    crossOrigin="anonymous"
                    className="relative rounded-xl object-cover shadow-md"
                    style={{ width: '72px', height: '72px' }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const placeholder = target.nextElementSibling as HTMLElement;
                      if (placeholder) placeholder.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="relative rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-3xl font-bold text-white shadow-md" style={{ width: '72px', height: '72px', display: contributor.avatar_url ? 'none' : 'flex' }}>
                  {contributor.name ? contributor.name.charAt(0).toUpperCase() : '?'}
                </div>
              </div>

              {/* Name and Badge */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 mb-1">
                  <h3 className="text-xl font-bold text-white truncate">
                    {contributor.name}
                  </h3>
                  {contributor.badge && (
                    <span
                      className={clsx(
                        'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border flex-shrink-0',
                        getBadgeColor(contributor.badge)
                      )}
                    >
                      {getBadgeIcon(contributor.badge)}
                    </span>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-5 text-slate-300">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-slate-800/50 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">{contributor.posts}</div>
                    <div className="text-xs text-slate-400">Posts</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-slate-800/50 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">{contributor.comments}</div>
                    <div className="text-xs text-slate-400">Comments</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-slate-800/50 rounded-lg">
                    <Heart className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">{contributor.reactions}</div>
                    <div className="text-xs text-slate-400">Reactions</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
