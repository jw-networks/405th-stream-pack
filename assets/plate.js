/* Builds a nameplate for a seat and keeps it in sync with the names file. */
window.makePlate = function (seat, opts = {}) {
  const el = document.createElement("div");
  el.className = "plate" + (opts.align === "right" ? " right" : "") + (opts.compact ? " compact" : "");
  el.innerHTML = `
    <div class="tab"><span class="label"></span><span class="kink"></span></div>
    <div class="bar hexpanel">
      <div class="mark"><img src="${opts.base || ""}assets/emblem.png" alt=""></div>
      <div class="name"></div>
    </div>`;
  el.querySelector(".label").textContent = opts.label || Names.label(seat);
  const nameEl = el.querySelector(".name");
  const maxPx = () => parseFloat(getComputedStyle(el).fontSize) * 2.2;

  let shown = "";
  let timer = null;
  function set(name) {
    if (name === shown) return;
    clearTimeout(timer);
    const apply = () => {
      shown = name;
      nameEl.textContent = name;
      if (name) {
        el.classList.add("on");
        requestAnimationFrame(() => fitText(nameEl, maxPx(), maxPx() * 0.5));
      }
      el.dispatchEvent(new CustomEvent("seatchange", { detail: { seat, name } }));
    };
    if (el.classList.contains("on")) {       // animate out, swap, animate in
      el.classList.remove("on");
      timer = setTimeout(apply, name ? 550 : 0);
    } else apply();
  }
  Names.onChange(() => {
    if (!opts.label) el.querySelector(".label").textContent = Names.label(seat);   // follows the show type
    set(Names.get(seat));
  });
  return el;
};
