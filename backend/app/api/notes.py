from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_session
from app.models import Course, Note
from app.schemas import NoteCreate, NoteRead


router = APIRouter(prefix="/courses/{course_id}/notes", tags=["notes"])


@router.post("", response_model=NoteRead, status_code=status.HTTP_201_CREATED)
def create_note(
    course_id: Annotated[int, Path(gt=0)],
    note: NoteCreate,
    session: Annotated[Session, Depends(get_session)],
) -> Note:
    if session.get(Course, course_id) is None:
        raise HTTPException(status_code=404, detail="Course not found")

    db_note = Note(course_id=course_id, title=note.title, content=note.content)
    session.add(db_note)
    session.commit()
    session.refresh(db_note)
    return db_note


@router.get("", response_model=list[NoteRead])
def list_notes(
    course_id: Annotated[int, Path(gt=0)],
    session: Annotated[Session, Depends(get_session)],
) -> list[Note]:
    if session.get(Course, course_id) is None:
        raise HTTPException(status_code=404, detail="Course not found")

    statement = select(Note).where(Note.course_id == course_id).order_by(Note.id)
    return list(session.scalars(statement))


def get_note_for_course(session: Session, course_id: int, note_id: int) -> Note:
    # Both identifiers must match before a note can be changed or deleted.
    statement = select(Note).where(Note.id == note_id, Note.course_id == course_id)
    db_note = session.scalar(statement)
    if db_note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    return db_note


@router.put("/{note_id}", response_model=NoteRead)
def update_note(
    course_id: Annotated[int, Path(gt=0)],
    note_id: Annotated[int, Path(gt=0)],
    note: NoteCreate,
    session: Annotated[Session, Depends(get_session)],
) -> Note:
    db_note = get_note_for_course(session, course_id, note_id)
    db_note.title = note.title
    db_note.content = note.content
    session.commit()
    session.refresh(db_note)
    return db_note


@router.delete(
    "/{note_id}", status_code=status.HTTP_204_NO_CONTENT, response_class=Response
)
def delete_note(
    course_id: Annotated[int, Path(gt=0)],
    note_id: Annotated[int, Path(gt=0)],
    session: Annotated[Session, Depends(get_session)],
) -> Response:
    db_note = get_note_for_course(session, course_id, note_id)
    session.delete(db_note)
    session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
