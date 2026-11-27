const CONFIG = {
  discordUser: 'a_duckgod',
  // Discord user ID for live profile & activity (via Lanyard). Set to '' to turn it off.
  discordId: '1131237914957840525',
  discordProfileUrl: 'https://discord.com/users/1131237914957840525',
  // Show raw Discord custom status text when idle/not in a game or Spotify.
  showCustomStatus: false,
  discordInvite: 'https://discord.gg/JS3cuBQaef',
  // Set to true once you place the 5 .webm files in assets/music/ (automatically falls back to previewSrc if missing or unsupported).
  useLocalAudio: false,
  // Background soundtrack (5 tracks: Losers Club + CG5).
  tracks: [
    {
      title: 'Losers Wish',
      artist: 'Losers Club',
      localSrc: '/assets/music/losers-wish.webm',
      previewSrc: 'https://p.scdn.co/mp3-preview/25492d320c0daedf313fc773b5166d9b1051802b',
      art: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02dfb81a27694effe6ffcbea01',
      spotifyUrl: 'https://open.spotify.com/track/0uaoEpUuC6n9q8LWTf2cAa',
    },
    {
      title: 'Losers Love',
      artist: 'Losers Club',
      localSrc: '/assets/music/losers-love.webm',
      previewSrc: 'https://p.scdn.co/mp3-preview/6dc80debee3b6a2f8d99d576330fbf49cd8aad49',
      art: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02dfb81a27694effe6ffcbea01',
      spotifyUrl: 'https://open.spotify.com/track/0rO11G9hWKlKfKxMFdYqzm',
    },
    {
      title: 'Losers Loss',
      artist: 'Losers Club',
      localSrc: '/assets/music/losers-loss.webm',
      previewSrc: 'https://p.scdn.co/mp3-preview/6a1e235e6d42f791c8d9006d56eb3c833794b0e3',
      art: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02dfb81a27694effe6ffcbea01',
      spotifyUrl: 'https://open.spotify.com/track/15OIaGSVwvVDuGE9MgPQ2E',
    },
    {
      title: 'Winners Return',
      artist: 'Losers Club',
      localSrc: '/assets/music/winners-return.webm',
      previewSrc: 'https://p.scdn.co/mp3-preview/bdeac3e2149de8db3cf6ec736bbaa96ff5eb2e3f',
      art: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02dfb81a27694effe6ffcbea01',
      spotifyUrl: 'https://open.spotify.com/track/7bGyhf4e5kV3HRILSm6RWC',
    },
    {
      title: 'why did the chicken cross the road?',
      artist: 'CG5',
      localSrc: '/assets/music/why-did-the-chicken-cross-the-road.webm',
      previewSrc: 'https://p.scdn.co/mp3-preview/f81e7dcd0bef1a29f2f02bff9f83ccaaa796bf72',
      art: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02628b768a3619a7457ba7764c',
      spotifyUrl: 'https://open.spotify.com/track/41Vr0Zt9gk1mtBu97RJyI7',
    },
  ],
};

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const ICONS = '/assets/icons.svg?v=4';

// Pause non-essential CSS animations whenever tab is hidden to keep audio/tab-switches silky smooth
const syncHiddenClass = () => {
  if (document.hidden) {
    document.documentElement.classList.add('page-hidden');
  } else {
    requestAnimationFrame(() => document.documentElement.classList.remove('page-hidden'));
  }
};
document.addEventListener('visibilitychange', syncHiddenClass);
addEventListener('pageshow', () => document.documentElement.classList.remove('page-hidden'));

// Navigating from Portfolio / 404 back to Home shouldn't re-trigger the Mirror Pond enter gate
if (!$('#enter-gate')) {
  try { sessionStorage.setItem('adg_entered', '1'); } catch {}
}

const go = (path) => { location.href = path; };
const openTab = (url) => window.open(url, '_blank', 'noopener,noreferrer');

const fmtSec = (sec) => {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const s = Math.floor(sec);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

// Toast + copy
const toastEl = $('.toast');
let toastTimer;
function toast(text) {
  if (!toastEl) return;
  toastEl.textContent = text;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2400);
}

async function copyText(text, successMsg, fallbackMsg) {
  try {
    await navigator.clipboard.writeText(text);
    toast(successMsg);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
    document.body.append(ta);
    ta.select();
    const ok = document.execCommand?.('copy');
    ta.remove();
    toast(ok ? successMsg : fallbackMsg);
    return !!ok;
  }
}

const copyDiscord = async (btn) => {
  const ok = await copyText(CONFIG.discordUser, 'Discord username copied', `My Discord username is ${CONFIG.discordUser}`);
  if (ok && btn) {
    btn.classList.add('is-copied');
    clearTimeout(btn._copyTimer);
    btn._copyTimer = setTimeout(() => btn.classList.remove('is-copied'), 1600);
  }
};

$$('[data-copy-discord]').forEach((el) => el.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  copyDiscord(el);
}));
$$('a[data-soon]').forEach((a) => a.addEventListener('click', (e) => {
  e.preventDefault();
  toast(a.dataset.soon || 'Link coming soon');
}));
$$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

// Playful duck avatar easter egg
const duckAvatarBtn = $('#duck-avatar-btn');
if (duckAvatarBtn) {
  const QUACKS = [
    'quack.',
    'bucket secured.',
    'written in python at 3am',
    'duck approved.',
    '7+ reactions needed',
    'press / for commands',
  ];
  let quackIdx = 0;
  duckAvatarBtn.addEventListener('click', (e) => {
    toast(QUACKS[quackIdx % QUACKS.length]);
    quackIdx++;
    spawnWaterRipple(e.clientX, e.clientY);
  });
}

function spawnWaterRipple(cx, cy) {
  if (reduceMotion || !cx || !cy) return;
  const r = document.createElement('span');
  r.className = 'water-ripple';
  r.style.left = `${cx}px`;
  r.style.top = `${cy}px`;
  document.body.append(r);
  setTimeout(() => r.remove(), 780);
}

// Fade sections in as they scroll into view
const reveals = $$('.reveal');
if (reveals.length && !reduceMotion && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -10px 0px', threshold: 0.01 });
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add('in'));
}

// Rotating "I make ..." word (pauses when tab is hidden or enter gate is up)
const rot = $('[data-rotate]');
if (rot && !reduceMotion) {
  const words = rot.dataset.rotate.split('|');
  let index = 0;
  let rotTimer = 0;
  let swapTimer = 0;

  const stopRot = () => {
    clearTimeout(rotTimer);
    clearTimeout(swapTimer);
    rotTimer = 0;
    swapTimer = 0;
    rot.classList.remove('out', 'in');
  };

  const scheduleRot = () => {
    if (document.hidden || document.documentElement.classList.contains('gate-pending')) return;
    clearTimeout(rotTimer);
    rotTimer = setTimeout(() => {
      if (document.hidden || document.documentElement.classList.contains('gate-pending')) return;
      rot.classList.add('out');
      swapTimer = setTimeout(() => {
        index = (index + 1) % words.length;
        rot.textContent = words[index];
        rot.classList.replace('out', 'in');
        void rot.offsetWidth;
        rot.classList.remove('in');
        scheduleRot();
      }, 300);
    }, 2600);
  };

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopRot();
    else scheduleRot();
  });
  document.addEventListener('adg:entered', scheduleRot);
  scheduleRot();
}

