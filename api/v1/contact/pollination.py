from http.server import BaseHTTPRequestHandler

from api._forms import handle_form, handle_options, pollination_payload


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        handle_options(self)

    def do_POST(self):
        handle_form(
            self,
            pollination_payload,
            "pollination_requests",
            "Thank you for your interest in our pollination services! We've received your request and will contact you shortly to discuss your needs.",
        )
