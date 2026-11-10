/*
 * Simulated Experience Agent: a backup for the future-state story.
 * Loads only when the demo bar is set to Story = Future and Agent = Backup.
 * It never opens on its own. The bill page opens it when Maya asks a question
 * or accepts help, and it picks up from what the page has already told her.
 */
(function () {
  "use strict";
  var VL = window.VL || {};
  if (VL.mode !== "future" || VL.agent !== "sim") return;

  var panel = document.createElement("section");
  panel.className = "chat-panel agent"; panel.hidden = true; panel.id = "agent-panel";
  panel.setAttribute("aria-label", "Vantaline assistant");
  panel.innerHTML = '<header><div class="ttl"><span class="eye" id="agent-why"></span><span class="h">Your September bill</span></div><button type="button" aria-label="Close" id="agent-close">✕</button></header>' +
    '<div class="agent-note"><span>Automated assistant</span><button type="button" id="agent-human">Talk to a person</button></div>' +
    '<div class="chat-log" id="agent-log" aria-live="polite"></div>' +
    '<form class="chat-form" id="agent-form"><input id="agent-input" autocomplete="off" placeholder="Type a question" aria-label="Message"><button class="btn sm" type="submit">Send</button></form>';
  document.body.appendChild(panel);
  panel.querySelector("#agent-close").addEventListener("click", function () { panel.hidden = true; });
  var log = panel.querySelector("#agent-log"), started = false, handed = false;

  function trace(lane, title, detail, o) { if (VL.trace) VL.trace(lane, title, detail, o); }
  function resolved(price, label, row, delta) {
    document.dispatchEvent(new CustomEvent("vl:resolved", { detail: { price: price, label: label, row: row, delta: delta, via: "assistant" } }));
  }
  function add(cls, html) { var d = document.createElement("div"); d.className = "cmsg " + cls; d.innerHTML = html; log.appendChild(d); log.scrollTop = log.scrollHeight; return d; }
  function say(html, delay) {
    var wait = delay || 650, dots = null;
    setTimeout(function () { dots = add("bot typing", "•••"); }, Math.max(0, wait - 500));
    setTimeout(function () { if (dots) dots.remove(); add("bot", html); }, wait);
  }
  function chips(list) {
    var c = add("bot", '<div class="chips">' + list.map(function (t) { return '<button type="button">' + t + "</button>"; }).join("") + "</div>");
    c.querySelectorAll("button").forEach(function (b) { b.addEventListener("click", function () { c.remove(); handle(b.textContent); }); });
  }
  function focusInput() { setTimeout(function () { try { panel.querySelector("#agent-input").focus({ preventScroll: true }); } catch (e) {} }, 450); }
  var pending = false;   // true only while an offer is on the table, so a bare "yes" never applies anything by accident

  function greet(askFirst) {
    started = true;
    panel.querySelector("#agent-why").textContent = "Picking up from your bill";
    trace("action", "Assistant opened, with the bill context", "It knows she has seen the promo explanation, so it does not repeat it");
    add("bot", "Hi Maya. I can see you’re looking at the promo change on your September bill, so I won’t go over it again." + (askFirst === false ? "" : " What would you like to know?"));
  }

  function start(reason) {
    panel.hidden = false; focusInput();
    if (started) return;
    greet();
    setTimeout(function () { chips(["Why wasn’t I told?", "Can I get it lower than $119?", "Apply the $119 price lock"]); }, 500);
  }

  function human(quiet) {
    panel.hidden = false; focusInput();
    if (handed) return; handed = true;
    if (!started) greet(false);   // opened from "Talk to a person" on the bill: show the chat it started from first
    started = true;
    trace("signal", "Maya asked for a person", "The assistant steps aside");
    trace("action", "Handed to Jordan R., Retention", "Sent with the conversation, churn score and session replay, so she does not repeat herself", { status: "With a person" });
    if (quiet !== true) say("Of course. I’m bringing in Jordan from our loyalty team. Jordan will see everything so far, so you won’t need to repeat anything.", 700);
    setTimeout(function () { add("sys", "Jordan R. (Retention) joined · has your bill and this conversation"); }, 2300);
    setTimeout(function () { pending = true; add("bot", "<b>Jordan R.</b><br>Hi Maya, I’ve read through this, and I’m sorry the notice never reached you. I can lock in $119 a month for the next 12 months right now. Want me to apply it?"); }, 3600);
  }

  function handle(text) {
    add("me", text.replace(/</g, "&lt;"));
    var t = text.toLowerCase();
    var yes = /^(yes|yep|yeah|ok|okay|sure|please|do it|sounds good|deal)\b/.test(t);
    if (/person|human|agent|representative|someone/.test(t)) {
      human();
    } else if (/cancel|leave|switch provider|close my account/.test(t)) {
      trace("signal", "Maya mentioned cancelling", "A person should take this, with everything she has seen so far", { risk: 90 });
      say("I can get that started, and I don’t want to stand in the way. Before anything changes, I’ll bring in someone who can either lower the bill or close the account, whichever you decide.", 700);
      setTimeout(function () { human(true); }, 900);
    } else if (/gateway|modem|router|rental|equipment/.test(t)) {
      say("The $15.00 is the monthly rental for your XB-7 gateway. It was $15.00 last month too, so it isn’t part of the increase. You can use your own compatible modem and drop that charge.");
    } else if (/tax|fee/.test(t)) {
      say("Taxes and fees are $4.40 this month, the same as August. They cover state and local taxes and the regulatory recovery fee.");
    } else if (/due|late|when.*pay|deadline/.test(t)) {
      say("This bill is due Sep 21. If you change your plan today, the new amount is what’s due on that date.");
    } else if (/autopay|auto pay|automatic/.test(t)) {
      say("Autopay is off on your account. Turning it on doesn’t change this bill, but it does mean you won’t miss a due date.");
    } else if (/\btv\b|channel|select/.test(t)) {
      say("TV Select is $42.00 a month, unchanged from August. Dropping it is the Internet 500 only option at $85 a month, and you can add TV back anytime.");
    } else if (/promo|discount|went up|increase|higher|change/.test(t) && !/119|lower|less/.test(t)) {
      say("One thing changed: the 12-month promotional discount of $56.41 ended on Sep 1. Internet, TV, the gateway and taxes are the same as August.");
    } else if (/why/.test(t)) {
      say("You should have been. We emailed you on Aug 11, but I can see it was never opened, and we didn’t follow up. I’m sorry it came as a surprise. I’ve passed that on.");
      trace("memory", "Noted: the Aug 11 notice did not reach her", "Fed back to the billing communications team");
    } else if (/146|current plan|no thanks|nothing/.test(t)) {
      trace("memory", "Maya declined the options", "Saved to her record. No follow-up offers will be sent.", { status: "Declined, respected" });
      say("No problem. Nothing changes, and I won’t ask again. The options stay on your bill if you change your mind.");
    } else if (/\b(99|100|105|109)\b|cheaper|lower|less|too much/.test(t)) {
      trace("decision", "Request is below the assistant’s limit", "Bring in a person instead of saying no");
      say("That’s below what I can approve on my own, so rather than say no I’ll bring in someone who can.", 800);
      setTimeout(function () { human(true); }, 900);
    } else if (/85|internet only/.test(t)) {
      say("Done. You’re on Internet 500 only at $85/mo, starting with this bill. You can add TV back anytime.");
      resolved(85, "Internet 500 only", "TV Select removed, new plan price", -61.40);
    } else if (/119|keep everything|apply|lock/.test(t) || (yes && pending)) {
      pending = false;
      say("Done. You’re set at $119/mo for the next 12 months, starting with this bill. You’ll see it update on the page now.");
      resolved(119, "Keep everything, 12-month price lock", "12-month price lock", -27.40);
    } else if (/thanks|thank you/.test(t)) {
      say("You’re welcome, Maya.");
    } else if (yes) {
      say("Happy to. Which would you like: the $119 price lock that keeps everything, or Internet 500 only at $85?");
    } else {
      say("I’m not sure I have that one right, and I’d rather not guess about your bill. I can explain any line on it, apply one of the two lower-price options, or bring in a person.");
    }
  }

  panel.querySelector("#agent-human").addEventListener("click", function () { add("me", "Talk to a person"); human(); });
  panel.querySelector("#agent-form").addEventListener("submit", function (e) {
    e.preventDefault(); var i = panel.querySelector("#agent-input"); var v = i.value.trim(); if (!v) return; i.value = "";
    started = true; handle(v);
  });

  window.VLAgent = { open: start, human: human };
})();
