
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

DATABASE_URL = settings.DATABASE_URL

# SQLite configuration
connect_args = (
    {"check_same_thread": False}
    if DATABASE_URL.startswith("sqlite")
    else {}
)

# Database engine configuration
engine_kwargs = {
    "connect_args": connect_args,
    "echo": False
}

# MySQL connection pool settings
if DATABASE_URL.startswith("mysql"):
    engine_kwargs.update({
        "pool_pre_ping": True,
        "pool_recycle": 3600,
        "pool_size": 10,
        "max_overflow": 20
    })

engine = create_engine(DATABASE_URL, **engine_kwargs)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def check_database_connection():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        print("[+] Database connection successful!")

    except Exception as e:
        print("[-] Database connection failed!")
        print("Error:", e)
        raise


def migrate_user_profile_columns():

    inspector = inspect(engine)

    if not inspector.has_table("users"):
        print("[!] Users table does not exist yet.")
        return

    profile_columns = {
        "phone": "VARCHAR(50)",
        "job_title": "VARCHAR(150)",
        "organization": "VARCHAR(200)",
    }

    existing_columns = {
        column["name"]
        for column in inspector.get_columns("users")
    }

    missing_columns = {
        name: column_type
        for name, column_type in profile_columns.items()
        if name not in existing_columns
    }

    if not missing_columns:
        print("[+] User profile columns already exist.")
        return

    with engine.begin() as connection:
        for name, column_type in missing_columns.items():
            connection.execute(
                text(
                    f"ALTER TABLE users ADD COLUMN {name} {column_type}"
                )
            )

    print("[+] User profile migration completed!")


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()
