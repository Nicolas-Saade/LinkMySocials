import smtplib
from email.mime.text import MIMEText

def send_welcome_email(user_email, first_name):
    """
    Send a welcome email to newly registered users using direct SMTP
    """
    subject = "Welcome to LinkMySocials!"
    message = f"""
Hello {first_name},

Welcome to LinkMySocials! We're excited to have you join our platform.

With LinkMySocials, you can:
- Keep track of all your social media profiles in one place
- Easily share your social media presence with others
- Discover new creators similar to ones you already follow

If you have any questions or need assistance, feel free to reach out to our support team.

Best regards,
The LinkMySocials Team
    """
    
    try:
        # Create a direct SMTP connection, bypassing Django's email system
        msg = MIMEText(message)
        msg['Subject'] = subject
        msg['From'] = 'linkmysocials@gmail.com'
        msg['To'] = user_email
        
        # Use SSL
        server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
        server.login('linkmysocials@gmail.com', 'mtyt cuaj fngz ctjv')
        server.send_message(msg)
        server.quit()
        print("Welcome email sent successfully")
        return True
    except Exception as e:
        print(f"Failed to send welcome email: {str(e)}")
        return False 