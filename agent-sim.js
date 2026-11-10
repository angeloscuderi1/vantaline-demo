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
    var wait = delay || 900, dots = null;
    setTimeout(function () { dots = add("bot typing", "•••"); }, Math.max(0, wait - 700));
    setTimeout(function () { if (dots) dots.remove(); add("bot", html); }, wait);
  }
  function chips(list) {
    var c = add("bot", '<div class="chips">' + list.map(function (t) { return '<button type="button">' + t + "</button>"; }).join("") + "</div>");
    c.querySelectorAll("button").forEach(function (b) { b.addEventListener("click", function () { handle(b.textContent); }); });
  }

  function start(reason) {
    panel.hidden = false;
    if (started) return;
    started = true;
    panel.querySelector("#agent-why").textContent = "Picking up from your bill";
    trace("action", "Assistant opened, with the bill context", "It knows she has seen the promo explanation, so it does not repeat it");
    add("bot", "Hi Maya. I can see you’re looking at the promo change on your September bill, so I won’t go over it again. What would you like to know?");
    setTimeout(function () { chips(["Why wasn’t I told?", "Can I get it lower than $119?", "Apply the $119 price lock"]); }, 500);
  }

  function human() {
    panel.hidden = false;
    if (handed) return; handed = true; started = true;
    trace("signal", "Maya asked for a person", "The assistant steps aside");
    trace("action", "Handed to Jordan R., Retention", "Sent with the conversation, churn score and session replay, so she does not repeat herself", { status: "With a person" });
    say("Of course. I’m bringing in Jordan from our loyalty team. Jordan will see everything so far, so you won’t need to repeat anything.", 700);
    setTimeout(function () { add("sys", "Jordan R. (Retention) joined · has your bill and this conversation"); }, 2300);
    setTimeout(function () { add("bot", "<b>Jordan R.</b><br>Hi Maya, I’ve read through this. I can lock $119 for 12 months and add a $15 credit for the surprise. Want me to apply it?"); }, 4300);
  }

  function handle(text) {
    add("me", text.replace(/</g, "&lt;"));
    var t = text.toLowerCase();
    if (/person|human|agent|representative|someone/.test(t)) {
      human();
    } else if (/why/.test(t)) {
      say("You should have been. We emailed you on Aug 11, but I can see it was never opened, and we didn’t follow up. I’m sorry it came as a surprise. I’ve passed that on.");
      trace("memory", "Noted: the Aug 11 notice did not reach her", "Fed back to the billing communications team");
    } else if (/146|current plan|no thanks|nothing/.test(t)) {
      trace("memory", "Maya declined the options", "Saved to her record. No follow-up offers will be sent.", { status: "Declined, respected" });
      say("No problem. Nothing changes, and I won’t ask again. The options stay on your bill if you change your mind.");
    } else if (/\b(99|100|105|109)\b|cheaper|lower|less|too much|cancel/.test(t)) {
      trace("decision", "Request is below the assistant’s limit", "Bring in a person instead of saying no");
      say("That’s below what I can approve on my own, so rather than say no I’ll bring in someone who can.", 800);
      setTimeout(human, 1500);
    } else if (/85|internet only/.test(t)) {
      say("Done. You’re on Internet 500 only at $85/mo, starting with this bill. You can add TV back anytime.");
      resolved(85, "Internet 500 only", "TV Select removed, new plan price", -61.40);
    } else if (/119|keep everything|apply|yes|ok|deal/.test(t)) {
      say("Done. You’re set at $119/mo for the next 12 months, starting with this bill. You’ll see it update on the page now.");
      resolved(119, "Keep everything, 12-month price lock", "12-month price lock", -27.40);
    } else if (/thanks|thank you/.test(t)) {
      say("You’re welcome, Maya.");
    } else {
      say("I can explain anything on this bill, apply one of the options listed under the promotional discount line, or bring in a person. Which would help?");
    }
  }

  panel.querySelector("#agent-human").addEventListener("click", function () { add("me", "Talk to a person"); human(); });
  panel.querySelector("#agent-form").addEventListener("submit", function (e) {
    e.preventDefault(); var i = panel.querySelector("#agent-input"); var v = i.value.trim(); if (!v) return; i.value = "";
    started = true; handle(v);
  });

  window.VLAgent = { open: start, human: human };
})();
