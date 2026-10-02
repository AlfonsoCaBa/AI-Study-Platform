from typing import Annotated

from fastapi import Depends, FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session

from app.db import get_session
from app.models import Course
from app.schemas import CourseCreate, CourseRead


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.exception_handler(OperationalError)
def database_unavailable(request: Request, exc: OperationalError) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content={"detail": "Database unavailable. Check PostgreSQL and the local configuration."},
    )


@app.post("/courses", response_model=CourseRead, status_code=status.HTTP_201_CREATED)
def create_course(
    course: CourseCreate, session: Annotated[Session, Depends(get_session)]
) -> Course:
    db_course = Course(name=course.name)
    session.add(db_course)
    session.commit()
    session.refresh(db_course)
    return db_course


@app.get("/courses", response_model=list[CourseRead])
def list_courses(session: Annotated[Session, Depends(get_session)]) -> list[Course]:
    return list(session.scalars(select(Course).order_by(Course.id)))
