# Vantaline demo site

A demo website for a fictional telecom, Vantaline Communications, built for an omnichannel experience management demo. Nothing here is a real company, account or offer.

- `billing.html` is the hero page. The "Show line-item details" toggle is intentionally broken so session replay can capture rage clicks.
- The demo bar at the top switches the story between the current state and the future state, and between the Qualtrics agent and a simulated backup agent. Reset clears the rage-click flag and reloads the page.
- In the future state, three fast clicks on the toggle make the page answer: the bill summary is spotlit and the line that changed is explained in place. With the backup agent, the assistant also steps in with the three options as cards.
- `servicenow.html` is a mock case console that stands in for ServiceNow CSM.
- Paste the Qualtrics deployment code into `qualtrics-deploy.js` between the BEGIN and END markers. Every page loads that file.
