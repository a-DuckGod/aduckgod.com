const CONFIG = {
  discordUser: 'a_duckgod',
  // Discord user ID for the live status on the home page (via Lanyard). Set to '' to turn it off.
  discordId: '1131237914957840525',
  // Show raw Discord custom status text when idle/not in a game or Spotify.
  showCustomStatus: false,
  discordInvite: 'https://discord.gg/JS3cuBQaef',
  demoInvite: 'https://discord.gg/RrHtpRTJe6',
};

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const ICONS = '/assets/icons.svg?v=3';

const go = (path) => { location.href = path; };
const openTab = (url) => window.open(url, '_blank', 'noopener,noreferrer');

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
  }
}

const copyDiscord = () => copyText(CONFIG.discordUser, 'Discord username copied', `My Discord username is ${CONFIG.discordUser}`);

$$('[data-copy-discord]').forEach((el) => el.addEventListener('click', copyDiscord));
$$('a[data-soon]').forEach((a) => a.addEventListener('click', (e) => {
  e.preventDefault();
  toast(a.dataset.soon || 'Link coming soon');
}));
$$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

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

// Rotating "I make ..." word
const rot = $('[data-rotate]');
if (rot && !reduceMotion) {
  const words = rot.dataset.rotate.split('|');
  let index = 0;
  setInterval(() => {
    if (document.hidden) return;
    rot.classList.add('out');
    setTimeout(() => {
      index = (index + 1) % words.length;
      rot.textContent = words[index];
      rot.classList.replace('out', 'in');
      void rot.offsetWidth; // apply the start position before animating back in
      rot.classList.remove('in');
    }, 300);
  }, 2600);
}

// Cursor light: background spotlight + tile glow.
// Tile positions are cached and only re-measured when the layout changes,
// and only tiles near the cursor are updated, so moving the mouse never forces layout.
if (finePointer && !reduceMotion) {
  const spot = $('.bg-spot');
  const tiles = $$('.tile');
  const lit = new Set();
  let boxes = null;
  let active = false;
  let x = 0;
  let y = 0;
  let frame = 0;

  const measure = () => {
    boxes = tiles.map((el) => {
      let left = 0;
      let top = 0;
      for (let n = el; n; n = n.offsetParent) {
        left += n.offsetLeft;
        top += n.offsetTop;
      }
      return { el, left, top, right: left + el.offsetWidth, bottom: top + el.offsetHeight };
    });
  };
  new ResizeObserver(() => { boxes = null; }).observe(document.body);

  const render = () => {
    frame = 0;
    if (spot) spot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    if (!boxes) measure();
    const px = x + scrollX;
    const py = y + scrollY;
    for (const box of boxes) {
      const near = px > box.left - 260 && px < box.right + 260 && py > box.top - 260 && py < box.bottom + 260;
      if (near) {
        box.el.style.setProperty('--mx', `${px - box.left}px`);
        box.el.style.setProperty('--my', `${py - box.top}px`);
        if (!lit.has(box.el)) { box.el.classList.add('is-lit'); lit.add(box.el); }
      } else if (lit.has(box.el)) {
        box.el.classList.remove('is-lit');
        lit.delete(box.el);
      }
    }
  };

  const queue = () => { if (active && !frame) frame = requestAnimationFrame(render); };
  addEventListener('pointermove', (e) => {
    active = true;
    x = e.clientX;
    y = e.clientY;
    spot?.classList.add('on');
    queue();
  }, { passive: true });
  addEventListener('scroll', queue, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => {
    active = false;
    spot?.classList.remove('on');
    lit.forEach((el) => el.classList.remove('is-lit'));
    lit.clear();
  });
}

