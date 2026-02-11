/* =========================================
   ORIGINAL RATEGEN 
========================================= */
var RateGen = (function () {
  function t(e) {
    (this._value = NaN),
      "string" == typeof e
        ? (this._seed = this.hashCode(e))
        : "number" == typeof e
        ? (this._seed = this.getSafeSeed(e))
        : (this._seed = this.getSafeSeed(
            t.MIN + Math.floor((t.MAX - t.MIN) * Math.random())
          )),
      this.reset();
  }
  return (
    (t.prototype.next = function (e, o) {
      void 0 === e && (e = 0);
      void 0 === o && (o = 1);
      this.recalculate();
      return this.map(this._value, t.MIN, t.MAX, e, o);
    }),
    (t.prototype.nextInt = function (e, o) {
      void 0 === e && (e = 10);
      void 0 === o && (o = 100);
      this.recalculate();
      return Math.floor(
        this.map(this._value, t.MIN, t.MAX, e, o + 1)
      );
    }),
    (t.prototype.reset = function () {
      this._value = this._seed;
    }),
    (t.prototype.recalculate = function () {
      this._value = this.xorshift(this._value);
    }),
    (t.prototype.xorshift = function (t) {
      return (t ^= t << 13), (t ^= t >> 17), (t ^= t << 5);
    }),
    (t.prototype.map = function (t, e, o, r, n) {
      return ((t - e) / (o - e)) * (n - r) + r;
    }),
    (t.prototype.hashCode = function (t) {
      var e = 0;
      if (t)
        for (var o = t.length, r = 0; r < o; r++)
          (e = (e << 5) - e + t.charCodeAt(r)),
            (e |= 0),
            (e = this.xorshift(e));
      return this.getSafeSeed(e);
    }),
    (t.prototype.getSafeSeed = function (t) {
      return 0 === t ? 1 : t;
    }),
    (t.MIN = -2147483648),
    (t.MAX = 2147483647),
    t
  );
})();

/* =========================================
   HELPERS
========================================= */

const mobileLogin = "#page-content-wrapper > div.header > button.login-btn";
const desktopLogin = "#btnLogin";
const mobileMenu = ".header a.hamburger";

function isMobile() {
  return Boolean(document.querySelector(mobileMenu));
}

document.addEventListener("contextmenu", e => e.preventDefault());

/* =========================================
   MAIN SLOT LOOP
========================================= */

