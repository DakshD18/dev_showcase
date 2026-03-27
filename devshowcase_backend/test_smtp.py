import smtplib
import os
from dotenv import load_dotenv

load_dotenv('.env')
user = os.environ.get('EMAIL_HOST_USER')
password = os.environ.get('EMAIL_HOST_PASSWORD')

try:
    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()
    server.login(user, password)
    print("Success! Login works.")
    server.quit()
except Exception as e:
    print(f"Failed: {e}")