// Reflective cursor lighting, subtle 3D glass tilt & ambient water click ripples
if (finePointer && !reduceMotion) {
  const spot = $('.bg-spot');
  const tiles = $$('.tile');
  const tiltable = new Set($$('.profile, .commissions, .feature, .dc-presence, .social, .price, .card, .nf-card'));
  const fxByTile = new Map();
  tiles.forEach((el) => {
    const fx = document.createElement('span');
    fx.className = 'tile-fx';
    fx.setAttribute('aria-hidden', 'true');
    el.prepend(fx);
    fxByTile.set(el, fx);
  });

  const lit = new Set();
  const tilted = new Set();
  let boxes = null;
  let active = false;
  let tx = 0;
  let ty = 0;
  let sx = 0;
  let sy = 0;
  let lastPx = NaN;
  let lastPy = NaN;
  let frame = 0;

  const measure = () => {
    boxes = tiles.map((el) => {
      let left = 0;
      let top = 0;
      for (let n = el; n; n = n.offsetParent) {
        left += n.offsetLeft;
        top += n.offsetTop;
      }
      return {
        el,
        fx: fxByTile.get(el),
        left,
        top,
        width: el.offsetWidth,
        height: el.offsetHeight,
        right: left + el.offsetWidth,
        bottom: top + el.offsetHeight,
      };
    });
  };
  new ResizeObserver(() => { boxes = null; lastPx = NaN; }).observe(document.body);
  document.fonts?.ready?.then(() => { boxes = null; lastPx = NaN; });

  const clearLighting = () => {
    active = false;
    if (frame) { cancelAnimationFrame(frame); frame = 0; }
    lastPx = NaN;
    lastPy = NaN;
    spot?.classList.remove('on');
    lit.forEach((fx) => fx.classList.remove('is-lit'));
    lit.clear();
    tilted.forEach((el) => {
      el.classList.remove('is-tilting');
      el.style.transform = '';
    });
    tilted.clear();
  };

  const render = () => {
    frame = 0;
    if (document.hidden || document.documentElement.classList.contains('gate-pending')) return;
    sx += (tx - sx) * 0.18;
    sy += (ty - sy) * 0.18;
    if (spot) spot.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0)`;

    const px = Math.round(tx + scrollX);
    const py = Math.round(ty + scrollY);
    if (px !== lastPx || py !== lastPy) {
      lastPx = px;
      lastPy = py;
      if (!boxes) measure();
      for (const box of boxes) {
        const near = px > box.left - 160 && px < box.right + 160 && py > box.top - 160 && py < box.bottom + 160;
        if (near) {
          const lx = px - box.left;
          const ly = py - box.top;
          box.fx.style.setProperty('--mx', `${lx}px`);
          box.fx.style.setProperty('--my', `${ly}px`);
          if (!lit.has(box.fx)) { box.fx.classList.add('is-lit'); lit.add(box.fx); }

          if (tiltable.has(box.el)) {
            const inside = lx >= 0 && lx <= box.width && ly >= 0 && ly <= box.height;
            if (inside) {
              const nx = (lx / box.width - 0.5) * 2;
              const ny = (ly / box.height - 0.5) * 2;
              const maxDeg = box.width > 560 ? 1.25 : 2.0;
              const tyPx = box.el.tagName === 'A' ? -2 : 0;
              box.el.style.transform = `perspective(1050px) rotateX(${(-ny * maxDeg).toFixed(2)}deg) rotateY(${(nx * maxDeg).toFixed(2)}deg) translateY(${tyPx}px)`;
              if (!tilted.has(box.el)) { box.el.classList.add('is-tilting'); tilted.add(box.el); }
            } else if (tilted.has(box.el)) {
              box.el.classList.remove('is-tilting');
              box.el.style.transform = '';
              tilted.delete(box.el);
            }
          }
        } else {
          if (lit.has(box.fx)) {
            box.fx.classList.remove('is-lit');
            lit.delete(box.fx);
          }
          if (tilted.has(box.el)) {
            box.el.classList.remove('is-tilting');
            box.el.style.transform = '';
            tilted.delete(box.el);
          }
        }
      }
    }

    if (active && (Math.abs(tx - sx) > 0.6 || Math.abs(ty - sy) > 0.6)) {
      frame = requestAnimationFrame(render);
    }
  };

  const queue = () => { if (active && !frame && !document.hidden) frame = requestAnimationFrame(render); };
  addEventListener('pointermove', (e) => {
    if (document.hidden || document.documentElement.classList.contains('gate-pending')) return;
    if (!active) { sx = e.clientX; sy = e.clientY; }
    active = true;
    tx = e.clientX;
    ty = e.clientY;
    spot?.classList.add('on');
    queue();
  }, { passive: true });
  addEventListener('scroll', queue, { passive: true });
  document.documentElement.addEventListener('pointerleave', clearLighting);
  document.addEventListener('visibilitychange', () => { if (document.hidden) clearLighting(); });

  // Subtle mirror ripple when clicking ambient open areas
  document.addEventListener('click', (e) => {
    if (document.documentElement.classList.contains('gate-pending')) return;
    if (e.target.closest('a, button, input, .music-dock, .palette, .lightbox, .dc')) return;
    spawnWaterRipple(e.clientX, e.clientY);
  });
}

// Standalone Discord Profile & Live Rich Activity (Lanyard WebSocket + REST fallback)
const discordCard = $('#discord-card');
if (discordCard && CONFIG.discordId) {
  const STATUS = {
    online: ['Online', '--ok'],
    idle: ['Idle', '--idle'],
    dnd: ['Do Not Disturb', '--dnd'],
    offline: ['Offline', '--off'],
  };
  const VERBS = { 0: 'Playing', 1: 'Streaming', 2: 'Listening to', 3: 'Watching', 5: 'Competing in' };
  const ICONS_BY_TYPE = { 0: 'gamepad', 1: 'broadcast', 2: 'music', 3: 'eye', 5: 'gamepad' };

  const dcProfileLink = $('#dc-profile-link');
  const dcProfAv = $('#dc-prof-av');
  const dcAvatar = $('#dc-avatar');
  const dcDeco = $('#dc-deco');
  const dcStatusBadge = $('#dc-status-badge');
  const dcDisplay = $('#dc-display');
  const dcGuildTag = $('#dc-guild-tag');
  const dcGuildBadge = $('#dc-guild-badge');
  const dcGuildText = $('#dc-guild-text');
  const dcDevices = $('#dc-devices');
  const dcHandle = $('#dc-handle');
  const presenceTitle = $('#presence-title');
  const presenceSep = $('#presence-sep');
  const actZone = $('#presence-act-zone');
  const live = $('#presence-live');
  const actBox = $('#presence-activity');
  const actImg = $('#act-img');
  const actIc = $('#act-ic');
  const actSmall = $('#act-small');
  const actKicker = $('#act-kicker');
  const actTime = $('#act-time');
  const actName = $('#act-name');
  const actMeta = $('#act-meta');
  const actBar = $('#act-bar');
  const actBarFill = $('#act-bar-fill');

  if (dcProfileLink) dcProfileLink.href = CONFIG.discordProfileUrl || `https://discord.com/users/${CONFIG.discordId}`;
  if (dcAvatar) {
    dcAvatar.addEventListener('error', () => {
      if (!dcAvatar.src.endsWith('/assets/avatar.png') && dcAvatar.getAttribute('src') !== 'assets/avatar.png') {
        dcAvatar.src = 'assets/avatar.png';
      }
    });
  }

  let activeTimestamps = null;
  let isSpotify = false;
  let lastSpotifyTrackId = '';
  let lastTimeStr = '';
  let wsConnected = false;
  let hasPresence = false;
  let tickTimer = 0;

  const fmtTime = (ms) => {
    const s = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return h ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
  };

  const resolveAsset = (appId, img) => {
    if (!img) return '';
    if (img.startsWith('mp:external/')) return `https://media.discordapp.net/external/${img.slice(12)}`;
    if (img.startsWith('mp:')) return `https://media.discordapp.net/${img.slice(3)}`;
    if (img.startsWith('spotify:')) return `https://i.scdn.co/image/${img.slice(8)}`;
    return appId ? `https://cdn.discordapp.com/app-assets/${appId}/${img}.png` : '';
  };

  const setArt = (src, iconId, smallSrc = '', largeText = '', smallText = '') => {
    const useEl = $('use', actIc);
    if (useEl) useEl.setAttribute('href', `${ICONS}#i-${iconId}`);
    if (src) {
      actImg.onerror = () => {
        actImg.hidden = true;
        actIc.toggleAttribute('hidden', false);
      };
      actImg.src = src;
      actImg.title = largeText || '';
      actImg.hidden = false;
      actIc.toggleAttribute('hidden', true);
    } else {
      actImg.hidden = true;
      actImg.title = '';
      actIc.toggleAttribute('hidden', false);
    }
    if (smallSrc) {
      actSmall.onerror = () => { actSmall.hidden = true; };
      actSmall.src = smallSrc;
      actSmall.title = smallText || '';
      actSmall.hidden = false;
    } else {
      actSmall.hidden = true;
      actSmall.title = '';
    }
  };

  const tickTime = (snap = false) => {
    if (!activeTimestamps?.start || document.hidden) return;
    const now = Date.now();
    if (isSpotify && activeTimestamps.end) {
      const total = Math.max(1000, activeTimestamps.end - activeTimestamps.start);
      const elapsed = Math.min(total, Math.max(0, now - activeTimestamps.start));
      const nextStr = `${fmtTime(elapsed)} / ${fmtTime(total)}`;
      if (nextStr !== lastTimeStr) {
        lastTimeStr = nextStr;
        actTime.textContent = nextStr;
      }
      actTime.hidden = false;
      actBar.hidden = false;
      const pct = `${((elapsed / total) * 100).toFixed(1)}%`;
      if (snap) {
        actBarFill.classList.add('is-snap');
        actBarFill.style.width = pct;
        void actBarFill.offsetWidth;
        actBarFill.classList.remove('is-snap');
      } else {
        actBarFill.style.width = pct;
      }
    } else {
      const elapsed = Math.max(0, now - activeTimestamps.start);
      const nextStr = `${fmtTime(elapsed)} elapsed`;
      if (nextStr !== lastTimeStr) {
        lastTimeStr = nextStr;
        actTime.textContent = nextStr;
      }
      actTime.hidden = false;
      actBar.hidden = true;
    }
  };

  const syncTickTimer = () => {
    clearInterval(tickTimer);
    tickTimer = 0;
    if (activeTimestamps?.start && !document.hidden) {
      tickTimer = setInterval(() => tickTime(false), 1000);
    }
  };

  const renderPresence = (data) => {
    if (!data) return;
    const statusKey = STATUS[data.discord_status] ? data.discord_status : 'offline';
    const [label, color] = STATUS[statusKey];
    document.documentElement.style.setProperty('--presence', `var(${color})`);
    if (presenceTitle) presenceTitle.textContent = label;
    if (dcStatusBadge) dcStatusBadge.dataset.status = statusKey;

    // Profile identity (live avatar, decoration, display name, guild tag, devices)
    const user = data.discord_user;
    if (user) {
      if (dcDisplay) dcDisplay.textContent = user.global_name || user.display_name || user.username || 'aDuckGod';
      if (dcHandle && user.username) dcHandle.textContent = `@${user.username}`;
      if (dcAvatar && user.avatar) {
        const ext = user.avatar.startsWith('a_') ? 'gif' : 'png';
        const url = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=128`;
        if (dcAvatar.dataset.loaded !== url) {
          dcAvatar.dataset.loaded = url;
          dcAvatar.src = url;
        }
      }
      const decoAsset = user.avatar_decoration_data?.asset;
      if (dcDeco) {
        if (decoAsset) {
          const decoUrl = `https://cdn.discordapp.com/avatar-decoration-presets/${decoAsset}.png?size=160&passthrough=true`;
          if (dcDeco.dataset.loaded !== decoUrl) {
            dcDeco.dataset.loaded = decoUrl;
            dcDeco.onload = () => {
              dcDeco.hidden = false;
              dcProfAv?.classList.add('has-deco');
            };
            dcDeco.onerror = () => {
              dcDeco.hidden = true;
              dcProfAv?.classList.remove('has-deco');
            };
            dcDeco.src = decoUrl;
          } else if (dcDeco.complete && dcDeco.naturalWidth > 0) {
            dcDeco.hidden = false;
            dcProfAv?.classList.add('has-deco');
          }
        } else {
          dcDeco.hidden = true;
          dcProfAv?.classList.remove('has-deco');
        }
      }
      const guild = user.primary_guild;
      if (dcGuildTag && dcGuildText) {
        if (guild?.identity_enabled && guild.tag) {
          dcGuildText.textContent = guild.tag;
          if (dcGuildBadge && guild.badge && guild.identity_guild_id) {
            const badgeUrl = `https://cdn.discordapp.com/clan-badges/${guild.identity_guild_id}/${guild.badge}.png?size=32`;
            if (dcGuildBadge.dataset.loaded !== badgeUrl) {
              dcGuildBadge.dataset.loaded = badgeUrl;
              dcGuildBadge.onerror = () => { dcGuildBadge.hidden = true; };
              dcGuildBadge.src = badgeUrl;
            }
            dcGuildBadge.hidden = false;
          } else if (dcGuildBadge) {
            dcGuildBadge.hidden = true;
          }
          dcGuildTag.hidden = false;
        } else {
          dcGuildTag.hidden = true;
        }
      }
    }

    // Active platform icons (wrapped in span for proper native hover tooltips)
    if (dcDevices) {
      const icons = [];
      if (data.active_on_discord_desktop) icons.push(`<span title="Active on Desktop"><svg aria-hidden="true"><use href="${ICONS}#i-desktop"/></svg></span>`);
      if (data.active_on_discord_mobile) icons.push(`<span title="Active on Mobile"><svg aria-hidden="true"><use href="${ICONS}#i-mobile"/></svg></span>`);
      if (data.active_on_discord_web) icons.push(`<span title="Active on Web"><svg aria-hidden="true"><use href="${ICONS}#i-globe"/></svg></span>`);
      dcDevices.innerHTML = icons.join('');
    }

    // Rich Activity (filter out custom status type 4 and hang status type 6)
    const activities = data.activities || [];
    const game = activities.find((a) => a.type !== 4 && a.type !== 6 && a.id !== 'spotify:1');
    const custom = activities.find((a) => a.type === 4 && a.state);
    const device = data.active_on_discord_desktop ? 'Desktop' : data.active_on_discord_mobile ? 'Mobile' : data.active_on_discord_web ? 'Web' : '';

    if (data.listening_to_spotify && data.spotify) {
      const sp = data.spotify;
      const trackChanged = sp.track_id !== lastSpotifyTrackId;
      lastSpotifyTrackId = sp.track_id || '';
      isSpotify = true;
      activeTimestamps = sp.timestamps || null;
      discordCard.dataset.activity = 'spotify';
      actBox.classList.add('is-spotify');
      if (live) live.hidden = false;
      setArt(sp.album_art_url, 'spotify', '', sp.album || sp.song);
      actKicker.textContent = 'Listening to Spotify';
      if (sp.track_id) {
        const a = document.createElement('a');
        a.href = `https://open.spotify.com/track/${sp.track_id}`;
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = sp.song;
        actName.replaceChildren(a);
      } else {
        actName.textContent = sp.song;
      }
      actMeta.textContent = `by ${sp.artist}`;
      actMeta.hidden = false;
      actTime.hidden = !activeTimestamps?.start;
      actBar.hidden = !(activeTimestamps?.start && activeTimestamps?.end);
      tickTime(trackChanged);
      if (presenceSep) presenceSep.hidden = false;
      if (actZone) actZone.hidden = false;
      actBox.hidden = false;
    } else if (game) {
      lastSpotifyTrackId = '';
      isSpotify = false;
      activeTimestamps = game.timestamps || null;
      discordCard.dataset.activity = 'game';
      actBox.classList.remove('is-spotify');
      if (live) live.hidden = false;
      const largeSrc = resolveAsset(game.application_id, game.assets?.large_image);
      const smallSrc = resolveAsset(game.application_id, game.assets?.small_image);
      setArt(largeSrc, ICONS_BY_TYPE[game.type] || 'gamepad', smallSrc, game.assets?.large_text, game.assets?.small_text);
      actKicker.textContent = VERBS[game.type] || 'Playing';
      actName.textContent = game.name;
      const metaParts = [game.details, game.state].filter(Boolean);
      const metaLine = metaParts.join(' · ') || (device ? `Active on ${device}` : '');
      actMeta.textContent = metaLine;
      actMeta.hidden = !metaLine;
      actBar.hidden = true;
      actTime.hidden = !activeTimestamps?.start;
      tickTime();
      if (presenceSep) presenceSep.hidden = false;
      if (actZone) actZone.hidden = false;
      actBox.hidden = false;
    } else {
      lastSpotifyTrackId = '';
      lastTimeStr = '';
      isSpotify = false;
      activeTimestamps = null;
      discordCard.dataset.activity = 'idle';
      if (live) live.hidden = true;
      actBox.hidden = true;
      if (presenceSep) presenceSep.hidden = true;
      if (actZone) actZone.hidden = true;
    }
    hasPresence = true;
    syncTickTimer();
  };

  const showOfflineFallback = () => {
    if (hasPresence) return;
    if (presenceTitle) presenceTitle.textContent = 'Offline';
    if (dcStatusBadge) dcStatusBadge.dataset.status = 'offline';
    document.documentElement.style.setProperty('--presence', 'var(--off)');
  };

  const fetchPresence = async () => {
    if (document.hidden) return;
    try {
      const res = await fetch(`https://api.lanyard.rest/v1/users/${CONFIG.discordId}`);
      if (!res.ok) {
        if (!wsConnected) showOfflineFallback();
        return;
      }
      const { success, data } = await res.json();
      if (success) renderPresence(data);
      else if (!wsConnected) showOfflineFallback();
    } catch {
      if (!wsConnected) showOfflineFallback();
    }
  };

  // Real-time Lanyard WebSocket with automatic REST fallback
  let ws = null;
  let hbTimer = 0;
  let reconnectTimer = 0;
  let closingForUnload = false;

  const disconnectWS = () => {
    closingForUnload = true;
    wsConnected = false;
    clearInterval(hbTimer);
    clearTimeout(reconnectTimer);
    hbTimer = 0;
    reconnectTimer = 0;
    if (ws) {
      try { ws.close(); } catch {}
      ws = null;
    }
  };

  const connectWS = () => {
    if (typeof WebSocket === 'undefined' || document.hidden) return;
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;
    closingForUnload = false;
    try {
      ws = new WebSocket('wss://api.lanyard.rest/socket');
      ws.addEventListener('message', (ev) => {
        let msg;
        try { msg = JSON.parse(ev.data); } catch { return; }
        if (msg.op === 1 && msg.d?.heartbeat_interval) {
          wsConnected = true;
          clearInterval(hbTimer);
          hbTimer = setInterval(() => {
            if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ op: 3 }));
          }, msg.d.heartbeat_interval);
          ws.send(JSON.stringify({ op: 2, d: { subscribe_to_id: CONFIG.discordId } }));
        } else if (msg.op === 0 && (msg.t === 'INIT_STATE' || msg.t === 'PRESENCE_UPDATE')) {
          renderPresence(msg.d);
        }
      });
      ws.addEventListener('close', () => {
        wsConnected = false;
        ws = null;
        clearInterval(hbTimer);
        hbTimer = 0;
        if (!closingForUnload && !document.hidden) {
          clearTimeout(reconnectTimer);
          reconnectTimer = setTimeout(connectWS, 15000);
        }
      });
      ws.addEventListener('error', () => {
        wsConnected = false;
      });
    } catch {
      wsConnected = false;
    }
  };

  fetchPresence();
  connectWS();
  setTimeout(showOfflineFallback, 6000);
  setInterval(() => { if (!wsConnected && !document.hidden) fetchPresence(); }, 30000);
  document.addEventListener('visibilitychange', () => {
    syncTickTimer();
    if (!document.hidden) {
      tickTime(false);
      if (!wsConnected) {
        setTimeout(() => {
          if (!document.hidden && !wsConnected) {
            fetchPresence();
            connectWS();
          }
        }, 250);
      }
    }
  });
  addEventListener('pagehide', () => {
    clearInterval(tickTimer);
    tickTimer = 0;
    disconnectWS();
  });
  addEventListener('pageshow', (e) => {
    if (e.persisted) {
      fetchPresence();
      connectWS();
      syncTickTimer();
    }
  });
}

