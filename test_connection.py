import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv(dotenv_path="backend/.env")

url = os.environ.get("DATABASE_URL")
print(f"Testing connection to: {url.split('@')[-1]}") # Print host only for safety

try:
    engine = create_engine(url)
    with engine.connect() as conn:
        result = conn.execute(text("SELECT version()"))
        print("Connection Successful!")
        print(result.fetchone())
except Exception as e:
    print("Connection Failed!")
    print(e)
