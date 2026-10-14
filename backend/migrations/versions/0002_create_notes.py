"""Create notes linked to courses."""

from alembic import op
import sqlalchemy as sa


revision = "0002_create_notes"
down_revision = "0001_create_courses"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "notes",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("course_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=100), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.ForeignKeyConstraint(
            ["course_id"], ["courses.id"], name="fk_notes_course_id_courses"
        ),
        sa.CheckConstraint("length(trim(title)) > 0", name="ck_notes_title_not_blank"),
        sa.CheckConstraint(
            "length(content) BETWEEN 1 AND 10000", name="ck_notes_content_length"
        ),
    )
    op.create_index("ix_notes_course_id", "notes", ["course_id"])


def downgrade() -> None:
    op.drop_index("ix_notes_course_id", table_name="notes")
    op.drop_table("notes")
