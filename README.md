# Vantaline demo site

A demo website for a fictional telecom, Vantaline Communications, built for an omnichannel experience management demo. Nothing here is a real company, account or offer.

- `billing.html` is the hero page. The "Show line-item details" toggle is intentionally broken so session replay can capture rage clicks.
- The demo bar at the top switches the story between the current state and the future state, and between the Qualtrics agent and a simulated backup agent. Reset clears the rage-click flag and reloads the page.
- In the future state, three fast clicks on the toggle make the page answer: the bill summary is spotlit and the line that changed is explained in place. With the backup agent, the assistant also steps in with the three options as cards.
- `servicenow.html` is a mock case console that stands in for ServiceNow CSM.
- Paste the Qualtrics deployment code into `qualtrics-deploy.js` between the BEGIN and END markers. Every page loads that file.

## Future-state story on the bill page
- A bill-shock pop-up appears about two seconds after the page loads. "Lower my bill" opens the agent (the backup agent, or the Qualtrics intercept via `window.VL.qualtricsAssist`); "Show me what changed" explains the bill in place.
- `agent-trace.js` is the "Behind the scenes" panel: a live log of what the Experience Agent sees, decides and does. Other scripts report steps with `VL.trace(lane, title, detail)`. It is simulated.
- When the backup agent applies an option, the bill on the page updates (amount due, summary row, total).
- Photos in `assets/` are by Vitaly Gariev on Unsplash, used under the Unsplash License.
