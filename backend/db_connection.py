from sqlalchemy import create_engine
from sqlalchemy import text

# PostgreSQL Connection Details
DB_USER = "postgres"
DB_PASSWORD = "Merengo%4020"   # Merengo@20 (@ encoded as %40)
DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "real3st_bi"

DATABASE_URL = (
    f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

try:
    engine = create_engine(DATABASE_URL)

    with engine.connect() as connection:
        print("✅ Connected to PostgreSQL successfully!")

        result = connection.execute(text("SELECT * FROM students;"))

        print("\nStudents in database:\n")

        for row in result:
            print(row)

except Exception as e:
    print("\n❌ Connection Failed!")
    print(e)