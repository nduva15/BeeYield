import argparse
import json
import os
import sys
import httpx


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Invoke BeeYield admin manual sync endpoint.")
    parser.add_argument("--api-url", default=os.getenv("API_URL", "http://localhost:8000"))
    parser.add_argument("--token", default=os.getenv("ADMIN_BEARER_TOKEN"))
    parser.add_argument("--target-user-id")
    parser.add_argument("--target-email")
    parser.add_argument("--reassign-orphaned", action="store_true", default=True)
    parser.add_argument("--no-reassign-orphaned", dest="reassign_orphaned", action="store_false")
    parser.add_argument("--seed-demo-data", action="store_true", default=False)
    parser.add_argument("--ensure-kibwezi-apiary", action="store_true", default=True)
    parser.add_argument("--no-ensure-kibwezi-apiary", dest="ensure_kibwezi_apiary", action="store_false")
    parser.add_argument("--desired-hive-count", type=int, default=184)
    parser.add_argument("--dry-run", action="store_true", default=False)
    parser.add_argument("--dry-run-output", help="Write dry-run response to a JSON file.")
    parser.add_argument("--schedule", action="store_true", default=False)
    parser.add_argument("--schedule-name", default="BeeYieldManualSync")
    parser.add_argument("--schedule-time", default="03:00")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if args.schedule:
        python_exe = sys.executable
        script_path = os.path.abspath(__file__)
        base_cmd = f'"{python_exe}" "{script_path}" --api-url "{args.api_url}"'
        if args.target_user_id:
            base_cmd += f' --target-user-id "{args.target_user_id}"'
        if args.target_email:
            base_cmd += f' --target-email "{args.target_email}"'
        if args.seed_demo_data:
            base_cmd += " --seed-demo-data"
        if not args.ensure_kibwezi_apiary:
            base_cmd += " --no-ensure-kibwezi-apiary"
        if not args.reassign_orphaned:
            base_cmd += " --no-reassign-orphaned"
        if args.desired_hive_count:
            base_cmd += f" --desired-hive-count {args.desired_hive_count}"
        if args.dry_run:
            base_cmd += " --dry-run"
        if args.dry_run_output:
            base_cmd += f' --dry-run-output "{args.dry_run_output}"'

        print("Use this Task Scheduler command (set ADMIN_BEARER_TOKEN env in the task):")
        print(
            "schtasks /Create /SC DAILY /TN "
            f'"{args.schedule_name}" /TR "{base_cmd}" /ST {args.schedule_time} /F'
        )
        return 0

    if not args.token:
        print("Missing admin token. Set ADMIN_BEARER_TOKEN or pass --token.")
        return 1

    payload = {
        "target_user_id": args.target_user_id,
        "target_email": args.target_email,
        "reassign_orphaned": args.reassign_orphaned,
        "seed_demo_data": args.seed_demo_data,
        "ensure_kibwezi_apiary": args.ensure_kibwezi_apiary,
        "desired_hive_count": args.desired_hive_count,
        "dry_run": args.dry_run,
    }

    url = args.api_url.rstrip("/") + "/api/v1/beeyield/admin/manual-sync"
    headers = {"Authorization": f"Bearer {args.token}"}

    with httpx.Client(timeout=30.0) as client:
        response = client.post(url, headers=headers, json=payload)

    if response.status_code >= 400:
        print(f"Error {response.status_code}: {response.text}")
        return 1
    data = response.json()
    print(json.dumps(data, indent=2))
    if args.dry_run and args.dry_run_output:
        with open(args.dry_run_output, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    return 0


if __name__ == "__main__":
    sys.exit(main())
