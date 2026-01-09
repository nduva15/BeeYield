#!/usr/bin/env python3
"""
BeeYield Connection Test Suite
Tests all external service connections and reports their status
"""
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

# Constants
WEAK_KEY_INDICATORS = ["change_this", "secret", "password", "123", "test", "default"]
MIN_SECRET_KEY_LENGTH = 32

def print_header(text):
    print(f"\n{'='*60}")
    print(f"  {text}")
    print(f"{'='*60}")

def print_test(name, status, message=""):
    status_symbol = "✅" if status else "❌"
    print(f"{status_symbol} {name}")
    if message:
        print(f"   └─ {message}")

def is_weak_secret_key(key):
    """Check if a secret key is weak or default"""
    if not key or len(key) < MIN_SECRET_KEY_LENGTH:
        return True
    return any(indicator in key.lower() for indicator in WEAK_KEY_INDICATORS)

def test_environment_variables():
    """Check if essential environment variables are set"""
    print_header("1. ENVIRONMENT VARIABLES")
    
    required_vars = {
        "VITE_SUPABASE_URL": "Supabase URL",
        "VITE_SUPABASE_ANON_KEY": "Supabase Anon Key",
        "CLICKHOUSE_HOST": "ClickHouse Host",
        "CLICKHOUSE_PASSWORD": "ClickHouse Password",
        "SECRET_KEY": "Application Secret Key"
    }
    
    optional_vars = {
        "STRIPE_SECRET_KEY": "Stripe Secret Key",
        "MPESA_CONSUMER_KEY": "M-Pesa Consumer Key",
        "SMTP_USER": "SMTP User",
        "RESEND_API_KEY": "Resend API Key",
        "BLOCKCHAIN_URL": "Blockchain RPC URL"
    }
    
    print("\nRequired Variables:")
    all_required_set = True
    for var, name in required_vars.items():
        value = os.getenv(var)
        is_set = bool(value)
        all_required_set = all_required_set and is_set
        
        # Check for default/insecure values
        warning = ""
        if var == "SECRET_KEY" and value and is_weak_secret_key(value):
            warning = "⚠️  Using default key - Change for production!"
            is_set = False
        
        print_test(name, is_set, warning if warning else (f"Set ({len(value)} chars)" if is_set else "Not set"))
    
    print("\nOptional Variables:")
    for var, name in optional_vars.items():
        value = os.getenv(var)
        is_set = bool(value)
        print_test(name, is_set, f"Set ({len(value)} chars)" if is_set else "Not configured (optional)")
    
    return all_required_set

def test_supabase():
    """Test Supabase connection"""
    print_header("2. SUPABASE (PostgreSQL)")
    
    try:
        from supabase import create_client
        
        url = os.getenv("VITE_SUPABASE_URL")
        key = os.getenv("VITE_SUPABASE_ANON_KEY")
        
        if not url or not key:
            print_test("Supabase Connection", False, "Missing credentials")
            return False
        
        print(f"   URL: {url}")
        
        supabase = create_client(url, key)
        print_test("Client Creation", True, "Successfully created Supabase client")
        
        # Try a simple query
        try:
            result = supabase.table("team_members").select("id").limit(1).execute()
            print_test("Database Query", True, f"Successfully queried database")
            return True
        except Exception as e:
            error_msg = str(e)
            if "not found" in error_msg.lower() or "does not exist" in error_msg.lower():
                print_test("Database Query", True, "Connected (table may not exist yet)")
                return True
            else:
                print_test("Database Query", False, f"Error: {error_msg[:100]}")
                return False
            
    except ImportError:
        print_test("Supabase Module", False, "Module not installed - Run: pip install supabase")
        return False
    except Exception as e:
        print_test("Supabase Connection", False, f"Error: {str(e)[:100]}")
        return False

def test_clickhouse():
    """Test ClickHouse connection"""
    print_header("3. CLICKHOUSE (Analytics)")
    
    try:
        from app.core.config import settings
        
        print(f"   Host: {settings.CLICKHOUSE_HOST}")
        print(f"   User: {settings.CLICKHOUSE_USER}")
        print(f"   Database: {settings.CLICKHOUSE_DATABASE}")
        
        if not settings.CLICKHOUSE_HOST or not settings.CLICKHOUSE_PASSWORD:
            print_test("ClickHouse Configuration", False, "Missing credentials")
            return False
        
        print_test("Configuration", True, "ClickHouse credentials loaded")
        
        try:
            from app.db.clickhouse_db import ClickHouseService
            
            client = ClickHouseService.get_client()
            if client:
                print_test("Client Creation", True, "Successfully created ClickHouse client")
                
                try:
                    result = client.query("SELECT 1")
                    print_test("Database Query", True, f"Query successful: {result.result_rows}")
                    return True
                except Exception as e:
                    print_test("Database Query", False, f"Error: {str(e)[:100]}")
                    return False
            else:
                print_test("Client Creation", False, "Client is None")
                return False
                
        except ImportError as e:
            print_test("ClickHouse Module", False, f"Module import error: {str(e)[:100]}")
            return False
            
    except Exception as e:
        print_test("ClickHouse Connection", False, f"Error: {str(e)[:100]}")
        return False

