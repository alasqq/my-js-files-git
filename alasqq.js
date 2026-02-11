class RateGen {
  constructor(seed) {
    this.seed = this.hash(seed);
  }
  hash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++)
      h = (h << 5) - h + str.charCodeAt(i) | 0;
    return h || 1;
  }
  next(min, max) {
    this.seed ^= this.seed << 13;
    this.seed ^= this.seed >> 17;
    this.seed ^= this.seed << 5;
    return Math.abs(this.seed % (max - min + 1)) + min;
  }
}

/* =========================
   EXCEPTION LIST (LENGKAP)
========================= */

const EXCEPTIONS = [
  "game terbaru",
  "promosi",
  "spaceman",
  "stream n' spin - luna",
  "stream n' spin - kimmy",
  "stream n' spin - angela"
];

document.addEventListener("DOMContentLoaded", () => {

  if (!location.pathname.includes("/slots")) return;

  const slots = document.querySelectorAll(".game-box-slots");
  if (!slots.length) return;

  const hourSeed = Math.floor(Date.now() / 3600000);

  slots.forEach((slot) => {

    const titleEl = slot.querySelector(".game-title-slots");
    if (!titleEl) return;

    const rawName = titleEl.innerText.trim();
    const name = rawName.toLowerCase();

    const isException = EXCEPTIONS.some(e => name.includes(e));

    const gen = new RateGen(name + hourSeed);

    const rate = gen.next(60, 98);
    const time = gen.next(0, 288);
    const pola = gen.next(100000000000, 999999999999);

    const color =
      rate > 75 ? "mediumseagreen" :
      rate > 50 ? "#FFC107" :
      "#F44336";

    slot.insertAdjacentHTML("beforeend", `
      <div style="visibility:${isException ? "hidden" : "visible"};">
        <div class="rtp-bar">
          <div style="width:${rate}%;background-color:${color}">
            <div>${rate}%</div>
          </div>
        </div>
        <button class="rtp-button"
          data-name="${rawName}"
          data-img="${slot.querySelector("img")?.src || ""}"
          data-time="${time}"
          data-rate="${rate}"
          data-pola="${pola}">
          Pola Hari Ini
        </button>
      </div>
    `);
  });

  if (!document.getElementById("pola-modal")) {
    document.body.insertAdjacentHTML("beforeend", `<div id="pola-modal"></div>`);
  }
});

/* =========================
   EVENT DELEGATION
========================= */

document.addEventListener("click", function(e){
  const btn = e.target.closest(".rtp-button");
  if (!btn) return;

  const modal = document.getElementById("pola-modal");

  const pola = String(btn.dataset.pola);
  const pola1 = pola.slice(0,4);
  const pola2 = pola.slice(4,8);
  const pola3 = pola.slice(8,12);

  modal.innerHTML = `
    <div>
      <h3>${btn.dataset.name}</h3>
      <div>
        <img src="${btn.dataset.img}">
        <table>
          <tr>
            <td>Pola Slot</td>
            <td>${pola1}<br>${pola2}<br>${pola3}</td>
          </tr>
          <tr>
            <td>RTP Live</td>
            <td>${btn.dataset.rate}%</td>
          </tr>
        </table>
        <button onclick="document.getElementById('pola-modal').style.display='none'">
          Tutup
        </button>
      </div>
    </div>
  `;

  modal.style.display = "flex";
});
