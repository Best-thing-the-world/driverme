export const ROLE_COLORS = {
  Intro: '#ea580c', Vibe: '#a855f7', Peak: '#ef4444', Transition: '#3b82f6',
  Deep: '#06b6d4', Lead: '#f59e0b', Mood: '#ec4899', Outro: '#84cc16',
};

export const TRACKLIST = [
  { id: 1,  title: "SAUCY",                   role: "Intro",      url: "https://www.dropbox.com/scl/fi/xr7s8i13w3mmgjzotvtv3/SAUCY-MykelTBrooks.mp3?rlkey=wp6uoqtuzr9vnwai69pcv54hn&raw=1" },
  { id: 2,  title: "Wasabi",                  role: "Vibe",       url: "https://www.dropbox.com/scl/fi/ch49tx2izn718sjg8730y/SADDIQ-Wasabi.mp3?rlkey=pfi79l57d53ksvi0431r008nw&raw=1" },
  { id: 3,  title: "Wet Wet (Toni Macaroni)", role: "Peak",       url: "https://www.dropbox.com/scl/fi/lj9qg9dtwr2zpcgcvjr1r/WET-WET-TONI-MACARONI.wav?rlkey=tsdvbdrontt5l3clqbez1vce9&st=0b2ksyn0&raw=1" },
  { id: 4,  title: "Aggressive",              role: "Peak",       url: "https://www.dropbox.com/scl/fi/tsferdusxt8245tmmavbn/Aggressive-Mykel-take-2.m4a?rlkey=wuwobkfqy5x7iql8hlbvygpm5&raw=1" },
  { id: 5,  title: "POGO",                    role: "Transition", url: "https://www.dropbox.com/scl/fi/7jwupdab3i6y0xa0tuq1k/POGO-SAADIQ.mp3?rlkey=cyl6orm7zroyt1q0ewhrpe7qz&raw=1" },
  { id: 6,  title: "Slo_Motion",              role: "Deep",       url: "https://www.dropbox.com/scl/fi/bmjt2o6whjjqkkjkom46w/Slo_Motion-1.mp3?rlkey=y3g1346mwn90r8re7wt534md0&raw=1" },
  { id: 7,  title: "Late Night",              role: "Lead",       url: "https://www.dropbox.com/scl/fi/fme33eh933shn6dpzuahh/SaadiQ-aka-Mykel-T-Brooks-Late-Night.m4a?rlkey=eno7odtsjm8cmg99nzwvqez8l&raw=1" },
  { id: 8,  title: "Jealousy",                role: "Mood",       url: "https://www.dropbox.com/scl/fi/jcgrqeoq7k6a46caoa3yd/Jealousy-Mykel-T-Brooks-.mp3.mp3?rlkey=1ips1c91vjuiuvaqu97tnchlx&raw=1" },
  { id: 9,  title: "Barry White",             role: "Outro",      url: "https://www.dropbox.com/scl/fi/l1jjj2s6hxjq1sndkmob1/Barry-White-Mykel-1.mp3?rlkey=wh42q4kq7sbu49kgalkr82rur&raw=1" },
  { id: 10, title: "Show U Real",             role: "Vibe",       url: "https://www.dropbox.com/scl/fi/x6lqfdg1vziwusjfgyt97/Show-U-Real-Prod.-By-ATM-Beats.mp3?rlkey=z09tj5cb3mw8t3nxb913ssdo4&st=pdk8pkki&raw=1" },
  { id: 11, title: "1 on 1",                  role: "Mood",       url: "https://www.dropbox.com/scl/fi/e77gvye6xcxysu03jjikc/1-one-1-SAADIQ-Mykel-T-Brooks.mp3?rlkey=rwecyck6bu608n47887wdzwin&st=teghfvx1&raw=1" },
  { id: 12, title: "Dance On Me",             role: "Vibe",       url: "https://www.dropbox.com/scl/fi/encktpgak9rt3cxgdjdpv/Dance_On_Me_OFFICIAL.wav?rlkey=pr1q80k8qll2olb9mwxfoubz8&st=87suhjey&raw=1" },
];

export const ARTIST_IMAGE = "https://www.dropbox.com/scl/fi/5gkp1mpyuraj0n9frtvvs/ChatGPT-Image-Mar-3-2026-03_28_32-AM.png?rlkey=73k6ue9e4b5wfeexufr50247x&st=moa8i7i5&raw=1";

export const HOWLER_CDN = "https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.3/howler.min.js";
export const HOWLER_SRI = "sha512-6+YN/9o9BWrk6wJ6sGSI4kirDi5iAI0BZsLaGCXcFNWMDEdXGD6nU+0khO1TZ2C6MkOdBe3MHnaXDiAOFWQCw==";

export const formatTime = (secs) => {
  if (typeof secs !== 'number' || isNaN(secs) || !isFinite(secs) || secs < 0) return "0:00";
  const m = Math.floor(secs / 60) || 0;
  const s = Math.floor(secs % 60) || 0;
  return `${m}:${s.toString().padStart(2, '0')}`;
};