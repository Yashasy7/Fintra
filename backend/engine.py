import pandas as pd
import networkx as nx
from datetime import timedelta

def analyze_transactions(df):
    # 1. Build the Directed Graph
    G = nx.DiGraph()
    for _, row in df.iterrows():
        G.add_edge(row['sender_id'], row['receiver_id'], 
                   amount=row['amount'], 
                   timestamp=pd.to_datetime(row['timestamp']),
                   tx_id=row['transaction_id'])

    suspicious_accounts = {}
    fraud_rings = []
    ring_counter = 1

    # --- PATTERN 1: Circular Fund Routing (Cycles 3-5) ---
    # We use simple_cycles which finds all elementary circuits
    cycles = list(nx.simple_cycles(G))
    for cycle in cycles:
        if 3 <= len(cycle) <= 5:
            ring_id = f"RING_{ring_counter:03d}"
            fraud_rings.append({
                "ring_id": ring_id,
                "member_accounts": cycle,
                "pattern_type": "cycle",
                "risk_score": 95.0
            })
            for node in cycle:
                suspicious_accounts[node] = {
                    "account_id": node,
                    "suspicion_score": 95.0,
                    "detected_patterns": [f"cycle_length_{len(cycle)}"],
                    "ring_id": ring_id
                }
            ring_counter += 1

    # --- PATTERN 2: Smurfing (Fan-in / Fan-out) ---
    for node in G.nodes():
        # Fan-in: Many senders to one receiver
        in_edges = G.in_edges(node, data=True)
        if len(in_edges) >= 10:
            # Temporal check: transactions within 72 hours
            times = sorted([data['timestamp'] for _, _, data in in_edges])
            if (times[-1] - times[0]) <= timedelta(hours=72):
                ring_id = f"RING_{ring_counter:03d}"
                suspicious_accounts[node] = {
                    "account_id": node,
                    "suspicion_score": 85.0,
                    "detected_patterns": ["high_velocity_fan_in"],
                    "ring_id": ring_id
                }
                ring_counter += 1

    # --- PATTERN 3: Layered Shell Networks ---
    # Chains of 3+ hops where intermediate nodes have low transaction counts
    for node in G.nodes():
        if G.in_degree(node) == 1 and G.out_degree(node) == 1:
            # Potential intermediate shell account
            suspicious_accounts[node] = {
                "account_id": node,
                "suspicion_score": 70.0,
                "detected_patterns": ["shell_layering"],
                "ring_id": "LAYER_CHAIN"
            }

    return suspicious_accounts, fraud_rings