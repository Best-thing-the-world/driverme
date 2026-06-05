import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Activity, Play, MessageCircle, RefreshCw, Crown, TrendingUp, AlertTriangle, CheckCircle, Database, Zap, Music } from 'lucide-react';
import { TRACKLIST, ROLE_COLORS } from '@/components/constants';

function StatCard({ icon: Icon, label, value, sub, color = '#a855f7', loading }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
          <Icon size={15} style={{ color }} />
        </div>
        {loading && <div className="w-3 h-3 rounded-full border border-white/20 border-t-white/60 animate-spin" />}
      </div>
      <div>
        <div className="text-2xl font-black tabular-nums">{loading ? '—' : value}</div>
        <div className="text-[11px] font-bold uppercase tracking-widest text-white/40 mt-0.5">{label}</div>
        {sub && <div className="text-[10px] text-white/25 mt-1">{sub}</div>}
      </div>
    </div>
  );
}

function HealthBadge({ ok, label }) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold ${ok ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
      {ok ? <CheckCircle size={11} /> : <AlertTriangle size={11} />}
      {label}
    </div>
  );
}

export default function Monitor() {
  const [trackStats, setTrackStats] = useState([]);
  const [comments, setComments] = useState([]);
  const [appMeta, setAppMeta] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [duplicates, setDuplicates] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [stats, cmts, meta] = await Promise.all([
        base44.entities.TrackStat.list(),
        base44.entities.TrackComment.list(),
        base44.entities.AppMeta.list(),
      ]);

      await new Promise(resolve => {
        requestIdleCallback(() => {
          const seen = {};
          const dups = [];
          stats.forEach(s => {
            if (seen[s.track_id]) dups.push(s.track_id);
            else seen[s.track_id] = true;
          });

          const merged = {};
          stats.forEach(s => {
            const tid = s.track_id;
            if (!merged[tid]) merged[tid] = { ...s, play_count: 0 };
            merged[tid].play_count += (s.play_count || 0);
          });

          setDuplicates([...new Set(dups)]);
          setTrackStats(Object.values(merged));
          setComments(cmts);
          setAppMeta(meta);
          setLastRefresh(new Date());
          resolve();
        });
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const fixDuplicates = async () => {
    if (!duplicates.length) return;
    const all = await base44.entities.TrackStat.list();
    for (const tid of duplicates) {
      const recs = all.filter(s => s.track_id === tid).sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
      const totalPlays = recs.reduce((sum, r) => sum + (r.play_count || 0), 0);
      await base44.entities.TrackStat.update(recs[0].id, { play_count: totalPlays });
      for (const dup of recs.slice(1)) {
        await base44.entities.TrackStat.delete(dup.id);
      }
    }
    await load();
  };

  const totalPlays = trackStats.reduce((sum, s) => sum + (s.play_count || 0), 0);
  const totalComments = comments.length;
  const hasDriveBackup = appMeta.some(m => m.key === 'drive_backup_file_id');
  const hasSpreadsheet = appMeta.some(m => m.key === 'sheets_spreadsheet_id' || m.key === 'sheets_spreadsheet_url');
  const premiumSessions = appMeta.filter(m => m.key === 'premium_session').length;

  const chartData = TRACKLIST.map(t => {
    const stat = trackStats.find(s => s.track_id === t.id);
    return { name: t.title.length > 8 ? t.title.slice(0, 8) + '…' : t.title, plays: stat?.play_count || 0, role: t.role, id: t.id };
  });

  const topTrack = [...trackStats].sort((a, b) => (b.play_count || 0) - (a.play_count || 0))[0];
  const topTrackInfo = topTrack ? TRACKLIST.find(t => t.id === topTrack.track_id) : null;
  const recentComments = [...comments].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 5);
  const maxChartPlays = Math.max(...chartData.map(x => x.plays), 1);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 pb-10" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="flex items-center justify-between mb-6 pt-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Admin</p>
          <h1 className="text-2xl font-black uppercase tracking-tight">Monitor</h1>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[11px] font-bold uppercase tracking-widest text-white/60 hover:text-white transition-all">
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <HealthBadge ok={totalPlays > 0} label="Play Tracking" />
        <HealthBadge ok={hasDriveBackup} label="Drive Backup" />
        <HealthBadge ok={hasSpreadsheet} label="Sheets Export" />
        <HealthBadge ok={duplicates.length === 0} label={duplicates.length === 0 ? "No Duplicates" : `${duplicates.length} Dup Track${duplicates.length > 1 ? 's' : ''}`} />
        {lastRefresh && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-white/5 text-white/30">
            <Activity size={11} />
            {lastRefresh.toLocaleTimeString()}
          </div>
        )}
      </div>

      {duplicates.length > 0 && (
        <div className="mb-4 p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertTriangle size={14} />
            <span className="text-[12px] font-bold">Duplicate TrackStat records found for track IDs: {duplicates.join(', ')}</span>
          </div>
          <button onClick={fixDuplicates}
            className="flex-shrink-0 px-4 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[11px] font-black uppercase tracking-widest hover:bg-amber-500/30 transition-all">
            Auto-Fix
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard icon={Play} label="Total Plays" value={totalPlays} sub="across all tracks" color="#a855f7" loading={loading} />
        <StatCard icon={MessageCircle} label="Comments" value={totalComments} sub="fan messages" color="#3b82f6" loading={loading} />
        <StatCard icon={Crown} label="VIP Sessions" value={premiumSessions} sub="verified payments" color="#f59e0b" loading={loading} />
        <StatCard icon={Music} label="Top Track" value={topTrackInfo?.title || '—'} sub={topTrack ? `${topTrack.play_count} plays` : 'no data'} color="#ef4444" loading={loading} />
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={14} className="text-white/40" />
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">Plays by Track</span>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
            <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: 700 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 9 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 11 }}
              labelStyle={{ color: 'white', fontWeight: 700 }}
              itemStyle={{ color: 'rgba(255,255,255,0.6)' }}
              cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            />
            <Bar dataKey="plays" radius={[4, 4, 0, 0]}>
              {chartData.map((entry) => (
                <Cell key={entry.id} fill={ROLE_COLORS[entry.role] || '#a855f7'} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={13} className="text-white/40" />
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">Leaderboard</span>
          </div>
          <div className="flex flex-col gap-1">
            {[...chartData].sort((a, b) => b.plays - a.plays).map((t, idx) => (
              <div key={t.id} className="flex items-center gap-3 py-1.5">
                <span className="text-[10px] font-black text-white/20 w-4 text-right">{idx + 1}</span>
                <div className="flex-1 relative h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
                    style={{ width: `${(t.plays / maxChartPlays) * 100}%`, backgroundColor: ROLE_COLORS[t.role] || '#a855f7' }} />
                </div>
                <span className="text-[10px] font-bold text-white/50 truncate w-20 text-right">{t.name}</span>
                <span className="text-[11px] font-black tabular-nums w-6 text-right"
                  style={{ color: ROLE_COLORS[t.role] || '#fff' }}>{t.plays}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle size={13} className="text-white/40" />
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">Recent Comments</span>
          </div>
          {recentComments.length === 0 && !loading ? (
            <p className="text-[11px] text-white/25 py-4 text-center">No comments yet</p>
          ) : (
            <div className="flex flex-col gap-3">
              {recentComments.map(c => {
                const tInfo = TRACKLIST.find(t => t.id === c.track_id);
                return (
                  <div key={c.id} className="flex items-start gap-2">
                    <div className="text-base leading-none mt-0.5">{c.emoji || '💬'}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[11px] font-black truncate">{c.name || 'Anonymous'}</span>
                        {tInfo && <span className="text-[9px] font-bold uppercase tracking-widest text-white/25 flex-shrink-0">on {tInfo.title}</span>}
                      </div>
                      <p className="text-[11px] text-white/50 truncate mt-0.5">{c.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 bg-white/5 border border-white/10 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Database size={13} className="text-white/40" />
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">System Records ({appMeta.length})</span>
        </div>
        <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
          {appMeta.length === 0 && !loading && <p className="text-[11px] text-white/25">No meta records</p>}
          {appMeta.map(m => (
            <div key={m.id} className="flex items-center gap-3 text-[11px]">
              <span className="font-bold text-white/50 flex-shrink-0">{m.key}</span>
              <span className="font-mono text-white/25 truncate">{m.value?.slice(0, 40)}{m.value?.length > 40 ? '…' : ''}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}