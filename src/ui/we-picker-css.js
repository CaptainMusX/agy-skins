/**
 * Unified `dsh-wallpaper-engine` (`we-picker`) component stylesheet.
 * Safe for both native in-host DOM injection inside Antigravity Settings (`#agy-skins-picker-css`)
 * and standalone Aux Sidecar Pane (`dist/panel.css`).
 */

export const WE_PICKER_CSS = `
.we-picker {
  --we-accent: var(--we-accent-src, #4f8cff);
  --we-accent-ink: var(--we-accent-ink, #ffffff);
  --we-ui-h: 34px;
  --we-ui-radius: 8px;
  --we-ink: var(--foreground, #0f172a);
  --we-ink-2: var(--secondary-foreground, rgba(100, 110, 125, 0.92));
  --we-ink-3: var(--muted-foreground, rgba(120, 128, 140, 0.72));
  --we-border-line: rgba(var(--we-border-rgb, 140, 148, 160), var(--we-border-alpha, 0.28));
  --we-hover-bg: var(--we-inner-2, rgba(128, 128, 128, 0.10));
  --we-ease: cubic-bezier(0.16, 1, 0.3, 1);
  --we-dur-fast: 120ms;
  --we-dur: 200ms;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
  contain: layout style;
  color: var(--we-ink);
  font-size: 15.5px;
  line-height: 1.5;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
}
.we-picker__body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}
.we-picker[data-we-embed="aux"] {
  font-size: 14px;
  line-height: 1.45;
  gap: 12px;
  --we-ui-h: 32px;
}
.we-picker *, .we-picker *::before, .we-picker *::after {
  box-sizing: border-box;
}

/* Header Card */
.we-picker__card-shell { display: block; }
.we-picker__card-head {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 10px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--we-border-line);
}
.we-picker__card-name {
  font-size: 22px;
  font-weight: 500;
  line-height: 30px;
  color: var(--we-ink);
  white-space: nowrap;
}
.we-picker__head-badge {
  position: static;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--we-ink-2);
  padding: 2px 9px;
  border-radius: 999px;
  background: var(--we-inner-2, rgba(128, 128, 128, 0.10));
  border: 1px solid var(--we-border-line);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.we-picker__card-desc {
  margin-left: auto;
  font-size: 14px;
  color: var(--we-ink-3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Sliding Segmented Tabs (.we-tabs + .we-tabs__pill) */
.we-tabs {
  position: relative;
  display: flex;
  flex: 0 0 auto;
  padding: 3px;
  border-radius: 10px;
  background: var(--we-inner-1, rgba(128, 128, 128, 0.06));
  border: 1px solid var(--we-border-line);
  overflow: hidden;
}
.we-tabs__pill {
  position: absolute;
  top: 3px;
  left: 3px;
  bottom: 3px;
  border-radius: 8px;
  background: var(--we-inner-3, rgba(255, 255, 255, 0.24));
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.22);
  transition: transform 220ms var(--we-ease), width 220ms var(--we-ease);
  will-change: transform, width;
  pointer-events: none;
}
.we-tabs__tab {
  position: relative;
  z-index: 1;
  flex: 1 1 0;
  min-width: 0;
  height: 34px;
  padding: 0 6px;
  border: 0;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
  font: inherit;
  font-size: 14px;
  line-height: 1;
  color: var(--we-ink-2);
  transition: color var(--we-dur-fast) var(--we-ease), transform var(--we-dur-fast) var(--we-ease);
}
.we-tabs__tab:hover { color: var(--we-ink); }
.we-tabs__tab--active { color: var(--we-ink); font-weight: 600; }
.we-tabs__tab:active, .we-picker__btn:active, .we-picker__rate:active { transform: scale(0.96); }

.we-tabpanel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  animation: we-tab-in 180ms var(--we-ease);
}
@keyframes we-tab-in {
  from { opacity: 0; transform: translateY(4px); }
}

/* Sections & Collapsible Headers */
.we-picker__section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.we-picker__section + .we-picker__section {
  border-top: 1px solid var(--we-border-line);
  padding-top: 12px;
}
.we-picker__section-head {
  display: flex;
  align-items: center;
  gap: 8px;
}
.we-picker__section-head--toggle {
  cursor: pointer;
  user-select: none;
  border-radius: 6px;
  padding: 2px 4px;
  transition: background-color 0.15s ease;
}
.we-picker__section-head--toggle:hover {
  background: var(--we-hover-bg);
}
.we-picker__section-label {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: var(--we-ink);
}
.we-picker__section-caret {
  margin-left: auto;
  font-size: 0.78em;
  color: var(--we-ink-2);
  transition: transform 0.15s ease;
}
.we-picker__section-caret.is-open {
  transform: rotate(180deg);
}

/* Module-level Reset Button (↺) */
.we-mod-reset {
  margin-left: auto;
  flex: 0 0 auto;
  width: 24px;
  height: 24px;
  padding: 0;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1em;
  cursor: pointer;
  border-radius: 999px;
  border: 1px solid var(--we-border-line);
  background: transparent;
  color: var(--we-ink-2);
  transition: color var(--we-dur-fast) ease, border-color var(--we-dur-fast) ease, background-color var(--we-dur-fast) ease;
}
.we-picker__section-caret + .we-mod-reset {
  margin-left: 8px;
}
.we-mod-reset:hover {
  color: var(--we-ink);
  background: var(--we-hover-bg);
}

/* Current Wallpaper Card & Spinning Vinyl Record */
.we-picker__current {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid var(--we-border-line);
  background: var(--we-inner-1, rgba(128, 128, 128, 0.06));
}
.we-vinyl {
  position: relative;
  width: 82px;
  height: 82px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: repeating-radial-gradient(circle at center, #191920 0 2px, #242530 2px 4px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.42), inset 0 0 0 1px rgba(255, 255, 255, 0.08);
  will-change: transform;
  transform: translateZ(0);
  contain: layout paint;
  animation: we-vinyl-spin 8s linear infinite;
  animation-play-state: paused;
}
.we-vinyl--playing { animation-play-state: running; }
.we-vinyl--sm { width: 44px; height: 44px; }
.we-vinyl__cover {
  position: absolute;
  inset: 22%;
  border-radius: 50%;
  overflow: hidden;
  background: rgba(128, 128, 128, 0.25);
  border: 2px solid rgba(0, 0, 0, 0.85);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1), inset 0 0 8px rgba(0, 0, 0, 0.6);
}
.we-vinyl__cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.we-vinyl__empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.55);
  font-size: 1.15em;
}
.we-vinyl__hole {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 10px;
  height: 10px;
  margin: -5px 0 0 -5px;
  border-radius: 50%;
  background: #0b0b0e;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.9);
}
.we-vinyl--sm .we-vinyl__hole {
  width: 6px;
  height: 6px;
  margin: -3px 0 0 -3px;
}
@keyframes we-vinyl-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.we-picker__current-info {
  flex: 1;
  min-width: 0;
}
.we-picker__current-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--we-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.we-picker__current-meta {
  display: block;
  font-size: 13.5px;
  color: var(--we-ink-2);
  margin-top: 2px;
}
.we-picker__current-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
}
.we-picker__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

/* Uniform Setting Row (40px spacious touch height) */
.we-picker__ctl {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 40px;
}
.we-picker__ctl--wrap { flex-wrap: wrap; row-gap: 8px; }
.we-picker__ctl--disabled { opacity: 0.45; pointer-events: none; }
.we-picker__ctl-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1 1 auto;
}
.we-picker__ctl-label {
  font-size: 15.5px;
  font-weight: 400;
  color: var(--we-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.we-picker__ctl-hint {
  font-size: 13.5px;
  line-height: 1.45;
  color: var(--we-ink-3);
  overflow-wrap: anywhere;
  max-width: 100%;
}
.we-picker__ctl-side {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
}

/* Buttons & Selects */
.we-picker__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  height: var(--we-ui-h);
  padding: 0 14px;
  border: 1px solid var(--we-border-line);
  border-radius: var(--we-ui-radius);
  background: transparent;
  color: var(--we-ink);
  font: inherit;
  font-size: 14px;
  line-height: 1;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color var(--we-dur-fast) var(--we-ease), border-color var(--we-dur-fast) var(--we-ease), color var(--we-dur-fast) var(--we-ease), transform var(--we-dur-fast) var(--we-ease);
}
.we-picker__btn:hover:not(:disabled) {
  background: var(--we-inner-2, rgba(128, 128, 128, 0.10));
}
.we-picker__btn:disabled { opacity: 0.45; cursor: default; }
.we-picker__btn.is-on {
  border-color: var(--we-accent);
  color: var(--we-accent);
}
.we-picker__btn--primary {
  color: var(--we-accent-ink, #ffffff);
  background: var(--we-accent, #4f8cff);
  border-color: transparent;
  font-weight: 600;
}
.we-picker__btn--primary:hover:not(:disabled) {
  background: color-mix(in srgb, var(--we-accent, #4f8cff) 86%, var(--we-accent-ink, #000000));
  color: var(--we-accent-ink, #ffffff);
}
.we-picker__btn--danger {
  border-color: color-mix(in srgb, #e5534b 55%, transparent);
  color: #e5534b;
}
.we-picker__btn--mini { padding: 0 8px; height: 24px; font-size: 0.76em; }
.we-picker__chip {
  height: 24px;
  padding: 0 9px;
  border-radius: 999px;
  border: 1px solid var(--we-border-line);
  background: transparent;
  color: var(--we-ink-2);
  font: inherit;
  font-size: 0.76em;
  cursor: pointer;
}
.we-picker__chip:hover { color: var(--we-ink); background: var(--we-hover-bg); }

.we-picker__select, .we-picker select {
  appearance: none;
  -webkit-appearance: none;
  height: var(--we-ui-h);
  padding: 0 26px 0 10px;
  border: 1px solid var(--we-border-line);
  border-radius: var(--we-ui-radius);
  background-color: transparent;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='5'%3E%3Cpath d='M1 1l3 3 3-3' fill='none' stroke='%23888' stroke-width='1.4' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 9px center;
  color: var(--we-ink);
  font: inherit;
  font-size: 14px;
  cursor: pointer;
  max-width: 100%;
}
.we-picker__select option, .we-picker select option,
.we-picker__select optgroup, .we-picker select optgroup {
  background-color: var(--we-readability-base, #1e2028);
  color: var(--we-ink, #ffffff);
}

.we-picker__text {
  height: var(--we-ui-h);
  padding: 0 10px;
  border: 1px solid var(--we-border-line);
  border-radius: var(--we-ui-radius);
  background: transparent;
  color: var(--we-ink);
  font: inherit;
  font-size: 14px;
  flex: 1;
  min-width: 0;
}
.we-picker__text:focus { outline: none; border-color: var(--we-accent); }
.we-picker__search { flex: 1 1 160px; min-width: 120px; }

/* Segmented Buttons */
.we-picker__seg {
  display: inline-grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  gap: 6px;
  flex: 0 1 auto;
  max-width: 100%;
}
.we-picker__ctl--wrap > .we-picker__seg { margin-left: auto; }
.we-picker__seg--corners-eq { grid-auto-columns: minmax(max-content, 1fr); }
.we-picker__seg--chips { display: flex; flex-wrap: wrap; justify-content: flex-start; gap: 6px; }
.we-picker__rate {
  min-width: 58px;
  height: var(--we-ui-h);
  padding: 0 12px;
  font-size: 13.5px;
  color: var(--we-ink-2);
}
.we-picker__rate--active {
  background: var(--we-accent) !important;
  border-color: var(--we-accent) !important;
  color: var(--we-accent-ink, #ffffff) !important;
  font-weight: 600;
}

/* Capsule Toggle Switch */
.we-picker__switch {
  position: relative;
  display: inline-flex;
  cursor: pointer;
  flex: none;
}
.we-picker__switch input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}
.we-picker__switch-track {
  position: relative;
  width: 40px;
  height: 22px;
  border-radius: 999px;
  background: var(--we-inner-3, rgba(128, 128, 128, 0.28));
  border: 1px solid var(--we-border-line);
  transition: background-color 180ms var(--we-ease), border-color 180ms var(--we-ease);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.14);
}
.we-picker__switch input:checked + .we-picker__switch-track {
  background: var(--we-accent);
  border-color: transparent;
}
.we-picker__switch-thumb {
  position: absolute;
  left: 2px;
  top: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
  transition: transform 180ms var(--we-ease);
}
.we-picker__switch input:checked + .we-picker__switch-track .we-picker__switch-thumb {
  transform: translateX(18px);
}

/* Range Sliders */
.we-picker__slider-row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 36px;
}
.we-picker__label {
  min-width: 118px;
  max-width: 220px;
  flex: 0 0 auto;
  color: var(--we-ink);
  font-size: 15.5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  user-select: none;
}
.we-picker__slider {
  -webkit-appearance: none;
  appearance: none;
  flex: 1;
  min-width: 0;
  height: 18px;
  background: transparent;
  cursor: pointer;
}
.we-picker__slider::-webkit-slider-runnable-track {
  height: 4px;
  border-radius: 2px;
  background: linear-gradient(to right,
    var(--we-accent) var(--we-fill, 0%),
    rgba(128, 128, 128, 0.34) var(--we-fill, 0%));
}
.we-picker__slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  margin-top: -6px;
  border-radius: 50%;
  background: #ffffff;
  border: 2px solid var(--we-accent);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  transition: transform var(--we-dur-fast) var(--we-ease);
}
.we-picker__slider:hover::-webkit-slider-thumb { transform: scale(1.12); }
.we-picker__value {
  min-width: 60px;
  text-align: right;
  flex: 0 0 auto;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  background: var(--we-inner-2, rgba(128, 128, 128, 0.10));
  color: var(--we-ink-2);
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 2px;
}
.we-picker__value-input {
  width: 3.4em;
  min-width: 0;
  padding: 0;
  border: 0;
  background: transparent;
  text-align: right;
  color: inherit;
  font: inherit;
}
.we-picker__value-input:focus { outline: none; }

/* Circular Color Swatches */
.we-picker__swatches {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1 0 100%;
}
.we-picker__swatch {
  width: 26px;
  height: 26px;
  padding: 0;
  border-radius: 50%;
  border: 0;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.5), 0 1px 3px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: transform var(--we-dur-fast) var(--we-ease), box-shadow var(--we-dur-fast) var(--we-ease);
}
.we-picker__swatch:hover { transform: scale(1.12); }
.we-picker__swatch--active {
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.65),
    0 0 0 2px var(--we-inner-2, rgba(128, 128, 128, 0.25)),
    0 0 0 4px var(--we-accent);
}
.we-picker__swatch--auto {
  width: auto;
  height: 26px;
  min-width: 42px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: #1f2937;
  background: linear-gradient(135deg, #d1d5db 0 50%, #f9fafb 50% 100%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.we-picker__swatch-custom {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}
.we-picker__swatch-custom input[type="color"] {
  width: 26px;
  height: 26px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
}
.we-picker__swatch-custom input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
.we-picker__swatch-custom input[type="color"]::-webkit-color-swatch {
  border: 1.5px solid rgba(255, 255, 255, 0.7);
  border-radius: 50%;
}

/* Theme Preset 4-Col Grid */
.we-picker__preset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 8px;
  padding: 10px;
  border: 1px solid var(--we-border-line);
  border-radius: 10px;
  background: var(--we-inner-1, rgba(128, 128, 128, 0.06));
}
.we-picker__preset-cell {
  display: flex;
  align-items: stretch;
  gap: 2px;
  min-width: 0;
}
.we-picker__preset-cell > .we-picker__btn {
  flex: 1;
  min-width: 0;
  justify-content: flex-start;
  overflow: hidden;
  text-overflow: ellipsis;
}
.we-picker__preset-cell--active > .we-picker__btn:first-child {
  border-color: var(--we-accent);
  background: color-mix(in srgb, var(--we-accent) 14%, transparent);
  color: var(--we-ink);
  font-weight: 600;
}
.we-picker__preset-del {
  flex: 0 0 auto;
  width: 26px;
  padding: 0;
}
.we-picker__preset-cell--empty {
  align-items: center;
  justify-content: center;
  border: 1px dashed var(--we-border-line);
  border-radius: 8px;
  min-height: 30px;
}

/* Drill-Down Wallpaper Library View (.we-picker__modal) */
.we-picker__modal {
  display: flex;
  flex-direction: column;
  gap: 10px;
  animation: we-tab-in 180ms var(--we-ease);
}
.we-picker__modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--we-border-line);
}
.we-picker__modal-head-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.we-picker__modal-title { font-weight: 600; font-size: 0.96em; }
.we-picker__modal-tabs { display: flex; gap: 6px; }
.we-picker__tab {
  flex: 1;
  height: 28px;
  border: 1px solid var(--we-border-line);
  border-radius: 7px;
  background: transparent;
  color: var(--we-ink-2);
  font: inherit;
  font-size: 0.82em;
  cursor: pointer;
}
.we-picker__tab--active {
  background: var(--we-accent);
  border-color: var(--we-accent);
  color: var(--we-accent-ink, #ffffff);
  font-weight: 600;
}
.we-picker__filter-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}
.we-picker__rating-menu { position: relative; flex: 0 1 auto; }
.we-picker__rating-btn {
  list-style: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  height: var(--we-ui-h);
  padding: 0 12px;
  border-radius: 8px;
  font-size: 13.5px;
  border: 1px solid var(--we-border-line);
  background: var(--we-inner-1, rgba(128, 128, 128, 0.06));
  color: var(--we-ink);
  white-space: nowrap;
}
.we-picker__rating-btn::-webkit-details-marker { display: none; }
.we-picker__rating-list {
  position: absolute;
  z-index: 30;
  top: calc(100% + 4px);
  right: 0;
  min-width: 196px;
  padding: 6px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  background-color: var(--we-floating-tint, var(--we-readability-base, #1e2028));
  backdrop-filter: blur(18px) saturate(160%);
  border: 1px solid var(--we-border-line);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.28);
  color: var(--we-ink);
}
.we-picker__rating-toggle {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 5px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
}
.we-picker__rating-toggle:hover { background: var(--we-hover-bg); }
.we-picker__rating-toggle input { accent-color: var(--we-accent); margin: 0; }

/* Grid: Fixed 16:9 & Classic CD-Rack */
.we-picker__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
  gap: 10px;
  padding: 2px;
  overflow-x: clip;
}
.we-picker__card {
  position: relative;
  height: 98px;
  padding: 0;
  cursor: pointer;
  display: block;
  overflow: hidden;
  border: 1px solid var(--we-border-line);
  border-radius: 8px;
  background: var(--we-inner-2, rgba(128, 128, 128, 0.10));
  transition: border-color var(--we-dur-fast) ease, box-shadow var(--we-dur-fast) ease, transform var(--we-dur-fast) ease;
}
.we-picker__card img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 280ms var(--we-ease);
}
.we-picker__modal:not([data-we-cards="classic"]) .we-picker__card:hover img {
  transform: scale(1.06);
}
.we-picker__modal[data-we-cards="classic"] .we-picker__grid {
  grid-template-columns: repeat(auto-fill, minmax(112px, 1fr));
  padding: 4px 10px 44px;
}
.we-picker__modal[data-we-cards="classic"] .we-picker__card {
  height: auto;
  aspect-ratio: 16 / 9;
  margin-bottom: -34px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
}
.we-picker__modal[data-we-cards="classic"] .we-picker__card:hover {
  transform: scale(1.12);
  z-index: 12;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.48);
}
.we-picker__card--selected {
  outline: 2px solid var(--we-accent);
  outline-offset: -2px;
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--we-accent) 45%, transparent),
              0 4px 16px color-mix(in srgb, var(--we-accent) 28%, transparent);
}
.we-picker__card--checked {
  outline: 2px solid var(--we-accent);
  outline-offset: -2px;
}
.we-picker__card-close {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85em;
  font-weight: 600;
  color: var(--we-ink-2);
}
.we-picker__card-type {
  position: absolute;
  top: 4px;
  left: 4px;
  z-index: 2;
  padding: 2px 6px;
  font-size: 0.68em;
  border-radius: 4px;
  color: #fff;
  background: rgba(0, 0, 0, 0.62);
}
.we-picker__card-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 1;
  padding: 1px 6px;
  font-size: 0.64em;
  border-radius: 4px;
  color: #fff;
  background: color-mix(in srgb, var(--we-accent) 85%, #000);
}
.we-picker__card-hide {
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 3;
  padding: 2px 7px;
  font-size: 0.68em;
  border: 0;
  border-radius: 4px;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.68);
  color: #fff;
  opacity: 0;
  transition: opacity var(--we-dur-fast) ease, background-color var(--we-dur-fast) ease;
}
.we-picker__card:hover .we-picker__card-hide,
.we-picker__card:focus-within .we-picker__card-hide { opacity: 1; }
.we-picker__card-hide:hover { background: rgba(195, 50, 50, 0.92); }
.we-picker__card-title {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 14px 6px 4px;
  font-size: 0.72em;
  color: #fff;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.76));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.we-picker__card-check {
  position: absolute;
  top: 4px;
  left: 4px;
  z-index: 3;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
  font-size: 12px;
  line-height: 18px;
  text-align: center;
}
.we-picker__card--checked .we-picker__card-check { background: var(--we-accent); }
.we-picker__card-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.74em;
  color: var(--we-ink-3);
}

/* Props, Uploads, Editor, Font Table, Confirm, Empty */
.we-picker__props, .we-picker__uploads, .we-picker__editor {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid var(--we-border-line);
  background: var(--we-inner-1, rgba(128, 128, 128, 0.06));
}
.we-picker__uploads-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 180px;
  overflow-y: auto;
}
.we-picker__uploads-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 6px;
  background: var(--we-inner-2, rgba(128, 128, 128, 0.10));
}
.we-picker__uploads-name, .we-picker__uploads-path {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13.5px;
}
.we-picker__font-table {
  width: 100%;
  border-collapse: collapse;
}
.we-picker__font-table th {
  font-weight: 500;
  text-align: left;
  padding: 6px;
  font-size: 13.5px;
  color: var(--we-ink-3);
}
.we-picker__font-table td {
  padding: 4px 6px;
  vertical-align: middle;
}
.we-picker__font-table th:nth-child(n+2),
.we-picker__font-table td:nth-child(n+2) {
  width: 1%;
  white-space: nowrap;
}
.we-confirm-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px dashed var(--we-border-line);
  background: var(--we-inner-1, rgba(128, 128, 128, 0.06));
}
.we-picker__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 18px;
  text-align: center;
}
.we-picker__empty-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--we-ink);
}
.we-picker__hint { font-size: 13.5px; line-height: 1.45; color: var(--we-ink-3); }
.we-picker__toast {
  position: sticky;
  bottom: 8px;
  align-self: center;
  padding: 7px 16px;
  border-radius: 999px;
  font-size: 13.5px;
  background: var(--we-accent);
  color: var(--we-accent-ink, #ffffff);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  z-index: 40;
}

/* Extension Module Cards & About */
.we-ext { display: flex; flex-direction: column; gap: 12px; }
.we-ext__module {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  border: 1px solid var(--we-border-line);
  border-radius: 12px;
  background: var(--we-inner-1, rgba(128, 128, 128, 0.06));
}
.we-ext__module-head { display: flex; align-items: center; gap: 8px; }
.we-ext__module-title { font-size: 16px; font-weight: 600; color: var(--we-ink); }
.we-about__lead { display: flex; flex-direction: column; gap: 10px; }
.we-about__p { margin: 0; font-size: 14.5px; line-height: 1.65; color: var(--we-ink-2); }
.we-about__url {
  display: block;
  padding: 9px 12px;
  border-radius: 8px;
  border: 1px dashed var(--we-border-line);
  background: var(--we-inner-1, rgba(128, 128, 128, 0.06));
  font-size: 13.5px;
  color: var(--we-ink-2);
  user-select: text;
  word-break: break-all;
}
.we-log-pre {
  margin: 0;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--we-border-line);
  background: var(--we-inner-1, rgba(0, 0, 0, 0.08));
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
  max-height: 220px;
  overflow: auto;
  color: var(--we-ink-2);
}

@media (prefers-reduced-motion: reduce) {
  .we-vinyl, .we-tabpanel, .we-tabs__pill, .we-picker * {
    animation: none !important;
    transition: none !important;
  }
}
`;
