/* Vantaline demo site: shared header, footer, demo controls, customer context and the current-state chat. */
(function () {
  "use strict";

  // ---------- demo customer (stands in for the Databricks golden record) ----------
  var CUSTOMER = {
    id: "VL-5520-8813",
    firstName: "Maya",
    lastName: "Torres",
    email: "maya.torres@example.com",
    tenureYears: 7,
    products: "Internet 500 + TV Select",
    promoRate: 89.99,
    promoEndDate: "2026-09-01",
    currentBill: 146.40,
    ltv: 11200,
    churnScore: 64,
    competitorFiber: true,
    segment: "Promo roll-off"
  };

  function readPref(k, d) { try { return localStorage.getItem(k) || d; } catch (e) { return d; } }
  function writePref(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function setCookie(k, v) { try { document.cookie = k + "=" + encodeURIComponent(v) + ";path=/;max-age=2592000;SameSite=Lax"; } catch (e) {} }

  var params = new URLSearchParams(location.search);
  if (params.get("mode")) writePref("vl_mode", params.get("mode"));
  if (params.get("agent")) writePref("vl_agent", params.get("agent"));
  var MODE = readPref("vl_mode", "current");      // current | future
  var AGENT = readPref("vl_agent", "qualtrics");  // qualtrics | sim

  // Expose context for Qualtrics intercept logic, DXA and embedded data.
  window.VL = { customer: CUSTOMER, mode: MODE, agent: AGENT, page: document.body.dataset.page || "" };
  var signedIn = document.body.dataset.auth === "in";
  if (signedIn) {
    setCookie("vl_customer_id", CUSTOMER.id);
    setCookie("vl_churn_score", CUSTOMER.churnScore);
    setCookie("vl_segment", CUSTOMER.segment);
  }
  setCookie("vl_mode", MODE);

  // ---------- header / footer ----------
  var LOGO = '<svg width="30" height="28" viewBox="0 0 30 28" aria-hidden="true"><rect x="0" y="16" width="7" height="12" fill="#0B6E78"/><rect x="11.5" y="8" width="7" height="20" fill="currentColor"/><rect x="23" y="0" width="7" height="28" fill="currentColor"/></svg>';
  var SPRITE = '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>' +
    sym("wifi", '<path d="M2 9a15 15 0 0 1 20 0"/><path d="M5 12.5a10 10 0 0 1 14 0"/><path d="M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="19.5" r=".8" fill="currentColor"/>') +
    sym("tv", '<rect x="2.5" y="4" width="19" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>') +
    sym("phone", '<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M11 18.5h2"/>') +
    sym("bill", '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>') +
    sym("card", '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19"/>') +
    sym("chat", '<path d="M4 5h16v11H9l-5 4z"/>') +
    sym("search", '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>') +
    sym("check", '<path d="m5 12.5 4.5 4.5L19 7.5"/>') +
    sym("chev", '<path d="m6 9 6 6 6-6"/>') +
    sym("arrow", '<path d="M5 12h14M13 6l6 6-6 6"/>') +
    sym("alert", '<path d="M12 3 2.5 20h19z"/><path d="M12 10v4.5M12 17.5v.1"/>') +
    sym("info", '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.8v.1"/>') +
    sym("pin", '<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>') +
    sym("shield", '<path d="M12 3 4.5 6v5.5c0 4.6 3.2 8 7.5 9.5 4.3-1.5 7.5-4.9 7.5-9.5V6z"/><path d="m9 12 2.2 2.2L15 10"/>') +
    sym("tool", '<path d="M14.5 6.5a4 4 0 0 0 5 5L20 13 13 20a2.1 2.1 0 0 1-3-3l7-7z"/>') +
    sym("clock", '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>') +
    sym("tag", '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.2"/>') +
    sym("user", '<circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/>') +
    "</defs></svg>";
  function sym(id, body) { return '<symbol id="i-' + id + '" viewBox="0 0 24 24">' + body + "</symbol>"; }
  function ic(name) { return '<svg class="ic" aria-hidden="true"><use href="#i-' + name + '"/></svg>'; }
  window.VL.icon = ic;

  var page = window.VL.page;
  function cur(key) { return page === key ? ' aria-current="page"' : ""; }
  function item(label, href, key, menu) {
    return '<div class="nav-item"><a href="' + href + '"' + cur(key) + ">" + label + (menu ? ic("chev") : "") + "</a>" +
      (menu ? '<div class="menu">' + menu + "</div>" : "") + "</div>";
  }
  function m(href, label, sub) { return '<a href="' + href + '">' + label + (sub ? "<small>" + sub + "</small>" : "") + "</a>"; }

  var demoBar = document.createElement("div");
  demoBar.className = "demo-bar";
  demoBar.innerHTML = '<div class="wrap"><span><b>Demo site.</b> Vantaline Communications is a fictional company. No real accounts or payments.</span>' +
    '<span style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">' +
    '<label>Story <select id="vl-mode"><option value="current">Current state</option><option value="future">Future state</option></select></label>' +
    '<label>Agent <select id="vl-agent"><option value="qualtrics">Qualtrics</option><option value="sim">Simulated backup</option></select></label>' +
    '<a href="servicenow.html" style="color:#C9D3DC">Case console</a></span></div>';

  var head = document.createElement("header");
  head.className = "site-head";
  head.innerHTML = '<div class="wrap"><a class="logo" href="index.html" aria-label="Vantaline home">' + LOGO + "<span>vantaline</span></a>" +
    '<nav class="mainnav" aria-label="Main">' +
    item("Deals", "index.html#shop", "deals") +
    item("Internet", "index.html#shop", "internet",
      m("index.html#shop", "Plans and pricing", "Speeds from 300 Mbps to Gig") + m("support.html", "Wi-Fi and equipment", "Gateways, extenders, tips") + m("signin.html", "Check availability", "Enter your address")) +
    item("TV", "index.html#shop", "tv", m("index.html#shop", "TV Select", "125+ channels") + m("support.html", "Channel lineup")) +
    item("Mobile", "index.html#mobile", "mobile", m("index.html#mobile", "Vantaline Mobile", "$30/mo per line with Internet") + m("index.html#mobile", "Bring your own phone")) +
    item("Support", "support.html", "support",
      m("support.html", "Support center", "Answers, outages, how-tos") + m("bill-faq.html", "Understanding your bill") + m("support.html#contact", "Contact us")) +
    "</nav>" +
        '<div class="head-cta"><a class="icon-btn" href="support.html" aria-label="Search">' + ic("search") + '</a><a class="icon-btn hide-m" href="support.html" aria-label="Find a store">' + ic("pin") + '</a>' + (signedIn
      ? '<a class="plain hide-m" href="billing.html">Pay bill</a><a class="plain" href="account.html" style="display:flex;gap:8px;align-items:center"><span class="avatar">MT</span><span class="hide-m">Maya</span></a>'
      : '<a class="plain" href="signin.html">Sign In</a>') + "</div></div>";

  var foot = document.createElement("footer");
  foot.className = "site-foot";
  foot.innerHTML = '<div class="wrap"><div class="cols">' +
    '<div><div class="logo" style="color:#fff">' + LOGO + '<span style="color:#fff">vantaline</span></div><p class="about" style="margin-top:14px">Internet, TV and mobile for your home. A fictional company built for an experience management demonstration.</p><div class="apps"><span>App Store</span><span>Google Play</span></div></div>' +
    '<div><h4>Shop</h4><a href="index.html#shop">Internet</a><a href="index.html#shop">TV</a><a href="index.html#shop">Mobile</a><a href="index.html#shop">Bundles</a><a href="index.html#compare">Compare plans</a></div>' +
    '<div><h4>Support</h4><a href="support.html">Support center</a><a href="support.html">Service status</a><a href="bill-faq.html">Understanding your bill</a><a href="support.html#contact">Contact us</a><a href="support.html">Accessibility help</a></div>' +
    '<div><h4>My account</h4><a href="signin.html">Sign in</a><a href="billing.html">Pay bill</a><a href="offers.html">Plans and offers</a><a href="account.html">Manage services</a></div>' +
    '<div><h4>Company</h4><a href="index.html">About Vantaline</a><a href="index.html">Careers</a><a href="index.html">Newsroom</a><a href="index.html">Investors</a></div>' +
    '<div><h4>Legal</h4><a href="index.html#legal">Offer terms</a><a href="index.html">Privacy</a><a href="index.html">Terms of service</a><a href="promo-email.html">Sample promo notice</a></div>' +
    '</div><div class="legal"><span>© 2026 Vantaline Communications (fictional, for demonstration only)</span><span>Do not sell or share my personal information</span></div></div>';

  document.body.prepend(head);
  document.body.prepend(demoBar);
  document.body.insertAdjacentHTML("afterbegin", SPRITE);
  document.body.appendChild(foot);

  var modeSel = document.getElementById("vl-mode"), agentSel = document.getElementById("vl-agent");
  modeSel.value = MODE; agentSel.value = AGENT;
  modeSel.addEventListener("change", function () { writePref("vl_mode", modeSel.value); location.reload(); });
  agentSel.addEventListener("change", function () { writePref("vl_agent", agentSel.value); location.reload(); });

  // Fill any [data-cust] placeholders.
  document.querySelectorAll("[data-cust]").forEach(function (el) {
    var v = CUSTOMER[el.dataset.cust];
    el.textContent = typeof v === "number" && /Rate|Bill/.test(el.dataset.cust) ? "$" + v.toFixed(2) : v;
  });
  document.querySelectorAll("[data-mode]").forEach(function (el) { el.hidden = el.dataset.mode !== MODE; });

  // ---------- current-state chat (scripted virtual assistant) ----------
  // In the future state the Qualtrics Experience Agent (or the simulated backup) replaces this.
  document.querySelectorAll("[data-open-chat]").forEach(function (b) {
    b.addEventListener("click", function (e) {
      e.preventDefault();
      var l = document.getElementById("chat-launch"), p = document.getElementById("chat-panel");
      if (l) { if (!p || p.hidden) l.click(); } else if (window.VLAgent) { window.VLAgent.open(); }
    });
  });
  var showLegacyChat = MODE === "current" || document.body.dataset.chat === "always";
  if (!showLegacyChat) return;

  var launch = document.createElement("button");
  launch.className = "chat-launch"; launch.type = "button"; launch.id = "chat-launch";
  launch.setAttribute("aria-label", "Chat with us"); launch.innerHTML = ic("chat") + "<span>Ask Vantaline</span>";
  var panel = document.createElement("section");
  panel.className = "chat-panel"; panel.hidden = true; panel.id = "chat-panel";
  panel.setAttribute("aria-label", "Vantaline chat");
  panel.innerHTML = '<header><span>Vantaline Assistant</span><button type="button" aria-label="Close chat" id="chat-close">✕</button></header>' +
    '<div class="chat-log" id="chat-log" aria-live="polite"></div>' +
    '<form class="chat-form" id="chat-form"><input id="chat-input" autocomplete="off" placeholder="Type a message" aria-label="Message"><button class="btn sm" type="submit">Send</button></form>';
  document.body.appendChild(launch); document.body.appendChild(panel);
  var log = panel.querySelector("#chat-log"), stage = 0, opened = false;

  function add(cls, text) { var d = document.createElement("div"); d.className = "cmsg " + cls; d.textContent = text; log.appendChild(d); log.scrollTop = log.scrollHeight; return d; }
  function bot(text, delay) { setTimeout(function () { add("bot", text); }, delay || 700); }

  launch.addEventListener("click", function () {
    panel.hidden = !panel.hidden;
    if (!panel.hidden && !opened) { opened = true; bot("Hi! I'm the Vantaline virtual assistant. How can I help today?", 300); }
    if (!panel.hidden) panel.querySelector("#chat-input").focus();
  });
  panel.querySelector("#chat-close").addEventListener("click", function () { panel.hidden = true; });
  panel.querySelector("#chat-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var input = panel.querySelector("#chat-input"), text = input.value.trim();
    if (!text) return;
    add("me", text); input.value = "";
    var t = text.toLowerCase();
    if (stage === 0) {
      stage = 1;
      bot("Bills can change based on your services, equipment, taxes, and any promotions or discounts on your account. This article may help: Understanding your bill.");
    } else if (stage === 1 && /agent|human|person|representative/.test(t)) {
      stage = 2;
      bot("I'll connect you with an agent. Current wait time is about 11 minutes.");
      setTimeout(function () { add("sys", "Waiting for an agent · demo wait shortened to 8 seconds"); }, 1200);
      setTimeout(function () { add("sys", "Priya joined the chat"); bot("Hi Maya, this is Priya. I see your promotional rate ended. I can offer $10 off for 3 months.", 400); }, 8000);
    } else if (stage === 1) {
      bot("I'm sorry, I didn't quite get that. You can ask about billing, payments, or outages, or type \"agent\" to talk to a person.");
    } else {
      bot("Thanks for chatting with Vantaline. Is there anything else I can help with?");
    }
  });
})();