def test_payment_services():
    """Test payment service configurations"""
    print_header("4. PAYMENT SERVICES")
    
    # Stripe
    stripe_key = os.getenv("STRIPE_SECRET_KEY")
    if stripe_key:
        if stripe_key.startswith("sk_test_"):
            print_test("Stripe (Test Mode)", True, "Test key configured")
        elif stripe_key.startswith("sk_live_"):
            print_test("Stripe (Live Mode)", True, "⚠️  Live key configured - Be careful!")
        else:
            print_test("Stripe", False, "Invalid key format")
    else:
        print_test("Stripe", False, "Not configured - International payments disabled")
    
    # M-Pesa
    mpesa_key = os.getenv("MPESA_CONSUMER_KEY")
    mpesa_secret = os.getenv("MPESA_CONSUMER_SECRET")
    mpesa_shortcode = os.getenv("MPESA_BUSINESS_SHORTCODE")
    
    if mpesa_key and mpesa_secret and mpesa_shortcode:
        print_test("M-Pesa", True, f"Configured (Shortcode: {mpesa_shortcode})")
    else:
        missing = []
        if not mpesa_key: missing.append("Consumer Key")
        if not mpesa_secret: missing.append("Consumer Secret")
        if not mpesa_shortcode: missing.append("Business Shortcode")
        print_test("M-Pesa", False, f"Not configured - Missing: {', '.join(missing)}")
    
    return bool(stripe_key or (mpesa_key and mpesa_secret))

def test_email_service():
    """Test email service configuration"""
    print_header("5. EMAIL SERVICE")
    
    # Check SMTP
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASSWORD")
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    
    # Check Resend
    resend_key = os.getenv("RESEND_API_KEY")
    
    if resend_key:
        print_test("Resend API", True, f"Configured (key: {resend_key[:10]}...)")
        return True
    elif smtp_user and smtp_pass:
        print_test("SMTP", True, f"Configured ({smtp_user} via {smtp_server})")
        return True
    else:
        print_test("Email Service", False, "Not configured - No emails will be sent")
        print("   └─ Configure either Resend or SMTP to enable emails")
        return False

def test_blockchain():
    """Test blockchain configuration"""
    print_header("6. BLOCKCHAIN SERVICE")
    
    blockchain_url = os.getenv("BLOCKCHAIN_URL")
    contract_address = os.getenv("BLOCKCHAIN_CONTRACT_ADDRESS")
    
    print_test("Python Blockchain", True, "Using custom Python implementation")
    print("   └─ Implementation: backend/app/blockchain/honey_chain.py")
    
    if blockchain_url and contract_address:
        print_test("External Blockchain (Web3)", True, f"Configured (URL: {blockchain_url})")
    else:
        print_test("External Blockchain (Web3)", False, "Not configured (using Python implementation)")
    
    return True

def test_security():
    """Test security configuration"""
    print_header("7. SECURITY")
    
    secret_key = os.getenv("SECRET_KEY")
    
    if not secret_key:
        print_test("Secret Key", False, "Not set - Application won't work!")
        return False
    
    # Check for default/weak keys
    if is_weak_secret_key(secret_key):
        print_test("Secret Key", False, "⚠️  Weak or default key - Generate a new one!")
        print("   └─ Generate with: python -c \"import secrets; print(secrets.token_urlsafe(64))\"")
        return False
    else:
        print_test("Secret Key", True, f"Strong key configured ({len(secret_key)} chars)")
        return True

def generate_summary(results):
    """Generate summary report"""
    print_header("SUMMARY")
    
    total = len(results)
    passed = sum(results.values())
    
    print(f"\n   Total Tests: {total}")
    print(f"   Passed: {passed} ✅")
    print(f"   Failed: {total - passed} ❌")
    print(f"   Success Rate: {(passed/total)*100:.1f}%")
    
    if passed == total:
        print("\n   🎉 All connections are configured!")
    elif results.get("environment", False) and results.get("supabase", False):
        print("\n   ✅ Core services working - Optional services need configuration")
    else:
        print("\n   ⚠️  Some critical services need configuration")
        print("   📖 See CONNECTIONS_CHECKLIST.md for details")
    
    print("\n" + "="*60 + "\n")

def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("  🐝 BeeYield Connection Test Suite")
    print("="*60)
    
    results = {}
    
    try:
        results["environment"] = test_environment_variables()
        results["supabase"] = test_supabase()
        results["clickhouse"] = test_clickhouse()
        results["payments"] = test_payment_services()
        results["email"] = test_email_service()
        results["blockchain"] = test_blockchain()
        results["security"] = test_security()
        
        generate_summary(results)
        
        # Exit code based on critical services
        critical_services = ["environment", "supabase", "security"]
        critical_passed = all(results.get(service, False) for service in critical_services)
        
        return 0 if critical_passed else 1
        
    except Exception as e:
        print(f"\n❌ Test suite error: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    sys.exit(main())
