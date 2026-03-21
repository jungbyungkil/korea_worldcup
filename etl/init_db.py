#!/usr/bin/env python3
"""SQLite 파일 생성 및 schema.sql 적용."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

# 실행 위치와 무관하게 import
_ROOT = Path(__file__).resolve().parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from etl.common import apply_schema, connect, default_db_path  # noqa: E402


def main() -> int:
    p = argparse.ArgumentParser(description="Create SQLite DB and apply etl/schema.sql")
    p.add_argument(
        "--db",
        type=Path,
        default=None,
        help=f"SQLite path (default: {default_db_path()})",
    )
    args = p.parse_args()
    db_path = args.db or default_db_path()
    conn = connect(db_path)
    apply_schema(conn)
    conn.close()
    print(f"OK: schema applied -> {db_path.resolve()}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
