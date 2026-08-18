(() => {
  "use strict";

  const canvas = document.getElementById("terminal-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  const ROWS = ["#3ecf8e", "#00bd58", "#95e6b8", "#e1fcd7", "#ffffff"];

  const LINE_HEIGHT = 20;
  const FONT_SIZE = 13;
  const PADDING_X = 14;
  const HEADER_H = 24;
  const MAX_PANEL_OPACITY = 0.42;
  const PANEL_GAP = 12;
  const COLS = 4;
  const GRID_ROWS = 4;
  const APPEAR_DURATION_MS = 150;
  const DIM_OPACITY = 0.25;
  const DIM_TRANSITION_MS = 800;

  const PROCESS_NAMES = [
    "build",
    "deploy",
    "lint",
    "test",
    "compile",
    "bundle",
    "serve",
    "watch",
    "migrate",
    "publish",
    "install",
    "format",
    "typecheck",
    "analyze",
    "preview",
    "debug",
  ];

  const TEMPLATES = [
    { text: "$ npm run tutorial", row: 4 },
    { text: "=== Log Functions ===", row: 2 },
    { text: "i Starting simulated process...", row: 0 },
    { text: "\u26a0 Low disk space", row: 3 },
    { text: "\u2716 Failed to connect to database", row: 1 },
    { text: "\u2714 Process completed", row: 0 },
    { text: "\u2714 Alias: success", row: 2 },
    { text: "i Alias: info", row: 0 },
    { text: "\u25cf Alias: debug", row: 3 },
    { text: "Cyan text from color object", row: 2 },
    { text: "Emulator | Host:Port | Emulator UI", row: 4 },
    { text: "Functions | localhost:5001 | :4000", row: 1 },
    { text: "Database | localhost:9000 | :4000", row: 1 },
    { text: "\u2714 1. Waiting before creating a resource", row: 0 },
    { text: "\u2714 2. Creating the resource", row: 0 },
    { text: "\u2714 3. Deleting the resource", row: 0 },
    { text: "\u2714 git installed", row: 2 },
    { text: "\u2714 node installed", row: 2 },
    { text: "\u2716 docker not found", row: 1 },
    { text: "ok: git, node, npm", row: 3 },
    { text: "fail: docker", row: 1 },
    { text: "isLinux(): false | isWindows(): true", row: 2 },
    { text: "\u27a4  Selected: View Loading Functions", row: 4 },
    { text: "$ npm run build && npm run test", row: 4 },
    { text: "> scriptdx@1.0.0 build", row: 1 },
    { text: "> tsup", row: 1 },
    { text: "\u2714 Typecheck passed", row: 0 },
    { text: "\u2714 Tests passed", row: 0 },
    { text: "$ npm publish --dry-run", row: 4 },
    { text: "\u2714 Package ready", row: 0 },
    { text: "\u28fe Building project", row: 2 },
    { text: "+------------+--------+", row: 1 },
    { text: "| Service    | Port   |", row: 3 },
    { text: "| API        | 3000   |", row: 2 },
  ];

  let dpr = 1;
  let viewW = 0;
  let viewH = 0;
  let panels = [];
  let animStartTime = -1;
  let heroRevealed = false;

  function mulberry32(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function randomRatios(n, min, max, rng) {
    const raw = [];
    for (let i = 0; i < n; i += 1) {
      raw.push(min + rng() * (max - min));
    }
    const sum = raw.reduce((a, b) => a + b, 0);
    return raw.map((v) => v / sum);
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function buildPanels() {
    const rng = mulberry32(77);
    const gap = PANEL_GAP;

    const totalGapX = gap * (COLS + 1);
    const totalGapY = gap * (GRID_ROWS + 1);
    const availW = viewW - totalGapX;
    const availH = viewH - totalGapY;

    const rowRatios = randomRatios(GRID_ROWS, 0.35, 0.65, rng);
    const rowHeights = rowRatios.map((r) => Math.floor(availH * r));

    const colWidthsPerRow = [];
    for (let r = 0; r < GRID_ROWS; r += 1) {
      const ratios = randomRatios(COLS, 0.15, 0.4, rng);
      colWidthsPerRow.push(ratios.map((ratio) => Math.floor(availW * ratio)));
    }

    const rects = [];
    let curY = gap;
    for (let r = 0; r < GRID_ROWS; r += 1) {
      let curX = gap;
      for (let c = 0; c < COLS; c += 1) {
        rects.push({
          x: curX,
          y: curY,
          w: colWidthsPerRow[r][c],
          h: rowHeights[r],
        });
        curX += colWidthsPerRow[r][c] + gap;
      }
      curY += rowHeights[r] + gap;
    }

    const indices = Array.from({ length: rects.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    panels = rects.map((rect, idx) => {
      const visibleRows = Math.max(
        0,
        Math.floor((rect.h - HEADER_H) / LINE_HEIGHT),
      );
      const seed = idx * 4;
      const lines = [];
      for (let i = 0; i < visibleRows; i += 1) {
        lines.push(TEMPLATES[(seed + i) % TEMPLATES.length]);
      }

      return {
        ...rect,
        appearIndex: indices.indexOf(idx),
        processNameIndex: idx % PROCESS_NAMES.length,
        opacity: 0,
        scale: 0.85,
        speed: 280 + idx * 55,
        cursor: seed + visibleRows,
        lines,
        nextAt: 0,
        scroll: 0,
      };
    });
  }

  function resize() {
    dpr = window.devicePixelRatio || 1;
    viewW = window.innerWidth;
    viewH = window.innerHeight;

    canvas.width = Math.floor(viewW * dpr);
    canvas.height = Math.floor(viewH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    buildPanels();
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawHeader(panel) {
    ctx.save();
    ctx.globalAlpha = 0.5;
    const gradient = ctx.createLinearGradient(
      panel.x,
      panel.y,
      panel.x,
      panel.y + HEADER_H,
    );
    gradient.addColorStop(0, "rgba(8, 34, 22, 0.95)");
    gradient.addColorStop(1, "rgba(3, 12, 8, 0.85)");
    ctx.fillStyle = gradient;
    ctx.fillRect(panel.x, panel.y, panel.w, HEADER_H);

    ctx.globalAlpha = 0.8;

    ctx.globalAlpha = 0.5;
    ctx.fillStyle = ROWS[3];
    ctx.font = `${FONT_SIZE - 2}px "Pixelify Sans", monospace`;
    ctx.textBaseline = "middle";
    const name = PROCESS_NAMES[panel.processNameIndex] ?? "process";
    ctx.fillText(name, panel.x + 10, panel.y + HEADER_H / 2 + 1);
    ctx.restore();
  }

  function drawPanel(panel, time) {
    if (panel.opacity <= 0) return;

    ctx.save();

    const cx = panel.x + panel.w / 2;
    const cy = panel.y + panel.h / 2;
    const s = panel.scale;

    ctx.translate(cx, cy);
    ctx.scale(s, s);
    ctx.translate(-cx, -cy);
    ctx.globalAlpha = panel.opacity;

    roundRect(panel.x, panel.y, panel.w, panel.h, 0);
    ctx.save();
    ctx.globalAlpha = panel.opacity * 0.1;
    ctx.strokeStyle = ROWS[0];
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    ctx.save();
    roundRect(panel.x, panel.y, panel.w, panel.h, 0);
    ctx.clip();

    drawHeader(panel);

    ctx.font = `${FONT_SIZE}px "Pixelify Sans", monospace`;
    ctx.textBaseline = "middle";

    const contentTop = panel.y + HEADER_H + 4;
    const contentH = panel.h - HEADER_H - 4;
    const offset = panel.scroll * LINE_HEIGHT;

    for (let i = 0; i < panel.lines.length; i += 1) {
      const entry = panel.lines[i];
      if (!entry) continue;

      const y = contentTop + i * LINE_HEIGHT - offset + LINE_HEIGHT / 2;
      if (y < contentTop - LINE_HEIGHT || y > contentTop + contentH) continue;

      const progress = (y - contentTop) / contentH;
      const fade = Math.min(1, Math.max(0.15, progress * 1.5));

      ctx.globalAlpha = MAX_PANEL_OPACITY * fade * panel.opacity;
      ctx.fillStyle = ROWS[entry.row] ?? ROWS[0];
      ctx.fillText(entry.text, panel.x + PADDING_X, y);
    }

    const lastY =
      contentTop +
      (panel.lines.length - 1) * LINE_HEIGHT -
      offset +
      LINE_HEIGHT / 2;
    if (lastY < contentTop + contentH && Math.floor(time / 500) % 2 === 0) {
      ctx.globalAlpha = MAX_PANEL_OPACITY * panel.opacity;
      ctx.fillStyle = ROWS[4];
      ctx.fillRect(panel.x + PADDING_X, lastY - FONT_SIZE / 2, 6, FONT_SIZE);
    }

    ctx.restore();
    ctx.restore();
  }

  function pushLine(panel) {
    panel.lines.push(TEMPLATES[panel.cursor % TEMPLATES.length]);
    panel.cursor += 1;
    panel.scroll += 1;

    const maxLines = Math.floor((panel.h - HEADER_H) / LINE_HEIGHT) + 3;
    while (panel.lines.length > maxLines) {
      panel.lines.shift();
      panel.scroll -= 1;
    }
  }

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  function frame(time) {
    if (animStartTime < 0) animStartTime = time;
    const elapsed = time - animStartTime;

    const totalAppearTime =
      (panels.length - 1) * APPEAR_DURATION_MS + APPEAR_DURATION_MS;
    const allLoaded = elapsed >= totalAppearTime;
    const dimElapsed = allLoaded ? elapsed - totalAppearTime : 0;
    const dimFactor = allLoaded
      ? 1 -
        (1 - DIM_OPACITY) *
          Math.min(1, easeOutCubic(dimElapsed / DIM_TRANSITION_MS))
      : 1;

    if (allLoaded && !heroRevealed) {
      heroRevealed = true;
      const hero = document.getElementById("hero");
      if (hero) hero.classList.add("visible");
    }

    for (const panel of panels) {
      const panelStart = panel.appearIndex * APPEAR_DURATION_MS;
      const panelElapsed = elapsed - panelStart;

      if (panelElapsed <= 0) {
        panel.opacity = 0;
        panel.scale = 0.85;
      } else if (panelElapsed >= APPEAR_DURATION_MS) {
        panel.opacity = dimFactor;
        panel.scale = 1;
      } else {
        const t = easeOutCubic(panelElapsed / APPEAR_DURATION_MS);
        panel.opacity = t * dimFactor;
        panel.scale = 0.85 + 0.15 * t;
      }
    }

    ctx.clearRect(0, 0, viewW, viewH);

    for (const panel of panels) {
      if (!reduceMotion && panel.opacity > 0) {
        if (time >= panel.nextAt) {
          pushLine(panel);
          panel.nextAt = time + panel.speed;
        }
        panel.scroll = Math.max(0, panel.scroll - 0.1);
      }
      drawPanel(panel, time);
    }

    requestAnimationFrame(frame);
  }

  window.addEventListener("resize", resize);
  resize();

  if (document.fonts?.ready) {
    document.fonts.ready.then(() => requestAnimationFrame(frame));
  } else {
    requestAnimationFrame(frame);
  }
})();
