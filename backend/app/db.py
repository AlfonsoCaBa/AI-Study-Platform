import os
from collections.abc import Iterator
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import URL, Engine, create_engine
from sqlalchemy.orm import Session


# Use the project's .env even when the terminal is inside backend/.
load_dotenv(Path(__file__).resolve().parents[2] / ".env")


def get_database_url() -> URL:
    required = ("POSTGRES_USER", "POSTGRES_PASSWORD", "POSTGRES_DB")
    missing = [name for name in required if not os.environ.get(name)]
    if missing:
        raise RuntimeError(f"Missing variables in the root .env: {', '.join(missing)}")

    # URL.create handles special characters in the password without exposing it.
    return URL.create(
        "postgresql+psycopg",
        username=os.environ["POSTGRES_USER"],
        password=os.environ["POSTGRES_PASSWORD"],
        database=os.environ["POSTGRES_DB"],
        host="127.0.0.1",
        port=5432,
    )


@lru_cache
def get_engine() -> Engine:
    return create_engine(
        get_database_url(), pool_pre_ping=True, connect_args={"connect_timeout": 5}
    )


def get_session() -> Iterator[Session]:
    # Each request gets a session that is closed when the request finishes.
    with Session(get_engine()) as session:
        yield session
