from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
import time
from engine import analyze_transactions

app = FastAPI()

# IMPORTANT: Allow Member 2's Frontend to talk to your Backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze")
async def upload_csv(file: UploadFile = File(...)):
    start_time = time.time()
    
    # Read CSV
    content = await file.read()
    df = pd.read_csv(io.BytesIO(content))
    
    # Run Member 1's Graph Engine
    suspicious_map, fraud_rings = analyze_transactions(df)
    
    # Format according to RIFT requirements
    suspicious_list = sorted(suspicious_map.values(), 
                             key=lambda x: x['suspicion_score'], 
                             reverse=True)
    
    end_time = time.time()
    
    return {
        "suspicious_accounts": suspicious_list,
        "fraud_rings": fraud_rings,
        "summary": {
            "total_accounts_analyzed": len(df['sender_id'].unique()) + len(df['receiver_id'].unique()),
            "suspicious_accounts_flagged": len(suspicious_list),
            "fraud_rings_detected": len(fraud_rings),
            "processing_time_seconds": round(end_time - start_time, 2)
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)