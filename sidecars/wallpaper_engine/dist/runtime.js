(() => {
  // src/engine/backdrop-manager.js
  var ROOT_ID = "agy-skins-backdrop-root";
  var LIVE_READY_CLASS = "agy-skins-backdrop-live-ready";
  var LIVE_FIRST_FRAME_MS = 3e4;
  var TRANSITION_BASE_MS = {
    cut: 0,
    fade: 1800,
    push: 700,
    wipe: 700,
    iris: 800,
    zoom: 900,
    bars: 800
  };
  var TRANSITION_SPEED_FACTOR = { fast: 0.6, normal: 1, slow: 1.6 };
  var BARS_TEETH = 9;
  var clamp = (value, min, max, fallback) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
  };
  function barsPolygon(direction, progress) {
    const horizontal = direction === "left" || direction === "right";
    const fromEnd = direction === "left" || direction === "up";
    const outer = fromEnd ? 1 : 0;
    const inward = fromEnd ? -1 : 1;
    const period = 1 / BARS_TEETH;
    const depth = clamp(progress, 0, 1, 0);
    const spine = Math.min(4e-3, depth);
    const slat = depth / BARS_TEETH;
    const point = (a, t) => horizontal ? [outer + inward * a, t] : [t, outer + inward * a];
    const points = [point(0, 0)];
    for (let i = 0; i < BARS_TEETH; i++) {
      const start = i * period;
      points.push(point(depth, start), point(depth, start + slat));
      if (i < BARS_TEETH - 1) points.push(point(spine, start + slat), point(spine, start + period));
    }
    points.push(point(spine, 1), point(0, 1));
    return `polygon(${points.map(([x, y]) => `${(x * 100).toFixed(2)}% ${(y * 100).toFixed(2)}%`).join(", ")})`;
  }
  function wipeInset(direction) {
    return {
      left: "inset(0 100% 0 0)",
      right: "inset(0 0 0 100%)",
      up: "inset(100% 0 0 0)",
      down: "inset(0 0 100% 0)"
    }[direction] || "inset(0 100% 0 0)";
  }
  function pushOffset(direction, incoming = true) {
    const sign = incoming ? 1 : -1;
    return {
      left: `translate3d(${100 * sign}%, 0, 0)`,
      right: `translate3d(${-100 * sign}%, 0, 0)`,
      up: `translate3d(0, ${100 * sign}%, 0)`,
      down: `translate3d(0, ${-100 * sign}%, 0)`
    }[direction] || `translate3d(${100 * sign}%, 0, 0)`;
  }
  function liveSceneUrl(project, options = {}) {
    if (!project?.token) throw new Error("Scene project has no media token");
    const origin = project.mediaOrigin || options.origin || "";
    if (!origin) throw new Error("Scene media origin is unavailable");
    const params = new URLSearchParams({
      type: "scene",
      fit: options.fit || "cover",
      sceneFps: String(options.fps || 30),
      muted: options.muted ? "true" : "false",
      src: project.token,
      mediaBase: `${origin}/api/agy-skins/scene/files`
    });
    if (options.autoQuality === false) params.set("autoq", "0");
    if (Number(options.renderDpr) > 0) params.set("renderDpr", String(options.renderDpr));
    if (Number(options.videoTexScale) > 0) params.set("vidscale", String(options.videoTexScale));
    return `${origin}/api/agy-skins/scene/live/index.html?${params.toString()}`;
  }
  function liveWebUrl(project, file, options = {}) {
    if (!project?.base) throw new Error("Web project has no media base");
    const origin = project.mediaOrigin || options.origin || "";
    if (!origin) throw new Error("Scene media origin is unavailable");
    const cleanFile = String(file || "index.html").replace(/\\/g, "/").split("/").filter(Boolean).map(encodeURIComponent).join("/");
    const base = /^https?:\/\//i.test(project.base) ? project.base : `${origin}${project.base}`;
    const params = new URLSearchParams({
      type: "web",
      fit: options.fit || "cover",
      sceneFps: String(options.fps || 30),
      muted: options.muted ? "true" : "false",
      src: `${base}/${cleanFile}`,
      mediaBase: `${origin}/api/agy-skins/scene/files`
    });
    if (options.autoQuality === false) params.set("autoq", "0");
    return `${origin}/api/agy-skins/scene/live/index.html?${params.toString()}`;
  }
  function normalizeMediaSource(input, type = "image") {
    if (typeof input !== "string" || !input.trim()) return null;
    const source = input.trim();
    if (/^https?:\/\//i.test(source)) return source;
    if (type === "image" && /^data:image\/(svg\+xml|png|jpeg|webp|gif);/i.test(source)) return source;
    return null;
  }
  var BackdropManager = class {
    constructor({ onMediaEnd = null } = {}) {
      this.root = null;
      this.layers = null;
      this.scrim = null;
      this.layer = null;
      this.previousLayer = null;
      this.sceneIframe = null;
      this.sceneProject = null;
      this.sceneType = null;
      this.liveReady = false;
      this.liveFailed = false;
      this.liveWatchdog = null;
      this.liveStats = null;
      this.currentKey = null;
      this.currentOptions = null;
      this.failedKeys = /* @__PURE__ */ new Set();
      this.onVisibilityChange = null;
      this.onMediaEnd = onMediaEnd;
      this.pointerFrame = null;
      this.pendingPointer = null;
      this.pointerInitialized = false;
      this.pauseReasons = /* @__PURE__ */ new Set();
      this.battery = null;
      this.lastMaskColor = null;
      this.mediaSnapshot = null;
      this.holeObserver = null;
      this.holeResizeObserver = null;
      this.observedHoleEl = null;
      this.coldBootHandled = false;
      this.bootDelayTimer = null;
      this.lastPropSignature = "";
      this.handleSceneMessage = (event) => {
        if (!this.sceneIframe || event.source !== this.sceneIframe.contentWindow) return;
        const data = event.data;
        if (!data || data.source !== "agy-skins-scene" && data.source !== "hermes-skins-scene") return;
        if (data.type === "ready") {
          this.liveReady = true;
          this.liveFailed = false;
          if (this.liveWatchdog !== null) clearTimeout(this.liveWatchdog);
          this.liveWatchdog = null;
          this.layer?.classList.add(LIVE_READY_CLASS);
          this.applyLiveOptions(true);
          this.pushMediaSnapshot();
        } else if (data.type === "error") {
          this.liveFailed = true;
          if (this.liveWatchdog !== null) clearTimeout(this.liveWatchdog);
          this.liveWatchdog = null;
        } else if (data.type === "stats") {
          this.liveStats = data;
        }
      };
      this.handleVisibility = () => {
        if (document.hidden) this.pointerLeave();
        this.syncPlayback();
        this.onVisibilityChange?.();
        if (!document.hidden) this.resumeDeferredLive();
      };
      this.handleFocus = () => {
        this.syncPlayback();
        this.onVisibilityChange?.();
        this.resumeDeferredLive();
      };
      this.handleBlur = () => {
        this.pointerLeave();
        this.syncPlayback();
        this.onVisibilityChange?.();
      };
      this.handleBattery = () => {
        this.syncPlayback();
        this.onVisibilityChange?.();
      };
    }
    ensureElements() {
      if (typeof document === "undefined" || !document.body) return;
      if (this.root?.isConnected) return;
      this.root = document.getElementById(ROOT_ID) || document.createElement("div");
      this.root.id = ROOT_ID;
      this.root.setAttribute("aria-hidden", "true");
      this.root.style.cssText = "position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;contain:strict;";
      this.layers = document.createElement("div");
      this.layers.style.cssText = "position:absolute;inset:0;overflow:hidden;";
      this.scrim = document.createElement("div");
      this.scrim.style.cssText = "position:absolute;inset:0;pointer-events:none;";
      this.root.replaceChildren(this.layers, this.scrim);
      document.body.prepend(this.root);
      this.ensureListeners();
      this.ensureHoleWatcher();
    }
    ensureListeners() {
      if (this.pointerInitialized || typeof window === "undefined") return;
      this.pointerInitialized = true;
      this.onPointerMove = (event) => {
        if (!this.sceneIframe || this.liveFailed || document.hidden) return;
        this.pendingPointer = {
          x: event.clientX,
          y: event.clientY,
          buttons: event.buttons || 0,
          mods: { shift: event.shiftKey, ctrl: event.ctrlKey, alt: event.altKey, meta: event.metaKey }
        };
        if (this.pointerFrame !== null) return;
        this.pointerFrame = window.requestAnimationFrame(() => {
          this.pointerFrame = null;
          const sample = this.pendingPointer;
          this.pendingPointer = null;
          if (sample) this.forwardPointer(sample, true);
        });
      };
      this.onPointerDown = (event) => {
        if (!this.sceneIframe || this.liveFailed) return;
        this.forwardPointer({
          x: event.clientX,
          y: event.clientY,
          buttons: event.buttons || 0,
          mods: { shift: event.shiftKey, ctrl: event.ctrlKey, alt: event.altKey, meta: event.metaKey }
        }, true);
      };
      this.onPointerUp = this.onPointerDown;
      this.onPointerLeave = () => this.pointerLeave();
      this.onWheel = (event) => {
        if (!this.sceneIframe || this.liveFailed) return;
        this.postScene({
          type: "wheel",
          dx: event.deltaX,
          dy: event.deltaY,
          mode: event.deltaMode,
          mods: { shift: event.shiftKey, ctrl: event.ctrlKey, alt: event.altKey, meta: event.metaKey }
        });
      };
      window.addEventListener("pointermove", this.onPointerMove, { passive: true, capture: true });
      window.addEventListener("pointerdown", this.onPointerDown, { passive: true, capture: true });
      window.addEventListener("pointerup", this.onPointerUp, { passive: true, capture: true });
      window.addEventListener("pointerleave", this.onPointerLeave);
      document.addEventListener("pointerleave", this.onPointerLeave);
      window.addEventListener("blur", this.handleBlur);
      window.addEventListener("focus", this.handleFocus);
      window.addEventListener("wheel", this.onWheel, { passive: true, capture: true });
      document.addEventListener("visibilitychange", this.handleVisibility);
      window.addEventListener("message", this.handleSceneMessage);
      if (typeof navigator !== "undefined" && navigator.getBattery) {
        navigator.getBattery().then((battery) => {
          this.battery = battery;
          battery.addEventListener("chargingchange", this.handleBattery);
          battery.addEventListener("levelchange", this.handleBattery);
          this.syncPlayback();
        }).catch(() => {
        });
      }
    }
    ensureHoleWatcher() {
      if (typeof document === "undefined" || typeof MutationObserver !== "function" || this.holeObserver) return;
      this.holeObserver = new MutationObserver(() => this.syncBrowserHole());
      this.holeObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ["data-has-browser-hole", "data-browser-hole"],
        childList: true,
        subtree: true
      });
      if (typeof ResizeObserver === "function") {
        this.holeResizeObserver = new ResizeObserver(() => this.syncBrowserHole());
      }
      if (typeof window !== "undefined") {
        window.addEventListener("resize", this.syncBrowserHoleBound = () => this.syncBrowserHole(), { passive: true });
      }
    }
    syncBrowserHole() {
      if (!this.root || typeof document === "undefined") return;
      if (this.currentOptions?.browserHoleCutout === false) {
        this.root.style.removeProperty("clip-path");
        return;
      }
      const hasHole = document.body?.getAttribute("data-has-browser-hole") === "true";
      const holeEl = hasHole ? document.querySelector('[data-browser-hole]:not([data-browser-hole="false"])') : null;
      if (!holeEl) {
        this.observedHoleEl = null;
        this.root.style.removeProperty("clip-path");
        return;
      }
      if (this.holeResizeObserver && this.observedHoleEl !== holeEl) {
        this.holeResizeObserver.disconnect();
        this.holeResizeObserver.observe(holeEl);
        this.observedHoleEl = holeEl;
      }
      const rect = holeEl.getBoundingClientRect?.();
      if (!rect || rect.width <= 1 || rect.height <= 1) {
        this.root.style.removeProperty("clip-path");
        return;
      }
      const l = Math.max(0, Math.round(rect.left));
      const t = Math.max(0, Math.round(rect.top));
      const r = Math.max(l, Math.round(rect.right));
      const b = Math.max(t, Math.round(rect.bottom));
      this.root.style.clipPath = `polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${l}px ${t}px, ${r}px ${t}px, ${r}px ${b}px, ${l}px ${b}px, ${l}px ${t}px)`;
    }
    postScene(message) {
      try {
        this.sceneIframe?.contentWindow?.postMessage({ source: "agy-skins-host", ...message }, "*");
      } catch {
      }
    }
    forwardPointer(sample, active) {
      const rect = this.sceneIframe?.getBoundingClientRect?.();
      if (!rect?.width || !rect?.height) return;
      const u = Math.min(1, Math.max(0, (sample.x - rect.left) / rect.width));
      const v = Math.min(1, Math.max(0, (sample.y - rect.top) / rect.height));
      const inside = active && sample.x >= rect.left && sample.x <= rect.right && sample.y >= rect.top && sample.y <= rect.bottom;
      this.postScene({ type: "pointer", u, v, buttons: inside ? sample.buttons : 0, mods: sample.mods });
    }
    pointerLeave() {
      if (this.pointerFrame !== null) window.cancelAnimationFrame(this.pointerFrame);
      this.pointerFrame = null;
      this.pendingPointer = null;
      this.postScene({ type: "pointer-leave" });
    }
    setMediaSnapshot(media) {
      this.mediaSnapshot = media && typeof media === "object" ? media : null;
      this.pushMediaSnapshot();
    }
    pushMediaSnapshot() {
      if (!this.sceneIframe) return;
      const media = this.mediaSnapshot;
      if (!media?.ok) {
        this.postScene({ type: "command", command: "setMedia", args: [null] });
        return;
      }
      const status = String(media.playing || "").toLowerCase();
      this.postScene({
        type: "command",
        command: "setMedia",
        args: [{
          hasMedia: true,
          title: media.title || "",
          artist: media.artist || "",
          album: media.album || "",
          playing: status === "playing",
          state: status === "playing" ? 1 : status === "paused" ? 2 : 0,
          position: Number(media.position) || 0,
          duration: Number(media.duration) || 0
        }]
      });
    }
    update(options) {
      const {
        enabled,
        type = "image",
        src,
        scenePayload = null,
        webPreview = null,
        blur = 0,
        occlusion = 25,
        isDark = true,
        mode = "live",
        fit = "cover",
        opacity = 100,
        pauseOnHidden = true,
        pauseOnBlur = false,
        pauseOnBattery = false,
        sound = false,
        volume = 100,
        playbackRate = 1,
        sceneLive = true,
        sceneLiveFps = 30,
        sceneAutoQuality = true,
        sceneRenderDpr = 0,
        sceneVideoTexScale = 0,
        liveBootDelay = 0,
        slides = null,
        slideIntervalMs = null,
        transition = "cut",
        transitionDir = "left",
        transitionSpeed = "normal",
        brightness = 100,
        contrast = 100,
        saturate = 100,
        flip = false,
        layerPositionX = 50,
        layerPositionY = 50,
        layerScale = 100,
        loop = true,
        userProps = null,
        browserHoleCutout = true
      } = options;
      const source = type === "scene" || type === "web" ? scenePayload?.token ? scenePayload.dir : null : enabled ? normalizeMediaSource(src, type) : null;
      if (!enabled || !source) {
        this.hide();
        return false;
      }
      const key = `${type}:${source}:${mode === "frame" ? "frame" : "live"}`;
      if (this.failedKeys.has(key)) {
        this.hide();
        return false;
      }
      this.ensureElements();
      if (!this.root) return false;
      this.root.style.display = "block";
      this.currentOptions = {
        type,
        src: source,
        scenePayload,
        webPreview,
        blur,
        occlusion,
        isDark,
        mode,
        fit,
        opacity,
        pauseOnHidden,
        pauseOnBlur,
        pauseOnBattery,
        sound,
        volume,
        playbackRate,
        sceneLive,
        sceneLiveFps,
        sceneAutoQuality,
        sceneRenderDpr,
        sceneVideoTexScale,
        liveBootDelay,
        slides,
        slideIntervalMs,
        transition,
        transitionDir,
        transitionSpeed,
        brightness,
        contrast,
        saturate,
        flip,
        layerPositionX,
        layerPositionY,
        layerScale,
        loop,
        userProps,
        browserHoleCutout
      };
      this.updateScrim(isDark, occlusion);
      this.syncBrowserHole();
      if (key === this.currentKey && this.layer) {
        this.applyOptionsToLayer(this.layer);
        this.applyLiveOptions(false);
        this.syncPlayback();
        return true;
      }
      this.currentKey = key;
      this.buildNextLayer(this.currentOptions, key);
      return true;
    }
    updateScrim(isDark, occlusion) {
      const alpha = clamp(occlusion, 0, 100, 25) / 100;
      const color = isDark ? `rgba(0,0,0,${alpha})` : `rgba(255,255,255,${alpha})`;
      if (this.lastMaskColor !== color) this.scrim.style.backgroundColor = color;
      this.lastMaskColor = color;
    }
    buildLayer() {
      const layer = document.createElement("div");
      layer.className = "agy-skins-backdrop-layer";
      layer.style.cssText = "position:absolute;inset:0;overflow:hidden;opacity:0;";
      const surface = document.createElement("div");
      surface.className = "agy-skins-backdrop-surface";
      surface.style.cssText = "position:absolute;inset:0;transform-origin:center;";
      const poster = document.createElement("div");
      poster.className = "agy-skins-backdrop-poster";
      poster.style.cssText = "position:absolute;inset:0;background-size:cover;background-position:center;background-repeat:no-repeat;";
      const media = document.createElement("div");
      media.className = "agy-skins-backdrop-media";
      media.style.cssText = "position:absolute;inset:0;overflow:hidden;";
      surface.appendChild(poster);
      surface.appendChild(media);
      layer.appendChild(surface);
      layer._surface = surface;
      layer._poster = poster;
      layer._media = media;
      return layer;
    }
    applyOptionsToLayer(layer) {
      const options = this.currentOptions;
      const blur = clamp(options.blur, 0, 60, 0);
      const surface = layer._surface;
      const media = layer._media;
      const brightness = clamp(options.brightness, 40, 160, 100);
      const contrast = clamp(options.contrast, 40, 200, 100);
      const saturate = clamp(options.saturate, 0, 200, 100);
      const filters = [];
      if (blur > 0) filters.push(`blur(${blur}px)`);
      if (brightness !== 100) filters.push(`brightness(${brightness}%)`);
      if (contrast !== 100) filters.push(`contrast(${contrast}%)`);
      if (saturate !== 100) filters.push(`saturate(${saturate}%)`);
      surface.style.filter = filters.length ? filters.join(" ") : "none";
      surface.style.inset = blur > 0 ? `-${blur + 8}px` : "0";
      const x = (50 - clamp(options.layerPositionX, 0, 100, 50)) / 2;
      const y = (50 - clamp(options.layerPositionY, 0, 100, 50)) / 2;
      const scale = clamp(options.layerScale, 50, 150, 100) / 100;
      const flip = options.flip ? " scaleX(-1)" : "";
      layer.style.transform = "none";
      surface.style.transform = `translate3d(${x.toFixed(2)}%, ${y.toFixed(2)}%, 0) scale(${scale.toFixed(3)})${flip}`;
      media.style.opacity = String(clamp(options.opacity, 0, 100, 100) / 100);
      layer._poster.style.opacity = String(clamp(options.opacity, 0, 100, 100) / 100);
      const objectFit = options.fit === "center" ? "none" : options.fit;
      for (const image of media.querySelectorAll("img")) {
        image.style.objectFit = objectFit;
        image.style.objectPosition = "center";
      }
      const video = media.querySelector("video");
      if (video) {
        video.style.objectFit = objectFit;
        video.style.objectPosition = "center";
        video.muted = !options.sound;
        video.volume = clamp(options.volume, 0, 100, 100) / 100;
        video.playbackRate = clamp(options.playbackRate, 0.25, 2, 1);
        video.loop = options.loop !== false;
      }
    }
    buildNextLayer(options, key) {
      const next = this.buildLayer();
      this.applyOptionsToLayer(next);
      this.applyPoster(next, options);
      this.appendContent(next, options, key);
      this.transitionTo(next, options, key);
    }
    applyPoster(layer, options) {
      const url = options.webPreview;
      if (!url || !/^https?:\/\//i.test(url)) return;
      const image = document.createElement("img");
      image.alt = "";
      image.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;";
      image.onerror = () => image.remove();
      image.src = url;
      layer._poster.appendChild(image);
    }
    appendContent(layer, options, key) {
      if (options.type === "scene" || options.type === "web") {
        if (options.mode !== "frame" && options.sceneLive) {
          if (document.hidden) {
            layer.dataset.liveState = "deferred";
            return;
          }
          const delayMs = !this.coldBootHandled && Number(options.liveBootDelay) > 0 ? Math.min(3e4, Number(options.liveBootDelay) * 1e3) : 0;
          this.coldBootHandled = true;
          if (delayMs > 0) {
            layer.dataset.liveState = "boot-delay";
            if (this.bootDelayTimer !== null) clearTimeout(this.bootDelayTimer);
            this.bootDelayTimer = setTimeout(() => {
              this.bootDelayTimer = null;
              if (this.currentKey === key && this.layer === layer) {
                this.showLive(layer, this.currentOptions, key);
              }
            }, delayMs);
          } else {
            this.showLive(layer, options, key);
          }
        }
        return;
      }
      this.coldBootHandled = true;
      if (options.type === "video") {
        this.showVideo(layer, options, key);
        return;
      }
      this.showImage(layer, options, key);
    }
    showImage(layer, options, key) {
      if (Array.isArray(options.slides) && options.slides.length > 1) {
        const wrap = document.createElement("div");
        wrap.style.cssText = "position:absolute;inset:0;overflow:hidden;";
        const first = document.createElement("img");
        const second = document.createElement("img");
        const fit2 = options.fit === "center" ? "none" : options.fit;
        for (const image2 of [first, second]) {
          image2.alt = "";
          image2.style.cssText = `position:absolute;inset:0;width:100%;height:100%;object-fit:${fit2};object-position:center;display:block;transition:opacity 800ms ease;`;
          wrap.appendChild(image2);
        }
        first.src = options.slides[0];
        first.style.opacity = "1";
        second.style.opacity = "0";
        layer._media.appendChild(wrap);
        let index = 0;
        const interval = clamp(options.slideIntervalMs, 1e3, 24 * 60 * 60 * 1e3, 6e4);
        layer._slideTimer = setInterval(() => {
          if (this.currentKey !== key) return;
          index += 1;
          const incoming = index % 2 === 0 ? first : second;
          const outgoing = index % 2 === 0 ? second : first;
          incoming.onload = () => {
            if (this.currentKey !== key) return;
            incoming.style.opacity = "1";
            outgoing.style.opacity = "0";
          };
          incoming.src = options.slides[index % options.slides.length];
        }, interval);
        return;
      }
      const image = document.createElement("img");
      image.alt = "";
      const fit = options.fit === "center" ? "none" : options.fit;
      image.style.cssText = `width:100%;height:100%;object-fit:${fit};object-position:center;display:block;`;
      image.onerror = () => this.fail(key);
      image.src = options.src;
      layer._media.appendChild(image);
    }
    showVideo(layer, options, key) {
      const video = document.createElement("video");
      video.autoplay = true;
      video.loop = options.loop !== false;
      video.playsInline = true;
      video.preload = "auto";
      video.muted = !options.sound;
      video.volume = clamp(options.volume, 0, 100, 100) / 100;
      video.playbackRate = clamp(options.playbackRate, 0.25, 2, 1);
      const fit = options.fit === "center" ? "none" : options.fit;
      video.style.cssText = `width:100%;height:100%;object-fit:${fit};object-position:center;display:block;`;
      video.onerror = () => this.fail(key);
      video.onended = () => {
        if (this.currentKey === key && options.loop === false) this.onMediaEnd?.();
      };
      video.src = options.src;
      layer._media.appendChild(video);
      if (options.mode === "frame") {
        video.addEventListener("loadeddata", () => {
          if (this.currentKey !== key) return;
          try {
            const canvas = document.createElement("canvas");
            const scale = Math.min(1, 1920 / Math.max(video.videoWidth, video.videoHeight));
            canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
            canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
            canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
            const image = document.createElement("img");
            image.src = canvas.toDataURL("image/jpeg", 0.9);
            image.style.cssText = `width:100%;height:100%;object-fit:${fit};object-position:center;display:block;`;
            if (this.currentKey === key) layer._media.replaceChildren(image);
          } catch {
          } finally {
            video.pause();
          }
        }, { once: true });
      }
      void video.play().catch((error) => {
        if (error?.name === "AbortError" || error?.name === "NotAllowedError") return;
        if (this.currentKey === key) this.fail(key);
      });
    }
    showLive(layer, options, key) {
      if (document.hidden) {
        layer.dataset.liveState = "deferred";
        return;
      }
      const project = options.scenePayload;
      if (!project?.token) {
        this.liveFailed = true;
        layer.dataset.liveState = "error:no-token";
        return;
      }
      this.liveReady = false;
      this.liveFailed = false;
      this.sceneProject = project;
      this.sceneType = options.type;
      const muted = !options.sound || clamp(options.volume, 0, 100, 100) <= 0;
      const url = options.type === "scene" ? liveSceneUrl(project, {
        fit: options.fit,
        fps: options.sceneLiveFps,
        muted,
        autoQuality: options.sceneAutoQuality,
        renderDpr: options.sceneRenderDpr,
        videoTexScale: options.sceneVideoTexScale
      }) : liveWebUrl(project, project.file || "index.html", {
        fit: options.fit,
        fps: options.sceneLiveFps,
        muted,
        autoQuality: options.sceneAutoQuality
      });
      const frame = document.createElement("iframe");
      frame.setAttribute("sandbox", "allow-scripts allow-same-origin");
      frame.setAttribute("allow", "autoplay; fullscreen");
      frame.setAttribute("aria-hidden", "true");
      frame.style.cssText = "position:absolute;inset:0;width:100%;height:100%;border:0;background:transparent;opacity:0;transition:opacity 1200ms ease;";
      frame.onload = () => {
        if (this.sceneIframe !== frame) return;
        this.applyLiveOptions(true);
        this.syncPlayback();
      };
      this.sceneIframe = frame;
      if (this.liveWatchdog !== null) clearTimeout(this.liveWatchdog);
      this.liveWatchdog = setTimeout(() => {
        this.liveWatchdog = null;
        if (this.sceneIframe !== frame || this.liveReady) return;
        this.liveFailed = true;
      }, LIVE_FIRST_FRAME_MS);
      frame.src = url;
      layer._media.appendChild(frame);
      layer.dataset.liveState = "framed";
    }
    resumeDeferredLive() {
      if (!this.layer || !this.currentOptions || this.layer.dataset.liveState !== "deferred") return;
      this.showLive(this.layer, this.currentOptions, this.currentKey);
    }
    applyLiveOptions(forceProps = false) {
      if (!this.sceneIframe || !this.currentOptions) return;
      const options = this.currentOptions;
      const volume = options.sound ? clamp(options.volume, 0, 100, 100) / 100 : 0;
      this.postScene({ type: "command", command: "setFit", args: [options.fit || "cover"] });
      this.postScene({ type: "command", command: "setSceneFps", args: [Number(options.sceneLiveFps) || 30] });
      this.postScene({ type: "command", command: "setRenderDpr", args: [Number(options.sceneRenderDpr) || 0] });
      this.postScene({ type: "command", command: "setVolume", args: [volume] });
      this.postScene({ type: "command", command: "setQuality", args: [{ autoQuality: options.sceneAutoQuality !== false }] });
      const propJson = options.userProps ? JSON.stringify(options.userProps) : "";
      if (propJson && (forceProps || propJson !== this.lastPropSignature)) {
        this.lastPropSignature = propJson;
        this.postScene({ type: "command", command: "updateWebProps", args: [options.userProps] });
      }
    }
    syncPlayback() {
      if (!this.currentOptions) return;
      const reasons = /* @__PURE__ */ new Set();
      if (this.currentOptions.pauseOnHidden !== false && document.hidden) reasons.add("hidden");
      if (this.currentOptions.pauseOnBlur === true && typeof document.hasFocus === "function" && !document.hasFocus()) reasons.add("blur");
      if (this.currentOptions.pauseOnBattery === true && this.battery && this.battery.charging === false) reasons.add("battery");
      const paused = reasons.size > 0;
      const wasPaused = this.pauseReasons.size > 0;
      this.pauseReasons = reasons;
      const video = this.layer?._media?.querySelector("video");
      if (video) {
        if (paused && !video.paused) video.pause();
        else if (!paused && video.paused && this.currentOptions.mode !== "frame") void video.play().catch(() => {
        });
      }
      if (this.sceneIframe && paused !== wasPaused) {
        this.postScene({ type: "command", command: paused ? "pause" : "resume" });
      }
    }
    transitionDuration(options) {
      const base = TRANSITION_BASE_MS[options.transition] ?? TRANSITION_BASE_MS.fade;
      const factor = TRANSITION_SPEED_FACTOR[options.transitionSpeed] ?? 1;
      return Math.round(base * factor);
    }
    transitionTo(next, options, key) {
      const prev = this.layer;
      if (this.previousLayer && this.previousLayer !== prev) this.retireLayer(this.previousLayer);
      this.previousLayer = prev;
      this.layer = next;
      const duration = prev ? this.transitionDuration(options) : 0;
      const dir = options.transitionDir || "left";
      const kind = options.transition || "cut";
      if (duration <= 0 || kind === "cut") {
        next.style.opacity = "1";
        this.layers.appendChild(next);
        if (prev) this.retireLayer(prev);
        this.previousLayer = null;
        this.syncPlayback();
        return;
      }
      if (kind === "push") {
        next.style.opacity = "1";
        next.style.transform = pushOffset(dir, true);
        next.style.transition = `transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`;
        this.layers.appendChild(next);
        if (prev) prev.style.transition = `transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`;
        requestAnimationFrame(() => {
          if (this.currentKey !== key) return;
          next.style.transform = "translate3d(0, 0, 0)";
          if (prev) prev.style.transform = pushOffset(dir, false);
        });
      } else if (kind === "wipe") {
        next.style.opacity = "1";
        next.style.clipPath = wipeInset(dir);
        next.style.transition = `clip-path ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`;
        this.layers.appendChild(next);
        requestAnimationFrame(() => {
          if (this.currentKey !== key) return;
          next.style.clipPath = "inset(0 0 0 0)";
        });
      } else if (kind === "iris") {
        next.style.opacity = "1";
        next.style.clipPath = "circle(0% at 50% 50%)";
        next.style.transition = `clip-path ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`;
        this.layers.appendChild(next);
        requestAnimationFrame(() => {
          if (this.currentKey !== key) return;
          next.style.clipPath = "circle(150% at 50% 50%)";
        });
      } else if (kind === "zoom") {
        next.style.opacity = "0";
        next.style.transform = "scale(1.12)";
        next.style.transition = `opacity ${duration}ms ease, transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`;
        this.layers.appendChild(next);
        requestAnimationFrame(() => {
          if (this.currentKey !== key) return;
          next.style.opacity = "1";
          next.style.transform = "scale(1)";
        });
      } else if (kind === "bars") {
        next.style.opacity = "1";
        next.style.clipPath = barsPolygon(dir, 0);
        this.layers.appendChild(next);
        const started = performance.now();
        const step = (now) => {
          if (this.currentKey !== key || this.layer !== next) return;
          const p = Math.min(1, (now - started) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          next.style.clipPath = barsPolygon(dir, eased);
          if (p < 1) requestAnimationFrame(step);
          else next.style.clipPath = "none";
        };
        requestAnimationFrame(step);
      } else {
        next.style.opacity = "0";
        next.style.transition = `opacity ${duration}ms ease`;
        this.layers.appendChild(next);
        requestAnimationFrame(() => {
          if (this.currentKey !== key) return;
          next.style.opacity = "1";
        });
      }
      setTimeout(() => {
        if (prev && prev !== this.layer) this.retireLayer(prev);
        if (this.previousLayer === prev) this.previousLayer = null;
      }, duration + 60);
      this.syncPlayback();
    }
    retireLayer(layer) {
      if (!layer) return;
      if (layer._slideTimer) clearInterval(layer._slideTimer);
      const frame = layer._media?.querySelector("iframe");
      if (frame) {
        if (frame === this.sceneIframe) this.sceneIframe = null;
        try {
          frame.contentWindow?.postMessage({ source: "agy-skins-host", type: "command", command: "destroy" }, "*");
        } catch {
        }
      }
      const video = layer._media?.querySelector("video");
      if (video) {
        try {
          video.pause();
          video.removeAttribute("src");
          video.load();
        } catch {
        }
      }
      layer.remove();
    }
    fail(key) {
      this.failedKeys.add(key);
      if (this.currentKey === key) this.hide();
    }
    hide() {
      if (this.bootDelayTimer !== null) clearTimeout(this.bootDelayTimer);
      this.bootDelayTimer = null;
      if (this.liveWatchdog !== null) clearTimeout(this.liveWatchdog);
      this.liveWatchdog = null;
      if (this.previousLayer) {
        this.retireLayer(this.previousLayer);
        this.previousLayer = null;
      }
      if (this.layer) {
        this.retireLayer(this.layer);
        this.layer = null;
      }
      this.currentKey = null;
      this.sceneIframe = null;
      this.lastPropSignature = "";
      if (this.root) {
        this.root.style.display = "none";
        this.root.style.removeProperty("clip-path");
      }
    }
    destroy() {
      this.hide();
      if (this.pointerInitialized && typeof window !== "undefined") {
        window.removeEventListener("pointermove", this.onPointerMove, { capture: true });
        window.removeEventListener("pointerdown", this.onPointerDown, { capture: true });
        window.removeEventListener("pointerup", this.onPointerUp, { capture: true });
        window.removeEventListener("pointerleave", this.onPointerLeave);
        document.removeEventListener("pointerleave", this.onPointerLeave);
        window.removeEventListener("blur", this.handleBlur);
        window.removeEventListener("focus", this.handleFocus);
        window.removeEventListener("wheel", this.onWheel, { capture: true });
        document.removeEventListener("visibilitychange", this.handleVisibility);
        window.removeEventListener("message", this.handleSceneMessage);
        if (this.holeResizeObserver) this.holeResizeObserver.disconnect();
        if (this.holeObserver) this.holeObserver.disconnect();
        if (this.syncBrowserHoleBound) window.removeEventListener("resize", this.syncBrowserHoleBound);
      }
      this.root?.remove();
      this.root = null;
      this.layers = null;
      this.scrim = null;
    }
  };

  // src/engine/glass-controller.js
  var STYLE_ID = "agy-skins-runtime-css";
  function parseSerializedColor(text) {
    if (typeof text !== "string") return null;
    let match = text.match(/^color\((?:srgb|srgb-linear) ([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)$/);
    if (match) {
      const ch = (v) => Math.round(Number(v) * 255);
      return { r: ch(match[1]), g: ch(match[2]), b: ch(match[3]), a: match[4] === void 0 ? 1 : Number(match[4]) };
    }
    match = text.match(/^rgba?\(([\d.]+),?\s*([\d.]+),?\s*([\d.]+)(?:\s*[,/]\s*([\d.]+))?\)$/);
    if (match) {
      return {
        r: Math.round(Number(match[1])),
        g: Math.round(Number(match[2])),
        b: Math.round(Number(match[3])),
        a: match[4] === void 0 ? 1 : Number(match[4])
      };
    }
    match = text.match(/^#([0-9a-f]{6})$/i);
    if (match) {
      const n = parseInt(match[1], 16);
      return { r: n >> 16 & 255, g: n >> 8 & 255, b: n & 255, a: 1 };
    }
    return null;
  }
  function isXtermTerminal(value) {
    return Boolean(
      value && typeof value === "object" && value.options && value._core && typeof value.refresh === "function" && value._core.optionsService && typeof value._core.optionsService.onSpecificOptionChange === "function"
    );
  }
  function isXtermAddon(value) {
    return Boolean(
      value && typeof value === "object" && value._terminal && "_renderer" in value && typeof value.dispose === "function"
    );
  }
  function findXtermTerminal(host) {
    if (!host || typeof host !== "object") return null;
    const fiberKey = Object.keys(host).find((name) => name.startsWith("__reactFiber$"));
    if (!fiberKey) return null;
    let fiber = host[fiberKey];
    const seen = /* @__PURE__ */ new Set();
    let terminal = null;
    let addon = null;
    for (let depth = 0; fiber && depth < 14; depth++, fiber = fiber.return) {
      for (const candidate of [fiber, fiber.alternate]) {
        if (!candidate || seen.has(candidate)) continue;
        seen.add(candidate);
        let hook = candidate.memoizedState;
        for (let i = 0; hook && i < 80; i++, hook = hook.next) {
          const value = hook.memoizedState?.current;
          if (!terminal && isXtermTerminal(value)) terminal = value;
          if (!addon && isXtermAddon(value)) addon = value;
          if (terminal && addon) return { terminal, addon };
        }
      }
    }
    return terminal ? { terminal, addon } : null;
  }
  var GlassController = class {
    constructor() {
      this.styleEl = null;
      this.materialRule = null;
      this.lastMaterialKey = null;
      this.seedKey = null;
      this.seedColors = { bg: null, sidebar: null, card: null };
      this.terminalObserver = null;
      this.terminalRecords = /* @__PURE__ */ new Map();
    }
    readHostSeeds(root) {
      const key = `${document.body?.className || ""}:${root.style?.cssText || ""}`;
      if (this.seedKey === key && this.seedColors.bg) return this.seedColors;
      try {
        const cs = getComputedStyle(root);
        this.seedColors = {
          bg: parseSerializedColor(cs.getPropertyValue("--background").trim()),
          sidebar: parseSerializedColor(cs.getPropertyValue("--sidebar").trim()),
          card: parseSerializedColor(cs.getPropertyValue("--card").trim())
        };
        this.seedKey = key;
      } catch {
      }
      return this.seedColors;
    }
    rgbaFromSeed(seed, alphaPct, fallbackHex) {
      const a = Math.min(1, Math.max(0, alphaPct / 100));
      if (seed) return `rgba(${seed.r}, ${seed.g}, ${seed.b}, ${a.toFixed(4)})`;
      const parsed = parseSerializedColor(fallbackHex);
      if (parsed) return `rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${a.toFixed(4)})`;
      return `color-mix(in srgb, ${fallbackHex} ${alphaPct}%, transparent)`;
    }
    update(params = {}) {
      if (typeof document === "undefined") return;
      const {
        enabled,
        glassTransparency = 10,
        bubbleOpacity = 55,
        composerFrost = 10,
        surfaceFrost = 8,
        saturation = 150,
        border = 35,
        highlight = true,
        accent = "#4f8cff",
        glassColor = null,
        glassDarkSeparate = false,
        glassFidelity = 100,
        chatGlassFidelity = 100,
        settingsWindowTransparency = 20,
        settingsWindowBlur = 16,
        sidebarGlass = true,
        sidebarFollowGlobal = true,
        sidebarBlur = 16,
        sidebarAlpha = 60,
        sidebarColor = "#ffffff",
        leftSidebarGlass = true,
        leftSidebarCornerRadius = "native",
        leftSidebarSquareTL = false,
        leftSidebarSquareTR = false,
        leftSidebarSquareBR = false,
        leftSidebarSquareBL = false,
        rightSidebarCornerRadius = "native",
        rightSidebarSquareTL = false,
        rightSidebarSquareTR = false,
        rightSidebarSquareBR = false,
        rightSidebarSquareBL = false,
        titlebarGlass = true,
        isDark = true
      } = params;
      const root = document.documentElement;
      const body = document.body;
      if (!body) return;
      if (!enabled) {
        body.removeAttribute("data-agy-skins-active");
        const el = this.styleEl || document.getElementById(STYLE_ID);
        el?.remove();
        this.styleEl = null;
        this.materialRule = null;
        this.lastMaterialKey = null;
        this.releaseTerminalObserver();
        return;
      }
      if (!this.styleEl || !document.head.contains(this.styleEl)) {
        this.materialRule = null;
        this.lastMaterialKey = null;
        this.styleEl = document.getElementById(STYLE_ID) || document.createElement("style");
        this.styleEl.id = STYLE_ID;
        this.styleEl.dataset.plugin = "agy-skins";
        if (!this.styleEl.isConnected) document.head.appendChild(this.styleEl);
      }
      const pct = (v, fb) => {
        const n = Number(v);
        return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : fb;
      };
      const fidelity = Math.min(1, Math.max(0, Number(glassFidelity) / 100));
      const chatFidelity = Math.min(1, Math.max(0, Number(chatGlassFidelity) / 100));
      const keep = (100 - pct(glassTransparency, 10)) * (0.4 + 0.6 * fidelity);
      const floatingKeep = Math.max(keep, 72);
      const overlayKeep = Math.min(100, Math.max(25, 100 - pct(settingsWindowTransparency, 20)));
      const bubbleKeep = pct(bubbleOpacity, 55) * (0.5 + 0.5 * chatFidelity);
      const composerBlur = Math.min(20, Math.max(0, pct(composerFrost, 10)));
      const surfaceBlur = Math.min(20, Math.max(0, pct(surfaceFrost, 8)));
      const overlayBlur = Math.min(60, Math.max(0, pct(settingsWindowBlur, 16)));
      const saturate = Math.min(200, Math.max(100, Number.isFinite(Number(saturation)) ? Number(saturation) : 150));
      const borderAlpha = Math.min(1, Math.max(0, (Number.isFinite(Number(border)) ? Number(border) : 35) / 100));
      const highlightAlpha = highlight ? 0.16 : 0;
      const frost = surfaceBlur > 0 ? `saturate(${saturate}%) blur(${surfaceBlur}px)` : "none";
      const overlayFrost = overlayBlur > 0 ? `saturate(${saturate}%) blur(${overlayBlur}px)` : "none";
      const composerFrostCss = composerBlur > 0 ? `saturate(${saturate}%) blur(${composerBlur}px)` : "none";
      const seeds = this.readHostSeeds(root);
      const fallbackBg = isDark ? "#101010" : "#ffffff";
      const fallbackSidebar = isDark ? "#151515" : "#fafafa";
      const chosenGlassColor = glassColor && typeof glassColor === "object" ? isDark && glassDarkSeparate ? glassColor.dark : glassColor.light : null;
      const customColorValid = /^#[0-9a-f]{6}$/i.test(chosenGlassColor || "") && String(chosenGlassColor).toLowerCase() !== "#ffffff";
      const chromeTint = customColorValid ? this.rgbaFromSeed(null, keep, chosenGlassColor) : this.rgbaFromSeed(seeds.bg, keep, fallbackBg);
      const cardTint = customColorValid ? this.rgbaFromSeed(null, keep, chosenGlassColor) : this.rgbaFromSeed(seeds.card || seeds.bg, keep, fallbackBg);
      const floatingTint = this.rgbaFromSeed(seeds.card || seeds.bg, floatingKeep, fallbackBg);
      const overlayTint = this.rgbaFromSeed(seeds.card || seeds.bg, overlayKeep, fallbackBg);
      const bubbleTint = this.rgbaFromSeed(seeds.card || seeds.bg, bubbleKeep, fallbackBg);
      const sidebarKeep = sidebarFollowGlobal ? keep : 100 - pct(sidebarAlpha, 60);
      const sidebarTint = !sidebarGlass || !leftSidebarGlass ? seeds.sidebar ? this.rgbaFromSeed(seeds.sidebar, 100, fallbackSidebar) : fallbackSidebar : sidebarFollowGlobal ? this.rgbaFromSeed(seeds.sidebar || seeds.bg, keep, fallbackSidebar) : this.rgbaFromSeed(null, sidebarKeep, /^#[0-9a-f]{6}$/i.test(sidebarColor || "") ? sidebarColor : fallbackSidebar);
      const sidebarFrost = !sidebarGlass || !leftSidebarGlass ? "none" : sidebarFollowGlobal ? frost : sidebarBlur > 0 ? `saturate(${saturate}%) blur(${Math.min(60, sidebarBlur)}px)` : "none";
      const titlebarTint = titlebarGlass ? chromeTint : this.rgbaFromSeed(seeds.bg, 100, fallbackBg);
      const titlebarFrost = titlebarGlass ? frost : "none";
      const cornerOf = (mode, square) => square ? "0px" : mode === "native" ? "0px" : `${mode}px`;
      const leftNative = leftSidebarCornerRadius === "native" && !leftSidebarSquareTL && !leftSidebarSquareTR && !leftSidebarSquareBR && !leftSidebarSquareBL;
      const leftRadius = leftNative ? "0px" : `${cornerOf(leftSidebarCornerRadius, leftSidebarSquareTL)} ${cornerOf(leftSidebarCornerRadius, leftSidebarSquareTR)} ${cornerOf(leftSidebarCornerRadius, leftSidebarSquareBR)} ${cornerOf(leftSidebarCornerRadius, leftSidebarSquareBL)}`;
      const rightNative = rightSidebarCornerRadius === "native" && !rightSidebarSquareTL && !rightSidebarSquareTR && !rightSidebarSquareBR && !rightSidebarSquareBL;
      const rightRadius = rightNative ? "0px" : `${cornerOf(rightSidebarCornerRadius, rightSidebarSquareTL)} ${cornerOf(rightSidebarCornerRadius, rightSidebarSquareTR)} ${cornerOf(rightSidebarCornerRadius, rightSidebarSquareBR)} ${cornerOf(rightSidebarCornerRadius, rightSidebarSquareBL)}`;
      const materialKey = JSON.stringify({
        keep,
        floatingKeep,
        overlayKeep,
        bubbleKeep,
        composerBlur,
        surfaceBlur,
        overlayBlur,
        saturate,
        borderAlpha,
        highlightAlpha,
        accent,
        chosenGlassColor,
        glassDarkSeparate,
        sidebarGlass,
        sidebarFollowGlobal,
        sidebarBlur,
        sidebarAlpha,
        sidebarColor,
        leftSidebarGlass,
        leftRadius,
        rightRadius,
        titlebarGlass,
        isDark,
        seedKey: this.seedKey
      });
      if (this.lastMaterialKey === materialKey && this.styleEl.isConnected) return;
      if (body.getAttribute("data-agy-skins-active") !== "true") {
        body.setAttribute("data-agy-skins-active", "true");
      }
      const vars = {
        "--agy-skins-keep": `${keep}%`,
        "--agy-skins-chrome-tint": chromeTint,
        "--agy-skins-card-tint": cardTint,
        "--agy-skins-sidebar-tint": sidebarTint,
        "--agy-skins-floating-tint": floatingTint,
        "--agy-skins-overlay-tint": overlayTint,
        "--agy-skins-bubble-tint": bubbleTint,
        "--agy-skins-frost": frost,
        "--agy-skins-sidebar-frost": sidebarFrost,
        "--agy-skins-titlebar-tint": titlebarTint,
        "--agy-skins-titlebar-frost": titlebarFrost,
        "--agy-skins-overlay-frost": overlayFrost,
        "--agy-skins-composer-frost": composerFrostCss,
        "--agy-skins-glass-border": String(borderAlpha),
        "--agy-skins-glass-highlight": String(highlightAlpha),
        "--agy-skins-left-radius": leftRadius,
        "--agy-skins-right-radius": rightRadius,
        "--agy-skins-accent": accent,
        "--we-accent": accent
      };
      if (this.materialRule) {
        for (const [k, v] of Object.entries(vars)) {
          if (this.materialRule.getPropertyValue(k).trim() !== v) {
            this.materialRule.setProperty(k, v);
          }
        }
        this.lastMaterialKey = materialKey;
        return;
      }
      const varLines = Object.entries(vars).map(([k, v]) => `  ${k}: ${v};`).join("\n");
      const css = `
body[data-agy-skins-active="true"] {
${varLines}
  --background: var(--agy-skins-chrome-tint);
  --shell: transparent;
  --content: var(--agy-skins-chrome-tint);
  --card: var(--agy-skins-card-tint);
  --sidebar: var(--agy-skins-sidebar-tint);
  --glass: var(--agy-skins-card-tint);
  background-color: transparent !important;
}

/* Shell & layout wrappers stay transparent so #agy-skins-backdrop-root shows cleanly without double veiling */
body[data-agy-skins-active="true"] .agy-shell {
  position: relative !important;
  z-index: 1 !important;
  background: transparent !important;
  background-color: transparent !important;
  backdrop-filter: none !important;
}
body[data-agy-skins-active="true"] .agy-sheet,
body[data-agy-skins-active="true"] .agy-inset-shell,
body[data-agy-skins-active="true"] [data-split-root],
body[data-agy-skins-active="true"] [data-tiling-pane]:not([data-browser-hole]),
body[data-agy-skins-active="true"] [data-pane-id]:not([data-browser-hole]) {
  background: transparent !important;
  background-color: transparent !important;
}

/* Left sidebar single structural veil + frost + corner radii */
body[data-agy-skins-active="true"] [data-testid="sidebar-split"] > :first-child {
  background-color: var(--agy-skins-sidebar-tint) !important;
  backdrop-filter: var(--agy-skins-sidebar-frost) !important;
  -webkit-backdrop-filter: var(--agy-skins-sidebar-frost) !important;
  border-radius: var(--agy-skins-left-radius) !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, var(--agy-skins-glass-highlight)),
              inset 0 0 0 1px rgba(255, 255, 255, var(--agy-skins-glass-border));
}
body[data-agy-skins-active="true"] .bg-sidebar,
body[data-agy-skins-active="true"] [data-testid="conversation-list-sidebar"],
body[data-agy-skins-active="true"] [data-testid="sidebar-navigation-items"] {
  background-color: transparent !important;
  background-image: none !important;
  backdrop-filter: none !important;
}
body[data-agy-skins-active="true"] .agy-sidebar-row .agy-row-actions,
body[data-agy-skins-active="true"] .agy-status-overflow {
  background: transparent !important;
  box-shadow: none !important;
}

/* Titlebar */
body[data-agy-skins-active="true"] [class*="@container/titlebar"],
body[data-agy-skins-active="true"] [data-main-content-header] {
  background-color: var(--agy-skins-titlebar-tint) !important;
  backdrop-filter: var(--agy-skins-titlebar-frost) !important;
  -webkit-backdrop-filter: var(--agy-skins-titlebar-frost) !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, var(--agy-skins-glass-highlight));
}

/* Main chat pane */
body[data-agy-skins-active="true"] [data-main-content-body] {
  background-color: var(--agy-skins-chrome-tint) !important;
  backdrop-filter: var(--agy-skins-frost) !important;
  -webkit-backdrop-filter: var(--agy-skins-frost) !important;
}

/* Right auxiliary / side panel (never tint embedded Chromium browser hole) */
body[data-agy-skins-active="true"] [data-side-panel-body]:not([data-has-browser-hole="true"]):not(:has([data-browser-hole]:not([data-browser-hole="false"]))) {
  background-color: var(--agy-skins-chrome-tint) !important;
  backdrop-filter: var(--agy-skins-frost) !important;
  -webkit-backdrop-filter: var(--agy-skins-frost) !important;
  border-radius: var(--agy-skins-right-radius) !important;
}
body[data-agy-skins-active="true"][data-has-browser-hole="true"] [data-has-browser-hole="true"],
body[data-agy-skins-active="true"][data-has-browser-hole="true"] [data-browser-hole]:not([data-browser-hole="false"]),
body[data-agy-skins-active="true"][data-has-browser-hole="true"] .browser-hole-opaque:not([data-has-browser-hole="true"]) {
  background: transparent !important;
  background-color: transparent !important;
  backdrop-filter: none !important;
}

/* User message bubbles */
body[data-agy-skins-active="true"] [data-testid="user-message-bubble"],
body[data-agy-skins-active="true"] .agy-user-bubble {
  background-color: var(--agy-skins-bubble-tint) !important;
  border-color: rgba(255, 255, 255, var(--agy-skins-glass-border)) !important;
}

/* Composer */
body[data-agy-skins-active="true"] .surface-composer {
  background-color: transparent !important;
}
body[data-agy-skins-active="true"] .surface-composer > .surface-composer-card {
  background-color: var(--agy-skins-card-tint) !important;
  backdrop-filter: var(--agy-skins-composer-frost) !important;
  -webkit-backdrop-filter: var(--agy-skins-composer-frost) !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, var(--agy-skins-glass-highlight)),
              inset 0 0 0 1px rgba(255, 255, 255, var(--agy-skins-glass-border)) !important;
}

/* Floating menus, fastpick, settings modal & dialogs */
body[data-agy-skins-active="true"] .surface-glass,
body[data-agy-skins-active="true"] .agy-fastpick,
body[data-agy-skins-active="true"] .quick-input-widget,
body[data-agy-skins-active="true"] [role="menu"],
body[data-agy-skins-active="true"] [role="listbox"] {
  background-color: var(--agy-skins-floating-tint) !important;
  backdrop-filter: var(--agy-skins-frost) !important;
  -webkit-backdrop-filter: var(--agy-skins-frost) !important;
}
body[data-agy-skins-active="true"] .settings-modal-container,
body[data-agy-skins-active="true"] [role="dialog"]:not(#agy-skins-studio-dialog) {
  background-color: var(--agy-skins-overlay-tint) !important;
  backdrop-filter: var(--agy-skins-overlay-frost) !important;
  -webkit-backdrop-filter: var(--agy-skins-overlay-frost) !important;
}

/* Embedded xterm transparent support */
body[data-agy-skins-active="true"] :is(.xterm, .xterm-screen, .xterm-viewport) {
  background-color: transparent !important;
}
`;
      this.styleEl.textContent = css;
      this.materialRule = this.styleEl.sheet?.cssRules?.[0]?.style || null;
      this.lastMaterialKey = materialKey;
      this.syncTerminalObserver();
    }
    syncTerminalObserver() {
      if (typeof MutationObserver !== "function" || typeof document === "undefined" || this.terminalObserver) return;
      this.terminalObserver = new MutationObserver((entries) => {
        for (const entry of entries) {
          if (entry.target?.nodeType === 1) this.applyTerminalSurface(entry.target);
        }
      });
      this.terminalObserver.observe(document.body, { childList: true, subtree: true });
      this.applyTerminalSurface(document.body);
    }
    applyTerminalSurface(root) {
      if (!root?.querySelectorAll) return;
      const hosts = [];
      if (root.matches?.(".xterm")) hosts.push(root);
      hosts.push(...root.querySelectorAll(".xterm"));
      for (const host of hosts) {
        const found = findXtermTerminal(host);
        if (!found?.terminal) continue;
        const { terminal, addon } = found;
        let rec = this.terminalRecords.get(terminal);
        if (!rec) {
          rec = {
            terminal,
            addon,
            hostTheme: { ...terminal.options?.theme || {} },
            originalAlpha: terminal.options?.allowTransparency
          };
          this.terminalRecords.set(terminal, rec);
        }
        try {
          terminal.options.allowTransparency = true;
          terminal.options.theme = { ...terminal.options?.theme || {}, background: "rgba(0, 0, 0, 0)" };
          addon?.clearTextureAtlas?.();
          terminal.refresh(0, Math.max(0, terminal.rows - 1));
        } catch {
        }
      }
    }
    releaseTerminalObserver() {
      this.terminalObserver?.disconnect();
      this.terminalObserver = null;
      for (const rec of this.terminalRecords.values()) {
        try {
          rec.terminal.options.allowTransparency = rec.originalAlpha;
          rec.terminal.options.theme = { ...rec.hostTheme };
          rec.addon?.clearTextureAtlas?.();
          rec.terminal.refresh(0, Math.max(0, rec.terminal.rows - 1));
        } catch {
        }
      }
      this.terminalRecords.clear();
    }
    destroy() {
      this.update({ enabled: false });
    }
  };

  // src/engine/font-controller.js
  var FONT_STYLE_ID = "agy-skins-font-css";
  var SURFACES = ':is([data-main-content-body], [data-testid="conversation-view"], [data-testid="sidebar-split"] > :first-child, .surface-composer, [class*="@container/titlebar"])';
  var COMPONENT_SELECTORS = {
    markdown: "[data-markdown-root]",
    codeBlock: "[data-markdown-root] :is(pre, code, kbd)",
    terminal: ".xterm",
    table: "[data-markdown-root] :is(table, th, td)"
  };
  var ROLE_SELECTORS = {
    "markdown-h1": "[data-markdown-root] h1",
    "markdown-h2": "[data-markdown-root] h2",
    "markdown-h3": "[data-markdown-root] h3",
    "markdown-h4": "[data-markdown-root] h4",
    "markdown-base": "[data-markdown-root]",
    "markdown-small": "[data-markdown-root] :is(small, .text-xs)",
    "markdown-code": "[data-markdown-root] :not(pre) > code",
    "markdown-code-block": "[data-markdown-root] :is(pre, pre code)",
    "markdown-table": "[data-markdown-root] :is(table, th, td)",
    "markdown-table-head": "[data-markdown-root] th",
    "xs-13": '[class*="@container/titlebar"], [data-main-content-header]',
    "xxs-12": "[data-markdown-root] :is(.text-xs, small)"
  };
  var TEXT_TOKEN_ROLES = {
    primary: "--foreground",
    secondary: "--secondary-foreground",
    tertiary: "--muted-foreground",
    caption: "--placeholder",
    dimmed: "--muted-foreground"
  };
  var safeFamily = (value) => typeof value === "string" ? value.replace(/[;{}<>"'\\\u0000-\u001f\u007f]/g, "").trim().slice(0, 200) : "";
  function fontFamilyStack(value) {
    const family = safeFamily(value);
    if (!family || family === "inherit") return "inherit";
    if (family.includes(",")) return family;
    return `"${family}", system-ui, sans-serif`;
  }
  function roleCss(config) {
    const blocks = [];
    for (const [role, selector] of Object.entries(ROLE_SELECTORS)) {
      const size = Number(config.themeSize?.[role]) || 0;
      const weight = Number(config.themeWeight?.[role]) || 0;
      const family = safeFamily(config.themeFamily?.[role]);
      const decl = [];
      if (size >= 8 && size <= 48) decl.push(`font-size:${size}px !important`);
      if (weight >= 100 && weight <= 900) decl.push(`font-weight:${weight} !important`);
      if (family) decl.push(`font-family:${fontFamilyStack(family)} !important`);
      if (decl.length) blocks.push(`body[data-agy-skins-font="true"] ${selector}{${decl.join(";")}}`);
    }
    return blocks.join("\n");
  }
  function componentCss(config) {
    const blocks = [];
    for (const [id, selector] of Object.entries(COMPONENT_SELECTORS)) {
      const value = config.componentFonts?.[id];
      if (!value) continue;
      const decl = [];
      if (Number(value.size) >= 8) decl.push(`font-size:${Math.round(Number(value.size))}px !important`);
      if (Number(value.weight) >= 100) decl.push(`font-weight:${Math.round(Number(value.weight))}px !important`.replace("px", ""));
      const family = safeFamily(value.family);
      if (family) decl.push(`font-family:${fontFamilyStack(family)} !important`);
      if (decl.length) blocks.push(`body[data-agy-skins-font="true"] ${selector}{${decl.join(";")}}`);
    }
    return blocks.join("\n");
  }
  function colorCss(config) {
    const blocks = [];
    for (const mode of ["light", "dark"]) {
      const decl = [];
      for (const [role, token] of Object.entries(TEXT_TOKEN_ROLES)) {
        const pair = config.themeColors?.[role];
        const color = pair?.[config.themeDarkSeparate ? mode : "light"] || pair?.dark || pair?.light;
        if (/^#[0-9a-f]{6}$/i.test(color || "")) decl.push(`${token}:${color}`);
      }
      if (decl.length) {
        const modeSel = mode === "light" ? "body.theme-light" : "body:not(.theme-light)";
        blocks.push(`${modeSel}[data-agy-skins-text-colors="true"]{${decl.join(";")}}`);
      }
    }
    return blocks.join("\n");
  }
  function uiColorCss(config) {
    if (!config.uiColorCustom) return "";
    const accent = /^#[0-9a-f]{6}$/i.test(config.accent || "") ? config.accent : "#4f8cff";
    const send = /^#[0-9a-f]{6}$/i.test(config.uiColorSend || "") ? config.uiColorSend : accent;
    const link = /^#[0-9a-f]{6}$/i.test(config.uiColorLink || "") ? config.uiColorLink : accent;
    const file = /^#[0-9a-f]{6}$/i.test(config.uiColorFileIcon || "") ? config.uiColorFileIcon : link;
    const tab = /^#[0-9a-f]{6}$/i.test(config.uiColorTab || "") ? config.uiColorTab : accent;
    const deep = /^#[0-9a-f]{6}$/i.test(config.uiColorDeepDiving || "") ? config.uiColorDeepDiving : accent;
    return `
    body[data-agy-skins-ui-colors="true"] {
      --we-accent:${accent};
      --primary:${accent};
      --cta:${accent};
      --nux-focus-ring:color-mix(in srgb, ${accent} 55%, transparent);
    }
    body[data-agy-skins-ui-colors="true"] .surface-composer button[type="submit"],
    body[data-agy-skins-ui-colors="true"] .surface-composer [data-testid="input-send-button"] {
      background-color:${send} !important;
    }
    body[data-agy-skins-ui-colors="true"] [data-markdown-root] a,
    body[data-agy-skins-ui-colors="true"] [data-markdown-root] .text-primary {
      color:${link} !important;
    }
    body[data-agy-skins-ui-colors="true"] [data-testid="tool-group-collapsible"] svg {
      color:${file};
    }
    body[data-agy-skins-ui-colors="true"] [data-panel-header] [aria-selected="true"] {
      color:${tab} !important;
      border-color:${tab} !important;
    }
    body[data-agy-skins-ui-colors="true"] [data-testid="worked-for-collapsible"] {
      color:${deep};
    }
  `;
  }
  var FontController = class {
    constructor() {
      this.styleEl = null;
      this.lastKey = null;
    }
    update(config = {}) {
      if (typeof document === "undefined" || !document.body) return;
      const body = document.body;
      const fontOn = config.fontCustom === true;
      const colorsOn = fontOn && Object.keys(config.themeColors || {}).length > 0;
      const uiColorsOn = config.uiColorCustom === true;
      const caret = /^#[0-9a-f]{6}$/i.test(config.caretColor || "") ? config.caretColor : "";
      const globalFamily = safeFamily(config.globalFamily);
      const key = JSON.stringify({
        fontOn,
        colorsOn,
        uiColorsOn,
        caret,
        globalFamily,
        themeSize: config.themeSize,
        themeWeight: config.themeWeight,
        themeFamily: config.themeFamily,
        componentFonts: config.componentFonts,
        themeColors: config.themeColors,
        themeDarkSeparate: config.themeDarkSeparate,
        accent: config.accent,
        send: config.uiColorSend,
        link: config.uiColorLink,
        file: config.uiColorFileIcon,
        tab: config.uiColorTab,
        deep: config.uiColorDeepDiving
      });
      if (key === this.lastKey && (!this.styleEl || this.styleEl.isConnected)) return;
      this.lastKey = key;
      if (fontOn) body.setAttribute("data-agy-skins-font", "true");
      else body.removeAttribute("data-agy-skins-font");
      if (colorsOn) body.setAttribute("data-agy-skins-text-colors", "true");
      else body.removeAttribute("data-agy-skins-text-colors");
      if (uiColorsOn) body.setAttribute("data-agy-skins-ui-colors", "true");
      else body.removeAttribute("data-agy-skins-ui-colors");
      if (fontOn && globalFamily) body.style.setProperty("--agy-skins-font-family", fontFamilyStack(globalFamily));
      else body.style.removeProperty("--agy-skins-font-family");
      const css = [
        fontOn ? `
        body[data-agy-skins-font="true"] ${SURFACES} {
          font-family:var(--agy-skins-font-family, inherit) !important;
        }
        ${roleCss(config)}
        ${componentCss(config)}
      ` : "",
        caret ? `
        body :is(input, textarea, [contenteditable="true"]) {
          caret-color:${caret} !important;
        }
      ` : "",
        colorCss(config),
        uiColorCss(config)
      ].filter(Boolean).join("\n");
      if (!css.trim()) {
        this.styleEl?.remove();
        this.styleEl = null;
        return;
      }
      if (!this.styleEl || !this.styleEl.isConnected) {
        this.styleEl = document.getElementById(FONT_STYLE_ID) || document.createElement("style");
        this.styleEl.id = FONT_STYLE_ID;
        this.styleEl.dataset.plugin = "agy-skins";
        if (!this.styleEl.isConnected) document.head.appendChild(this.styleEl);
      }
      this.styleEl.textContent = css;
    }
    destroy() {
      this.update({ fontCustom: false, uiColorCustom: false, caretColor: "" });
    }
  };

  // src/engine/fx-overlay.js
  var CANVAS_ID = "agy-skins-fx-canvas";
  var IDLE_DELAY_MS = 2200;
  var TIER_PARAMS = {
    full: { intervalMs: 16, maxRipples: 10, maxParticles: 160, maxTrail: 28, burstCount: 14, shadowScale: 1, dustMult: 1 },
    reduced: { intervalMs: 22, maxRipples: 6, maxParticles: 96, maxTrail: 18, burstCount: 9, shadowScale: 0.7, dustMult: 0.65 },
    minimal: { intervalMs: 33, maxRipples: 4, maxParticles: 48, maxTrail: 12, burstCount: 5, shadowScale: 0.35, dustMult: 0.35 }
  };
  var VALID_BLEND = /* @__PURE__ */ new Set(["screen", "normal", "overlay", "multiply", "lighten"]);
  var clamp2 = (value, min, max, fb) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fb;
  };
  function hexToRgb(hex) {
    if (typeof hex !== "string") return [79, 140, 255];
    const m = hex.trim().match(/^#?([0-9a-f]{6})$/i);
    if (!m) return [79, 140, 255];
    const n = parseInt(m[1], 16);
    return [n >> 16 & 255, n >> 8 & 255, n & 255];
  }
  function hslToRgb(h, s = 0.85, l = 0.62) {
    const hue = (h % 360 + 360) % 360;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(hue / 60 % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (hue < 60) [r, g, b] = [c, x, 0];
    else if (hue < 120) [r, g, b] = [x, c, 0];
    else if (hue < 180) [r, g, b] = [0, c, x];
    else if (hue < 240) [r, g, b] = [0, x, c];
    else if (hue < 300) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];
    return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
  }
  var FxOverlay = class {
    constructor() {
      this.canvas = null;
      this.ctx = null;
      this.config = null;
      this.ripples = [];
      this.particles = [];
      this.trail = [];
      this.hue = 210;
      this.raf = null;
      this.lastRender = 0;
      this.lastMove = 0;
      this.tier = "full";
      this.slowFrames = 0;
      this.fastFrames = 0;
      this.lastStamp = 0;
      this.listenersAttached = false;
      this.onPointerDown = (e) => this.handlePointerDown(e);
      this.onPointerMove = (e) => this.handlePointerMove(e);
      this.onResize = () => this.resize();
      this.onVisibility = () => {
        if (document.hidden) this.pauseLoop();
        else if (this.ripples.length || this.particles.length || this.trail.length) this.scheduleLoop();
      };
    }
    ensureCanvas() {
      if (typeof document === "undefined" || !document.body) return;
      if (!this.canvas || !this.canvas.isConnected) {
        this.canvas = document.getElementById(CANVAS_ID) || document.createElement("canvas");
        this.canvas.id = CANVAS_ID;
        this.canvas.setAttribute("aria-hidden", "true");
        this.canvas.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;z-index:2147483000;pointer-events:none;";
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext("2d");
        this.resize();
      }
      const blend = VALID_BLEND.has(this.config?.fxBlend) ? this.config.fxBlend : "screen";
      this.canvas.style.mixBlendMode = blend;
      this.attachListeners();
    }
    attachListeners() {
      if (this.listenersAttached || typeof window === "undefined") return;
      this.listenersAttached = true;
      window.addEventListener("pointerdown", this.onPointerDown, { passive: true, capture: true });
      window.addEventListener("pointermove", this.onPointerMove, { passive: true, capture: true });
      window.addEventListener("resize", this.onResize, { passive: true });
      document.addEventListener("visibilitychange", this.onVisibility);
    }
    detachListeners() {
      if (!this.listenersAttached || typeof window === "undefined") return;
      this.listenersAttached = false;
      window.removeEventListener("pointerdown", this.onPointerDown, { capture: true });
      window.removeEventListener("pointermove", this.onPointerMove, { capture: true });
      window.removeEventListener("resize", this.onResize);
      document.removeEventListener("visibilitychange", this.onVisibility);
    }
    resize() {
      if (!this.canvas || typeof window === "undefined") return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.max(1, Math.round(window.innerWidth));
      const h = Math.max(1, Math.round(window.innerHeight));
      this.canvas.width = Math.round(w * dpr);
      this.canvas.height = Math.round(h * dpr);
      this.dpr = dpr;
    }
    resolveRgb(shift = 0) {
      const mode = this.config?.fxColorMode || "accent";
      if (mode === "rainbow") return hslToRgb(this.hue + shift);
      if (mode === "custom") return hexToRgb(this.config?.fxColor || "#4f8cff");
      return hexToRgb(this.config?.accent || "#4f8cff");
    }
    handlePointerDown(e) {
      if (!this.config?.fxEnabled || this.config.fxClick === false) return;
      const tier = TIER_PARAMS[this.tier];
      const style = this.config.fxClickStyle || "both";
      const size = clamp2(this.config.fxClickSize, 40, 400, 140) / 140;
      const rgb = this.resolveRgb(18);
      if (style === "ripple" || style === "both") {
        if (this.ripples.length >= tier.maxRipples) this.ripples.shift();
        this.ripples.push({
          x: e.clientX,
          y: e.clientY,
          r: 4 * size,
          maxR: 64 * size,
          life: 1,
          rgb
        });
      }
      if (style === "spark" || style === "both") {
        const count = tier.burstCount;
        for (let i = 0; i < count; i++) {
          if (this.particles.length >= tier.maxParticles) this.particles.shift();
          const angle = Math.PI * 2 * i / count + (Math.random() - 0.5) * 0.4;
          const speed = (1.6 + Math.random() * 2.8) * size;
          this.particles.push({
            x: e.clientX,
            y: e.clientY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: (1.5 + Math.random() * 2.2) * size,
            life: 1,
            decay: 0.032 + Math.random() * 0.025,
            rgb: this.config.fxColorMode === "rainbow" ? hslToRgb(this.hue + i * 16) : rgb
          });
        }
      }
      this.scheduleLoop();
    }
    handlePointerMove(e) {
      if (!this.config?.fxEnabled || this.config.fxTrail === false) return;
      const now = performance.now();
      if (now - this.lastMove < 10) return;
      this.lastMove = now;
      this.hue = (this.hue + 4) % 360;
      const tier = TIER_PARAMS[this.tier];
      const style = this.config.fxTrailStyle || "comet";
      const rgb = this.resolveRgb();
      const widthScale = Math.max(0.4, clamp2(this.config.fxTrailWidth, 1, 12, 3) / 3);
      const trailMs = clamp2(this.config.fxTrailLength, 80, 2e3, 420);
      const decayRate = Math.max(0.015, Math.min(0.22, 16 / trailMs));
      if (style === "dust") {
        const n = Math.max(1, Math.round(2 * tier.dustMult));
        for (let i = 0; i < n; i++) {
          if (this.particles.length >= tier.maxParticles) this.particles.shift();
          this.particles.push({
            x: e.clientX + (Math.random() - 0.5) * 8,
            y: e.clientY + (Math.random() - 0.5) * 8,
            vx: (Math.random() - 0.5) * 0.9,
            vy: -0.35 - Math.random() * 0.7,
            radius: (1.4 + Math.random() * 1.8) * widthScale,
            life: 1,
            decay: decayRate + Math.random() * 0.015,
            rgb
          });
        }
      } else {
        const cap = Math.max(6, Math.min(tier.maxTrail, Math.round(trailMs / 420 * 18)));
        while (this.trail.length >= cap) this.trail.shift();
        this.trail.push({ x: e.clientX, y: e.clientY, life: 1, decay: decayRate, rgb });
      }
      this.scheduleLoop();
    }
    adaptTier(dt) {
      if (dt > 24) {
        this.slowFrames += 1;
        this.fastFrames = 0;
        if (this.slowFrames >= 8) {
          this.tier = this.tier === "full" ? "reduced" : "minimal";
          this.slowFrames = 0;
        }
      } else if (dt < 17) {
        this.fastFrames += 1;
        this.slowFrames = 0;
        if (this.fastFrames >= 90 && this.tier !== "full") {
          this.tier = this.tier === "minimal" ? "reduced" : "full";
          this.fastFrames = 0;
        }
      }
    }
    scheduleLoop() {
      if (this.raf !== null || typeof window === "undefined" || document.hidden) return;
      const step = (ts) => {
        this.raf = null;
        if (!this.config?.fxEnabled) return;
        const tier = TIER_PARAMS[this.tier];
        if (this.lastStamp) this.adaptTier(ts - this.lastStamp);
        this.lastStamp = ts;
        if (ts - this.lastRender >= tier.intervalMs) {
          this.lastRender = ts;
          this.renderFrame();
        }
        if (this.ripples.length || this.particles.length || this.trail.length || ts - this.lastMove < IDLE_DELAY_MS) {
          this.raf = window.requestAnimationFrame(step);
        }
      };
      this.raf = window.requestAnimationFrame(step);
    }
    pauseLoop() {
      if (this.raf !== null && typeof window !== "undefined") {
        window.cancelAnimationFrame(this.raf);
      }
      this.raf = null;
    }
    renderFrame() {
      if (!this.ctx || !this.canvas) return;
      const ctx = this.ctx;
      const dpr = this.dpr || 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, this.canvas.width / dpr, this.canvas.height / dpr);
      const tier = TIER_PARAMS[this.tier];
      const opacity = clamp2(this.config.fxOpacity, 10, 100, 85) / 100;
      const clickGlow = clamp2(this.config.fxClickGlow, 0, 100, 60) / 100 * 18 * tier.shadowScale;
      const trailGlow = clamp2(this.config.fxTrailGlow, 0, 100, 60) / 100 * 18 * tier.shadowScale;
      const widthBase = clamp2(this.config.fxTrailWidth, 1, 12, 3);
      if (this.trail.length > 1) {
        for (let i = 1; i < this.trail.length; i++) {
          const prev = this.trail[i - 1];
          const cur = this.trail[i];
          const t = i / this.trail.length;
          const alpha = cur.life * t * opacity * 0.78;
          if (alpha <= 0.01) continue;
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(cur.x, cur.y);
          ctx.strokeStyle = `rgba(${cur.rgb[0]},${cur.rgb[1]},${cur.rgb[2]},${alpha.toFixed(3)})`;
          ctx.lineWidth = Math.max(0.8, widthBase * t * 1.8);
          ctx.lineCap = "round";
          ctx.shadowColor = `rgb(${cur.rgb[0]},${cur.rgb[1]},${cur.rgb[2]})`;
          ctx.shadowBlur = trailGlow;
          ctx.stroke();
        }
        for (let i = this.trail.length - 1; i >= 0; i--) {
          this.trail[i].life -= this.trail[i].decay || 0.045;
          if (this.trail[i].life <= 0) this.trail.splice(i, 1);
        }
      } else if (this.trail.length === 1) {
        this.trail[0].life -= 0.08;
        if (this.trail[0].life <= 0) this.trail.length = 0;
      }
      for (let i = this.ripples.length - 1; i >= 0; i--) {
        const rp = this.ripples[i];
        rp.r += (rp.maxR - rp.r) * 0.14;
        rp.life -= 0.04;
        if (rp.life <= 0) {
          this.ripples.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${rp.rgb[0]},${rp.rgb[1]},${rp.rgb[2]},${(rp.life * opacity).toFixed(3)})`;
        ctx.lineWidth = 2.2;
        ctx.shadowColor = `rgb(${rp.rgb[0]},${rp.rgb[1]},${rp.rgb[2]})`;
        ctx.shadowBlur = clickGlow;
        ctx.stroke();
      }
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.life -= p.decay;
        if (p.life <= 0) {
          this.particles.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.6, p.radius * p.life), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.rgb[0]},${p.rgb[1]},${p.rgb[2]},${(p.life * opacity).toFixed(3)})`;
        ctx.shadowColor = `rgb(${p.rgb[0]},${p.rgb[1]},${p.rgb[2]})`;
        ctx.shadowBlur = trailGlow;
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    }
    update(config = {}) {
      this.config = config;
      if (!config.fxEnabled) {
        this.pauseLoop();
        this.detachListeners();
        this.ripples = [];
        this.particles = [];
        this.trail = [];
        this.canvas?.remove();
        this.canvas = null;
        this.ctx = null;
        return;
      }
      this.ensureCanvas();
    }
    destroy() {
      this.update({ fxEnabled: false });
    }
  };

  // src/engine/parallax-controller.js
  var PARALLAX_STYLE_ID = "agy-skins-parallax-css";
  var UI_GROUPS = [
    { key: "parallaxUiChatDepth", selector: '[data-testid="conversation-view"]', defaultDepth: 3 },
    { key: "parallaxUiComposerDepth", selector: ".surface-composer", defaultDepth: 6 },
    { key: "parallaxUiSidebarDepth", selector: '[data-testid="sidebar-split"] > :first-child', defaultDepth: 2 },
    { key: "parallaxUiBubbleDepth", selector: '[data-testid="user-message-bubble"], .agy-user-bubble', defaultDepth: 8 }
  ];
  var clamp3 = (value, min, max, fb) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fb;
  };
  function discoverExtensionSlots(doc = typeof document !== "undefined" ? document : null) {
    if (!doc) return [];
    const seen = /* @__PURE__ */ new Set();
    const out = [];
    for (const el of doc.querySelectorAll("[data-slot]")) {
      const slot = el.getAttribute("data-slot")?.trim();
      if (!slot || seen.has(slot)) continue;
      seen.add(slot);
      out.push(slot);
    }
    return out;
  }
  var ParallaxController = class {
    constructor() {
      this.styleEl = null;
      this.config = null;
      this.targetX = 0;
      this.targetY = 0;
      this.curX = 0;
      this.curY = 0;
      this.raf = null;
      this.active = false;
      this.onPointerMove = (e) => this.handleMove(e);
      this.onPointerLeave = () => {
        this.targetX = 0;
        this.targetY = 0;
        this.scheduleTick();
      };
    }
    ensureStyle(config) {
      if (typeof document === "undefined" || !document.head) return;
      if (!this.styleEl || !this.styleEl.isConnected) {
        this.styleEl = document.getElementById(PARALLAX_STYLE_ID) || document.createElement("style");
        this.styleEl.id = PARALLAX_STYLE_ID;
        this.styleEl.dataset.plugin = "agy-skins";
        if (!this.styleEl.isConnected) document.head.appendChild(this.styleEl);
      }
      const bgPct = clamp3(config.parallaxBg, 0, 10, 1);
      const bgPx = bgPct * 10;
      const bgScale = (1 + bgPct * 0.025).toFixed(4);
      const blocks = [
        `
        body[data-agy-skins-parallax="true"] .agy-skins-backdrop-surface {
          transform: translate3d(
            calc(var(--agy-px, 0) * ${bgPx.toFixed(2)}px),
            calc(var(--agy-py, 0) * ${bgPx.toFixed(2)}px),
            0
          ) scale(${bgScale}) !important;
          will-change: transform;
        }
      `
      ];
      if (config.parallaxUi) {
        for (const grp of UI_GROUPS) {
          const depth = clamp3(config[grp.key], 0, 20, grp.defaultDepth);
          if (depth <= 0) continue;
          blocks.push(`
          body[data-agy-skins-parallax="true"] ${grp.selector} {
            transform: translate3d(
              calc(var(--agy-px, 0) * ${(-depth).toFixed(2)}px),
              calc(var(--agy-py, 0) * ${(-depth).toFixed(2)}px),
              0
            );
            will-change: transform;
          }
        `);
        }
      }
      if (config.parallaxPlugin) {
        const slots = discoverExtensionSlots();
        for (const slot of slots) {
          const rawDepth = config.parallaxPluginDepths?.[slot];
          const depth = clamp3(rawDepth, 0, 20, 4);
          if (depth <= 0) continue;
          const safeSlot = slot.replace(/["\\]/g, "");
          blocks.push(`
          body[data-agy-skins-parallax="true"] [data-slot="${safeSlot}"] {
            transform: translate3d(
              calc(var(--agy-px, 0) * ${(-depth).toFixed(2)}px),
              calc(var(--agy-py, 0) * ${(-depth).toFixed(2)}px),
              0
            );
          }
        `);
        }
      }
      this.styleEl.textContent = blocks.join("\n");
    }
    handleMove(e) {
      if (!this.active || typeof window === "undefined") return;
      const w = Math.max(1, window.innerWidth);
      const h = Math.max(1, window.innerHeight);
      this.targetX = (e.clientX / w - 0.5) * 2;
      this.targetY = (e.clientY / h - 0.5) * 2;
      this.scheduleTick();
    }
    scheduleTick() {
      if (this.raf !== null || !this.active || typeof window === "undefined") return;
      const step = () => {
        this.raf = null;
        if (!this.active || !document.body) return;
        const smooth = clamp3(this.config?.parallaxSmooth, 1, 100, 35);
        const alpha = 0.04 + (100 - smooth) * 22e-4;
        this.curX += (this.targetX - this.curX) * alpha;
        this.curY += (this.targetY - this.curY) * alpha;
        document.body.style.setProperty("--agy-px", this.curX.toFixed(4));
        document.body.style.setProperty("--agy-py", this.curY.toFixed(4));
        if (Math.abs(this.targetX - this.curX) > 2e-3 || Math.abs(this.targetY - this.curY) > 2e-3) {
          this.raf = window.requestAnimationFrame(step);
        }
      };
      this.raf = window.requestAnimationFrame(step);
    }
    update(config = {}) {
      this.config = config;
      if (typeof document === "undefined" || !document.body) return;
      const enabled = config.parallaxEnabled === true && config.wallpaperEnabled === true;
      if (!enabled) {
        this.active = false;
        if (this.raf !== null && typeof window !== "undefined") window.cancelAnimationFrame(this.raf);
        this.raf = null;
        document.body.removeAttribute("data-agy-skins-parallax");
        document.body.style.removeProperty("--agy-px");
        document.body.style.removeProperty("--agy-py");
        this.styleEl?.remove();
        this.styleEl = null;
        if (typeof window !== "undefined") {
          window.removeEventListener("pointermove", this.onPointerMove, { capture: true });
          window.removeEventListener("pointerleave", this.onPointerLeave);
        }
        return;
      }
      document.body.setAttribute("data-agy-skins-parallax", "true");
      this.ensureStyle(config);
      if (!this.active && typeof window !== "undefined") {
        this.active = true;
        window.addEventListener("pointermove", this.onPointerMove, { passive: true, capture: true });
        window.addEventListener("pointerleave", this.onPointerLeave);
      }
    }
    destroy() {
      this.update({ parallaxEnabled: false, wallpaperEnabled: false });
    }
  };

  // src/engine/theme-follow-controller.js
  var FOLLOW_STYLE_ID = "agy-skins-theme-follow-css";
  function rgbToHex(r, g, b) {
    return `#${[r, g, b].map((v) => Math.min(255, Math.max(0, Math.round(v))).toString(16).padStart(2, "0")).join("")}`;
  }
  function relativeLuminance(r, g, b) {
    const linear = [r, g, b].map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  }
  function ensureLegibleAccent([r, g, b], isDark) {
    let cr = r, cg = g, cb = b;
    for (let i = 0; i < 8; i++) {
      const lum = relativeLuminance(cr, cg, cb);
      if (isDark && lum >= 0.24) break;
      if (!isDark && lum <= 0.34) break;
      if (isDark) {
        cr = cr + (255 - cr) * 0.2;
        cg = cg + (255 - cg) * 0.2;
        cb = cb + (255 - cb) * 0.2;
      } else {
        cr *= 0.82;
        cg *= 0.82;
        cb *= 0.82;
      }
    }
    return rgbToHex(cr, cg, cb);
  }
  function extractDominantColorFromPixels(data, isDark = true) {
    let bestScore = -1;
    let bestRgb = null;
    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3];
      if (a < 180) continue;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const sat = max === 0 ? 0 : (max - min) / max;
      const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      if (luma < 0.08 || luma > 0.94) continue;
      const score = sat * 1.8 + (1 - Math.abs(luma - 0.52)) * 0.4;
      if (score > bestScore) {
        bestScore = score;
        bestRgb = [r, g, b];
      }
    }
    return bestRgb ? ensureLegibleAccent(bestRgb, isDark) : null;
  }
  var ThemeFollowController = class {
    constructor() {
      this.styleEl = null;
      this.lastSrc = null;
      this.lastIsDark = null;
      this.requestId = 0;
    }
    applyAccentCss(accent) {
      if (typeof document === "undefined" || !document.body) return;
      if (!accent) {
        document.body.removeAttribute("data-agy-skins-theme-follow");
        this.styleEl?.remove();
        this.styleEl = null;
        return;
      }
      if (!this.styleEl || !this.styleEl.isConnected) {
        this.styleEl = document.getElementById(FOLLOW_STYLE_ID) || document.createElement("style");
        this.styleEl.id = FOLLOW_STYLE_ID;
        this.styleEl.dataset.plugin = "agy-skins";
        if (!this.styleEl.isConnected) document.head.appendChild(this.styleEl);
      }
      document.body.setAttribute("data-agy-skins-theme-follow", "true");
      this.styleEl.textContent = `
      body[data-agy-skins-theme-follow="true"] {
        --we-accent: ${accent};
        --primary: ${accent};
        --cta: ${accent};
        --nux-focus-ring: color-mix(in srgb, ${accent} 55%, transparent);
      }
    `;
    }
    async sampleUrl(url, isDark) {
      const id = ++this.requestId;
      if (typeof Image === "undefined" || typeof document === "undefined") return;
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = url;
        });
        if (id !== this.requestId) return;
        const canvas = document.createElement("canvas");
        canvas.width = 48;
        canvas.height = 27;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, 48, 27);
        const data = ctx.getImageData(0, 0, 48, 27).data;
        const hex = extractDominantColorFromPixels(data, isDark);
        if (id === this.requestId) this.applyAccentCss(hex);
      } catch {
        if (id === this.requestId) this.applyAccentCss(null);
      }
    }
    update({ enabled, previewUrl, isDark = true } = {}) {
      if (!enabled || !previewUrl) {
        this.lastSrc = null;
        this.applyAccentCss(null);
        return;
      }
      if (this.lastSrc === previewUrl && this.lastIsDark === isDark && this.styleEl?.isConnected) return;
      this.lastSrc = previewUrl;
      this.lastIsDark = isDark;
      void this.sampleUrl(previewUrl, isDark);
    }
    destroy() {
      this.requestId++;
      this.applyAccentCss(null);
    }
  };

  // src/engine/theme-watcher.js
  function detectIsDark(doc = typeof document !== "undefined" ? document : null) {
    if (!doc || !doc.body || !doc.documentElement) return true;
    if (doc.body.classList.contains("theme-light")) return false;
    if (doc.body.classList.contains("dark")) return true;
    try {
      const scheme = getComputedStyle(doc.documentElement).colorScheme;
      if (scheme === "light") return false;
      if (scheme === "dark") return true;
    } catch {
    }
    return true;
  }
  var ThemeWatcher = class {
    constructor(onThemeChange) {
      this.onThemeChange = onThemeChange;
      this.bodyObserver = null;
      this.rootObserver = null;
      this.timer = null;
    }
    start() {
      if (typeof document === "undefined" || typeof MutationObserver !== "function" || this.bodyObserver) return;
      const notify = () => {
        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.timer = null;
          this.onThemeChange?.(detectIsDark(document));
        }, 40);
      };
      this.bodyObserver = new MutationObserver(notify);
      this.bodyObserver.observe(document.body, { attributes: true, attributeFilter: ["class", "data-agy-theme"] });
      this.rootObserver = new MutationObserver(notify);
      this.rootObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["style", "class"] });
    }
    destroy() {
      if (this.timer) clearTimeout(this.timer);
      this.timer = null;
      this.bodyObserver?.disconnect();
      this.rootObserver?.disconnect();
      this.bodyObserver = null;
      this.rootObserver = null;
    }
  };

  // src/engine/titlebar-controller.js
  var TitlebarController = class {
    constructor() {
      this.lastKey = null;
    }
    update({ enabled, isDark = true } = {}) {
      if (typeof window === "undefined" || !window.electronNative?.setTitleBarOverlay) return;
      const key = `${Boolean(enabled)}:${Boolean(isDark)}`;
      if (key === this.lastKey) return;
      this.lastKey = key;
      try {
        const symbolColor = isDark ? "#f1f5f9" : "#0f172a";
        const color = enabled ? "#00000000" : void 0;
        window.electronNative.setTitleBarOverlay(
          enabled ? { color: "#00000000", symbolColor } : { symbolColor }
        );
        void color;
      } catch {
      }
    }
    destroy() {
      this.update({ enabled: false, isDark: true });
    }
  };

  // src/engine/host-entries.js
  var ENTRY_ID = "agy-skins-appearance-entry";
  var MODAL_ID = "agy-skins-studio-dialog";
  var HostEntries = class {
    constructor() {
      this.studioUrl = "";
      this.shortcutEnabled = true;
      this.lang = "en";
      this.observer = null;
      this.onKeyDown = (e) => {
        if (!this.shortcutEnabled) return;
        if (e.altKey && e.shiftKey && !e.ctrlKey && !e.metaKey && String(e.key || "").toLowerCase() === "w") {
          e.preventDefault();
          e.stopPropagation();
          this.toggleModal();
        } else if (e.key === "Escape" && document.getElementById(MODAL_ID)) {
          e.preventDefault();
          this.closeModal();
        }
      };
    }
    start() {
      if (typeof document === "undefined" || !document.body) return;
      if (!this.observer && typeof MutationObserver === "function") {
        this.observer = new MutationObserver(() => this.syncSettingsEntry());
        this.observer.observe(document.body, { childList: true, subtree: true });
      }
      window.addEventListener("keydown", this.onKeyDown, { capture: true });
      this.syncSettingsEntry();
    }
    update({ studioUrl, shortcutEnabled = true, lang = "en" } = {}) {
      if (studioUrl) this.studioUrl = studioUrl;
      this.shortcutEnabled = shortcutEnabled !== false;
      this.lang = lang || "en";
      this.syncSettingsEntry();
      const frame = document.querySelector(`#${MODAL_ID} iframe`);
      if (frame && this.studioUrl && frame.src !== this.studioUrl) {
        frame.src = this.studioUrl;
      }
    }
    syncSettingsEntry() {
      if (typeof document === "undefined") return;
      const container = document.querySelector(".settings-modal-container");
      if (!container) return;
      if (container.querySelector(`#${ENTRY_ID}`)) return;
      const headings = [...container.querySelectorAll("h2, h3")];
      const targetHeading = headings.find((h) => {
        const t = (h.textContent || "").trim().toLowerCase();
        return t === "appearance" || t === "外观";
      });
      if (!targetHeading) return;
      const section = targetHeading.closest("section") || targetHeading.parentElement;
      if (!section) return;
      const isZh = String(this.lang).toLowerCase().startsWith("zh");
      const card = document.createElement("div");
      card.id = ENTRY_ID;
      card.style.cssText = [
        "margin: 12px 0;",
        "padding: 12px 14px;",
        "border-radius: 10px;",
        "border: 1px solid var(--border, rgba(255,255,255,0.14));",
        "background: var(--card, rgba(255,255,255,0.04));",
        "display: flex;",
        "align-items: center;",
        "justify-content: space-between;",
        "gap: 12px;"
      ].join("");
      const info = document.createElement("div");
      info.innerHTML = `
      <div style="font-weight:600;font-size:13px;color:var(--foreground,inherit);">
        ${isZh ? "Wallpaper Engine 皮肤工作台" : "Wallpaper Engine Studio"}
      </div>
      <div style="font-size:12px;opacity:0.75;margin-top:2px;">
        ${isZh ? "管理动态壁纸、液态玻璃、字体系统与特效 (Alt+Shift+W)" : "Live wallpapers, liquid glass, typography & FX (Alt+Shift+W)"}
      </div>
    `;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = isZh ? "打开工作台" : "Open Studio";
      btn.style.cssText = [
        "padding: 6px 14px;",
        "border-radius: 8px;",
        "border: 1px solid rgba(255,255,255,0.18);",
        "background: var(--primary, #4f8cff);",
        "color: #ffffff;",
        "font-size: 12px;",
        "font-weight: 600;",
        "cursor: pointer;",
        "white-space: nowrap;"
      ].join("");
      btn.addEventListener("click", () => this.openModal());
      card.append(info, btn);
      section.appendChild(card);
    }
    toggleModal() {
      if (document.getElementById(MODAL_ID)) this.closeModal();
      else this.openModal();
    }
    openModal() {
      if (typeof document === "undefined" || !document.body || !this.studioUrl) return;
      if (document.getElementById(MODAL_ID)) return;
      const overlay = document.createElement("div");
      overlay.id = MODAL_ID;
      overlay.setAttribute("role", "dialog");
      overlay.setAttribute("aria-modal", "true");
      overlay.style.cssText = [
        "position:fixed;inset:0;z-index:2147483500;",
        "background:rgba(6, 10, 18, 0.56);",
        "backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);",
        "display:flex;align-items:center;justify-content:center;padding:24px;"
      ].join("");
      const frameWrap = document.createElement("div");
      frameWrap.style.cssText = [
        "width:min(1040px, 94vw);height:min(760px, 90vh);",
        "border-radius:16px;overflow:hidden;",
        "border:1px solid rgba(255,255,255,0.18);",
        "box-shadow:0 28px 80px rgba(0,0,0,0.48);",
        "background:var(--background, #0f141e);",
        "display:flex;flex-direction:column;position:relative;"
      ].join("");
      const closeBtn = document.createElement("button");
      closeBtn.type = "button";
      closeBtn.textContent = "×";
      closeBtn.title = "Close (Esc)";
      closeBtn.style.cssText = [
        "position:absolute;top:10px;right:12px;z-index:2;",
        "width:28px;height:28px;border-radius:8px;",
        "border:1px solid rgba(255,255,255,0.16);",
        "background:rgba(15,20,30,0.65);color:#f8fafc;",
        "font-size:18px;line-height:1;cursor:pointer;"
      ].join("");
      closeBtn.addEventListener("click", () => this.closeModal());
      const iframe = document.createElement("iframe");
      iframe.src = this.studioUrl;
      iframe.style.cssText = "width:100%;height:100%;border:0;display:block;background:transparent;";
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) this.closeModal();
      });
      frameWrap.append(closeBtn, iframe);
      overlay.appendChild(frameWrap);
      document.body.appendChild(overlay);
    }
    closeModal() {
      document.getElementById(MODAL_ID)?.remove();
    }
    destroy() {
      this.observer?.disconnect();
      this.observer = null;
      if (typeof window !== "undefined") window.removeEventListener("keydown", this.onKeyDown, { capture: true });
      document.getElementById(ENTRY_ID)?.remove();
      this.closeModal();
    }
  };

  // src/engine/runtime-entry.js
  var OWNER = typeof __AGY_SKINS_OWNER__ === "number" ? __AGY_SKINS_OWNER__ : Date.now();
  var HASH = typeof __AGY_SKINS_HASH__ === "string" ? __AGY_SKINS_HASH__ : "dev";
  function teardownLegacyThemes() {
    try {
      globalThis.__AGY_MODAL_OBSERVER__?.disconnect?.();
      globalThis.__AGY_MODAL_OBSERVER__ = null;
      globalThis.__AGY_SHELL_RO__?.disconnect?.();
      globalThis.__AGY_SHELL_RO__ = null;
      globalThis.__AGY_SCROLL_AC__?.abort?.();
      if (globalThis.__AGY_TICK_TIMER__) {
        clearTimeout(globalThis.__AGY_TICK_TIMER__);
        globalThis.__AGY_TICK_TIMER__ = 0;
      }
      if (globalThis.__AGY_TICK_RAF__) {
        cancelAnimationFrame(globalThis.__AGY_TICK_RAF__);
        globalThis.__AGY_TICK_RAF__ = 0;
      }
      globalThis.__AGY_SCENE_ENGINE__?.pause?.();
      globalThis.__AGY_SCENE_ENGINE__ = null;
      globalThis.__ANTIGRAVITY_REMOVE_CUSTOM_THEME__?.();
    } catch {
    }
    if (typeof document !== "undefined") {
      const liveLayer = document.getElementById("agy-live-wp-layer");
      const oldVid = liveLayer?.querySelector?.("video");
      if (oldVid) {
        try {
          oldVid.pause();
          oldVid.removeAttribute("src");
          oldVid.load();
        } catch {
        }
      }
      for (const legacyId of [
        "antigravity-custom-theme-active",
        "agy-live-wp-layer",
        "agy-live-wp-video",
        "agy-live-wp-scrim",
        "agy-custom-theme-sidebar-btn",
        "agy-custom-theme-settings-btn",
        "agy-custom-theme-modal-backdrop",
        "agy-wallpaper-backdrop"
      ]) {
        document.getElementById(legacyId)?.remove();
      }
      const shell = document.querySelector(".agy-shell");
      if (shell) {
        delete shell.dataset?.agyHoleActive;
        shell.style?.removeProperty?.("--agy-hole-clip");
        shell.style?.removeProperty?.("--agy-l-glass-bg");
        shell.style?.removeProperty?.("--agy-static-wp");
      }
    }
  }
  function createRuntime() {
    if (globalThis.__agySkinsRuntime && typeof globalThis.__agySkinsRuntime.owner === "number" && globalThis.__agySkinsRuntime.owner > OWNER) {
      return "superseded";
    }
    try {
      globalThis.__agySkinsRuntime?.dispose?.();
    } catch {
    }
    teardownLegacyThemes();
    let lastPayload = null;
    let currentIsDark = detectIsDark();
    const glass = new GlassController();
    const fonts = new FontController();
    const fx = new FxOverlay();
    const parallax = new ParallaxController();
    const themeFollow = new ThemeFollowController();
    const titlebar = new TitlebarController();
    const hostEntries = new HostEntries();
    const backdrop = new BackdropManager({
      onVideoEnd: () => {
        const origin = lastPayload?.runtimeOrigin;
        const token = lastPayload?.runtimeToken;
        if (!origin || !token) return;
        void fetch(`${origin}/runtime-event`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-agy-runtime-token": token
          },
          body: JSON.stringify({ type: "videoEnd" })
        }).catch(() => {
        });
      }
    });
    const applyAll = (payload) => {
      if (!payload || typeof payload !== "object") return;
      lastPayload = payload;
      const cfg = payload.config || {};
      const res = payload.resolved || {};
      const isDark = detectIsDark();
      currentIsDark = isDark;
      const active = cfg.wallpaperEnabled === true && Boolean(res.resolvedSrc);
      backdrop.setMediaSnapshot(payload.nowPlaying || null);
      backdrop.update({
        enabled: active,
        type: cfg.wallpaperType,
        src: res.resolvedSrc,
        scenePayload: res.scenePayload,
        webPreview: res.previewUrl,
        blur: cfg.wallpaperBlur,
        occlusion: cfg.maskOcclusion,
        isDark,
        mode: cfg.wallpaperMode,
        fit: cfg.wallpaperFit,
        opacity: cfg.wallpaperOpacity,
        pauseOnHidden: cfg.pauseOnHidden,
        pauseOnBlur: cfg.pauseOnBlur,
        pauseOnBattery: cfg.pauseOnBattery,
        sound: cfg.wallpaperSound,
        volume: cfg.wallpaperVolume,
        playbackRate: cfg.videoPlaybackRate,
        sceneLive: cfg.sceneLive,
        sceneLiveFps: cfg.sceneLiveFps,
        sceneAutoQuality: cfg.sceneAutoQuality,
        sceneRenderDpr: cfg.sceneRenderDpr,
        sceneVideoTexScale: cfg.sceneVideoTexScale,
        liveBootDelay: cfg.liveBootDelay,
        slides: res.slides,
        slideIntervalMs: cfg.weSelection?.slideIntervalMs,
        transition: cfg.wallpaperTransition,
        transitionDir: cfg.wallpaperTransitionDir,
        transitionSpeed: cfg.wallpaperTransitionSpeed,
        brightness: cfg.backgroundBrightness,
        contrast: cfg.backgroundContrast,
        saturate: cfg.backgroundSaturate,
        flip: cfg.wallpaperFlip,
        layerPositionX: cfg.layerPositionX,
        layerPositionY: cfg.layerPositionY,
        layerScale: cfg.layerScale,
        userProps: cfg.userProps,
        browserHoleCutout: cfg.browserHoleCutout
      });
      glass.update({
        enabled: active,
        glassTransparency: cfg.panelGlass,
        bubbleOpacity: cfg.bubbleOpacity,
        composerFrost: cfg.composerFrost,
        surfaceFrost: cfg.surfaceFrost,
        saturation: cfg.glassSaturation,
        border: cfg.glassBorder,
        highlight: cfg.glassHighlight,
        accent: cfg.accent,
        glassColor: cfg.glassColor,
        glassDarkSeparate: cfg.glassDarkSeparate,
        glassFidelity: cfg.glassFidelity,
        chatGlassFidelity: cfg.chatGlassFidelity,
        settingsWindowTransparency: cfg.settingsWindowTransparency,
        settingsWindowBlur: cfg.settingsWindowBlur,
        sidebarGlass: cfg.sidebarGlass,
        sidebarFollowGlobal: cfg.sidebarFollowGlobal,
        sidebarBlur: cfg.sidebarBlur,
        sidebarAlpha: cfg.sidebarAlpha,
        sidebarColor: cfg.sidebarColor,
        leftSidebarGlass: cfg.leftSidebarGlass,
        leftSidebarCornerRadius: cfg.leftSidebarCornerRadius,
        leftSidebarSquareTL: cfg.leftSidebarSquareTL,
        leftSidebarSquareTR: cfg.leftSidebarSquareTR,
        leftSidebarSquareBR: cfg.leftSidebarSquareBR,
        leftSidebarSquareBL: cfg.leftSidebarSquareBL,
        rightSidebarCornerRadius: cfg.rightSidebarCornerRadius,
        rightSidebarSquareTL: cfg.rightSidebarSquareTL,
        rightSidebarSquareTR: cfg.rightSidebarSquareTR,
        rightSidebarSquareBR: cfg.rightSidebarSquareBR,
        rightSidebarSquareBL: cfg.rightSidebarSquareBL,
        titlebarGlass: cfg.titlebarGlass,
        isDark
      });
      fonts.update(cfg);
      fx.update(cfg);
      parallax.update({ ...cfg, wallpaperEnabled: active });
      themeFollow.update({
        enabled: active && cfg.themeFollow === true,
        previewUrl: res.previewUrl,
        isDark
      });
      titlebar.update({ enabled: active, isDark });
      hostEntries.update({
        studioUrl: payload.studioUrl,
        shortcutEnabled: cfg.studioShortcut !== false,
        lang: cfg.uiLanguage === "auto" ? typeof navigator !== "undefined" ? navigator.language : "en" : cfg.uiLanguage
      });
    };
    const watcher = new ThemeWatcher((isDark) => {
      if (isDark === currentIsDark) return;
      currentIsDark = isDark;
      if (lastPayload) applyAll(lastPayload);
    });
    watcher.start();
    hostEntries.start();
    const api = {
      owner: OWNER,
      hash: HASH,
      readState(callerOwner) {
        if (typeof callerOwner === "number" && callerOwner < OWNER) return "superseded";
        return { ok: true, owner: OWNER, hash: HASH, active: Boolean(lastPayload) };
      },
      apply(payload, callerOwner) {
        if (typeof callerOwner === "number" && callerOwner < OWNER) return "superseded";
        applyAll(payload);
        return { ok: true, owner: OWNER };
      },
      dispose() {
        watcher.destroy();
        hostEntries.destroy();
        titlebar.destroy();
        themeFollow.destroy();
        parallax.destroy();
        fx.destroy();
        fonts.destroy();
        glass.destroy();
        backdrop.destroy();
        if (globalThis.__agySkinsRuntime === api) {
          delete globalThis.__agySkinsRuntime;
        }
      }
    };
    globalThis.__agySkinsRuntime = api;
    return api;
  }
  createRuntime();
})();
