from app.core.config import settings

def send_email(to_email: str, subject: str, content: str):
    """
    Sends an email using Resend if RESEND_API_KEY is configured.
    Falls back to mock printing in development.
    """
    api_key = settings.RESEND_API_KEY
    from_email = settings.EMAIL_FROM_ADDRESS
    from_name = settings.EMAIL_FROM_NAME

    if api_key and api_key != "REPLACE_WITH_YOUR_RESEND_KEY":
        try:
            import resend
            resend.api_key = api_key
            
            params = {
                "from": f"{from_name} <{from_email}>",
                "to": [to_email],
                "subject": subject,
                "html": content.replace("\n", "<br>")
            }
            
            resend.Emails.send(params)
            print(f"[SUCCESS] Email sent to {to_email} via Resend")
            return True
        except Exception as e:
            print(f"[ERROR] Resend failed to send email: {e}")
            # Fallback to mock
    
    # Mock fallback
    try:
        print("--- MOCK EMAIL ---")
        print(f"To: {to_email}")
        # Safe print for Windows consoles
        safe_subject = subject.encode('ascii', 'replace').decode()
        print(f"Subject: {safe_subject}")
        safe_content = content.encode('ascii', 'replace').decode()
        print(f"Content: {safe_content}")
        print("------------------")
    except Exception as e:
        print(f"[ERROR] Failed to log email: {e}")
    return True