// Background Music Engine + Reflective Floating Dock + Mirror Pond Enter Portal
const music = (() => {
  const tracks = CONFIG.tracks || [];
  if (!tracks.length) return null;

  const STORAGE_VOL = 'adg_music_vol';
  const STORAGE_MUTE = 'adg_music_mute';
  const STORAGE_LAST = 'adg_last_track';
  const STORAGE_MIN = 'adg_music_min';
  const SESS_STATE = 'adg_music_sess';

  const navEntry = performance.getEntriesByType?.('navigation')?.[0];
  const isReload = navEntry?.type === 'reload';
  const gateEl = $('#enter-gate');
  const hasGate = !!gateEl && document.documentElement.classList.contains('gate-pending');

  const pickRandomIndex = (exclude = -1) => {
    if (tracks.length <= 1) return 0;
    let idx;
    do { idx = Math.floor(Math.random() * tracks.length); } while (idx === exclude);
    return idx;
  };

  let savedSession = null;
  if (!isReload && !hasGate) {
    try { savedSession = JSON.parse(sessionStorage.getItem(SESS_STATE) || 'null'); } catch {}
  }

  const lastPlayed = Number(localStorage.getItem(STORAGE_LAST) ?? -1);
  let currentIndex = Number.isInteger(savedSession?.idx) && tracks[savedSession.idx]
    ? savedSession.idx
    : pickRandomIndex(lastPlayed);

  let volume = Math.min(1, Math.max(0, parseFloat(localStorage.getItem(STORAGE_VOL) ?? '0.38') || 0.38));
  let muted = localStorage.getItem(STORAGE_MUTE) === '1';
  let minimized = localStorage.getItem(STORAGE_MIN) === '1';
  let shuffle = true;
  let playing = false;
  let wantPlay = false;
  let pendingFadeIn = false;
  let queueOpen = false;
  let history = [currentIndex];
  const playedBag = new Set([currentIndex]);
  const failedLocal = new Set();

  const audio = new Audio();
  audio.preload = 'auto';
  audio.crossOrigin = 'anonymous';
  audio.volume = muted ? 0 : volume;
  audio.muted = muted;

  const canPlayWebm = Boolean(
    audio.canPlayType?.('audio/webm; codecs="opus"') || audio.canPlayType?.('audio/webm')
  );

  // Passive captureStream() AnalyserNode: NEVER connects to audioCtx.destination so native <audio>
  // stays on the browser's dedicated hardware media thread (zero tab-switch stutter & zero stopped pop).
  let audioCtx = null;
  let streamSrc = null;
  let analyser = null;
  let freqData = null;
  let eqRaf = 0;
  let eqResumeTimer = 0;
  let lastEqTime = 0;
  let useCors = true;
  let playOpId = 0;
  let pauseTimer = 0;
  let metaAbort = null;

  // Build floating reflective music dock
  const dock = document.createElement('aside');
  dock.className = 'music-dock' + (minimized ? ' is-min' : '');
  dock.setAttribute('aria-label', 'Background music player');
  dock.innerHTML = `
    <span class="music-glow" id="m-glow" aria-hidden="true"></span>
    <div class="music-queue" id="m-queue-panel" aria-hidden="true">
      <div class="music-queue-head">
        <span>Soundtrack (${tracks.length})</span>
        <span>Random on entry</span>
      </div>
      <div class="music-queue-list" id="m-queue-list"></div>
    </div>
    <div class="music-top">
      <button class="music-art-btn" id="m-art-btn" type="button" aria-label="Play or pause music">
        <img id="m-art" alt="" width="44" height="44">
        <span class="music-eq" id="m-eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
      </button>
      <div class="music-meta">
        <div class="music-title-clip" id="m-title-clip">
          <p class="music-title" id="m-title"></p>
        </div>
        <p class="music-artist" id="m-artist"></p>
      </div>
      <div class="music-head-btns">
        <a class="m-btn is-spotify" id="m-spotify" target="_blank" rel="noopener" aria-label="Open on Spotify" title="Open on Spotify">
          <svg class="i"><use href="${ICONS}#i-spotify"/></svg>
        </a>
        <button class="m-btn" id="m-min" type="button" aria-label="Minimize music player" title="Minimize">
          <svg class="i"><use href="${ICONS}#i-minus"/></svg>
        </button>
      </div>
    </div>
    <div class="music-prog">
      <span class="music-time" id="m-cur">0:00</span>
      <div class="music-scrub" id="m-scrub" role="slider" tabindex="0" aria-label="Seek track" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
        <span class="music-scrub-track"><span class="music-scrub-fill" id="m-fill"></span></span>
      </div>
      <span class="music-time" id="m-dur">--:--</span>
    </div>
    <div class="music-controls">
      <div class="music-transport">
        <button class="m-btn is-active" id="m-shuffle" type="button" aria-pressed="true" aria-label="Toggle shuffle" title="Shuffle">
          <svg class="i"><use href="${ICONS}#i-shuffle"/></svg>
        </button>
        <button class="m-btn" id="m-prev" type="button" aria-label="Previous track" title="Previous">
          <svg class="i"><use href="${ICONS}#i-prev"/></svg>
        </button>
        <button class="m-btn is-play" id="m-play" type="button" aria-label="Play music" title="Play / Pause">
          <svg class="i"><use href="${ICONS}#i-play-fill"/></svg>
        </button>
        <button class="m-btn" id="m-next" type="button" aria-label="Skip track" title="Skip">
          <svg class="i"><use href="${ICONS}#i-next"/></svg>
        </button>
      </div>
      <div class="music-vol">
        <button class="m-btn" id="m-mute" type="button" aria-label="Mute or unmute" title="Mute (M)">
          <svg class="i"><use href="${ICONS}#i-volume"/></svg>
        </button>
        <input class="music-vol-slider" id="m-vol" type="range" min="0" max="1" step="0.01" value="${volume}" aria-label="Music volume">
        <button class="m-btn" id="m-queue" type="button" aria-expanded="false" aria-label="Show tracklist" title="Tracklist">
          <svg class="i"><use href="${ICONS}#i-queue"/></svg>
        </button>
      </div>
    </div>
  `;
  document.body.append(dock);

  const glowEl = $('#m-glow', dock);
  const artEl = $('#m-art', dock);
  const artBtn = $('#m-art-btn', dock);
  const eqBars = $$('#m-eq i', dock);
  const titleClip = $('#m-title-clip', dock);
  const titleEl = $('#m-title', dock);
  const artistEl = $('#m-artist', dock);
  const spotifyEl = $('#m-spotify', dock);
  const minBtn = $('#m-min', dock);
  const curEl = $('#m-cur', dock);
  const durEl = $('#m-dur', dock);
  const scrubEl = $('#m-scrub', dock);
  const fillEl = $('#m-fill', dock);
  const shuffleBtn = $('#m-shuffle', dock);
  const prevBtn = $('#m-prev', dock);
  const playBtn = $('#m-play', dock);
  const nextBtn = $('#m-next', dock);
  const muteBtn = $('#m-mute', dock);
  const volSlider = $('#m-vol', dock);
  const queueBtn = $('#m-queue', dock);
  const queuePanel = $('#m-queue-panel', dock);
  const queueList = $('#m-queue-list', dock);

  let lastCurText = '0:00';
  let lastDurText = '--:--';
  let lastScrubVal = '0';
  let lastMarqueeKey = '';
  let marqueeRaf = 0;

  const saveSession = () => {
    try {
      sessionStorage.setItem(SESS_STATE, JSON.stringify({
        idx: currentIndex,
        time: audio.currentTime || 0,
        playing: wantPlay || playing,
      }));
    } catch {}
  };

  const syncTitleMarquee = (force = false) => {
    if (!titleClip || !titleEl) return;
    const width = minimized ? 0 : titleClip.clientWidth;
    const key = `${currentIndex}:${minimized ? 1 : 0}:${width}`;
    if (!force && key === lastMarqueeKey) return;
    lastMarqueeKey = key;
    cancelAnimationFrame(marqueeRaf);
    titleClip.classList.remove('is-overflow');
    titleEl.style.removeProperty('--marquee-dx');
    if (minimized || reduceMotion || width <= 0) return;
    marqueeRaf = requestAnimationFrame(() => {
      const overflow = titleEl.scrollWidth - titleClip.clientWidth;
      if (overflow > 6) {
        titleEl.style.setProperty('--marquee-dx', `${-(overflow + 18)}px`);
        titleClip.classList.add('is-overflow');
      }
    });
  };
  new ResizeObserver(() => syncTitleMarquee(false)).observe(dock);

  const renderQueue = () => {
    queueList.replaceChildren();
    tracks.forEach((t, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'music-q-item' + (i === currentIndex ? ' is-current' : '');
      if (i === currentIndex) btn.setAttribute('aria-current', 'true');
      btn.innerHTML = `
        <img src="${t.art}" alt="" width="32" height="32" loading="lazy">
        <span class="music-q-txt"><b>${t.title}</b><span>${t.artist}</span></span>
        ${i === currentIndex ? `<span class="music-q-badge">${playing ? 'Playing' : 'Selected'}</span>` : ''}
      `;
      btn.addEventListener('click', () => {
        loadTrack(i, { autoplay: true });
        toggleQueue(false);
      });
      queueList.append(btn);
    });
  };

  const syncUI = () => {
    const t = tracks[currentIndex];
    if (titleEl.textContent !== t.title) {
      titleEl.textContent = t.title;
      titleEl.title = `${t.title} — ${t.artist}`;
    }
    if (artistEl.textContent !== t.artist) artistEl.textContent = t.artist;
    if (artEl.getAttribute('src') !== t.art) {
      artEl.src = t.art;
      artEl.alt = `${t.title} cover art`;
    }
    if (spotifyEl.href !== t.spotifyUrl) spotifyEl.href = t.spotifyUrl;

    dock.classList.toggle('is-playing', playing);
    if ((!playing || muted) && glowEl) glowEl.style.opacity = '0.22';

    $('use', playBtn).setAttribute('href', `${ICONS}#i-${playing ? 'pause' : 'play-fill'}`);
    playBtn.setAttribute('aria-label', playing ? 'Pause music' : 'Play music');
    artBtn.setAttribute('aria-label', minimized ? 'Expand music player' : (playing ? 'Pause music' : 'Play music'));
    artBtn.title = minimized ? `Expand player · ${t.title}` : (playing ? 'Pause' : 'Play');

    const effectiveVol = muted ? 0 : volume;
    const isMutedNow = effectiveVol === 0;
    $('use', muteBtn).setAttribute('href', `${ICONS}#i-${isMutedNow ? 'mute' : 'volume'}`);
    muteBtn.classList.toggle('is-active', isMutedNow);
    volSlider.value = String(effectiveVol);
    volSlider.style.setProperty('--vol', `${Math.round(effectiveVol * 100)}%`);

    shuffleBtn.classList.toggle('is-active', shuffle);
    shuffleBtn.setAttribute('aria-pressed', String(shuffle));

    // Sync gate preview capsule (artist in kicker so long titles never clip artist)
    const gateKicker = $('#gate-track-kicker');
    const gateTitle = $('#gate-track-title');
    const gateArt = $('#gate-track-art');
    const gateIc = $('#gate-track-ic');
    if (gateKicker) gateKicker.textContent = `Queued · ${t.artist}`;
    if (gateTitle) {
      gateTitle.textContent = t.title;
      gateTitle.title = `${t.title} — ${t.artist}`;
    }
    if (gateArt && t.art) {
      gateArt.src = t.art;
      gateArt.hidden = false;
      gateIc?.toggleAttribute('hidden', true);
    }

    syncTitleMarquee(false);
    if (queueOpen) renderQueue();
    saveSession();
  };

  const stopEq = (suspendCtx = false) => {
    clearTimeout(eqResumeTimer);
    eqResumeTimer = 0;
    cancelAnimationFrame(eqRaf);
    eqRaf = 0;
    if (suspendCtx && audioCtx && audioCtx.state === 'running') {
      audioCtx.suspend().catch(() => {});
    }
  };

  const attachAnalyser = () => {
    if (!useCors || reduceMotion || document.hidden || !playing) return;
    const capture = audio.captureStream || audio.mozCaptureStream;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (typeof capture !== 'function' || !Ctx) return;
    try {
      const stream = capture.call(audio);
      if (!stream || !stream.getAudioTracks().length) return;
      if (!audioCtx) {
        audioCtx = new Ctx({ latencyHint: 'playback' });
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.8;
        freqData = new Uint8Array(analyser.frequencyBinCount);
      }
      if (!streamSrc) {
        streamSrc = audioCtx.createMediaStreamSource(stream);
        streamSrc.connect(analyser);
        // Intentionally NOT connected to audioCtx.destination — audio plays natively without Web Audio glitches.
      }
      dock.classList.add('has-analyser');
      if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }
      if (!eqRaf) eqRaf = requestAnimationFrame(pumpEq);
    } catch {
      analyser = null;
      streamSrc = null;
      dock.classList.remove('has-analyser');
    }
  };

  const pumpEq = (now) => {
    eqRaf = 0;
    if (!playing || !analyser || !freqData || document.hidden) return;
    if (now - lastEqTime >= 32) {
      lastEqTime = now;
      analyser.getByteFrequencyData(freqData);
      const bins = [2, 5, 9, 14];
      let energy = 0;
      const scale = muted ? 0 : Math.min(1, Math.max(0.28, volume * 1.4));
      for (let i = 0; i < eqBars.length; i++) {
        const val = ((freqData[bins[i]] || 0) / 255) * scale;
        energy += val;
        eqBars[i].style.transform = `scaleY(${(0.22 + val * 0.88).toFixed(2)})`;
      }
      if (glowEl) {
        const beat = muted ? 0 : Math.min(1, energy / 2.2);
        glowEl.style.opacity = (0.22 + beat * 0.58).toFixed(3);
      }
    }
    eqRaf = requestAnimationFrame(pumpEq);
  };

  let fadeRaf = 0;
  const fadeVolumeTo = (target, ms = 650, onDone = null) => {
    cancelAnimationFrame(fadeRaf);
    fadeRaf = 0;
    const clampedTarget = Math.min(1, Math.max(0, target));
    if (ms <= 0 || document.hidden) {
      audio.volume = clampedTarget;
      onDone?.();
      return;
    }
    const start = Math.min(1, Math.max(0, audio.volume));
    if (Math.abs(start - clampedTarget) < 0.002) {
      audio.volume = clampedTarget;
      onDone?.();
      return;
    }
    let t0 = 0;
    const step = (now) => {
      if (!t0) t0 = now;
      const p = Math.min(1, Math.max(0, (now - t0) / ms));
      audio.volume = Math.min(1, Math.max(0, start + (clampedTarget - start) * p));
      if (p < 1) {
        fadeRaf = requestAnimationFrame(step);
      } else {
        fadeRaf = 0;
        onDone?.();
      }
    };
    fadeRaf = requestAnimationFrame(step);
  };

  const resetStreamSrc = () => {
    if (streamSrc) {
      try { streamSrc.disconnect(); } catch {}
      streamSrc = null;
    }
  };

  let tryingLocal = false;
  const loadTrack = (idx, { autoplay = false, startTime = 0, fadeIn = false } = {}) => {
    clearTimeout(pauseTimer);
    pauseTimer = 0;
    cancelAnimationFrame(fadeRaf);
    fadeRaf = 0;
    if (metaAbort) {
      metaAbort();
      metaAbort = null;
    }

    currentIndex = ((idx % tracks.length) + tracks.length) % tracks.length;
    playedBag.add(currentIndex);
    try { localStorage.setItem(STORAGE_LAST, String(currentIndex)); } catch {}
    const t = tracks[currentIndex];

    const supportsLocal = Boolean(t.localSrc && (!t.localSrc.endsWith('.webm') || canPlayWebm));
    const preferLocal = Boolean(CONFIG.useLocalAudio && supportsLocal && !failedLocal.has(currentIndex));
    tryingLocal = preferLocal;
    resetStreamSrc();
    audio.volume = 0;
    audio.crossOrigin = useCors ? 'anonymous' : null;
    audio.src = preferLocal ? t.localSrc : t.previewSrc;
    audio.load();

    if (startTime > 0) {
      const onMeta = () => {
        if (Number.isFinite(audio.duration) && startTime < audio.duration - 1) {
          audio.currentTime = startTime;
        }
        cleanup();
      };
      const cleanup = () => {
        audio.removeEventListener('loadedmetadata', onMeta);
        if (metaAbort === cleanup) metaAbort = null;
      };
      metaAbort = cleanup;
      audio.addEventListener('loadedmetadata', onMeta);
    }

    lastCurText = '0:00';
    lastDurText = '--:--';
    lastScrubVal = '0';
    curEl.textContent = lastCurText;
    durEl.textContent = lastDurText;
    fillEl.style.width = '0%';
    scrubEl.setAttribute('aria-valuenow', '0');
    dock.style.setProperty('--prog', '0%');
    syncUI();

    if (autoplay) {
      play({ fadeIn });
    }
  };

  const play = async ({ fadeIn = false } = {}) => {
    const opId = ++playOpId;
    clearTimeout(pauseTimer);
    pauseTimer = 0;
    cancelAnimationFrame(fadeRaf);
    fadeRaf = 0;
    wantPlay = true;
    pendingFadeIn = fadeIn;
    try { sessionStorage.setItem('adg_entered', '1'); } catch {}

    audio.muted = muted;
    audio.volume = 0;
    try {
      await audio.play();
      if (opId !== playOpId) return;
      playing = true;
      pendingFadeIn = false;
      const target = muted ? 0 : volume;
      fadeVolumeTo(target, fadeIn ? 650 : 45);
      syncUI();
      if (!document.hidden) attachAnalyser();
    } catch {
      if (opId !== playOpId) return;
      playing = false;
      stopEq(true);
      syncUI();
    }
  };

  const pause = () => {
    const opId = ++playOpId;
    clearTimeout(pauseTimer);
    pauseTimer = 0;
    wantPlay = false;
    pendingFadeIn = false;
    playing = false;
    stopEq(true);
    syncUI();

    if (audio.paused) return;
    // Soft 35ms ramp to zero before pausing eliminates waveform click/pop
    fadeVolumeTo(0, 35, () => {
      if (opId !== playOpId || wantPlay) return;
      audio.pause();
    });
    pauseTimer = setTimeout(() => {
      if (opId === playOpId && !wantPlay && !audio.paused) {
        audio.volume = 0;
        audio.pause();
      }
    }, 60);
  };

  const togglePlay = () => (wantPlay || playing ? pause() : play());

  const next = ({ announce = false } = {}) => {
    let nextIdx;
    if (shuffle) {
      if (playedBag.size >= tracks.length) playedBag.clear();
      const pool = tracks.map((_, i) => i).filter((i) => !playedBag.has(i) && i !== currentIndex);
      nextIdx = pool.length ? pool[Math.floor(Math.random() * pool.length)] : pickRandomIndex(currentIndex);
    } else {
      nextIdx = (currentIndex + 1) % tracks.length;
    }
    history.push(nextIdx);
    if (history.length > 20) history.shift();
    loadTrack(nextIdx, { autoplay: true });
    if (announce) toast(`Now playing: ${tracks[nextIdx].title}`);
  };

  const prev = () => {
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    let prevIdx;
    if (history.length > 1) {
      history.pop();
      prevIdx = history[history.length - 1];
    } else {
      prevIdx = (currentIndex - 1 + tracks.length) % tracks.length;
    }
    loadTrack(prevIdx, { autoplay: true });
  };

  const setMuted = (val, { announce = false } = {}) => {
    muted = !!val;
    if (!muted && volume === 0) {
      volume = 0.38;
      try { localStorage.setItem(STORAGE_VOL, String(volume)); } catch {}
    }
    try { localStorage.setItem(STORAGE_MUTE, muted ? '1' : '0'); } catch {}
    if (playing && !audio.paused) {
      if (muted) {
        fadeVolumeTo(0, 30, () => { if (muted) audio.muted = true; });
      } else {
        audio.volume = 0;
        audio.muted = false;
        fadeVolumeTo(volume, 40);
      }
    } else {
      cancelAnimationFrame(fadeRaf);
      fadeRaf = 0;
      audio.muted = muted;
      audio.volume = muted ? 0 : volume;
    }
    syncUI();
    if (announce) toast(muted ? 'Music muted' : 'Music unmuted');
  };

  const toggleMute = (announce = false) => setMuted(!muted, { announce });

  const toggleQueue = (force) => {
    queueOpen = typeof force === 'boolean' ? force : !queueOpen;
    queuePanel.classList.toggle('is-open', queueOpen);
    queuePanel.setAttribute('aria-hidden', String(!queueOpen));
    queueBtn.classList.toggle('is-active', queueOpen);
    queueBtn.setAttribute('aria-expanded', String(queueOpen));
    if (queueOpen) renderQueue();
  };

  const setMinimized = (val) => {
    minimized = !!val;
    dock.classList.toggle('is-min', minimized);
    if (minimized) {
      toggleQueue(false);
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        dock.style.setProperty('--prog', `${Math.min(100, Math.max(0, (audio.currentTime / audio.duration) * 100)).toFixed(1)}%`);
      }
    }
    try { localStorage.setItem(STORAGE_MIN, minimized ? '1' : '0'); } catch {}
    syncUI();
  };

  // Fallback seamlessly from local .webm -> official Spotify preview -> non-CORS fallback
  audio.addEventListener('error', () => {
    const t = tracks[currentIndex];
    if (tryingLocal && t.previewSrc) {
      failedLocal.add(currentIndex);
      tryingLocal = false;
      resetStreamSrc();
      audio.src = t.previewSrc;
      audio.load();
      if (wantPlay) play({ fadeIn: pendingFadeIn });
      return;
    }
    if (useCors && t.previewSrc) {
      useCors = false;
      resetStreamSrc();
      analyser = null;
      dock.classList.remove('has-analyser');
      audio.removeAttribute('crossOrigin');
      audio.src = t.previewSrc;
      audio.load();
      if (wantPlay) play({ fadeIn: pendingFadeIn });
    }
  });

  audio.addEventListener('loadedmetadata', () => {
    const dur = fmtSec(audio.duration);
    if (dur !== lastDurText) {
      lastDurText = dur;
      durEl.textContent = dur;
    }
  });
  audio.addEventListener('timeupdate', () => {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
    const pct = Math.min(100, Math.max(0, (audio.currentTime / audio.duration) * 100));
    fillEl.style.width = `${pct.toFixed(2)}%`;
    if (minimized) dock.style.setProperty('--prog', `${pct.toFixed(1)}%`);
    const cur = fmtSec(audio.currentTime);
    if (cur !== lastCurText) {
      lastCurText = cur;
      curEl.textContent = cur;
    }
    const dur = fmtSec(audio.duration);
    if (dur !== lastDurText) {
      lastDurText = dur;
      durEl.textContent = dur;
    }
    const rounded = String(Math.round(pct));
    if (rounded !== lastScrubVal) {
      lastScrubVal = rounded;
      scrubEl.setAttribute('aria-valuenow', rounded);
    }
  });
  audio.addEventListener('ended', () => next());
  audio.addEventListener('play', () => {
    playing = true;
    syncUI();
    if (!document.hidden) attachAnalyser();
  });
  audio.addEventListener('pause', () => {
    if (!audio.ended) {
      playing = false;
      stopEq(true);
      syncUI();
    }
  });

  // UI interactions
  playBtn.addEventListener('click', togglePlay);
  nextBtn.addEventListener('click', () => next());
  prevBtn.addEventListener('click', prev);
  muteBtn.addEventListener('click', () => toggleMute(false));
  shuffleBtn.addEventListener('click', () => {
    shuffle = !shuffle;
    syncUI();
    toast(shuffle ? 'Shuffle on' : 'Shuffle off');
  });
  volSlider.addEventListener('input', () => {
    volume = Math.min(1, Math.max(0, parseFloat(volSlider.value) || 0));
    muted = volume === 0;
    cancelAnimationFrame(fadeRaf);
    fadeRaf = 0;
    audio.muted = muted;
    audio.volume = volume;
    try {
      localStorage.setItem(STORAGE_VOL, String(volume));
      localStorage.setItem(STORAGE_MUTE, muted ? '1' : '0');
    } catch {}
    syncUI();
  });
  queueBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleQueue();
  });
  minBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    setMinimized(true);
  });
  artBtn.addEventListener('click', () => {
    if (minimized) setMinimized(false);
    else togglePlay();
  });
  dock.addEventListener('click', (e) => {
    if (minimized && e.target === dock) setMinimized(false);
  });
  document.addEventListener('click', (e) => {
    if (queueOpen && !dock.contains(e.target)) toggleQueue(false);
  });

  // Scrubber seeking (mouse + touch + keyboard)
  const seekAt = (clientX) => {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
    const rect = scrubEl.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    audio.currentTime = ratio * audio.duration;
  };
  let scrubbing = false;
  scrubEl.addEventListener('pointerdown', (e) => {
    scrubbing = true;
    scrubEl.classList.add('is-dragging');
    scrubEl.setPointerCapture?.(e.pointerId);
    seekAt(e.clientX);
  });
  scrubEl.addEventListener('pointermove', (e) => { if (scrubbing) seekAt(e.clientX); });
  const endScrub = () => { scrubbing = false; scrubEl.classList.remove('is-dragging'); };
  scrubEl.addEventListener('pointerup', endScrub);
  scrubEl.addEventListener('pointercancel', endScrub);
  scrubEl.addEventListener('keydown', (e) => {
    if (!Number.isFinite(audio.duration)) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); audio.currentTime = Math.min(audio.duration, audio.currentTime + 5); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); audio.currentTime = Math.max(0, audio.currentTime - 5); }
  });

  addEventListener('pagehide', () => {
    saveSession();
    stopEq(true);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // Suspend passive visualizer AudioContext while hidden; native <audio> plays untouched!
      stopEq(true);
    } else if (playing) {
      // Delay resuming visualizer briefly so tab-restore compositing finishes smoothly first
      clearTimeout(eqResumeTimer);
      eqResumeTimer = setTimeout(() => {
        if (!document.hidden && playing) attachAnalyser();
      }, 150);
    }
  });

  // Load initial track
  loadTrack(currentIndex, {
    autoplay: false,
    startTime: savedSession?.time || 0,
  });

  // Resume smoothly across Home <-> Portfolio navigation if already entered & playing
  if (!hasGate && savedSession?.playing) {
    play({ fadeIn: false });
  }

  // Unique Mirror Pond Click-to-Enter Portal wiring
  if (hasGate && gateEl) {
    const lens = $('#gate-lens');
    const medallion = $('.gate-medallion', gateEl);
    const glare = $('.gate-glare', gateEl);
    const ripples = $('#gate-ripples');
    const rerollBtn = $('#gate-reroll');
    const muteEnterBtn = $('#gate-enter-muted');
    const behindEls = [$('header.nav'), $('main'), dock].filter(Boolean);
    let entered = false;

    behindEls.forEach((el) => { el.inert = true; });
    requestAnimationFrame(() => gateEl.focus({ preventScroll: true }));

    if (finePointer && !reduceMotion) {
      let gateFrame = 0;
      let gx = 0;
      let gy = 0;
      gateEl.addEventListener('pointermove', (e) => {
        if (entered) return;
        gx = e.clientX;
        gy = e.clientY;
        if (gateFrame) return;
        gateFrame = requestAnimationFrame(() => {
          gateFrame = 0;
          if (entered) return;
          if (lens) {
            lens.classList.add('on');
            lens.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
          }
          const nx = (gx / innerWidth - 0.5) * 2;
          const ny = (gy / innerHeight - 0.5) * 2;
          if (medallion) medallion.style.transform = `perspective(800px) rotateX(${(-ny * 9).toFixed(2)}deg) rotateY(${(nx * 9).toFixed(2)}deg)`;
          if (glare) glare.style.transform = `translate3d(${(nx * 28 - 10).toFixed(1)}%, ${(ny * 28 - 10).toFixed(1)}%, 0)`;
        });
      }, { passive: true });
    }

    rerollBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const rolled = pickRandomIndex(currentIndex);
      loadTrack(rolled, { autoplay: false });
    });

    const onGateKey = (e) => {
      if (entered) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        enterSite(true, innerWidth / 2, innerHeight / 2);
      } else if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest('button, a')) {
        e.preventDefault();
        enterSite(false, innerWidth / 2, innerHeight / 2);
      }
    };

    const enterSite = (startMuted, cx, cy) => {
      if (entered) return;
      entered = true;
      removeEventListener('keydown', onGateKey);
      behindEls.forEach((el) => { el.inert = false; });
      try { sessionStorage.setItem('adg_entered', '1'); } catch {}

      if (ripples && !reduceMotion) {
        const rx = cx || innerWidth / 2;
        const ry = cy || innerHeight / 2;
        [0, 95, 190].forEach((delay) => {
          setTimeout(() => {
            const burst = document.createElement('span');
            burst.className = 'gate-click-ripple';
            burst.style.left = `${rx}px`;
            burst.style.top = `${ry}px`;
            ripples.append(burst);
          }, delay);
        });
      }

      if (startMuted) {
        setMuted(true);
      } else {
        setMuted(false);
        play({ fadeIn: true });
      }

      gateEl.classList.add('is-leaving');
      document.documentElement.classList.remove('gate-pending');
      document.dispatchEvent(new CustomEvent('adg:entered'));

      setTimeout(() => {
        document.documentElement.classList.add('has-entered');
        gateEl.remove();
      }, reduceMotion ? 10 : 680);
    };

    muteEnterBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      enterSite(true, e.clientX, e.clientY);
    });

    gateEl.addEventListener('click', (e) => {
      if (e.target.closest('button, a')) return;
      enterSite(false, e.clientX, e.clientY);
    });

    addEventListener('keydown', onGateKey);
  }

  return {
    togglePlay,
    next,
    prev,
    toggleMute,
    loadTrack,
    isQueueOpen: () => queueOpen,
    closeQueue: (restoreFocus = false) => {
      if (!queueOpen) return;
      toggleQueue(false);
      if (restoreFocus) queueBtn.focus();
    },
  };
})();

