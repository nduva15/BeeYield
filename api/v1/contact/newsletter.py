from http.server import BaseHTTPRequestHandler

from api._forms import handle_form, handle_options, newsletter_payload


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        handle_options(self)

    def do_POST(self):
        handle_form(
            self,
            newsletter_payload,
            "newsletter_subscribers",
            "Welcome to BeeYield! You're now subscribed to our newsletter.",
            on_conflict="email",
            ignore_duplicates=True,
        )
