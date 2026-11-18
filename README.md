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
7. Download the management PDF report, inspect Fleet / Activity, or restart.

Try declining the first backup request to see the alternative recommendation. Declining both suitable drivers requires manual follow-up. Declining recovery requires a simulated availability recheck.

## Run with Streamlit
Use Python 3.11 or newer:

```sh
pip install -r requirements.txt
streamlit run app.py
```

## Hosting

On Streamlit Community Cloud, deploy this repository from the `main` branch with
`app.py` as the entry point. Keep `fleetrelay.html` beside it. The frontend is also
a standalone page and can be served over HTTPS. No map API key is required for
the demo.

## Map

FleetRelay uses [Leaflet](https://leafletjs.com/),
[MapLibre](https://maplibre.org/) and [OpenFreeMap](https://openfreemap.org/)
vector tiles based on OpenStreetMap. The map centers on Al Ain and uses English
place names or Latin-script transliterations when available. Drag and zoom to explore, select a vehicle marker to inspect its
assignment, or use the reset control to fit the fleet. The breakdown pulse,
moving vehicles and animated response paths use the scenario clock. The map
requires internet access, and the simulation panel stays available if tiles
fail or the browser cannot render the vector map.

## Honest scope
- The street map is real. All vehicles, drivers, positions, paths, ETAs and notifications are fictional. Response paths illustrate the workflow and do not follow calculated road routes.
- The assistant uses deterministic rules, **not a connected AI model**. The prototype demonstrates an AI-assisted product concept without claiming live AI capabilities.
- The selection checks 28-passenger capacity, driver availability and an illustrative 35-minute response-service allowance against the next assignment.
- Driver accounts are simulated views on one device, not authenticated logins. No push messages or SMS are sent.
- Travel is accelerated to 28/38 seconds; displayed arrival estimates are scenario values, not calculated traffic predictions.
- Refresh clears all state. PDF reports are generated locally and only downloaded on request. They include a plain-English summary, outstanding actions, selection rationale and a chronological timeline. Embedded subset fonts are derived from Liberation Sans under the SIL Open Font License; attribution and licence text are included in the HTML source.
- No emergency dispatch, signal control, real-time tracking or operational safety guarantee is provided.
- Reduced-motion preferences pause the simulation initially; Resume motion starts it.

## Production requirements
Authenticated accounts and permissions; consented location telemetry; licensed mapping/routing; driver eligibility and duty checks; reliable notification delivery and timeout escalation; secure server-side state and audit logs; privacy/retention controls; incident procedures; integration and field testing. Business suitability and requirements must be validated with operators before production use.

## Validation
Run `node test_workflow.cjs` to check the state machine, eligibility, rejection, arrival and handover ordering. The frontend has no build step. `fleetrelay.html` can also be opened directly in a modern browser.