// Command menu ( / or Ctrl+K ). Built the first time it opens.
const COMMANDS = [
  { name: 'profile', desc: 'Open my Discord profile', icon: 'discord', tag: '↗', run: () => openTab(CONFIG.discordProfileUrl) },
  { name: 'copy', desc: 'Copy my Discord username', icon: 'copy', run: () => copyDiscord() },
  { name: 'discord', desc: 'Join my Discord server', icon: 'discord', tag: '↗', run: () => openTab(CONFIG.discordInvite) },
  { name: 'portfolio', desc: 'Projects, bot demo and pricing', icon: 'grid', run: () => go('/portfolio.html') },
  { name: 'greenville', desc: 'Greenville Roleplay Bot', icon: 'bot', run: () => go('/portfolio.html#greenville') },
  { name: 'pricing', desc: 'What I build and what it costs', icon: 'tag', run: () => go('/portfolio.html#pricing') },
  { name: 'demo', desc: 'Try the live bot demo', icon: 'play', run: () => go('/portfolio.html#chat') },
  { name: 'music', desc: 'Play or pause background music', icon: 'music', run: () => music?.togglePlay() },
  { name: 'skip', desc: 'Skip to next random track', icon: 'next', run: () => music?.next({ announce: true }) },
  { name: 'mute', desc: 'Mute or unmute background music', icon: 'mute', run: () => music?.toggleMute(true) },
  { name: 'github', desc: 'Code and projects', icon: 'github', tag: '↗', run: () => openTab('https://github.com/a-DuckGod') },
  { name: 'youtube', desc: 'Videos', icon: 'youtube', tag: '↗', run: () => openTab('https://www.youtube.com/@aDuckGod') },
  { name: 'twitch', desc: 'Streams', icon: 'twitch', tag: '↗', run: () => openTab('https://www.twitch.tv/a_duckgod') },
  { name: 'home', desc: 'Back to the start', icon: 'home', run: () => go('/') },
];

