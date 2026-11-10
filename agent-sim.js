/*
 * Simulated Experience Agent: a backup for the future-state story.
 * Loads only when the demo bar is set to Story = Future and Agent = Backup.
 * Steps in when the bill page reports frustration (rage click) or after 20 seconds on the bill page.
 * It says what it noticed, says it is automated, and always offers a person.
 */
(function () {
  "use strict";
  var VL = window.VL || {};
  if (VL.mode !== "future" || VL.agent !== "sim") return;

  var panel = document.createElement("section");
  panel.className = "chat-panel agent"; panel.hidden = true; panel.id = "agent-panel";
  panel.setAttribute("aria-label", "Vantaline assistant");
  panel.innerHTML = '<header><div class="ttl"><span class="eye"><span class="pulse-dot" aria-hidden="true"></span><span id="agent-why"></span></span><span class="h">Let’s sort out your bill, Maya</span></div><button type="button" aria-label="Close" id="agent-close">✕</button></header>' +
    '<div class="agent-note"><span>Automated assistant</span><button type="button" id="agent-human">Talk to a person</button></div>' +
    '<div class="chat-log" id="agent-log" aria-live="polite"></div>' +
    '<form class="chat-form" id="agent-form"><input id="agent-input" autocomplete="off" placeholder="Type a message" aria-label="Message"><button class="btn sm" type="submit">Send</button></form>';
  document.body.appendChild(panel);
  panel.querySelector("#agent-close").addEventListener("click", function () { panel.hidden = true; });
  var log = panel.querySelector("#agent-log"), started = false, handed = false;

  function add(cls, html) { var d = document.createElement("div"); d.className = "cmsg " + cls; d.innerHTML = html; log.appendChild(d); log.scrollTop = log.scrollHeight; return d; }
  // A short "typing" beat before each reply, so the reply lands instead of just appearing.
  function say(html, delay, cls) {
    var wait = delay || 900, dots = null;
    setTimeout(function () { dots = add("bot typing", "•••"); }, Math.max(0, wait - 700));
    setTimeout(function () { if (dots) dots.remove(); add(cls || "bot", html); }, wait);
  }

  var WHY = { rage: "We noticed a few quick clicks on your bill", time: "You’ve been on your bill for a bit", manual: "Here to help with your bill" };

  function start(reason) {
    if (started) { panel.hidden = false; return; }
    started = true;
    panel.querySelector("#agent-why").textContent = WHY[reason] || WHY.manual;
    panel.hidden = false;
    add("bot", "Hi Maya. Your 12-month promo ended on Sep 1. That is why your bill went from <b>$89.99</b> to <b>$146.40</b>. Nothing else changed.");
    say("I can bring it back down right now. Here are your options:", 1100);
    setTimeout(cards, 1900);
  }

  function cards() {
    var c = add("bot wide", '<div class="ocards">' +
      '<button type="button" class="rec" data-say="Keep everything for $119"><span class="px">$119<small>/mo</small></span><span class="nm">Keep everything <span class="tag">Recommended</span></span><span class="ds">Locked for 12 months, applies to this bill</span></button>' +
      '<button type="button" data-say="Internet only for $85"><span class="px">$85<small>/mo</small></span><span class="nm">Internet 500 only</span><span class="ds">Drop TV, add it back anytime</span></button>' +
      '<button type="button" data-say="Keep my current plan"><span class="px">$146.40</span><span class="nm">Keep my current plan</span><span class="ds">No changes</span></button></div>');
    c.querySelectorAll("button").forEach(function (b) { b.addEventListener("click", function () { handle(b.dataset.say); }); });
    var w = add("bot", '<div class="chips"><button type="button">Why wasn’t I told?</button></div>');
    w.querySelector("button").addEventListener("click", function () { handle("Why wasn’t I told?"); });
  }

  function human() {
    if (handed) return; handed = true;
    say("Of course. I’m bringing in Jordan from our loyalty team. Jordan will see everything so far, so you won’t need to repeat anything.", 700);
    setTimeout(function () { add("sys", "Handed off to Jordan R. (Retention) · summary, churn score and replay attached"); }, 2300);
    setTimeout(function () { add("bot", "<b>Jordan R.</b><br>Hi Maya, I’ve read your conversation. I can lock $119 for 12 months and add a $15 credit for the surprise."); }, 4300);
  }

  function handle(text) {
    add("me", text.replace(/</g, "&lt;"));
    var t = text.toLowerCase();
    if (/person|human|agent|representative|someone/.test(t)) {
      human();
    } else if (/why/.test(t)) {
      say("You should have been. We emailed you on Aug 11, but I can see it didn’t reach you in time. I’m sorry it came as a surprise, and I’ve passed that on.");
    } else if (/146|current plan|no thanks|nothing/.test(t)) {
      say("No problem. Nothing changes, and I won’t ask again. These options stay on your Plans &amp; offers page if you change your mind.");
    } else if (/\b(99|100|105|109)\b|cheaper|lower|less|too much|cancel/.test(t)) {
      say("That’s below what I can approve on my own, so I’m bringing in Jordan from our loyalty team. Jordan will see everything we’ve discussed, so you won’t need to repeat anything.");
      handed = true;
      setTimeout(function () { add("sys", "Handed off to Jordan R. (Retention) · summary, churn score and replay attached"); }, 2400);
      setTimeout(function () { add("bot", "<b>Jordan R.</b><br>Hi Maya, I’ve read your conversation. I can’t get to $99, but I can lock $119 for 12 months and add a $15 credit for the surprise."); }, 4400);
    } else if (/85|internet only/.test(t)) {
      say("Done. You’re on Internet 500 only at $85/mo, starting with this bill. You can add TV back anytime.");
      setTimeout(pulse, 2400);
    } else if (/119|keep everything/.test(t)) {
      say("Done. You’re set at $119/mo for the next 12 months, starting with this bill. You’ll get a confirmation email shortly.");
      setTimeout(pulse, 2400);
    } else if (/ok|works|yes|deal|thanks/.test(t)) {
      say("Great, it’s all set. Thanks for sticking with Vantaline.");
      setTimeout(pulse, 2000);
    } else {
      say("Here are the options I can set up right now:");
      setTimeout(cards, 1500);
    }
  }

  function pulse() {
    var c = add("bot", 'One quick question: how likely are you to recommend Vantaline to a friend? <div class="chips" style="margin-top:6px">' +
      [0,1,2,3,4,5,6,7,8,9,10].map(function (n) { return '<button type="button">' + n + "</button>"; }).join("") + "</div>");
    c.querySelectorAll("button").forEach(function (b) { b.addEventListener("click", function () { add("me", b.textContent); say("Thank you, Maya. We’ve noted that the first email didn’t reach you in time, and we’ll pass that on."); }); });
  }

  panel.querySelector("#agent-human").addEventListener("click", function () { add("me", "Talk to a person"); human(); });
  panel.querySelector("#agent-form").addEventListener("submit", function (e) {
    e.preventDefault(); var i = panel.querySelector("#agent-input"); var v = i.value.trim(); if (!v) return; i.value = "";
    if (!started) { started = true; panel.hidden = false; panel.querySelector("#agent-why").textContent = WHY.manual; }
    handle(v);
  });

  document.addEventListener("vl:frustration", function () { start("rage"); });
  if (VL.page === "billing") setTimeout(function () { start("time"); }, 20000);
  window.VLAgent = { open: function () { start("manual"); } };
})();
