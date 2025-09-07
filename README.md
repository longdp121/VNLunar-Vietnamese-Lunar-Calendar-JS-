# VNLunar — Vietnamese Lunar Calendar (Âm lịch) in JavaScript

**VNLunar** is a clean JavaScript port of the algorithms from the Vietnamese Wikipedia’s “Âm lịch” programming notes. It converts dates between **Solar (Dương lịch)** and **Lunar (Âm lịch)**, computes **New Moon** times, **Sun longitude**, and **Can–Chi** (Heavenly Stems & Earthly Branches).
It runs in **Node.js** (CLI & library) and the **browser** (via a global `VNLunar`).

> Thuật toán tham khảo: [Mô đun:Âm lịch – Wikipedia tiếng Việt](https://vi.wikipedia.org/wiki/M%C3%B4_%C4%91un:%C3%82m_l%E1%BB%8Bch)

* Live demo (browser UI): **[https://vn-lunar-vietnamese-lunar-calendar.vercel.app/](https://vn-lunar-vietnamese-lunar-calendar.vercel.app/)**

---

## Features

* Solar ⇄ Lunar conversion with **VN timezone (UTC+7)** support
* **New Moon** times (Julian Day), **Sun longitude** (radians)
* **Lunar Month 11** (Đông chí), **lunar year table** (incl. leap months)
* **Can–Chi** for day / month / year
* Works in Node and in the browser (no bundler required)

---

## Install / Use

### A) Node.js (CLI)

```bash
node vnlunar.js
# Runs the default test suite from the original document
```

Custom tests (JSON):

```bash
node vnlunar.js '{"utc":7,"cases":[
  {"fn":"UniversalToJD","args":[1,1,2000],"approx":2451544.5},
  {"fn":"UniversalFromJD","args":[2451544.5],"equals":[1,1,2000]},
  {"fn":"SunLongitude","args":[2451520.2083333335],"approx":4.453168980086705}
]}'
```

### B) Node.js (as a library)

```js
const VNLunar = require('./vnlunar');

const utc = 7;
const [dd, mm, yy, leap] = VNLunar.Solar2Lunar(8, 9, 2025, utc); // D/M/Y, UTC+7
console.log({ dd, mm: mm === 0 ? 12 : mm, yy, leap });
```

### C) Browser

```html
<script src="vnlunar.js"></script>
<script>
  const { Solar2Lunar, Lunar2Solar, canchi } = window.VNLunar;
  const utc = 7;
  console.log(Solar2Lunar(8, 9, 2025, utc));
</script>
```

> **Note:** Include `vnlunar.js` **before** your app logic so `window.VNLunar` is available.

---

## API (quick)

All functions are exposed as `VNLunar.*` (Node export + browser global):

* **Julian Day / UTC**

  * `UniversalToJD(D, M, Y) -> JD`
  * `UniversalFromJD(JD) -> [dd, mm, yyyy]`
* **Local time helpers**

  * `LocalToJD(D, M, Y, utcHours) -> JD`
  * `LocalFromJD(JD, utcHours) -> [dd, mm, yyyy]`
* **Astronomy**

  * `NewMoon(k) -> JD`
  * `SunLongitude(jdn) -> radians in [0, 2π)`
* **Lunar calendar core**

  * `LunarMonth11(Y, utcHours) -> [dd, mm, yyyy]` (month containing Đông chí)
  * `LunarYear(Y, b, utcHours)` → returns one of:

    * `b=1`: day\[] | `b=2`: month\[] | `b=3`: year\[] | `b=4`: monthIndex\[] | `b=5`: leapFlags\[] | else: length
* **Conversions**

  * `Solar2Lunar(D, M, Y, utcHours) -> [dd, mm, yy, leap]` (`mm=0` means month 12)
  * `Lunar2Solar(D, M, Y, leap, utcHours) -> [dd, mm, yyyy]`
* **Can–Chi**

  * `canchi(x) -> "Can Chi"`

Utilities: `toInt`, `LocalToJD`, `LocalFromJD`, etc.

---

## Accuracy & Notes

* The port follows the Wikipedia module closely; **New Moon** timing error is typically within a couple of minutes (per doc).
* **Timezone** matters. Examples and UI use **UTC+7 (Việt Nam)**.
* Floating-point rounding: tests use small epsilons for comparisons.
* In some internals, `mm = 0` stands for **tháng 12** (as in the source algorithms).

---

## Development

* Single file build: **`vnlunar.js`** (Node + Browser)
* Default CLI tests are derived from the original document.
* If you see “`require is not defined`” in the browser, ensure you’re **not** executing the Node-only CLI block; the file already guards it with a `require.main === module` check under a Node environment test.

---

## Acknowledgements

* Algorithms and reference examples adapted from **Wikipedia tiếng Việt – Mô đun:Âm lịch**:
  [https://vi.wikipedia.org/wiki/M%C3%B4\_%C4%91un:%C3%82m\_l%E1%BB%8Bch](https://vi.wikipedia.org/wiki/M%C3%B4_%C4%91un:%C3%82m_l%E1%BB%8Bch)

---

## License

MIT (see `LICENSE` if included).