const palette = {
  el: null,
  input: null,
  list: null,
  items: [],
  index: 0,
  lastFocus: null,

  build() {
    const el = document.createElement('div');
    el.className = 'palette';
    el.innerHTML = `
      <div class="pal" role="dialog" aria-modal="true" aria-label="Commands">
        <div class="pal-head">
          <span class="pal-slash">/</span>
          <input type="text" placeholder="Type a command" aria-label="Search commands" role="combobox" aria-expanded="true" aria-controls="pal-list" autocomplete="off" spellcheck="false">
          <kbd>esc</kbd>
        </div>
        <p class="pal-title">Commands</p>
        <ul class="pal-list" id="pal-list" role="listbox"></ul>
        <div class="pal-foot"><span><kbd>↑</kbd><kbd>↓</kbd> move</span><span><kbd>↵</kbd> run</span></div>
      </div>`;
    document.body.append(el);
    this.el = el;
    this.input = $('input', el);
    this.list = $('.pal-list', el);

    this.input.addEventListener('input', () => {
      if (this.input.value.startsWith('/')) this.input.value = this.input.value.replace(/^\/+/, '');
      this.index = 0;
      this.render();
    });
    this.input.addEventListener('keydown', (e) => {
      const count = Math.max(1, this.items.length);
      if (e.key === 'ArrowDown') { e.preventDefault(); this.select((this.index + 1) % count); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); this.select((this.index - 1 + count) % count); }
      else if (e.key === 'Enter') { e.preventDefault(); this.run(this.index); }
      else if (e.key === 'Tab') { e.preventDefault(); }
    });
    el.addEventListener('click', (e) => { if (e.target === el) this.close(); });
  },

  render() {
    const q = this.input.value.trim().replace(/^\//, '').toLowerCase();
    this.items = COMMANDS.filter((c) => !q || c.name.includes(q) || c.desc.toLowerCase().includes(q));
    this.list.replaceChildren();
    if (!this.items.length) {
      this.input.removeAttribute('aria-activedescendant');
      this.list.innerHTML = '<li class="pal-empty">No command found</li>';
      return;
    }
    this.items.forEach((cmd, i) => {
      const li = document.createElement('li');
      li.className = 'pal-item';
      li.id = `pal-${cmd.name}`;
      li.setAttribute('role', 'option');
      li.innerHTML = `<span class="pal-ic"><svg><use href="${ICONS}#i-${cmd.icon}"/></svg></span><span><span class="pal-name">/${cmd.name}</span><span class="pal-desc">${cmd.desc}</span></span>${cmd.tag ? `<span class="pal-tag">${cmd.tag}</span>` : ''}`;
      li.addEventListener('mousemove', () => { if (this.index !== i) this.select(i); });
      li.addEventListener('click', () => this.run(i));
      this.list.append(li);
    });
    this.select(this.index);
  },

  select(i) {
    this.index = i;
    $$('.pal-item', this.list).forEach((li, n) => li.setAttribute('aria-selected', n === i));
    const current = this.items[i];
    if (!current) return;
    this.input.setAttribute('aria-activedescendant', `pal-${current.name}`);
    $(`#pal-${current.name}`)?.scrollIntoView({ block: 'nearest' });
  },

  open() {
    if ($('.lightbox.open')) return;
    music?.closeQueue(false);
    if (!this.el) this.build();
    this.lastFocus = document.activeElement;
    this.input.value = '';
    this.index = 0;
    this.render();
    this.el.classList.add('open');
    requestAnimationFrame(() => {
      this.input.value = '';
      this.input.focus();
    });
  },

  close() {
    if (!this.el) return;
    this.el.classList.remove('open');
    this.lastFocus?.focus?.();
  },

  get isOpen() { return !!this.el?.classList.contains('open'); },

  run(i) {
    const cmd = this.items[i];
    if (!cmd) return;
    this.close();
    cmd.run();
  },
};

