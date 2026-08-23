"""
Convenience CLI for common operations.

Usage:
    python cli.py init-db                  # create schema + pgvector
    python cli.py crawl [source ...]       # crawl all / named sources
    python cli.py search "income certificate"
    python cli.py schedule                 # run the periodic refresher
"""
from __future__ import annotations

import argparse
import json


def main() -> None:
    parser = argparse.ArgumentParser(description="Sahayak data collector CLI")
    sub = parser.add_subparsers(dest="cmd", required=True)

    sub.add_parser("init-db", help="Create schema and pgvector extension")

    p_crawl = sub.add_parser("crawl", help="Crawl sources")
    p_crawl.add_argument("sources", nargs="*", help="Source names (default: all)")

    p_search = sub.add_parser("search", help="Semantic search")
    p_search.add_argument("query")
    p_search.add_argument("--limit", type=int, default=5)
    p_search.add_argument("--mode", choices=["keyword", "semantic", "hybrid"], default=None)
    p_search.add_argument("--state", default=None)
    p_search.add_argument("--language", default=None)

    sub.add_parser("schedule", help="Start the background refresh scheduler")

    args = parser.parse_args()

    if args.cmd == "init-db":
        from database.connection import init_db

        init_db()
        print("Database initialised.")
    elif args.cmd == "crawl":
        from crawler.runner import run

        run(args.sources or None)
    elif args.cmd == "search":
        from search.semantic_search import search

        print(json.dumps(
            search(args.query, args.limit, args.mode, args.state, language=args.language),
            indent=2, ensure_ascii=False,
        ))
    elif args.cmd == "schedule":
        from scheduler.jobs import main as sched_main

        sched_main()


if __name__ == "__main__":
    main()
