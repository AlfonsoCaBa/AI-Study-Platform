"""Create the courses table."""

from alembic import op
import sqlalchemy as sa


revision = "0001_create_courses"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "courses",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.CheckConstraint("length(trim(name)) > 0", name="ck_courses_name_not_blank"),
    )


def downgrade() -> None:
    op.drop_table("courses")
