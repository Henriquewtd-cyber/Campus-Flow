"""baseline

Revision ID: ed4884a5e2bf
Revises: 8f938538329f
Create Date: 2026-10-23 18:50:42.778046

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ed4884a5e2bf'
down_revision: Union[str, Sequence[str], None] = '8f938538329f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
