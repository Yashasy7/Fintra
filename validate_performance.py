#!/usr/bin/env python3
"""
Validation Script for Fintra Fraud Detection System
Tests the system against the following requirements:
1. Processing Time ≤ 30 seconds (datasets up to 10K transactions)
2. Precision Target ≥ 70%
3. Recall Target ≥ 60%
4. False Positive Control - Must NOT flag legitimate accounts
"""

import pandas as pd
import sys
import time
sys.path.insert(0, '/Users/vishalprajwal/Documents/Fintra/backend')

from engine import analyze_transactions, calculate_metrics, KNOWN_FRAUD_PATTERNS, KNOWN_LEGITIMATE

def print_header(text):
    print(f"\n{'='*60}")
    print(f"  {text}")
    print(f"{'='*60}")

def validate_performance():
    """Run performance validation on test dataset"""
    print_header("Running Performance Validation")
    
    # Load test data
    test_file = '/Users/vishalprajwal/Documents/Fintra/test_data.csv'
    df = pd.read_csv(test_file)
    
    print(f"\n📊 Dataset Info:")
    print(f"   Total Transactions: {len(df)}")
    print(f"   Unique Accounts: {len(set(df['sender_id']).union(set(df['receiver_id'])))}")
    print(f"   Date Range: {df['timestamp'].min()} to {df['timestamp'].max()}")
    
    # Measure processing time
    print(f"\n⏱️  Processing Time Test:")
    start = time.time()
    suspicious_map, fraud_rings = analyze_transactions(df)
    processing_time = time.time() - start
    
    print(f"   Processing Time: {processing_time:.4f} seconds")
    print(f"   Target: ≤ 30 seconds")
    
    if processing_time <= 30:
        print(f"   ✅ PASS: Processing time meets target")
    else:
        print(f"   ❌ FAIL: Processing time exceeds 30 seconds")
    
    return suspicious_map, fraud_rings, processing_time

def validate_metrics(suspicious_map, fraud_rings):
    """Calculate and display metrics"""
    print_header("Calculating Metrics")
    
    metrics = calculate_metrics(suspicious_map, fraud_rings)
    
    print(f"\n📈 Precision & Recall Metrics:")
    print(f"   Precision: {metrics['precision']:.2%} (Target: ≥ 70%)")
    print(f"   Recall: {metrics['recall']:.2%} (Target: ≥ 60%)")
    print(f"   F1 Score: {metrics['f1_score']:.2%}")
    
    if metrics['meets_precision_target']:
        print(f"   ✅ PASS: Precision meets target")
    else:
        print(f"   ❌ FAIL: Precision below 70% target")
    
    if metrics['meets_recall_target']:
        print(f"   ✅ PASS: Recall meets target")
    else:
        print(f"   ❌ FAIL: Recall below 60% target")
    
    print(f"\n🛡️  False Positive Control:")
    print(f"   False Positive Rate: {metrics['false_positive_rate']:.2%}")
    print(f"   True Positives (Fraud Detected): {metrics['true_positives']}")
    print(f"   False Positives (Legitimate Flagged): {metrics['false_positives']}")
    print(f"   False Negatives (Fraud Missed): {metrics['false_negatives']}")
    
    if metrics['fp_control_ok']:
        print(f"   ✅ PASS: False positive rate acceptable (< 15%)")
    else:
        print(f"   ❌ FAIL: Too many legitimate accounts flagged")
    
    return metrics

