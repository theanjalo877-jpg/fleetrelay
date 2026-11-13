# FleetRelay — Fleet response prototype

An Anjalo Theophine Wilson project demo.

A map-first portfolio prototype showing how a passenger-transport operator could coordinate a replacement vehicle, backup driver and recovery unit during a breakdown. Tailored demonstrations and proposed adaptations can be discussed with prospective business clients on request, based on their operational priorities.

## Try the demo
1. Select **Try a breakdown scenario**.
2. Compare the backup buses. B03 is nearer but conflicts with another pickup; V02 has too few seats.
3. Select **Approve & notify B07**.
4. Open **Driver app**, then **Accept job**. Close it to watch the bus travel.
5. Select **Send recovery request**. In Driver app choose **Recovery driver**, accept and return to the map.
6. After arrival, confirm the passenger transfer. Then confirm vehicle recovery.
7. Download the response report, inspect Fleet / Activity, or restart.

Try declining the first backup request to see the alternative recommendation. Declining both suitable drivers requires manual follow-up. Declining recovery requires a simulated availability recheck.

## Run with Streamlit
Use Python 3.11 or newer:

```sh
pip install -r requirements.txt
streamlit run app.py
```

## GitHub and Streamlit Community Cloud
Create a **new repository named `fleetrelay`**, separate from VerifyDesk. Upload the extracted files from this folder to the repository root — **not the ZIP itself**. Keep `app.py` and `fleetrelay.html` together.

On Streamlit Community Cloud, create a new app from this repository, choose the `main` branch and `app.py` as the main file. No API keys or secrets are required. The app uses Streamlit 1.67.0; choose Python 3.11 or newer.

## Technology
Python / Streamlit host; JavaScript state machine; high-DPI Canvas 2D vector map; requestAnimationFrame vehicle motion; CSS transitions; responsive UI; native HTML dialogs; JSON report export. No paid mapping SDK, GPS hardware or backend is needed for the demo. The illustrative vector map is original and is not geographic navigation data. Optional Google Fonts requests fall back to local sans-serif fonts if unavailable.

## Honest scope
- All vehicles, drivers, positions, routes, ETAs and notifications are fictional.
- The assistant uses deterministic rules, **not a connected AI model**. The prototype demonstrates an AI-assisted product concept without claiming live AI capabilities.
- The selection checks 28-passenger capacity, driver availability and an illustrative 35-minute response-service allowance against the next assignment.
- Driver accounts are simulated views on one device, not authenticated logins. No push messages or SMS are sent.
- Travel is accelerated to 28/38 seconds; displayed arrival estimates are scenario values, not calculated traffic predictions.
- Refresh clears all state. Reports are generated locally and only downloaded on request.
- No emergency dispatch, signal control, real-time tracking or operational safety guarantee is provided.
- Reduced-motion preferences pause the simulation initially; Resume motion starts it.

## Production requirements
Authenticated accounts and permissions; consented location telemetry; licensed mapping/routing; driver eligibility and duty checks; reliable notification delivery and timeout escalation; secure server-side state and audit logs; privacy/retention controls; incident procedures; integration and field testing. Business suitability and requirements must be validated with operators before production use.

## Validation
Run `node test_workflow.cjs` to check the state machine, eligibility, rejection, arrival and handover ordering. The frontend has no build step. `fleetrelay.html` can also be opened directly in a modern browser.
