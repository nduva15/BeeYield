def send_email(to_email: str, subject: str, content: str):
    """
    Mock email sender. In production use SendGrid or AWS SES.
    """
    try:
        print(f"--- MOCK EMAIL ---")
        print(f"To: {to_email}")
        # Safe print for Windows consoles
        safe_subject = subject.encode('ascii', 'replace').decode()
        print(f"Subject: {safe_subject}")
        safe_content = content.encode('ascii', 'replace').decode()
        print(f"Content: {safe_content}")
        print(f"------------------")
    except Exception as e:
        print(f"[ERROR] Failed to log email: {e}")
    return True