$$('[data-palette]').forEach((btn) => btn.addEventListener('click', () => palette.open()));
addEventListener('keydown', (e) => {
  if (document.documentElement.classList.contains('gate-pending')) return;
  const lbOpen = Boolean($('.lightbox.open'));
  const active = document.activeElement;
  const isRange = active?.tagName === 'INPUT' && active.type === 'range';
  const typing = (!isRange && /^(INPUT|TEXTAREA|SELECT)$/.test(active?.tagName)) || active?.isContentEditable;
  if (e.key === 'Escape') {
    if (lbOpen) return; // handled by lightbox listener
    if (palette.isOpen) {
      e.preventDefault();
      palette.close();
    } else if (music?.isQueueOpen()) {
      e.preventDefault();
      music.closeQueue(true);
    }
    return;
  }
  if (lbOpen) return;
  if ((e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey && !typing && !palette.isOpen) || ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === 'k')) {
    e.preventDefault();
    palette.isOpen ? palette.close() : palette.open();
  } else if (e.key.toLowerCase() === 'm' && !e.ctrlKey && !e.metaKey && !e.altKey && !typing && !palette.isOpen) {
    music?.toggleMute(true);
  }
});

// Discord demo on the portfolio page
const chat = $('#chat');
if (chat) {
  const log = $('.dc-log', chat);
  const startup = $('#startup', chat);
  const ea = $('#ea', chat);
  const release = $('#release', chat);
  const typing = $('.dc-typing', chat);
  const gem = $('.dc-gem', chat);
  const reactBtn = $('[data-react]', chat);
  const countEl = $('[data-react-count]', chat);
  const replyTpl = $('#reply-tpl');
  const SESSION_CODE = '1A2B3';
  const REPLIES = {
    ea: {
      member: { text: '🔒 Early Access is only for server boosters and the Early Access role.' },
      booster: { text: 'Here\'s the Early Access private server code:', code: SESSION_CODE },
    },
    join: { text: 'Here\'s the private server code:', code: SESSION_CODE },
  };
  let role = 'member';
  let baseCount = 6;
  let userReacted = false;
  let goalReached = false;
  let timers = [];

  const clearTimers = () => {
    timers.forEach((t) => clearTimeout(t));
    timers = [];
  };
  const clearReplies = () => $$('.is-ephemeral', log).forEach((m) => m.remove());
  const syncCount = () => {
    if (!reactBtn || !countEl) return;
    countEl.textContent = String(baseCount + (userReacted ? 1 : 0));
    reactBtn.classList.toggle('is-on', userReacted);
    reactBtn.setAttribute('aria-pressed', userReacted);
  };
  const revealMsg = (el) => {
    el.classList.remove('is-pending', 'is-fresh');
    void el.offsetWidth;
    el.classList.add('is-fresh');
    log.scrollTop = log.scrollHeight;
  };

  const triggerSessionFlow = () => {
    if (goalReached) return;
    goalReached = true;
    clearTimers();
    timers.push(setTimeout(() => {
      revealMsg(ea);
    }, 1000));
    timers.push(setTimeout(() => {
      typing.classList.add('on');
    }, 6800));
    timers.push(setTimeout(() => {
      typing.classList.remove('on');
      revealMsg(release);
    }, 8000));
  };

  const reply = ({ text, code } = {}) => {
    clearReplies();
    const msg = replyTpl.content.firstElementChild.cloneNode(true);
    msg.classList.add('is-fresh');
    $('.dc-text', msg).textContent = text;
    const codeBlock = $('.dc-codeblock', msg);
    if (code && codeBlock) {
      $('[data-code-text]', codeBlock).textContent = code;
      const copyBtn = $('[data-copy-code]', codeBlock);
      copyBtn.dataset.copyCode = code;
      copyBtn.addEventListener('click', () => copyText(code, `Copied ${code}`, `Private server code: ${code}`));
      codeBlock.hidden = false;
    }
    $('[data-dismiss]', msg).addEventListener('click', () => msg.remove());
    log.append(msg);
    log.scrollTop = log.scrollHeight;
  };

  const play = () => {
    clearTimers();
    clearReplies();
    typing.classList.remove('on');
    baseCount = 6;
    userReacted = false;
    goalReached = false;
    ea.classList.toggle('is-mentioned', role === 'booster');
    if (reduceMotion) {
      baseCount = 7;
      goalReached = true;
      syncCount();
      startup.classList.remove('is-pending');
      ea.classList.remove('is-pending');
      release.classList.remove('is-pending');
      log.scrollTop = log.scrollHeight;
      return;
    }
    syncCount();
    startup.classList.add('is-pending');
    ea.classList.add('is-pending');
    release.classList.add('is-pending');
    typing.classList.add('on');
    timers.push(setTimeout(() => {
      typing.classList.remove('on');
      revealMsg(startup);
      timers.push(setTimeout(() => {
        if (goalReached) return;
        baseCount = 7;
        syncCount();
        triggerSessionFlow();
      }, 6000));
    }, 1100));
  };

  $('[data-act="ea"]', chat)?.addEventListener('click', () => reply(REPLIES.ea[role]));
  $('[data-act="join"]', chat)?.addEventListener('click', () => reply(REPLIES.join));
  $('#replay')?.addEventListener('click', play);

  reactBtn?.addEventListener('click', () => {
    userReacted = !userReacted;
    syncCount();
    if (baseCount + (userReacted ? 1 : 0) >= 7) triggerSessionFlow();
  });

  $$('[data-role]').forEach((btn) => btn.addEventListener('click', () => {
    role = btn.dataset.role;
    $$('[data-role]').forEach((b) => b.setAttribute('aria-pressed', b === btn));
    gem.toggleAttribute('hidden', role !== 'booster');
    ea.classList.toggle('is-mentioned', role === 'booster');
    clearReplies();
  }));

  new IntersectionObserver(([entry], observer) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    play();
  }, { threshold: 0.35 }).observe(chat);
}

