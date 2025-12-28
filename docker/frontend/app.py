import streamlit as st
import requests
import os

BACKEND_URL = os.getenv("BACKEND_URL", "http://backend:8000")

st.set_page_config(page_title="Cloud Ninjas", page_icon="⚔️")

st.title("⚔️ Cloud Ninjas Platform")
st.subheader("DevOps Microservices Demo")

# Health Check
if st.button("Check Backend Health"):
    try:
        r = requests.get(f"{BACKEND_URL}/health")
        st.success(r.json())
    except:
        st.error("Backend not reachable")

# Add Item
st.subheader("Add Item")

name = st.text_input("Item name")
price = st.number_input("Price", 1, 10000)

if st.button("Save Item"):
    payload = {"name": name, "price": price}
    r = requests.post(f"{BACKEND_URL}/items", json=payload)
    st.success("Item saved")

# View Items
if st.button("View Items"):
    r = requests.get(f"{BACKEND_URL}/items")
    st.json(r.json())

