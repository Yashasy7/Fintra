from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
import time
from engine import analyze_transactions

app = FastAPI(title="RIFT 2026 Forensic Engine - Production")

# ✅ Mandatory for Hackathon: Enable CORS so the Frontend can communicate with Backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://fintra-plum.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze")
async def upload_csv(file: UploadFile = File(...)):
    """
    Primary endpoint for RIFT 2026.
    Processes CSV -> Detects Fraud -> Returns Analysis + Full Graph Overlay.
    """
    start_time = time.time()
    
    # 1. Validate File Format
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Disqualified: System only accepts CSV format.")
    
    try:
        # Read the uploaded CSV data
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))
        
        # Clean column names (removes hidden spaces from CSV headers)
        df.columns = df.columns.str.strip()
        
        # 2. RUN DETECTION ENGINE (Member 1's Core Logic)
        # This handles Cycles, Smurfing, and Merchant Filtering
        suspicious_map, fraud_rings = analyze_transactions(df)
        
        # 3. BUILD FULL NETWORK OVERLAY (The "Professional Upgrade")
        # Extract unique accounts from the entire dataset
        unique_nodes = list(set(df['sender_id']).union(set(df['receiver_id'])))
        
        # Serialize every single transaction into a graph edge
        # We include 'amount' so Member 2 can vary edge thickness in UI
        edges = [
            {
                "source": str(row['sender_id']),
                "target": str(row['receiver_id']),
                "amount": float(row['amount']),
                "transaction_id": str(row['transaction_id'])
            }
            for _, row in df.iterrows()
        ]
        
        # 4. SORT SUSPICIOUS LIST
        # Mandatory Requirement: Sorted by suspicion_score in DESCENDING order
        suspicious_list = sorted(
            suspicious_map.values(), 
            key=lambda x: x['suspicion_score'], 
            reverse=True
        )

        # Enforce strict schema for suspicious_accounts
        suspicious_accounts_json = [
            {
                "account_id": str(acc["account_id"]),
                "suspicion_score": float(acc["suspicion_score"]),
                "detected_patterns": list(acc["detected_patterns"]),
                "ring_id": str(acc["ring_id"])
            }
            for acc in suspicious_list
        ]

        # Enforce strict schema for fraud_rings
        fraud_rings_json = [
            {
                "ring_id": str(ring["ring_id"]),
                "member_accounts": [str(a) for a in ring["member_accounts"]],
                "pattern_type": str(ring["pattern_type"]),
                "risk_score": float(ring["risk_score"])
            }
            for ring in fraud_rings
        ]

        processing_time = round(time.time() - start_time, 4)

        # 5. FINAL RETURN: The "Winning" Response
        return {
            "suspicious_accounts": suspicious_accounts_json,
            "fraud_rings": fraud_rings_json,
            "graph": {
                "nodes": [{"id": str(n)} for n in unique_nodes],
                "edges": edges
            },
            "summary": {
                "total_accounts_analyzed": len(unique_nodes),
                "suspicious_accounts_flagged": len(suspicious_accounts_json),
                "fraud_rings_detected": len(fraud_rings_json),
                "processing_time_seconds": processing_time
            }
        }
        
    except Exception as e:
        # Standard error handling to prevent API crashes during judging
        raise HTTPException(status_code=500, detail=f"Engine Error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    # Host on 0.0.0.0 to ensure accessibility after deployment
    uvicorn.run(app, host="0.0.0.0", port=8000)