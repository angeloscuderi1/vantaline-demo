# Vantaline demo site

A demo website for a fictional telecom, Vantaline Communications, built for an omnichannel experience management demo. Nothing here is a real company, account or offer.

- `billing.html` is the hero page. The "Show line-item details" toggle is intentionally broken so session replay can capture rage clicks.
- The demo bar at the top switches the story between the current state and the future state, and between the Qualtrics agent and a simulated backup agent. Reset clears the rage-click flag and reloads the page.
- In the future state, three fast clicks on the toggle make the page answer: the bill summary is spotlit and the line that changed is explained in place. With the backup agent, the assistant also steps in with the three options as cards.
- `servicenow.html` is a mock case console that stands in for ServiceNow CSM.
- Paste the Qualtrics deployment code into `qualtrics-deploy.js` between the BEGIN and END markers. Every page loads that file.

## Future-state story on the bill page
The help is one thread that gets louder only if Maya needs it:
1. **Quiet:** a line under the amount due, "$56.41 more than last month. See why".
2. **Nudge:** after 12 seconds without acting, that line becomes easier to spot.
3. **Helper:** on "See why", or three fast clicks on the dead details link, the explanation opens under the promotional discount line, followed by the options. Picking one updates the bill in place.
4. **Pop-up:** only if she is still stuck 30 seconds after the helper opened, or rage-clicks again.

The assistant never opens by itself. "Ask a question" or the pop-up opens it (the backup agent, or the Qualtrics intercept via `window.VL.qualtricsAssist`).

Presenter controls sit in the demo bar: **Next step** moves the story on without waiting, and **Behind the scenes** shows a strip along the bottom (`agent-trace.js`) logging what the Experience Agent sees, decides and does. Scripts report steps with `VL.trace(lane, title, detail)`. It is simulated and off by default.

Photos in `assets/` are by Vitaly Gariev on Unsplash, used under the Unsplash License.
