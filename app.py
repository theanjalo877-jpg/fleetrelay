from pathlib import Path
import streamlit as st

st.set_page_config(page_title="FleetRelay | Fleet response demo", page_icon="↗", layout="wide", initial_sidebar_state="collapsed")
st.html('''<style>
.stApp,[data-testid="stAppViewContainer"]{background:#e7ebdf!important}
[data-testid="stMainBlockContainer"]{max-width:100%!important;padding:0!important}
[data-testid="stVerticalBlock"]{gap:0!important}
[data-testid="stHeader"]{display:none!important}
iframe[title="FleetRelay interactive fleet demo"]{display:block;width:100%!important;height:100dvh!important;min-height:640px;border:0!important}
[data-testid="stElementContainer"]:has(iframe){height:100dvh!important;min-height:640px}
</style>''')
st.iframe(Path(__file__).with_name("fleetrelay.html"), height=1000, alt="FleetRelay interactive fleet demo")