def validate_detection_patterns(suspicious_map, fraud_rings):
    """Analyze what patterns were detected"""
    print_header("Fraud Ring Detection Analysis")
    
    print(f"\n🔍 Detected Fraud Rings:")
    print(f"   Total Rings: {len(fraud_rings)}")
    
    pattern_counts = {}
    for ring in fraud_rings:
        pattern_type = ring.get('pattern_type', 'unknown')
        pattern_counts[pattern_type] = pattern_counts.get(pattern_type, 0) + 1
    
    for pattern_type, count in pattern_counts.items():
        print(f"   - {pattern_type.title()}: {count} rings")
    
    print(f"\n📋 Detected Suspicious Accounts:")
    print(f"   Total: {len(suspicious_map)}")
    
    # Check which known fraud patterns were detected
    detected_frauds = set(suspicious_map.keys())
    missed_frauds = KNOWN_FRAUD_PATTERNS - detected_frauds
    false_flags = set(suspicious_map.keys()) & KNOWN_LEGITIMATE
    
    if missed_frauds:
        print(f"\n   ⚠️  Missed Fraud Patterns ({len(missed_frauds)}):")
        for account in list(missed_frauds)[:5]:
            print(f"      - {account}")
        if len(missed_frauds) > 5:
            print(f"      ... and {len(missed_frauds) - 5} more")
    
    if false_flags:
        print(f"\n   ⚠️  Incorrectly Flagged Legitimate Accounts ({len(false_flags)}):")
        for account in list(false_flags)[:5]:
            details = suspicious_map[account]
            print(f"      - {account} (Score: {details['suspicion_score']})")
        if len(false_flags) > 5:
            print(f"      ... and {len(false_flags) - 5} more")

def generate_recommendations(metrics, suspicious_map):
    """Generate recommendations based on validation results"""
    print_header("Recommendations")
    
    issues = []
    
    if metrics['precision'] < 0.70:
        issues.append(
            "Precision too low - Consider:\n"
            "      • Increase suspicion score thresholds\n"
            "      • Improve merchant/payroll filtering\n"
            "      • Add more pattern-specific rules"
        )
    
    if metrics['recall'] < 0.60:
        issues.append(
            "Recall too low - Consider:\n"
            "      • Lower detection thresholds\n"
            "      • Add more detection patterns (e.g., triangular routing)\n"
            "      • Include time-based clustering"
        )
    
    if metrics['false_positive_rate'] > 0.15:
        issues.append(
            "False positive rate too high - Consider:\n"
            "      • Whitelist known merchants/payroll\n"
            "      • Use machine learning for better filtering\n"
            "      • Increase minimum transaction count for smurfing"
        )
    
    if not issues:
        print("\n✅ All metrics are within acceptable ranges!")
        print("\nContinue monitoring with:")
        print("   • Real-world transaction data")
        print("   • Feedback loops from analysts")
        print("   • Regular threshold adjustments")
    else:
        print("\n⚠️  Issues Detected:\n")
        for i, issue in enumerate(issues, 1):
            print(f"{i}. {issue}\n")

def main():
    """Run all validations"""
    print("\n" + "🔐 FINTRA FRAUD DETECTION SYSTEM - VALIDATION REPORT".center(60))
    
    try:
        # Run tests
        suspicious_map, fraud_rings, processing_time = validate_performance()
        metrics = validate_metrics(suspicious_map, fraud_rings)
        validate_detection_patterns(suspicious_map, fraud_rings)
        generate_recommendations(metrics, suspicious_map)
        
        # Summary
        print_header("Summary")
        print(f"\n✅ Processing Time Target: {'PASS' if processing_time <= 30 else 'FAIL'}")
        print(f"✅ Precision Target (≥70%): {'PASS' if metrics['meets_precision_target'] else 'FAIL'}")
        print(f"✅ Recall Target (≥60%): {'PASS' if metrics['meets_recall_target'] else 'FAIL'}")
        print(f"✅ FP Control: {'PASS' if metrics['fp_control_ok'] else 'FAIL'}")
        
        all_pass = (
            processing_time <= 30 and
            metrics['meets_precision_target'] and
            metrics['meets_recall_target'] and
            metrics['fp_control_ok']
        )
        
        print(f"\n{'='*60}")
        if all_pass:
            print("  🎉 ALL REQUIREMENTS MET! 🎉".center(60))
        else:
            print("  ⚠️  Some requirements not met - See recommendations above".center(60))
        print(f"{'='*60}\n")
        
    except Exception as e:
        print(f"\n❌ Validation failed with error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
