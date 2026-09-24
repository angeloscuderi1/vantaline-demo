# Vantaline demo site

A demo website for a fictional telecom, Vantaline Communications, built for an omnichannel experience management demo. Nothing here is a real company, account or offer.

- `billing.html` is the hero page. The "Show line-item details" toggle is intentionally broken so session replay can capture rage clicks.
- The demo bar at the top switches the story between the current state and the future state, and between the Qualtrics agent and a simulated backup agent.
- `servicenow.html` is a mock case console that stands in for ServiceNow CSM.
- Paste the Qualtrics deployment code into `qualtrics-deploy.js` between the BEGIN and END markers. Every page loads that file.
