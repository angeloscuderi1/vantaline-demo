/*
 * Behind the scenes: a presenter strip along the bottom of the page that logs, live, what the
 * Experience Agent sees, decides and does. Future state only, off until the presenter turns it on
 * from the demo bar. Other scripts report steps with VL.trace(lane, title, detail, {risk, status}).
 * Everything shown here is simulated for the demo.
 */
(function () {
  "use strict";
  var VL = window.VL = window.VL || {};
  if (VL.mode !== "future") { VL.trace = function () {}; return; }

  var LANES = { signal: "Signal", identity: "Identity", memory: "Memory", decision: "Decision", action: "Action", outcome: "Outcome" };
  var open = false; try { open = localStorage.getItem("vl_trace") === "open"; } catch (e) {}

  var el = document.createElement("aside");
  el.className = "trace"; el.id = "trace"; el.hidden = true; el.setAttribute("aria-label", "Behind the scenes: Experience Agent activity");
  el.innerHTML = '<div class="t-stat"><span class="t-eye"><span class="pulse-dot" aria-hidden="true"></span>Behind the scenes</span>' +
    '<div><span>Churn risk</span><b id="t-risk">64</b><i class="t-meter"><i id="t-bar" style="width:64%"></i></i></div>' +
    '<div><span>Status</span><b id="t-status">Watching quietly</b></div></div>' +
    '<ol class="t-log" id="t-log" aria-live="polite"></ol>' +
    '<button type="button" id="trace-hide" aria-label="Hide behind the scenes">✕</button>';
  document.body.appendChild(el);

  // Presenter controls live in the demo bar, away from Maya's page.
  var ctl = document.querySelector(".demo-bar .ctl");
  var btn = document.createElement("button"); btn.type = "button"; btn.className = "pbtn"; btn.id = "vl-bts"; btn.textContent = "Behind the scenes";
  var step = document.createElement("button"); step.type = "button"; step.className = "pbtn"; step.id = "vl-step"; step.textContent = "Next step ▸";
  if (ctl) { ctl.insertBefore(btn, ctl.firstChild); if (VL.page === "billing") ctl.insertBefore(step, btn.nextSibling); }

  function show(v) {
    open = v; el.hidden = !v; btn.setAttribute("aria-pressed", String(v)); document.body.classList.toggle("trace-open", v);
    try { localStorage.setItem("vl_trace", v ? "open" : "closed"); } catch (e) {}
    if (v) log.scrollLeft = log.scrollWidth;
  }
  var log = el.querySelector("#t-log"), queue = [], busy = false;
  btn.addEventListener("click", function () { show(!open); });
  el.querySelector("#trace-hide").addEventListener("click", function () { show(false); });
  step.addEventListener("click", function () { if (VL.nextStep) VL.nextStep(); });
  show(open);

  function clock() { return new Date().toLocaleTimeString("en-US", { hour12: false }); }
  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }

  function pump() {
    if (busy || !queue.length) return; busy = true;
    var e = queue.shift(), li = document.createElement("li");
    li.className = "t-" + e.lane;
    li.innerHTML = '<span class="t-time">' + clock() + '</span><span class="t-lane">' + LANES[e.lane] + '</span><b>' + esc(e.title) + "</b>" + (e.detail ? "<p>" + esc(e.detail) + "</p>" : "");
    log.appendChild(li); try { log.scrollTo({ left: log.scrollWidth, behavior: "smooth" }); } catch (x) { log.scrollLeft = log.scrollWidth; }
    if (e.o) {
      if (e.o.status) { var s = document.getElementById("t-status"); s.textContent = e.o.status; s.className = /Resolved/.test(e.o.status) ? "ok" : /Stepping|person|Offering/.test(e.o.status) ? "hot" : ""; }
      if (e.o.risk != null) { var r = document.getElementById("t-risk"), b = document.getElementById("t-bar"); r.textContent = e.o.risk; b.style.width = e.o.risk + "%"; b.className = e.o.risk >= 75 ? "hot" : e.o.risk <= 40 ? "ok" : ""; r.className = b.className; }
    }
    setTimeout(function () { busy = false; pump(); }, 600);
  }
  VL.trace = function (lane, title, detail, o) { if (!LANES[lane]) lane = "action"; queue.push({ lane: lane, title: title, detail: detail, o: o }); pump(); };

  var c = VL.customer || {};
  VL.trace("identity", "Signed-in customer recognized", (c.firstName || "Maya") + " " + (c.lastName || "Torres") + " · " + (c.id || "VL-5520-8813"));
  VL.trace("memory", "Pulled what Vantaline already knows", "7-year customer · promo ended Sep 1 · bill up $56.41 · Aug 11 notice never opened");
  if (VL.page === "billing") VL.trace("decision", "Start quiet", "Put the answer on the bill itself. No interruption unless she struggles.");
})();