// Typewriter prompt demo on the AI Media Generation card
const promptEl = $('[data-prompts]');
if (promptEl && !reduceMotion) {
  const prompts = promptEl.dataset.prompts.split('|').filter(Boolean);
  const goBtn = promptEl.closest('.prompt')?.querySelector('.prompt-go');
  if (prompts.length > 1) {
    let idx = 0;
    let charIdx = prompts[0].length;
    let deleting = true;
    let visible = false;
    let timer = 0;

    const stop = () => {
      clearTimeout(timer);
      timer = 0;
    };

    const schedule = (ms) => {
      stop();
      if (!visible || document.hidden) return;
      timer = setTimeout(tick, ms);
    };

    const tick = () => {
      timer = 0;
      if (!visible || document.hidden) return;
      const full = prompts[idx];
      if (deleting) {
        promptEl.classList.add('is-typing');
        charIdx--;
        promptEl.textContent = full.slice(0, charIdx);
        if (charIdx > 0) {
          schedule(18);
        } else {
          deleting = false;
          idx = (idx + 1) % prompts.length;
          promptEl.classList.remove('is-typing');
          schedule(420);
        }
      } else {
        promptEl.classList.add('is-typing');
        charIdx++;
        promptEl.textContent = full.slice(0, charIdx);
        if (charIdx < full.length) {
          schedule(34 + Math.random() * 24);
        } else {
          deleting = true;
          promptEl.classList.remove('is-typing');
          if (goBtn) {
            goBtn.classList.add('is-pulse');
            setTimeout(() => goBtn.classList.remove('is-pulse'), 240);
          }
          schedule(2400);
        }
      }
    };

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else if (visible && !timer) schedule(600);
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !timer && !document.hidden) schedule(1400);
        else if (!visible) stop();
      }, { threshold: 0.25 }).observe(promptEl);
    } else {
      visible = true;
      schedule(1800);
    }
  }
}

