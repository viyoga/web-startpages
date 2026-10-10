/**
 * SONDER — Minimalist Startpage Engine
 * Features:
 * - Real-time 24h clock with seconds & lowercase date formatter
 * - Live performance stats (load, ping, fps, resolution)
 * - Interactive tasks checklist with due tags & localStorage persistence
 * - Open-Meteo weather fetch with instant fallback
 * - 12 shortcut links with SVG icons & single-key navigation
 * - Floating search overlay triggered by '/' or typing, with bang shortcuts
 */

(() => {
  'use strict';

  // ══════════════════════════════════════════════════════════════════
  // 1. DATETIME (24-Hour with seconds)
  // ══════════════════════════════════════════════════════════════════
  const timeDisplay = document.getElementById('timeDisplay');
  const dateDisplay = document.getElementById('dateDisplay');

  function updateDateTime() {
    const now = new Date();
    
    // 24-hour HH:mm:ss
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    timeDisplay.textContent = `${hours}:${minutes}:${seconds}`;

    // sunday, january 11, 2026 (exact lowercase format)
    const weekday = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const month = now.toLocaleDateString('en-US', { month: 'long' }).toLowerCase();
    const day = now.getDate();
    const year = now.getFullYear();
    dateDisplay.textContent = `${weekday}, ${month} ${day}, ${year}`;
  }

  updateDateTime();
  setInterval(updateDateTime, 1000);

  // ══════════════════════════════════════════════════════════════════
  // 2. LIVE SYSTEM STATS (cpu, ram, down, up)
  // ══════════════════════════════════════════════════════════════════
  const statCpu = document.getElementById('statCpu');
  const statRam = document.getElementById('statRam');
  const statDown = document.getElementById('statDown');
  const statUp = document.getElementById('statUp');

  // Load cached stats so there is no layout jump or empty display
  try {
    const cached = localStorage.getItem('sonder_system_stats');
    if (cached) {
      const data = JSON.parse(cached);
      if (data.cpu) statCpu.textContent = data.cpu;
      if (data.ram) statRam.textContent = data.ram;
      if (data.down) statDown.textContent = data.down;
      if (data.up) statUp.textContent = data.up;
    }
  } catch (_) {}

  async function fetchSystemStats() {
    try {
      const res = await fetch('http://127.0.0.1:9191/stats', {
        cache: 'no-store',
        signal: AbortSignal.timeout(1500)
      });
      if (!res.ok) return;
      const data = await res.json();

      if (data.cpu !== undefined) statCpu.textContent = data.cpu;
      if (data.ram !== undefined) statRam.textContent = data.ram;
      if (data.down !== undefined) statDown.textContent = data.down;
      if (data.up !== undefined) statUp.textContent = data.up;

      localStorage.setItem('sonder_system_stats', JSON.stringify({
        cpu: data.cpu,
        ram: data.ram,
        down: data.down,
        up: data.up
      }));
    } catch (_) {
      // If service is temporarily offline, keep previous/cached values
    }
  }

  fetchSystemStats();

  // Poll stats every 1s when active, pause when tab is hidden
  let statsTimer = null;
  function startStatsPolling() {
    if (statsTimer) clearInterval(statsTimer);
    statsTimer = setInterval(fetchSystemStats, 1000);
  }

  function stopStatsPolling() {
    if (statsTimer) {
      clearInterval(statsTimer);
      statsTimer = null;
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopStatsPolling();
    } else {
      fetchSystemStats();
      startStatsPolling();
    }
  });

  startStatsPolling();

  // ══════════════════════════════════════════════════════════════════
  // 3. TASKS CHECKLIST (Interactive + LocalStorage)
  // ══════════════════════════════════════════════════════════════════
  const tasksCount = document.getElementById('tasksCount');
  const tasksList = document.getElementById('tasksList');
  const taskForm = document.getElementById('taskForm');
  const taskInput = document.getElementById('taskInput');

  const DEFAULT_TASKS = [
    { id: '1', text: '257 far selections', due: 'today', completed: false },
    { id: '2', text: '351 lc03', due: 'tmrw 11:00 am', completed: false },
    { id: '3', text: '351 hw02', due: 'tmrw 11:59 pm', completed: false },
    { id: '4', text: '351 lb0', due: 'tmrw 11:59 pm', completed: false },
    { id: '5', text: '351 rd04', due: 'tmrw 11:59 pm', completed: false },
    { id: '6', text: '257 watanna selections', due: 'tue', completed: false },
    { id: '7', text: '208 skill 1', due: 'wed 11:59 pm', completed: false },
    { id: '8', text: '208 conceptual 1', due: 'wed 11:59 pm', completed: false },
    { id: '9', text: '351 hw03', due: 'wed 11:59 pm', completed: false },
    { id: '10', text: '351 rd05', due: 'wed 11:59 pm', completed: false }
  ];

  function loadTasks() {
    try {
      const raw = localStorage.getItem('sonder_tasks');
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return DEFAULT_TASKS;
  }

  function saveTasks(tasks) {
    localStorage.setItem('sonder_tasks', JSON.stringify(tasks));
  }

  let tasks = loadTasks();

  function renderTasks(focusedId = null) {
    tasksCount.textContent = `${tasks.length} tasks`;

    if (tasks.length === 0) {
      tasksList.innerHTML = `<div class="task-row" style="color: var(--c-fg-dim); font-style: italic;">no tasks remaining</div>`;
      return;
    }

    tasksList.innerHTML = tasks.map(t => `
      <div class="task-row ${t.completed ? 'completed' : ''}" data-id="${t.id}" tabindex="0" role="checkbox" aria-checked="${t.completed}">
        <span class="task-check">${t.completed ? '[x]' : '[ ]'}</span>
        <span class="task-text">${escapeHtml(t.text)}</span>
        ${t.due ? `<span class="task-due">${escapeHtml(t.due)}</span>` : ''}
        <span class="task-del" title="Delete task">×</span>
      </div>
    `).join('');

    if (focusedId) {
      const el = tasksList.querySelector(`.task-row[data-id="${focusedId}"]`);
      if (el) el.focus();
    }
  }

  function escapeHtml(str) {
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  // Toggle or Delete task on click
  tasksList.addEventListener('click', (e) => {
    const row = e.target.closest('.task-row');
    if (!row) return;
    const id = row.getAttribute('data-id');

    if (e.target.classList.contains('task-check') || e.target.classList.contains('task-text')) {
      tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
      saveTasks(tasks);
      renderTasks(id);
    } else if (e.target.classList.contains('task-del')) {
      tasks = tasks.filter(t => t.id !== id);
      saveTasks(tasks);
      renderTasks();
    }
  });

  // Keyboard navigation & controls on tasks list
  tasksList.addEventListener('keydown', (e) => {
    const row = e.target.closest('.task-row');
    if (!row) return;
    const id = row.getAttribute('data-id');
    const rows = Array.from(tasksList.querySelectorAll('.task-row[data-id]'));
    const idx = rows.indexOf(row);

    // Toggle complete: Space, 'x', or Enter
    if (e.key === ' ' || e.key === 'x' || e.key === 'X' || e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
      saveTasks(tasks);
      renderTasks(id);
      return;
    }

    // Delete task: 'd', Delete, or Backspace
    if (e.key === 'd' || e.key === 'D' || e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      e.stopPropagation();
      const nextToFocus = rows[idx + 1] ? rows[idx + 1].getAttribute('data-id') : (rows[idx - 1] ? rows[idx - 1].getAttribute('data-id') : null);
      tasks = tasks.filter(t => t.id !== id);
      saveTasks(tasks);
      renderTasks(nextToFocus);
      if (!nextToFocus && tasks.length === 0) taskInput.focus();
      return;
    }

    // Next item: ArrowDown or 'j'
    if (e.key === 'ArrowDown' || e.key === 'j') {
      e.preventDefault();
      e.stopPropagation();
      if (idx < rows.length - 1) {
        rows[idx + 1].focus();
      } else {
        taskInput.focus();
      }
      return;
    }

    // Prev item: ArrowUp or 'k'
    if (e.key === 'ArrowUp' || e.key === 'k') {
      e.preventDefault();
      e.stopPropagation();
      if (idx > 0) {
        rows[idx - 1].focus();
      }
      return;
    }

    // Escape: Blur task row back to page
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      row.blur();
      return;
    }
  });

  // Add new task
  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = taskInput.value.trim();
    if (!val) return;

    let text = val;
    let due = '';

    // Parse "@due" or "// due"
    if (val.includes('@')) {
      const parts = val.split('@');
      text = parts[0].trim();
      due = parts.slice(1).join('@').trim();
    } else if (val.includes('//')) {
      const parts = val.split('//');
      text = parts[0].trim();
      due = parts.slice(1).join('//').trim();
    }

    const newTask = {
      id: String(Date.now()),
      text: text || val,
      due: due,
      completed: false
    };

    tasks.push(newTask);
    saveTasks(tasks);
    renderTasks();
    taskInput.value = '';

    // Scroll to bottom of task list
    tasksList.scrollTop = tasksList.scrollHeight;
  });

  taskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      taskInput.blur();
    } else if (e.key === 'ArrowUp' && (taskInput.selectionStart === 0 || taskInput.value === '')) {
      const rows = tasksList.querySelectorAll('.task-row[data-id]');
      if (rows.length > 0) {
        e.preventDefault();
        rows[rows.length - 1].focus();
      }
    }
  });

  renderTasks();

  // ══════════════════════════════════════════════════════════════════
  // 4. WEATHER (Open-Meteo API + Exact fallback)
  // ══════════════════════════════════════════════════════════════════
  const weatherTemp = document.getElementById('weatherTemp');
  const weatherCondition = document.getElementById('weatherCondition');
  const statHumi = document.getElementById('statHumi');
  const statPrec = document.getElementById('statPrec');
  const statUv = document.getElementById('statUv');
  const statWind = document.getElementById('statWind');
  const statFeel = document.getElementById('statFeel');
  const statAqi = document.getElementById('statAqi');
  const weatherForecast = document.getElementById('weatherForecast');

  function wmoCondition(code) {
    if (code === 0) return 'clear';
    if (code === 1 || code === 2) return 'sunny';
    if (code === 3) return 'overcast';
    if (code >= 45 && code <= 48) return 'fog';
    if (code >= 51 && code <= 55) return 'drizzle';
    if (code >= 61 && code <= 65) return 'rain';
    if (code >= 71 && code <= 77) return 'snow';
    if (code >= 80 && code <= 82) return 'showers';
    if (code >= 95) return 'thunderstorm';
    return 'clear';
  }

  async function fetchLiveWeather() {
    try {
      const cached = localStorage.getItem('sonder_weather_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < 30 * 60 * 1000) {
          applyWeatherData(parsed.data);
          return;
        }
      }

      const lat = parseFloat(localStorage.getItem('sonder_weather_lat')) || 19.4389;
      const lon = parseFloat(localStorage.getItem('sonder_weather_lon')) || 84.8731;

      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code,uv_index&timezone=auto&forecast_days=2`;
      const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi`;

      const [wRes, aqiRes] = await Promise.all([
        fetch(weatherUrl, { signal: AbortSignal.timeout(4000) }),
        fetch(aqiUrl, { signal: AbortSignal.timeout(4000) }).catch(() => null)
      ]);

      if (!wRes.ok) return;
      const wData = await wRes.json();
      let aqiVal = 95;
      if (aqiRes && aqiRes.ok) {
        const aData = await aqiRes.json();
        if (aData.current?.us_aqi) aqiVal = Math.round(aData.current.us_aqi);
      }

      const current = wData.current;
      const hourly = wData.hourly;

      const now = new Date();
      const currentHour = now.getHours();
      const forecastRows = [];

      for (let i = 1; i <= 5; i++) {
        const targetHour = (Math.floor(currentHour / 3) * 3 + (i * 3)) % 24;
        const timeStr = `${String(targetHour).padStart(2, '0')}:00`;
        const hourIdx = i * 3;
        const temp = hourly.temperature_2m[hourIdx] !== undefined 
          ? Math.round(hourly.temperature_2m[hourIdx]) 
          : 22;
        const cond = hourly.weather_code[hourIdx] !== undefined
          ? wmoCondition(hourly.weather_code[hourIdx])
          : 'clear';

        forecastRows.push({ time: timeStr, temp: `${temp}°`, cond });
      }

      const payload = {
        temp: `${Math.round(current.temperature_2m)}°`,
        condition: wmoCondition(current.weather_code),
        humi: `${Math.round(current.relative_humidity_2m)}%`,
        prec: `${Math.round(current.precipitation)}%`,
        uv: String(Math.round(hourly.uv_index?.[0] || 0)),
        wind: `${Math.round(current.wind_speed_10m)} kmh`,
        feel: `${Math.round(current.apparent_temperature)}°`,
        aqi: String(aqiVal),
        forecast: forecastRows
      };

      localStorage.setItem('sonder_weather_cache', JSON.stringify({ timestamp: Date.now(), data: payload }));
      applyWeatherData(payload);
    } catch (_) {}
  }

  function applyWeatherData(data) {
    if (!data) return;
    if (data.temp) weatherTemp.textContent = data.temp;
    if (data.condition) weatherCondition.textContent = data.condition;
    if (data.humi) statHumi.textContent = data.humi;
    if (data.prec) statPrec.textContent = data.prec;
    if (data.uv) statUv.textContent = data.uv;
    if (data.wind) statWind.textContent = data.wind;
    if (data.feel) statFeel.textContent = data.feel;
    if (data.aqi) statAqi.textContent = data.aqi;

    if (data.forecast && data.forecast.length) {
      weatherForecast.innerHTML = data.forecast.map(f => `
        <div class="forecast-row">
          <span class="fc-time">${f.time}</span>
          <span class="fc-temp">${f.temp}</span>
          <span class="fc-cond">${f.cond}</span>
        </div>
      `).join('');
    }
  }

  fetchLiveWeather();

  // ══════════════════════════════════════════════════════════════════
  // 5. SHORTCUT LINKS (Preserved from user config)
  // ══════════════════════════════════════════════════════════════════
  const LINKS = [
    {
      key: 'v',
      name: 'viyoga',
      url: 'https://viyoga.github.io',
      svg: '<svg viewBox="0 0 24 24"><path d="M19.5 3.5L16 7.2C14.8 6.5 13.4 6 12 6s-2.8.5-4 1.2L4.5 3.5 3.5 11c0 5 3.8 9 8.5 9s8.5-4 8.5-9l-1-7.5zM8.5 12a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm7 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/></svg>'
    },
    {
      key: 'm',
      name: 'gmail',
      url: 'https://mail.google.com',
      svg: '<svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>'
    },
    {
      key: 'd',
      name: 'gdrive',
      url: 'https://drive.google.com',
      svg: '<svg viewBox="0 0 24 24"><path d="M7.71 3.5L1.15 15l3.43 6 6.55-11.5M9.73 15L6.3 21h13.12l3.43-6M22.29 15L15.73 3.5H8.86l6.56 11.5"/></svg>'
    },
    {
      key: 'c',
      name: 'chatgpt',
      url: 'https://chatgpt.com',
      svg: '<svg viewBox="0 0 24 24"><path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.607 1.5-2.602-1.5z"/></svg>'
    },
    {
      key: 'a',
      name: 'claude',
      url: 'https://claude.ai',
      svg: '<svg viewBox="0 0 24 24"><path d="M12 2a1.5 1.5 0 0 1 1.5 1.5v3.4l2.4-2.4a1.5 1.5 0 1 1 2.1 2.1l-2.4 2.4h3.4a1.5 1.5 0 1 1 0 3h-3.4l2.4 2.4a1.5 1.5 0 0 1-2.1 2.1l-2.4-2.4v3.4a1.5 1.5 0 1 1-3 0v-3.4l-2.4 2.4a1.5 1.5 0 1 1-2.1-2.1l2.4-2.4H4.5a1.5 1.5 0 1 1 0-3h3.4l-2.4-2.4a1.5 1.5 0 1 1 2.1-2.1l2.4 2.4V3.5A1.5 1.5 0 0 1 12 2z"/></svg>'
    },
    {
      key: 's',
      name: 'syncthing',
      url: 'http://127.0.0.1:8384/',
      svg: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2"/><circle cx="12" cy="4" r="2.2"/><circle cx="5" cy="17" r="2.2"/><circle cx="19" cy="17" r="2.2"/><path d="M12 6.2v2.6M6.6 15.1l2.3-1.3M17.4 15.1l-2.3-1.3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
    },
    {
      key: 'y',
      name: 'youtube',
      url: 'https://youtube.com',
      svg: '<svg viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>'
    },
    {
      key: 'r',
      name: 'reddit',
      url: 'https://reddit.com',
      svg: '<svg viewBox="0 0 24 24"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.197-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>'
    },
    {
      key: 'n',
      name: 'Anime',
      url: 'https://everythingmoe.com/',
      svg: '<svg viewBox="0 0 24 24"><path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12zm-11-2l6-4-6-4v8z"/></svg>'
    },
    {
      key: 'w',
      name: 'wallhaven',
      url: 'https://wallhaven.cc',
      svg: '<svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-1.96-2.36L6.5 17h11l-3.54-4.71zM8.5 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/></svg>'
    }
  ];

  const linksGrid = document.getElementById('linksGrid');

  function renderLinks() {
    linksGrid.innerHTML = LINKS.map(link => `
      <a href="${link.url}" class="link-item" data-key="${link.key}">
        <span class="link-icon">${link.svg}</span>
        <span class="link-key-tag">[${link.key}]</span>
        <span class="link-name">${link.name}</span>
      </a>
    `).join('');
  }

  renderLinks();

  // ══════════════════════════════════════════════════════════════════
  // 6. SEARCH OVERLAY & BANG SHORTCUTS
  // ══════════════════════════════════════════════════════════════════
  const searchOverlay = document.getElementById('searchOverlay');
  const searchInput = document.getElementById('searchInput');

  const BANGS = {
    '/rr': { home: 'https://www.reddit.com/', search: 'https://www.reddit.com/search/?q=' },
    '!rr': { home: 'https://www.reddit.com/', search: 'https://www.reddit.com/search/?q=' },
    '/yt': { home: 'https://www.youtube.com/', search: 'https://www.youtube.com/results?search_query=' },
    '!yt': { home: 'https://www.youtube.com/', search: 'https://www.youtube.com/results?search_query=' },
    '/ss': { home: 'https://www.startpage.com/', search: 'https://www.startpage.com/sp/search?query=' },
    '!ss': { home: 'https://www.startpage.com/', search: 'https://www.startpage.com/sp/search?query=' },
    '/dd': { home: 'https://duckduckgo.com/', search: 'https://duckduckgo.com/?q=' },
    '!dd': { home: 'https://duckduckgo.com/', search: 'https://duckduckgo.com/?q=' },
    'dd':  { home: 'https://duckduckgo.com/', search: 'https://duckduckgo.com/?q=' },
    '/gg': { home: 'https://www.google.com/', search: 'https://www.google.com/search?q=' },
    '!gg': { home: 'https://www.google.com/', search: 'https://www.google.com/search?q=' },
    'gg':  { home: 'https://www.google.com/', search: 'https://www.google.com/search?q=' }
  };

  function openSearch(initialChar = '') {
    searchOverlay.classList.add('open');
    searchOverlay.setAttribute('aria-hidden', 'false');
    searchInput.value = initialChar;
    searchInput.focus();
  }

  function closeSearch() {
    searchOverlay.classList.remove('open');
    searchOverlay.setAttribute('aria-hidden', 'true');
    searchInput.value = '';
    searchInput.blur();
  }

  function executeSearch(query) {
    const q = query.trim();
    if (!q) return;

    // Check for bang match
    const lower = q.toLowerCase();
    for (const [bang, target] of Object.entries(BANGS)) {
      if (lower === bang) {
        window.location.href = target.home;
        return;
      }
      if (lower.startsWith(bang + ' ')) {
        const terms = q.slice(bang.length).trim();
        window.location.href = target.search + encodeURIComponent(terms);
        return;
      }
    }

    // Check if query is a URL
    if (/^https?:\/\//i.test(q)) {
      window.location.href = q;
      return;
    }
    if (/^[\w-]+(\.[\w-]{2,})+(\/\S*)?$/.test(q)) {
      window.location.href = 'https://' + q;
      return;
    }

    // Default search engine (Google)
    window.location.href = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
  }

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      executeSearch(searchInput.value);
    } else if (e.key === 'Escape') {
      closeSearch();
    }
  });

  searchOverlay.addEventListener('click', (e) => {
    if (e.target === searchOverlay) {
      closeSearch();
    }
  });

  // ══════════════════════════════════════════════════════════════════
  // 7. GLOBAL KEYBOARD NAVIGATION
  // ══════════════════════════════════════════════════════════════════
  document.addEventListener('keydown', (e) => {
    // If typing in any input or textarea, or navigating tasks, don't trigger global hotkeys
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable || e.target.closest('.tasks-list')) {
      return;
    }

    // If search overlay is open, handle only Escape
    if (searchOverlay.classList.contains('open')) {
      if (e.key === 'Escape') {
        closeSearch();
      }
      return;
    }

    // Ignore if modifier keys are held (except Shift+T)
    if (e.ctrlKey || e.altKey || e.metaKey) return;

    // 'T' (Shift+T) focuses the first task in list
    if (e.key === 'T') {
      e.preventDefault();
      const firstRow = tasksList.querySelector('.task-row[data-id]');
      if (firstRow) {
        firstRow.focus();
      } else {
        taskInput.focus();
      }
      return;
    }

    // ArrowDown / ArrowUp from main page focuses task list
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const rows = tasksList.querySelectorAll('.task-row[data-id]');
      if (rows.length > 0) {
        e.preventDefault();
        if (e.key === 'ArrowDown') {
          rows[0].focus();
        } else {
          rows[rows.length - 1].focus();
        }
        return;
      }
    }

    const key = e.key.toLowerCase();

    // Hotkey match for direct link opening (v or legacy h for viyoga)
    const matchedLink = LINKS.find(l => l.key === key || (key === 'h' && l.name === 'viyoga'));
    if (matchedLink) {
      e.preventDefault();
      window.location.href = matchedLink.url;
      return;
    }

    // 't' focuses task input
    if (key === 't') {
      e.preventDefault();
      taskInput.focus();
      return;
    }

    // '/' opens search overlay
    if (e.key === '/') {
      e.preventDefault();
      openSearch('');
      return;
    }

    // Typing any single printable character opens search overlay
    if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      e.preventDefault();
      openSearch(e.key);
    }
  });

})();