document.addEventListener("DOMContentLoaded", () => {

  const path = window.location.pathname;
  if (!path.includes("/slots") || path.includes("Fishing")) return;

  const exceptions = [
    "game terbaru",
    "promosi",
    "spaceman",
    "stream n spin - luna",
    "stream n spin - kimmy",
    "stream n spin - angela"
  ];

  const common = Math.floor(Date.now() / 3600000);
  const slots = document.querySelectorAll("div > div.game-box-slots");
  const mobileView = isMobile();

  for (let i = 0; i < slots.length; i++) {

    const nameElement = slots[i].querySelector(".game-title-slots");
    if (!nameElement) continue;

    const rawName = nameElement.innerText.trim();

    const normalized = rawName
      .toLowerCase()
      .replace(/&#039;|'/g, "")
      .replace(/\s+/g, " ")
      .trim();

    const isException = exceptions.some(e =>
      normalized.includes(e)
    );

    const seed = `${normalized}${common}`;
    const generator = new RateGen(seed);

    const rateSeed = generator.nextInt(0, 59);
    const rate =
      rateSeed >= 20
        ? 90 + (rateSeed % 10)
        : 60 + rateSeed;

    const time = generator.nextInt(0, 288);
    const polaSeed = generator.nextInt(100000000000, 999999999999);

    const color =
      rate > 64
        ? "mediumseagreen"
        : rate > 34
        ? "#FFC107"
        : "#F44336";

    slots[i].insertAdjacentHTML(
      "beforeend",
      `
      <div style="visibility:${isException ? "hidden" : "visible"};">
        <div class="rtp-bar">
          <div style="width:${rate}%;background-color:${color};">
            <div>${rate}%</div>
          </div>
        </div>
        <button class="rtp-button"
          data-name="${rawName}"
          data-time="${time}"
          data-rate="${rate}"
          data-pola="${polaSeed}"
          data-index="${i}">
          Pola Hari Ini
        </button>
      </div>
      `
    );
  }

  /* Disable ribbon block */
  document.querySelectorAll(".ribbon-wrapper").forEach(ribbon => {
    ribbon.style.pointerEvents = "none";
    ribbon.style.userSelect = "none";
  });

  /* Inject modal container */
  const content =
    document.querySelector("div.main") ||
    document.getElementById("page-content-wrapper");

  if (!document.getElementById("pola-modal")) {
    content.insertAdjacentHTML(
      "beforeend",
      '<div id="pola-modal" style="display:none;"></div>'
    );
  }
});

/* =========================================
   EVENT DELEGATION 
========================================= */

document.addEventListener("click", function (e) {
  const btn = e.target.closest(".rtp-button");
  if (!btn) return;

  const images = isMobile()
    ? document.querySelectorAll("img.slot-image")
    : document.querySelectorAll(".slots-img-wrap img");

  const index = btn.dataset.index;
  const image = images[index]?.src || "";

  renderPola(
    btn.dataset.name,
    image,
    +btn.dataset.time,
    +btn.dataset.rate,
    btn.dataset.pola
  );
});

/* =========================================
   POLA LOGIC
========================================= */

const isEven = num => Number(num) % 2 === 0;
const autoValues = [10, 20, 30, 50, 70, 100];

function closeModal() {
  const modal = document.getElementById("pola-modal");
  modal.style.display = "none";
  modal.innerHTML = "";
}

function getPolaSpin(seed) {
  const [spin, auto, onetwo, three] = seed;

  const autoBool = isEven(auto);
  const spin1to9 = Math.max(spin, 1);
  const index0to5 = Math.round((spin1to9 / 3) * 2) - 1;
  const even1and2 = isEven(onetwo);

  const isAuto = autoBool ? "Auto" : "Manual";
  const spins = autoBool ? autoValues[index0to5] : spin1to9;
  const check1 = even1and2 ? "❌" : "✅";
  const check2 = even1and2 ? "✅" : "❌";
  const check3 = isEven(three) ? "❌" : "✅";

  return `${spins} ${check1}${check2}${check3} ${isAuto}`;
}

function renderPola(name, image, time, rate, pola) {

  const padNumber = num =>
    num < 10 ? "0" + num : num.toString();

  const toTimeFormat = (h, m) =>
    padNumber(h) + ":" + padNumber(m);

  const normalizeHours = num =>
    num >= 24 ? num - 24 : num;

  const minuteCount = time * 5;
  const hours = Math.floor(minuteCount / 60);
  const minutes = minuteCount % 60;

  const startTime = toTimeFormat(hours, minutes);
  const endTime = toTimeFormat(
    normalizeHours(hours + 3),
    minutes
  );

  const polaSeed = String(pola);
  const seed1 = polaSeed.substring(0, 4);
  const seed2 = polaSeed.substring(4, 8);
  const seed3 = polaSeed.substring(8, 12);

  const content = `
    <div>
      <h3>${name}</h3>
      <div>
        <img src="${image}" alt="${name}" />
        <table>
          <tbody>
            <tr>
              <td>Pola Slot</td>
              <td>
                <div>${getPolaSpin(seed1)}</div>
                <div>${getPolaSpin(seed2)}</div>
                <div>${getPolaSpin(seed3)}</div>
              </td>
            </tr>
            <tr>
              <td>RTP Live</td>
              <td>${rate}%</td>
            </tr>
          </tbody>
        </table>
        <button onclick="closeModal()">Tutup</button>
      </div>
    </div>
  `;

  const modal = document.getElementById("pola-modal");
  modal.innerHTML = content;
  modal.style.display = "flex";
}
