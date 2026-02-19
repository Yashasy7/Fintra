from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
import time
from engine import analyze_transactions

app = FastAPI()

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze")
async def upload_csv(file: UploadFile = File(...)):
    start_time = time.time()
    
    # Read the CSV upload
    content = await file.read()
    df = pd.read_csv(io.BytesIO(content))
    
    # 1. Run the Detection Engine (Member 1's Graph Logic)
    suspicious_map, fraud_rings = analyze_transactions(df)
    
    # 2. Build FULL Graph for Professional Visualization
    # Extract unique accounts from both columns
    unique_accounts = list(set(df['sender_id']).union(set(df['receiver_id'])))
    
    # Map every transaction to a real edge
    edges = [
        {
            "source": str(row['sender_id']),
            "target": str(row['receiver_id']),
            "amount": float(row['amount']),
            "transaction_id": str(row['transaction_id'])
        }
        for _, row in df.iterrows()
    ]
    
    # 3. Sort suspicious accounts by score (Mandatory Requirement)
    suspicious_list = sorted(
        suspicious_map.values(), 
        key=lambda x: x['suspicion_score'], 
        reverse=True
    )
    
    end_time = time.time()
    processing_time = round(end_time - start_time, 4)
    
    # 4. Final Return Block with "graph" upgrade
    return {
        "suspicious_accounts": suspicious_list,
        "fraud_rings": fraud_rings,
        "graph": {
            "nodes": [{"id": str(n)} for n in unique_accounts],
            "edges": edges
        },
        "summary": {
            "total_accounts_analyzed": len(unique_accounts),
            "suspicious_accounts_flagged": len(suspicious_list),
            "fraud_rings_detected": len(fraud_rings),
            "processing_time_seconds": processing_time
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)