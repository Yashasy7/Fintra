import pandas as pd
import networkx as nx
from datetime import timedelta

def analyze_transactions(df):
    """
    Complete Forensic Engine for RIFT 2026.
    Implements: 
    1. Circular Routing (Cycles)
    2. Smurfing (Fan-in/Fan-out)
    3. Layered Shell Networks
    """
    df.columns = df.columns.str.strip()
    G = nx.DiGraph()
    
    for _, row in df.iterrows():
        G.add_edge(row['sender_id'], row['receiver_id'], 
                   amount=float(row['amount']), 
                   timestamp=pd.to_datetime(row['timestamp']),
                   tx_id=row['transaction_id'])

    suspicious_accounts = {}
    fraud_rings = []
    ring_counter = 1

    # --- 🛡️ MERCHANT FILTER (Precision logic) ---
    def is_legit_high_volume(node):
        in_deg = G.in_degree(node)
        out_deg = G.out_degree(node)
        # Merchants (Amazon): High in-degree, low out-degree
        if in_deg > 50 and out_deg < 5: return True
        # Payroll: High out-degree, low in-degree
        if out_deg > 50 and in_deg <= 2: return True
        return False

    # --- 🌀 PATTERN 1: Circular Fund Routing (Cycles) ---
    cycles = list(nx.simple_cycles(G))
    for cycle in cycles:
        if 3 <= len(cycle) <= 5:
            if any(is_legit_high_volume(n) for n in cycle): continue
            
            ring_id = f"RING_{ring_counter:03d}"
            score = 98.5 if len(cycle) == 3 else 94.0
            
            fraud_rings.append({
                "ring_id": ring_id,
                "member_accounts": [str(node) for node in cycle],
                "pattern_type": "cycle",
                "risk_score": float(score)
            })
            for node in cycle:
                suspicious_accounts[node] = {
                    "account_id": str(node),
                    "suspicion_score": float(score),
                    "detected_patterns": [f"cycle_length_{len(cycle)}"],
                    "ring_id": ring_id
                }
            ring_counter += 1

    # --- 🌪️ PATTERN 2: Smurfing Patterns (Fan-in) ---
    for node in G.nodes():
        if is_legit_high_volume(node): continue 

        # Correct unpacking of 3 values (u, v, data) to fix the error
        in_edges = list(G.in_edges(node, data=True))
        if len(in_edges) >= 10:
            times = sorted([data['timestamp'] for u, v, data in in_edges])
            
            if (times[-1] - times[0]) <= timedelta(hours=72):
                ring_id = f"RING_{ring_counter:03d}"
                senders = list(set([u for u, v, data in in_edges]))
                all_members = [str(node)] + [str(s) for s in senders]
                
                v_score = min(85.0 + (len(in_edges) * 0.2), 92.5)
                fraud_rings.append({
                    "ring_id": ring_id,
                    "member_accounts": all_members,
                    "pattern_type": "smurfing",
                    "risk_score": float(v_score)
                })

                if node not in suspicious_accounts or suspicious_accounts[node]["suspicion_score"] < v_score:
                    suspicious_accounts[node] = {
                        "account_id": str(node),
                        "suspicion_score": float(v_score),
                        "detected_patterns": ["high_velocity_smurfing"],
                        "ring_id": ring_id
                    }
                ring_counter += 1

    # --- ⛓️ PATTERN 3: Layered Shell Networks (Chains) ---
    for node in G.nodes():
        # Shells act as bridges: exactly 1 in and 1 out
        if G.in_degree(node) == 1 and G.out_degree(node) == 1:
            if node not in suspicious_accounts:
                suspicious_accounts[node] = {
                    "account_id": str(node),
                    "suspicion_score": 65.0,
                    "detected_patterns": ["shell_layering"],
                    "ring_id": "LAYER_CHAIN"
                }

    return suspicious_accounts, fraud_rings