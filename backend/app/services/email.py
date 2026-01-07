def send_email(to_email: str, subject: str, content: str):
    """
    Mock email sender. In production use SendGrid or AWS SES.
    """
    print(f"--- MOCK EMAIL ---")
    print(f"To: {to_email}")
    print(f"Subject: {subject}")
    print(f"Content: {content}")
    print(f"------------------")
    return True
