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
  function setCookie(k, v) { document.cookie = k + "=" + encodeURIComponent(v) + ";path=/;max-age=2592000;SameSite=Lax"; }

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
  var LOGO = '<svg width="34" height="34" viewBox="0 0 28 28" aria-hidden="true"><rect width="28" height="28" rx="7" fill="#0B6E78"/><path d="M7 9l7 11 7-11" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="14" cy="7.5" r="1.8" fill="#fff"/></svg>';
  var page = window.VL.page;
  function nav(href, label, key) { return '<a href="' + href + '"' + (page === key ? ' aria-current="page"' : "") + ">" + label + "</a>"; }

  var demoBar = document.createElement("div");
  demoBar.className = "demo-bar";
  demoBar.innerHTML = '<div class="wrap"><span><b>Demo site.</b> Vantaline Communications is a fictional company. No real accounts or payments.</span>' +
    '<span style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">' +
    '<label>Story <select id="vl-mode"><option value="current">Current state</option><option value="future">Future state</option></select></label>' +
    '<label>Agent <select id="vl-agent"><option value="qualtrics">Qualtrics</option><option value="sim">Simulated backup</option></select></label>' +
    '<a href="servicenow.html" style="color:#C9D3DC">Case console</a></span></div>';

  var head = document.createElement("header");
  head.className = "site-head";
  head.innerHTML = '<div class="wrap"><a class="logo" href="index.html">' + LOGO + "<span>Vantaline</span></a>" +
    '<nav class="mainnav" aria-label="Main">' + nav("index.html#internet", "Internet", "internet") + nav("index.html#tv", "TV", "tv") + nav("index.html#mobile", "Mobile", "mobile") + nav("support.html", "Support", "support") + "</nav>" +
    '<div class="head-cta">' + (signedIn
      ? '<a class="acct-chip" href="account.html" style="text-decoration:none"><span class="avatar">MT</span><span>Maya</span></a>'
      : '<a class="btn ghost sm" href="signin.html">Sign in</a>') + "</div></div>";

  var foot = document.createElement("footer");
  foot.className = "site-foot";
  foot.innerHTML = '<div class="wrap"><span>© 2026 Vantaline Communications (fictional, for demonstration only)</span>' +
    '<span style="display:flex;gap:18px;flex-wrap:wrap"><a href="support.html">Support</a><a href="bill-faq.html">Understanding your bill</a><a href="promo-email.html">Sample promo notice</a></span></div>';

  document.body.prepend(head);
  document.body.prepend(demoBar);
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
  var showLegacyChat = MODE === "current" || document.body.dataset.chat === "always";
  if (!showLegacyChat) return;

  var launch = document.createElement("button");
  launch.className = "chat-launch"; launch.type = "button"; launch.id = "chat-launch";
  launch.setAttribute("aria-label", "Chat with us"); launch.textContent = "Chat";
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