// Live Discord status + Rich Activity card
const presenceTitle = $('#presence-title');
if (presenceTitle && CONFIG.discordId) {
  const STATUS = {
    online: ['Online', '--ok'],
    idle: ['Idle', '--idle'],
    dnd: ['Do Not Disturb', '--dnd'],
    offline: ['Offline', '--off'],
  };
  const VERBS = { 0: 'Playing', 1: 'Streaming', 2: 'Listening to', 3: 'Watching', 5: 'Competing in' };
  const ICONS_BY_TYPE = { 0: 'gamepad', 1: 'broadcast', 2: 'music', 3: 'eye', 5: 'gamepad' };

  const fallback = $('#presence-fallback');
  const sub = $('#presence-sub');
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

  let activeTimestamps = null;
  let isSpotify = false;

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

  const setArt = (src, iconId, smallSrc = '') => {
    const useEl = $('use', actIc);
    if (useEl) useEl.setAttribute('href', `${ICONS}#i-${iconId}`);
    if (src) {
      actImg.onerror = () => {
        actImg.hidden = true;
        actIc.toggleAttribute('hidden', false);
      };
      actImg.src = src;
      actImg.hidden = false;
      actIc.toggleAttribute('hidden', true);
    } else {
      actImg.hidden = true;
      actIc.toggleAttribute('hidden', false);
    }
    if (smallSrc) {
      actSmall.onerror = () => { actSmall.hidden = true; };
      actSmall.src = smallSrc;
      actSmall.hidden = false;
    } else {
      actSmall.hidden = true;
    }
  };

  const tickTime = () => {
    if (!activeTimestamps?.start || document.hidden) return;
    const now = Date.now();
    if (isSpotify && activeTimestamps.end) {
      const total = Math.max(1000, activeTimestamps.end - activeTimestamps.start);
      const elapsed = Math.min(total, Math.max(0, now - activeTimestamps.start));
      actTime.textContent = `${fmtTime(elapsed)} / ${fmtTime(total)}`;
      actTime.hidden = false;
      actBar.hidden = false;
      actBarFill.style.width = `${((elapsed / total) * 100).toFixed(1)}%`;
    } else {
      const elapsed = Math.max(0, now - activeTimestamps.start);
      actTime.textContent = `${fmtTime(elapsed)} elapsed`;
      actTime.hidden = false;
      actBar.hidden = true;
    }
  };

  const update = async () => {
    if (document.hidden) return;
    try {
      const res = await fetch(`https://api.lanyard.rest/v1/users/${CONFIG.discordId}`);
      if (!res.ok) return;
      const { success, data } = await res.json();
      if (!success) return;

      const [label, color] = STATUS[data.discord_status] || STATUS.offline;
      document.documentElement.style.setProperty('--presence', `var(${color})`);
      presenceTitle.textContent = label;
      live.hidden = data.discord_status === 'offline';

      const activities = data.activities || [];
      const game = activities.find((a) => a.type !== 4 && a.id !== 'spotify:1');
      const custom = activities.find((a) => a.type === 4 && a.state);
      const device = data.active_on_discord_desktop ? 'On Desktop' : data.active_on_discord_mobile ? 'On Mobile' : data.active_on_discord_web ? 'On Web' : '';

      if (data.listening_to_spotify && data.spotify) {
        const sp = data.spotify;
        isSpotify = true;
        activeTimestamps = sp.timestamps || null;
        actBox.classList.add('is-spotify');
        setArt(sp.album_art_url, 'music');
        actKicker.textContent = 'Listening to Spotify';
        actName.textContent = sp.song;
        actMeta.textContent = `by ${sp.artist}`;
        actMeta.hidden = false;
        actTime.hidden = !activeTimestamps?.start;
        actBar.hidden = !(activeTimestamps?.start && activeTimestamps?.end);
        tickTime();
        fallback.hidden = true;
        actBox.hidden = false;
      } else if (game) {
        isSpotify = false;
        activeTimestamps = game.timestamps || null;
        actBox.classList.remove('is-spotify');
        const largeSrc = resolveAsset(game.application_id, game.assets?.large_image);
        const smallSrc = resolveAsset(game.application_id, game.assets?.small_image);
        setArt(largeSrc, ICONS_BY_TYPE[game.type] || 'gamepad', smallSrc);
        actKicker.textContent = VERBS[game.type] || 'Playing';
        actName.textContent = game.name;
        const metaParts = [game.details, game.state].filter(Boolean);
        const metaLine = metaParts.join(' · ') || (device ? `Active ${device.toLowerCase()}` : '');
        actMeta.textContent = metaLine;
        actMeta.hidden = !metaLine;
        actBar.hidden = true;
        actTime.hidden = !activeTimestamps?.start;
        tickTime();
        fallback.hidden = true;
        actBox.hidden = false;
      } else {
        isSpotify = false;
        activeTimestamps = null;
        actBox.hidden = true;
        fallback.hidden = false;
        sub.textContent = (CONFIG.showCustomStatus && custom) ? custom.state : 'Custom bots, server setup and hosting.';
      }
    } catch {
      // keep the default text
    }
  };

  update();
  setInterval(update, 30000);
  setInterval(tickTime, 1000);
  document.addEventListener('visibilitychange', () => {
    update();
    tickTime();
  });
}

