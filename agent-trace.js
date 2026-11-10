/*
 * Behind the scenes: a live log of what the Experience Agent sees, decides and does while Maya is on the page.
 * Future state only. Other scripts report steps with VL.trace(lane, title, detail, {risk, status}).
 * Everything shown here is simulated for the demo.
 */
(function () {
  "use strict";
  var VL = window.VL = window.VL || {};
  if (VL.mode !== "future") { VL.trace = function () {}; return; }

  var LANES = { signal: "Signal", identity: "Identity", memory: "Memory", decision: "Decision", action: "Action", outcome: "Outcome" };
  var open; try { open = localStorage.getItem("vl_trace") !== "closed"; } catch (e) { open = true; }

  var el = document.createElement("aside");
  el.className = "trace"; el.id = "trace"; el.setAttribute("aria-label", "Behind the scenes: Experience Agent activity");
  el.innerHTML = '<header><div><span class="t-eye"><span class="pulse-dot" aria-hidden="true"></span>Behind the scenes · live</span><b>Experience Agent</b></div>' +
    '<button type="button" id="trace-hide" aria-label="Hide behind the scenes">✕</button></header>' +
    '<div class="t-stat"><div><span>Churn risk</span><b id="t-risk">64</b><i class="t-meter"><i id="t-bar" style="width:64%"></i></i></div><div><span>Status</span><b id="t-status">Watching</b></div></div>' +
    '<ol class="t-log" id="t-log" aria-live="polite"></ol>' +
    '<footer>Simulated for the demo. Maya never sees this panel.</footer>';
  var tab = document.createElement("button");
  tab.type = "button"; tab.className = "trace-tab"; tab.id = "trace-tab";
  tab.innerHTML = '<span class="pulse-dot" aria-hidden="true"></span>Behind the scenes <b id="t-count">0</b>';
  document.body.appendChild(el); document.body.appendChild(tab);

  function show(v) {
    open = v; el.hidden = !v; tab.hidden = v; document.body.classList.toggle("trace-open", v);
    try { localStorage.setItem("vl_trace", v ? "open" : "closed"); } catch (e) {}
  }
  el.querySelector("#trace-hide").addEventListener("click", function () { show(false); });
  tab.addEventListener("click", function () { show(true); });
  // On small screens start collapsed so the page stays readable.
  show(open && window.matchMedia("(min-width: 1180px)").matches);

  var log = el.querySelector("#t-log"), queue = [], busy = false, count = 0;
  function clock() { var d = new Date(); return d.toLocaleTimeString("en-US", { hour12: false }); }
  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }

  function pump() {
    if (busy || !queue.length) return; busy = true;
    var e = queue.shift(), li = document.createElement("li");
    li.className = "t-" + e.lane;
    li.innerHTML = '<span class="t-time">' + clock() + '</span><span class="t-lane">' + LANES[e.lane] + '</span><b>' + esc(e.title) + "</b>" + (e.detail ? "<p>" + esc(e.detail) + "</p>" : "");
    log.appendChild(li); log.scrollTop = log.scrollHeight;
    count++; document.getElementById("t-count").textContent = count;
    if (e.o) {
      if (e.o.status) { var s = document.getElementById("t-status"); s.textContent = e.o.status; s.className = /Resolved/.test(e.o.status) ? "ok" : /Stepping|person/.test(e.o.status) ? "hot" : ""; }
      if (e.o.risk != null) { var r = document.getElementById("t-risk"), b = document.getElementById("t-bar"); r.textContent = e.o.risk; b.style.width = e.o.risk + "%"; b.className = e.o.risk >= 75 ? "hot" : e.o.risk <= 40 ? "ok" : ""; r.className = b.className; }
    }
    setTimeout(function () { busy = false; pump(); }, 650);
  }
  VL.trace = function (lane, title, detail, o) { if (!LANES[lane]) lane = "action"; queue.push({ lane: lane, title: title, detail: detail, o: o }); pump(); };

  var c = VL.customer || {};
  VL.trace("identity", "Signed-in customer recognized", (c.firstName || "Maya") + " " + (c.lastName || "Torres") + " · " + (c.id || "VL-5520-8813") + " · web session linked to her account");
  VL.trace("memory", "Pulled what Vantaline already knows", "7-year customer · promo ended Sep 1 · bill up $56.41 · the Aug 11 notice email was not opened · has looked at competitor fiber");
  if (VL.page === "billing") VL.trace("decision", "Bill shock is likely on this page", "Show a heads-up before she has to hunt for the reason");
})();
