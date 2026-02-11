/* =========================
   RATE GENERATOR
========================= */
class RateGen {
  static MIN = -2147483648;
  static MAX = 2147483647;

  constructor(seed) {
    if (typeof seed === "string") {
      this._seed = this.hashCode(seed);
    } else if (typeof seed === "number") {
      this._seed = this.getSafeSeed(seed);
    } else {
      this._seed = this.getSafeSeed(
        RateGen.MIN + Math.floor((RateGen.MAX - RateGen.MIN) * Math.random())
      );
    }
    this.reset();
  }

  reset() {
    this._value = this._seed;
  }

  recalculate() {
    this._value = this.xorshift(this._value);
  }

  next(min = 0, max = 1) {
    this.recalculate();
    return this.map(this._value, RateGen.MIN, RateGen.MAX, min, max);
  }

  nextInt(min = 10, max = 100) {
    this.recalculate();
    return Math.floor(this.map(this._value, RateGen.MIN, RateGen.MAX, min, max + 1));
  }

  xorshift(x) {
    x ^= x << 13;
    x ^= x >> 17;
    x ^= x << 5;
    return x;
  }

  map(value, inMin, inMax, outMin, outMax) {
    return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
  }

  hashCode(str) {
    let hash = 0;
    if (!str) return this.getSafeSeed(hash);

    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
      hash = this.xorshift(hash);
    }

    return this.getSafeSeed(hash);
  }

  getSafeSeed(value) {
    return value === 0 ? 1 : value;
  }
}

/* =========================
   CONFIG
========================= */

const SELECTOR = {
  mobileLogin: "#page-content-wrapper > div.header > button.login-btn",
  desktopLogin: "#btnLogin",
  mobileMenu: ".header a.hamburger"
};

const EXCEPTIONS = [
  "game terbaru",
  "promosi",
  "spaceman",
  "stream n' spin - luna",
  "stream n' spin - kimmy",
  "stream n' spin - angela"
];

const autoValues = [10, 20, 30, 50, 70, 100];

/* =========================
   HELPERS
========================= */

const isLoggedIn = () =>
  !document.querySelector(SELECTOR.mobileLogin) &&
  !document.querySelector(SELECTOR.desktopLogin);

const isMobile = () => Boolean(document.querySelector(SELECTOR.mobileMenu));

const normalizeText = (text) =>
  text.replace(/\s+/g, " ").trim().toLowerCase();

const isEven = (num) => Number(num) % 2 === 0;

/* =========================
   MAIN INIT
========================= */

document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("contextmenu", (e) => e.preventDefault());

  const path = window.location.pathname;
  if (!path.includes("/slots") || path.includes("Fishing")) return;

  const slots = document.querySelectorAll("div > div.game-box-slots");
  const hourSeed = Math.floor(Date.now() / 3600000);

  // Create modal container once
  const container =
    document.querySelector("div.main") ||
    document.getElementById("page-content-wrapper");

  if (!document.getElementById("pola-modal")) {
    container.insertAdjacentHTML(
      "beforeend",
      `<div id="pola-modal" style="display:none;"></div>`
    );
  }

  slots.forEach((slot, index) => {
    const titleEl = slot.querySelector(".game-title-slots");
    if (!titleEl) return;

    const rawName = titleEl.innerText;
    const name = normalizeText(rawName);
    const isException = EXCEPTIONS.some((e) => name.includes(e));

    const generator = new RateGen(name + hourSeed);

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

    slot.insertAdjacentHTML(
      "beforeend",
      `
      <div style="visibility:${isException ? "hidden" : "visible"};">
        <div class="rtp-bar">
          <div style="width:${rate}%;background-color:${color};">
            <div>${rate}%</div>
          </div>
        </div>
        <button class="rtp-button" data-index="${index}">
          Pola Hari Ini
        </button>
      </div>
    `
    );

    const button = slot.querySelector(".rtp-button");
    if (button) {
      button.addEventListener("click", () => {
        const images = isMobile()
          ? document.querySelectorAll("img.slot-image")
          : document.querySelectorAll(".slots-img-wrap img");

        renderPola(
          rawName,
          images[index]?.src || "",
          time,
          rate,
          polaSeed
        );
      });
    }
  });

  document.querySelectorAll(".ribbon-wrapper").forEach((ribbon) => {
    ribbon.style.pointerEvents = "none";
    ribbon.style.userSelect = "none";
  });
});

/* =========================
   MODAL
========================= */

function closeModal() {
  const modal = document.getElementById("pola-modal");
  if (!modal) return;
  modal.style.display = "none";
  modal.innerHTML = "";
}

function getPolaSpin(seed) {
  const [spin, auto, onetwo, three] = seed;

  const autoMode = isEven(auto);
  const spinValue = Math.max(spin, 1);
  const index = Math.max(Math.round((spinValue / 3) * 2) - 1, 0);
  const even12 = isEven(onetwo);

  const mode = autoMode ? "Auto" : "Manual";
  const spins = autoMode ? autoValues[index] : spinValue;

  const check1 = even12 ? "❌" : "✅";
  const check2 = even12 ? "✅" : "❌";
  const check3 = isEven(three) ? "❌" : "✅";

  return `${spins} ${check1}${check2}${check3} ${mode}`;
}

function renderPola(name, image, time, rate, pola) {
  const modal = document.getElementById("pola-modal");
  if (!modal) return;

  const minuteCount = time * 5;
  const hours = Math.floor(minuteCount / 60);
  const minutes = minuteCount % 60;

  const pad = (n) => (n < 10 ? "0" + n : n);
  const formatTime = (h, m) => `${pad(h)}:${pad(m)}`;

  const polaStr = String(pola);
  const seed1 = polaStr.substring(0, 4);
  const seed2 = polaStr.substring(4, 8);
  const seed3 = polaStr.substring(8, 12);

  modal.innerHTML = `
    <div class="pola-content">
      <h3>${name}</h3>
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
  `;

  modal.style.display = "flex";
}
