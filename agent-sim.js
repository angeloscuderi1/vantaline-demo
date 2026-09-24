/*
 * Simulated Experience Agent: a backup for the future-state story.
 * Loads only when the demo bar is set to Story = Future state and Agent = Simulated backup.
 * Opens when the bill page reports frustration (rage click) or after 20 seconds on the bill page.
 */
(function () {
  "use strict";
  var VL = window.VL || {};
  if (VL.mode !== "future" || VL.agent !== "sim") return;

  var panel = document.createElement("section");
  panel.className = "chat-panel"; panel.hidden = true; panel.id = "agent-panel";
  panel.setAttribute("aria-label", "Vantaline assistant");
  panel.innerHTML = '<header><span>Vantaline · here to help</span><button type="button" aria-label="Close" id="agent-close">✕</button></header>' +
    '<div class="chat-log" id="agent-log" aria-live="polite"></div>' +
    '<form class="chat-form" id="agent-form"><input id="agent-input" autocomplete="off" placeholder="Type a message" aria-label="Message"><button class="btn sm" type="submit">Send</button></form>';
  document.body.appendChild(panel);
  panel.querySelector("#agent-close").addEventListener("click", function () { panel.hidden = true; });
  var log = panel.querySelector("#agent-log"), step = 0, started = false;

  function add(cls, html) { var d = document.createElement("div"); d.className = "cmsg " + cls; d.innerHTML = html; log.appendChild(d); log.scrollTop = log.scrollHeight; return d; }
  function say(html, delay) { setTimeout(function () { add("bot", html); }, delay || 800); }

  function start(reason) {
    if (started) return; started = true; panel.hidden = false;
    add("sys", reason === "rage" ? "Opened after repeated clicks on your bill" : "Opened on your bill page");
    say("Hi Maya, I can see you're looking at your September bill. Your 12-month promotional rate ended on Sep 1, which is why it went from $89.99 to $146.40. Want to see your options?", 500);
    setTimeout(function () {
      var c = add("bot", '<div class="chips"><button type="button" data-a="options">Show my options</button><button type="button" data-a="why">Why wasn\'t I told?</button></div>');
      c.querySelectorAll("button").forEach(function (b) { b.addEventListener("click", function () { handle(b.textContent); }); });
    }, 1400);
  }

  function options() {
    say("I'm sorry that came as a surprise. We emailed you on Aug 11, but I can see it didn't reach you in time. Here's what I can do right now:");
    setTimeout(function () {
      add("bot", "<b>$119/mo</b> keep everything for 12 months<br><b>$85/mo</b> Internet 500 only<br><b>$146.40</b> keep your current plan");
    }, 1500);
  }

  function handle(text) {
    add("me", text.replace(/</g, "&lt;"));
    var t = text.toLowerCase(); step++;
    if (/\b(99|100|105|109)\b|cheaper|lower|less|too much|cancel/.test(t)) {
      say("That's below what I can approve, so I'm bringing in Jordan from our loyalty team. Jordan will see everything we've discussed, so you won't need to repeat anything.");
      setTimeout(function () { add("sys", "Handed off to Jordan R. (Retention) · summary, churn score and replay attached"); }, 2200);
      setTimeout(function () { add("bot", "<b>Jordan R.</b><br>Hi Maya, I've read your conversation. I can't get to $99, but I can lock $119 for 12 months and add a $15 credit for the surprise."); }, 4200);
    } else if (/119|keep everything/.test(t)) {
      say("Done. You're set at $119/mo for the next 12 months, starting with this bill. You'll get a confirmation email shortly.");
      setTimeout(pulse, 2200);
    } else if (/ok|works|yes|deal|thanks/.test(t)) {
      say("Great, it's all set. Thanks for sticking with Vantaline.");
      setTimeout(pulse, 1800);
    } else {
      options();
    }
  }

  function pulse() {
    var c = add("bot", 'One quick question: how likely are you to recommend Vantaline to a friend? <div class="chips" style="margin-top:6px">' +
      [0,1,2,3,4,5,6,7,8,9,10].map(function (n) { return '<button type="button">' + n + "</button>"; }).join("") + "</div>");
    c.querySelectorAll("button").forEach(function (b) { b.addEventListener("click", function () { add("me", b.textContent); say("Thank you, Maya. We've noted that the first email didn't reach you in time, and we'll pass that on."); }); });
  }

  panel.querySelector("#agent-form").addEventListener("submit", function (e) {
    e.preventDefault(); var i = panel.querySelector("#agent-input"); var v = i.value.trim(); if (!v) return; i.value = "";
    if (!started) { started = true; panel.hidden = false; }
    handle(v);
  });

  document.addEventListener("vl:frustration", function () { start("rage"); });
  if (VL.page === "billing") setTimeout(function () { start("time"); }, 20000);
  window.VLAgent = { open: function () { start("manual"); } };
})();
