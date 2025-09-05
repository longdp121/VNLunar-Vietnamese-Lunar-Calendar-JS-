# VNLunar — Vietnamese Lunar Calendar (JS)

A tiny, dependency-free JavaScript port of the Vietnamese lunar calendar routines from the Lua module on Wikipedia.  
**Original Lua source:** **[Mô đun:Âm lịch (Wikipedia tiếng Việt)](https://vi.wikipedia.org/wiki/M%C3%B4_%C4%91un:%C3%82m_l%E1%BB%8Bch#)**

> This project is fully open-source and intended for educational and practical use in Vietnamese calendar applications.


---

## Features

* Convert **Gregorian ↔ Julian Day** (UTC or local offset).
* Compute **New Moon times** (Meeus-style approximations).
* Compute **Sun ecliptic longitude**.
* Derive **lunar months**, detect **leap lunar months**.
* Convert **Solar → Lunar** date (with leap flag) and format **Can-Chi**.
* Pure JS, no dependencies; works offline in browsers.

---

## Demo / Quick Start

Include the library, then use the global:

```html
<script src="vnlunar.js"></script>
<script>
  const { UniversalToJD, LocalFromJD, Solar2Lunar, main } = VNLunar;

  console.log(UniversalToJD(1,1,2000));                 // ~2451544.5 (UTC)
  console.log(LocalFromJD(2451544.2083333335, 7));      // [1, 1, 2000] (UTC+7)
  console.log(Solar2Lunar(1,1,2000,7));                 // [day, lunarMonthIdx(0..11; 0==12), lunarYear, leapFlag]
  console.log(main(1,1,2000,'full',7));                 // "ngày 1 tháng 1 năm Can-Chi"
</script>
```

To avoid global name clashes in pages with many scripts, destructure locally:

```html
<script>
(() => {
  const { UniversalFromJD, LocalToJD, NewMoon, SunLongitude } = VNLunar;
  // use functions here...
})();
</script>
```

---

## Repository Layout

```
.
├─ vnlunar.js     # Library: single-file browser build (global VNLunar)
├─ index.html     # Minimal page with console-based tests
└─ README.md
```

---

## API

All functions are available via the `VNLunar` global.

### Integer & JD helpers

* `toInt(n): number`
  Truncates toward zero (matches Lua `toint` behavior).

* `UniversalToJD(D, M, Y): number`
  Gregorian → **Julian Day** at **UTC noon** boundary per algorithm (not a clock-time timestamp).

* `UniversalFromJD(JD): [dd, mm, yyyy]`
  **Julian Day** → Gregorian (UTC).

* `LocalToJD(D, M, Y, utc): number`
  Local date at midnight (given `utc` offset in hours, e.g. `7` for UTC+7) → **Julian Day**.

* `LocalFromJD(JD, utc): [dd, mm, yyyy]`
  **Julian Day** → local date triple at given `utc` offset.

### Astronomy

* `NewMoon(k): number`
  Returns JD of the *k-th* mean new moon since 1900 Jan 0.5 (Meeus approximation with periodic terms and ΔT).

* `SunLongitude(jdn): number`
  True ecliptic longitude of the Sun in **radians** normalized to `[0, 2π)` for the given JD.

### Lunar year & month scaffolding

* `LunarMonth11(Y, utc): [d, m, y]`
  Returns the local date (UTC offset `utc`) for the start of lunar month 11 of year `Y`.

* `LunarYear(Y, b, utc)`
  Returns different sequences for the lunar year that spans month 11 of `Y-1` to month 11 of `Y`:

  * `b=1` → array of **days** for month starts (1-based indexing)
  * `b=2` → array of **months**
  * `b=3` → array of **years** (Gregorian)
  * `b=4` → array of **lunar month numbers** modulo 12 (Lua mapping; `0` represents 12th month)
  * `b=5` → array of **leap flags** (`1` leap month else `0`)
  * otherwise → **length** of the sequence (`13` or `14`)

### Conversions & formatting

* `Solar2Lunar(D, M, Y, utc): [dd, mmIdx, yyyy, leap]`
  Solar → Lunar. `mmIdx` is `0..11` with `0` meaning **12th** lunar month (mirrors the original Lua’s mapping). `leap` is `0|1`.

* `Lunar2Solar(D, M, Y, utc, DF, leap): string`
  Lunar → formatted Solar string using `DF` (display format) tokens from the Lua code (`'full','jMY','dFY','dm','d-m-y','jM','dM','Y','j','d','n','m','M','F'`).
  **Note:** this port preserves the Lua formatting and idiosyncrasies.

* `canchi(x): string`
  Returns `"Can Chi"` for number `x` (used to compute year/month/day names).

* `main(D, M, Y, DF, utc): string`
  High-level formatter (like the Lua `p.main`) producing Vietnamese phrases; uses `Solar2Lunar` + `canchi`.

---

## Built-in Console Tests

`index.html` contains an IIFE block that prints **EXPECTED vs ACTUAL** for:

* `UniversalFromJD` reference dates (Gregorian reform edge cases).
* Local JD roundtrip at UTC+7.
* Several `NewMoon(k)` epochs and their local dates.
* Two `SunLongitude` checks and the inequality across the winter solstice.

To run:

1. Open `index.html` in a browser.
2. Open DevTools → Console to see ✅/❌ results.

---

## Accuracy & Notes

* This is a **direct translation** of the Wikipedia Lua logic. It keeps:

  * The **1-based indexing** convention in the lunar year arrays.
  * The **month index** mapping where `0` represents the 12th lunar month.
  * Small quirks from the original (e.g., a minor formatting branch in `main(…, 'Y', …)` in Lua).
* The astronomy formulas are **approximations** suitable for calendrical use, not high-precision ephemerides.
* **UTC offset (`utc`)** is a **number** in hours (e.g., `7` for Việt Nam). Fractions are allowed (e.g., `5.5`).

---

## Browser vs. Modules

This repo ships a **browser-global** build:

* Use as `<script src="vnlunar.js"></script>` → functions under `window.VNLunar`.
* If you prefer ESM, you can adapt the bottom section to export named functions, then load with:

  ```html
  <script type="module">
    import { Solar2Lunar, main } from './vnlunar.esm.js';
  </script>
  ```

  (We kept the default file browser-only to maximize compatibility.)

---

## Roadmap / Ideas

* Optional **ESM** build published alongside the browser file.
* A small **UI demo** that renders a month calendar and highlights lunar dates.
* Add **unit tests** (Vitest/Jest) run in Node with deterministic expectations.

---

## Contributing

1. Fork and create a feature branch.
2. Keep the code style simple (no dependencies).
3. Add/extend tests in `index.html` (or propose a test harness).
4. Open a PR with a clear description of changes and reasoning.

Issues and discussions are welcome—especially regarding edge cases and historical calendar boundaries.

---

## License

**MIT License** — see `LICENSE` (MIT is chosen to maximize reuse).

---

## Attribution

- Original algorithms and reference values adapted from **[Mô đun:Âm lịch (Wikipedia tiếng Việt)](https://vi.wikipedia.org/wiki/M%C3%B4_%C4%91un:%C3%82m_l%E1%BB%8Bch#)**.
- This port preserves behavior and structure to ease verification and cross-checking.


---

## Disclaimer

While this library is useful for calendrical conversions, it is not a substitute for official astronomical ephemerides. For mission-critical or scientific analysis requiring arcsecond precision, use authoritative sources (e.g., JPL DE ephemerides).

---

## Example: Convert Solar → Lunar (UTC+7)

```html
<script src="vnlunar.js"></script>
<script>
  const [d, mIdx, y, leap] = VNLunar.Solar2Lunar(1, 1, 2000, 7);
  const mHuman = (mIdx === 0) ? 12 : mIdx; // Lua mapping
  console.log({ lunarDay: d, lunarMonth: mHuman, lunarYear: y, isLeap: !!leap });
  console.log(VNLunar.main(1,1,2000,'full',7));
</script>
```

Happy hacking!
