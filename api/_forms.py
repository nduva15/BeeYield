import json
import os
import re
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from http import HTTPStatus


EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


class FormError(Exception):
    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail
        super().__init__(detail)


def load_local_env():
    env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
    if not os.path.exists(env_path):
        return

    with open(env_path, "r", encoding="utf-8") as env_file:
        for raw_line in env_file:
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def get_supabase_config():
    load_local_env()
    url = os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL")
    key = (
        os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        or os.getenv("SUPABASE_KEY")
        or os.getenv("SUPABASE_ANON_KEY")
        or os.getenv("VITE_SUPABASE_ANON_KEY")
    )

    if not url or not key:
        raise FormError(
            HTTPStatus.INTERNAL_SERVER_ERROR,
            "Database is not configured. Missing Supabase URL or key.",
        )

    return url.rstrip("/"), key


def read_json_body(request):
    try:
        length = int(request.headers.get("content-length", "0") or "0")
    except ValueError:
        length = 0

    if length <= 0:
        return {}

    try:
        return json.loads(request.rfile.read(length).decode("utf-8"))
    except json.JSONDecodeError:
        raise FormError(HTTPStatus.BAD_REQUEST, "Invalid JSON request body.")


def require_string(data, field):
    value = data.get(field)
    if not isinstance(value, str) or not value.strip():
        raise FormError(HTTPStatus.UNPROCESSABLE_ENTITY, f"{field} is required.")
    return value.strip()


def optional_string(data, field):
    value = data.get(field)
    if value is None:
        return None
    if isinstance(value, str):
        value = value.strip()
        return value or None
    return str(value)


def require_email(data):
    email = require_string(data, "email").lower()
    if not EMAIL_RE.match(email):
        raise FormError(HTTPStatus.UNPROCESSABLE_ENTITY, "A valid email is required.")
    return email


def number_or_none(data, field):
    value = data.get(field)
    if value in (None, ""):
        return None
    try:
        number = float(value)
        return int(number) if number.is_integer() else number
    except (TypeError, ValueError):
        raise FormError(HTTPStatus.UNPROCESSABLE_ENTITY, f"{field} must be a number.")


def int_or_none(data, field):
    value = data.get(field)
    if value in (None, ""):
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        raise FormError(HTTPStatus.UNPROCESSABLE_ENTITY, f"{field} must be an integer.")


def compact(payload):
    return {key: value for key, value in payload.items() if value is not None}


def supabase_write(table, payload, on_conflict=None, ignore_duplicates=False):
    base_url, key = get_supabase_config()
    query = {}
    if on_conflict:
        query["on_conflict"] = on_conflict

    endpoint = f"{base_url}/rest/v1/{table}"
    if query:
        endpoint = f"{endpoint}?{urllib.parse.urlencode(query)}"

    prefer_parts = ["return=representation"]
    if on_conflict:
        prefer_parts.append(
            f"resolution={'ignore-duplicates' if ignore_duplicates else 'merge-duplicates'}"
        )

    request = urllib.request.Request(
        endpoint,
        data=json.dumps(payload).encode("utf-8"),
        method="POST",
        headers={
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": ",".join(prefer_parts),
        },
    )

    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            body = response.read().decode("utf-8")
            return json.loads(body) if body else []
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8")
        raise FormError(
            HTTPStatus.INTERNAL_SERVER_ERROR,
            f"Database insert failed: {detail or error.reason}",
        )
    except urllib.error.URLError as error:
        raise FormError(
            HTTPStatus.SERVICE_UNAVAILABLE,
            f"Database unavailable: {error.reason}",
        )


def newsletter_payload(data):
    email = require_email(data)
    return compact(
        {
            "email": email,
            "first_name": optional_string(data, "first_name"),
            "source": optional_string(data, "source") or "footer",
        }
    )


def contact_message_payload(data):
    return compact(
        {
            "full_name": require_string(data, "full_name"),
            "email": require_email(data),
            "subject": optional_string(data, "subject"),
            "message": require_string(data, "message"),
            "status": "new",
        }
    )


def contact_submission_payload(data):
    first_name = require_string(data, "first_name")
    last_name = require_string(data, "last_name")
    inquiry_type = require_string(data, "inquiry_type")
    topic = require_string(data, "topic")

    return compact(
        {
            "first_name": first_name,
            "last_name": last_name,
            "name": f"{first_name} {last_name}".strip(),
            "email": require_email(data),
            "phone": require_string(data, "phone"),
            "city": require_string(data, "city"),
            "state": require_string(data, "state"),
            "country": require_string(data, "country"),
            "inquiry_type": inquiry_type,
            "topic": topic,
            "subject": f"{inquiry_type.upper()}: {topic}",
            "message": optional_string(data, "message"),
            "company": optional_string(data, "company"),
            "farm_name": optional_string(data, "farm_name"),
            "apiary_name": optional_string(data, "apiary_name"),
            "crop_type": optional_string(data, "crop_type"),
            "acres": number_or_none(data, "acres"),
            "hive_count": int_or_none(data, "hive_count"),
            "experience_years": optional_string(data, "experience_years"),
            "form_specific_data": data.get("form_specific_data"),
            "status": "new",
        }
    )


def pollination_payload(data):
    return compact(
        {
            "full_name": require_string(data, "full_name"),
            "email": require_email(data),
            "phone": require_string(data, "phone"),
            "farm_name": require_string(data, "farm_name"),
            "farm_location": require_string(data, "farm_location"),
            "crop_type": require_string(data, "crop_type"),
            "acres": number_or_none(data, "acres"),
            "preferred_start_date": require_string(data, "preferred_start_date"),
            "additional_info": optional_string(data, "additional_info"),
            "status": "pending",
        }
    )


def json_response(handler, status_code, payload):
    encoded = json.dumps(payload).encode("utf-8")
    handler.send_response(status_code)
    handler.send_header("Content-Type", "application/json")
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
    handler.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
    handler.send_header("Content-Length", str(len(encoded)))
    handler.end_headers()
    handler.wfile.write(encoded)


def handle_options(handler):
    json_response(handler, HTTPStatus.NO_CONTENT, {})


def handle_form(handler, build_payload, table, success_message, on_conflict=None, ignore_duplicates=False):
    try:
        data = read_json_body(handler)
        payload = build_payload(data)
        rows = supabase_write(
            table,
            payload,
            on_conflict=on_conflict,
            ignore_duplicates=ignore_duplicates,
        )
        message = success_message
        if on_conflict and isinstance(rows, list) and not rows:
            message = "You're already subscribed! Check your inbox for our latest updates."

        json_response(
            handler,
            HTTPStatus.OK,
            {
                "status": "success",
                "message": message,
                "saved_at": datetime.now(timezone.utc).isoformat(),
            },
        )
    except FormError as error:
        json_response(handler, error.status_code, {"detail": error.detail})
    except Exception as error:
        json_response(
            handler,
            HTTPStatus.INTERNAL_SERVER_ERROR,
            {"detail": f"Submission failed: {error}"},
        )