// Command menu ( / or Ctrl+K ). Built the first time it opens.
const COMMANDS = [
  { name: 'discord', desc: 'Join my Discord server', icon: 'discord', tag: '↗', run: () => openTab(CONFIG.discordInvite) },
  { name: 'portfolio', desc: 'Projects, bot demo and pricing', icon: 'grid', run: () => go('/portfolio.html') },
  { name: 'greenville', desc: 'Greenville Roleplay Bot', icon: 'bot', run: () => go('/portfolio.html#greenville') },
  { name: 'pricing', desc: 'What I build and what it costs', icon: 'tag', run: () => go('/portfolio.html#pricing') },
  { name: 'demo', desc: 'Join the demo server', icon: 'play', tag: '↗', run: () => openTab(CONFIG.demoInvite) },
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
    this.el.classList.remove('open');
    this.lastFocus?.focus?.();
  },

  get isOpen() { return this.el?.classList.contains('open'); },

  run(i) {
    const cmd = this.items[i];
    if (!cmd) return;
    this.close();
    cmd.run();
  },
};

$$('[data-palette]').forEach((btn) => btn.addEventListener('click', () => palette.open()));
addEventListener('keydown', (e) => {
  const active = document.activeElement;
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(active?.tagName) || active?.isContentEditable;
  if (e.key === 'Escape' && palette.isOpen) {
    e.preventDefault();
    palette.close();
  } else if ((e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey && !typing && !palette.isOpen) || ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === 'k')) {
    e.preventDefault();
    palette.isOpen ? palette.close() : palette.open();
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
      // If the visitor doesn't react within 6s of seeing /startup, someone else adds the 7th reaction
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

    const schedule = (ms) => {
      clearTimeout(timer);
      timer = setTimeout(tick, ms);
    };

    const tick = () => {
      if (!visible || document.hidden) {
        schedule(400);
        return;
      }
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

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !timer) schedule(1800);
      }, { threshold: 0.25 }).observe(promptEl);
    } else {
      visible = true;
      schedule(1800);
    }
  }
}

// Screenshot lightbox
const shots = $$('.shot img');
if (shots.length) {
  let lb = null;
  let lbImg = null;
  let lbCap = null;

  const closeLb = () => lb?.classList.remove('open');
  const openLb = (img) => {
    if (!lb) {
      lb = document.createElement('div');
      lb.className = 'lightbox';
      lb.setAttribute('role', 'dialog');
      lb.setAttribute('aria-modal', 'true');
      lb.innerHTML = '<img alt=""><p class="lightbox-cap"></p>';
      lbImg = $('img', lb);
      lbCap = $('.lightbox-cap', lb);
      lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
      document.body.append(lb);
    }
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = img.alt;
    lb.classList.add('open');
  };

  shots.forEach((img) => {
    img.closest('.shot').addEventListener('click', () => {
      if (img.closest('.shot').classList.contains('empty')) return;
      openLb(img);
    });
  });

  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lb?.classList.contains('open')) {
      e.preventDefault();
      closeLb();
    }
  });
}
