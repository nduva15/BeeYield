
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Dict, Any, Optional

class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.from_email = os.getenv("SMTP_FROM_EMAIL", "noreply@beeyield.com")
        self.enabled = bool(self.smtp_user and self.smtp_password)

    def send_email(self, to_email: str, subject: str, html_content: str):
        """
        Send an email using SMTP or log to console if not configured.
        """
        if not self.enabled:
            print(f"--- [MOCK EMAIL SERVICE] ---")
            print(f"TO: {to_email}")
            print(f"SUBJECT: {subject}")
            print(f"CONTENT: {html_content[:100]}...")
            print(f"----------------------------")
            return
        
        try:
            msg = MIMEMultipart()
            msg['From'] = self.from_email
            msg['To'] = to_email
            msg['Subject'] = subject
            
            msg.attach(MIMEText(html_content, 'html'))
            
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.smtp_user, self.smtp_password)
            server.send_message(msg)
            server.quit()
            print(f"Email sent successfully to {to_email}")
        except Exception as e:
            print(f"Failed to send email: {e}")

    def send_order_confirmation(self, order: Dict[str, Any], items: List[Dict[str, Any]]):
        """
        Send order confirmation email.
        """
        subject = f"Order Confirmation - {order.get('order_number')}"
        
        # Build HTML content
        items_html = ""
        for item in items:
            items_html += f"""
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">{item.get('product_name')} ({item.get('variant_size')})</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">{item.get('quantity')}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">KES {item.get('total_price'):,}</td>
            </tr>
            """
            
        shipping = order.get('shipping_address', {})
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #F59E0B;">BeeYield</h1>
                </div>
                
                <h2>Thank you for your order!</h2>
                <p>Hi {shipping.get('fullName', 'Valued Customer')},</p>
                <p>We've received your order and are getting it ready for delivery.</p>
                
                <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 4px;">
                    <h3 style="margin-top: 0;">Order Summary</h3>
                    <p><strong>Order Number:</strong> {order.get('order_number')}</p>
                    <p><strong>Total Amount:</strong> KES {order.get('total_kes'):,}</p>
                </div>
                
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <thead>
                        <tr style="background-color: #f0f0f0;">
                            <th style="padding: 8px; text-align: left;">Product</th>
                            <th style="padding: 8px; text-align: left;">Qty</th>
                            <th style="padding: 8px; text-align: left;">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items_html}
                    </tbody>
                </table>
                
                <div style="margin-top: 20px;">
                    <h3>Shipping To:</h3>
                    <p>
                        {shipping.get('address')}<br>
                        {shipping.get('city')}, {shipping.get('county')}
                    </p>
                </div>
                
                <p style="margin-top: 30px; font-size: 12px; color: #888;">
                    You can track the journey of your honey using our <a href="https://beeyield.co.ke/traceability">Traceability</a> page.
                </p>
            </div>
        </body>
        </html>
        """
        
        # Send
        to_email = shipping.get('email')
        if to_email:
            self.send_email(to_email, subject, html_content)


email_service = EmailService()
