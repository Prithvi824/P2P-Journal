"""initial_setup

Revision ID: b1c2d3e4f5a6
Revises:
Create Date: 2026-06-22 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'b1c2d3e4f5a6'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('buying_phases',
    sa.Column('platform', sa.String(length=100), nullable=True),
    sa.Column('price_per_coin', sa.Float(), nullable=True),
    sa.Column('coins_received', sa.Float(), nullable=True),
    sa.Column('inr_spent', sa.Float(), nullable=True),
    sa.Column('status', sa.String(length=20), nullable=False),
    sa.Column('coin_value_inr', sa.Float(), nullable=True),
    sa.Column('purchase_fees_inr', sa.Float(), nullable=True),
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('deposit_phases',
    sa.Column('source_platform', sa.String(length=100), nullable=True),
    sa.Column('coin_symbol', sa.String(length=20), nullable=True),
    sa.Column('network', sa.String(length=30), nullable=True),
    sa.Column('coins_deposited', sa.Float(), nullable=True),
    sa.Column('usdt_received', sa.Float(), nullable=True),
    sa.Column('status', sa.String(length=20), nullable=False),
    sa.Column('cost_per_usdt_inr', sa.Float(), nullable=True),
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('sale_phases',
    sa.Column('min_order_inr', sa.Float(), nullable=True),
    sa.Column('max_order_inr', sa.Float(), nullable=True),
    sa.Column('usdt_for_sale', sa.Float(), nullable=True),
    sa.Column('payment_methods', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    sa.Column('sale_fees_inr', sa.Float(), nullable=True),
    sa.Column('status', sa.String(length=20), nullable=False),
    sa.Column('avg_price_per_usdt', sa.Float(), nullable=True),
    sa.Column('total_usdt_sold', sa.Float(), nullable=True),
    sa.Column('total_inr_received', sa.Float(), nullable=True),
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('users',
    sa.Column('username', sa.String(length=50), nullable=False),
    sa.Column('email', sa.String(length=255), nullable=False),
    sa.Column('hashed_password', sa.String(), nullable=False),
    sa.Column('is_active', sa.Boolean(), nullable=False),
    sa.Column('price_alert_threshold', sa.Float(), nullable=True),
    sa.Column('last_alert_sent_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email')
    )
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)
    op.create_table('sale_orders',
    sa.Column('sale_phase_id', sa.UUID(), nullable=False),
    sa.Column('price_per_usdt', sa.Float(), nullable=True),
    sa.Column('usdt_sold', sa.Float(), nullable=True),
    sa.Column('inr_received', sa.Float(), nullable=True),
    sa.Column('buyer_username', sa.String(length=100), nullable=True),
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    sa.ForeignKeyConstraint(['sale_phase_id'], ['sale_phases.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_sale_orders_sale_phase_id'), 'sale_orders', ['sale_phase_id'], unique=False)
    op.create_table('trade_cycles',
    sa.Column('user_id', sa.UUID(), nullable=False),
    sa.Column('buy_phase_id', sa.UUID(), nullable=False),
    sa.Column('deposit_phase_id', sa.UUID(), nullable=True),
    sa.Column('sale_phase_id', sa.UUID(), nullable=True),
    sa.Column('status', sa.String(length=20), nullable=False),
    sa.Column('total_inr_spent', sa.Float(), nullable=False),
    sa.Column('total_inr_received', sa.Float(), nullable=False),
    sa.Column('remaining_usdt', sa.Float(), nullable=False),
    sa.Column('remaining_value_inr', sa.Float(), nullable=False),
    sa.Column('total_fees_inr', sa.Float(), nullable=False),
    sa.Column('pnl', sa.Float(), nullable=False),
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    sa.ForeignKeyConstraint(['buy_phase_id'], ['buying_phases.id'], ),
    sa.ForeignKeyConstraint(['deposit_phase_id'], ['deposit_phases.id'], ),
    sa.ForeignKeyConstraint(['sale_phase_id'], ['sale_phases.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_trade_cycles_user_id'), 'trade_cycles', ['user_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_trade_cycles_user_id'), table_name='trade_cycles')
    op.drop_table('trade_cycles')
    op.drop_index(op.f('ix_sale_orders_sale_phase_id'), table_name='sale_orders')
    op.drop_table('sale_orders')
    op.drop_index(op.f('ix_users_username'), table_name='users')
    op.drop_table('users')
    op.drop_table('sale_phases')
    op.drop_table('deposit_phases')
    op.drop_table('buying_phases')