// Screenshot lightbox (click + keyboard accessible)
const shots = $$('.shot img');
if (shots.length) {
  let lb = null;
  let lbImg = null;
  let lbCap = null;
  let lbCloseBtn = null;
  let lbLastFocus = null;

  const closeLb = () => {
    if (!lb?.classList.contains('open')) return;
    lb.classList.remove('open');
    lbLastFocus?.focus?.();
  };
  const openLb = (img) => {
    music?.closeQueue(false);
    if (palette.isOpen) palette.close();
    lbLastFocus = document.activeElement;
    if (!lb) {
      lb = document.createElement('div');
      lb.className = 'lightbox';
      lb.setAttribute('role', 'dialog');
      lb.setAttribute('aria-modal', 'true');
      lb.setAttribute('aria-label', 'Screenshot preview');
      lb.innerHTML = '<button class="lightbox-close" type="button" aria-label="Close screenshot">&times;</button><img alt=""><p class="lightbox-cap"></p>';
      lbImg = $('img', lb);
      lbCap = $('.lightbox-cap', lb);
      lbCloseBtn = $('.lightbox-close', lb);
      lbCloseBtn.addEventListener('click', closeLb);
      lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
      document.body.append(lb);
    }
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = img.alt;
    lb.classList.add('open');
    lbCloseBtn?.focus();
  };

  shots.forEach((img) => {
    const fig = img.closest('.shot');
    const trigger = () => {
      if (fig.classList.contains('empty')) return;
      openLb(img);
    };
    fig.addEventListener('click', trigger);
    fig.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        trigger();
      }
    });
  });

  addEventListener('keydown', (e) => {
    if (!lb?.classList.contains('open')) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      closeLb();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      lbCloseBtn?.focus();
    }
  });
}
