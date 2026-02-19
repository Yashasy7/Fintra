import pandas as pd
import networkx as nx
from datetime import timedelta

def analyze_transactions(df):
    # Standardize column names
    df.columns = df.columns.str.strip()
    
    # 1. Build the Directed Graph
    G = nx.DiGraph()
    for _, row in df.iterrows():
        G.add_edge(row['sender_id'], row['receiver_id'], 
                   amount=float(row['amount']), 
                   timestamp=pd.to_datetime(row['timestamp']),
                   tx_id=row['transaction_id'])

    suspicious_accounts = {}
    fraud_rings = []
    ring_counter = 1

    # --- PATTERN 1: Circular Fund Routing (Cycles 3-5) ---
    cycles = list(nx.simple_cycles(G))
    for cycle in cycles:
        if 3 <= len(cycle) <= 5:
            ring_id = f"RING_{ring_counter:03d}"
            fraud_rings.append({
                "ring_id": ring_id,
                "member_accounts": [str(node) for node in cycle],
                "pattern_type": "cycle",
                "risk_score": 95.3
            })
            for node in cycle:
                suspicious_accounts[node] = {
                    "account_id": str(node),
                    "suspicion_score": 95.3,
                    "detected_patterns": [f"cycle_length_{len(cycle)}"],
                    "ring_id": ring_id
                }
            ring_counter += 1

    # --- PATTERN 2: Smurfing (Fan-in / Fan-out) ---
    for node in G.nodes():
        in_edges = G.in_edges(node, data=True)
        if len(in_edges) >= 10:
            times = sorted([data['timestamp'] for _, _, data in in_edges])
            if (times[-1] - times[0]) <= timedelta(hours=72):
                ring_id = f"RING_{ring_counter:03d}"
                # Cycle pattern takes priority over smurfing for scoring
                if node not in suspicious_accounts or suspicious_accounts[node]["suspicion_score"] < 87.5:
                    suspicious_accounts[node] = {
                        "account_id": str(node),
                        "suspicion_score": 87.5,
                        "detected_patterns": ["high_velocity"],
                        "ring_id": ring_id
                    }
                ring_counter += 1

    # --- PATTERN 3: Layered Shell Networks ---
    for node in G.nodes():
        if G.in_degree(node) == 1 and G.out_degree(node) == 1:
            if node not in suspicious_accounts:
                suspicious_accounts[node] = {
                    "account_id": str(node),
                    "suspicion_score": 65.0,
                    "detected_patterns": ["shell_layering"],
                    "ring_id": "LAYER_CHAIN"
                }

    return suspicious_accounts, fraud_rings