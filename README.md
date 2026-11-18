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
`app.py` as the entry point. Keep `fleetrelay.html` and `al_ain_map.json` beside it. The frontend is also
a standalone page and can be served over HTTPS. No map API key is required for
the demo.

## Map

The **Map language** control switches between English and Arabic without
restarting the drill. Arabic uses local Arabic names where present. The bundled
map covers the Al Ain demonstration area and renders with Leaflet Canvas,
without WebGL or live tile requests. Keep `al_ain_map.json` next to the HTML
file for static hosting. The Streamlit wrapper embeds it in the map iframe.

The bundled geographic extract comes from OpenFreeMap's November 15, 2026
OpenMapTiles snapshot. The source tile template and coverage are recorded in
`al_ain_map.json`. Geographic data is © OpenStreetMap contributors, available under
the [Open Database License](https://www.openstreetmap.org/copyright).
[OpenFreeMap](https://openfreemap.org/) and [OpenMapTiles](https://openmaptiles.org/)
are credited on the map.

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

## School transport drill

Open **School drill** and select one of five example schools. The three yellow
buses use fictional driver names and licence numbers. Hover or tap a marker
to inspect its driver and passenger count. Use **Fleet** for Mulkiya, insurance,
driver licence, vehicle inspection, oil-change and scheduled-service checks.

Start the drill to watch a simulated traffic queue, then supervise unloading
at the demonstration gate and confirm the handover. Schools are examples only.
The route paths and gates are illustrative, and the drill contains no children's
names, addresses, home pins or live telemetry. The drill demonstrates the
district-level dispatch view. It does not implement production accounts or
permissions for private stops.

## Live pilot

Open **Live desk** on the private FleetRelay site. The site owner should select
**Set up management** before granting any other accounts site access. Create a
school run and copy its one-time driver link. The driver opens it in an authorized
browser, signs in to the site if prompted, accepts the assignment, and starts
GPS sharing while safely stopped. Use a second device to see positions update.
The run list refreshes every 3 seconds, identifies stale positions after 45
seconds, and displays GPS accuracy. The latest position is cleared on stop or
run removal. The pilot has one manager and stores no student records or location
history. Use only test or appropriately authorized driver data.

The driver page is a foreground browser pilot. Screen wake is requested when
available, but background or locked-screen tracking depends on the phone and is
not guaranteed. Third-party recovery contacts open a call or an editable
WhatsApp draft and do not send automatically.

The Sites deployment uses the Worker assembled by
`node live/build.mjs . <worker-output.mjs>` and its D1 migration in
`live/drizzle`. The existing Streamlit simulator links to the hosted live desk.
Public campus pins in the demo use the published Al Ain Juniors and Al Dhafra
school pins and published GEMS Our Own and Al Sanawbar location data. The Indian
School marker uses the nearby public bus stop pending campus-pin verification. Pickup icons and
routes are fictional.
