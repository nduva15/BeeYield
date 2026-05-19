from http.server import BaseHTTPRequestHandler

from api._forms import contact_submission_payload, handle_form, handle_options


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        handle_options(self)

    def do_POST(self):
        handle_form(
            self,
            contact_submission_payload,
            "contact_submissions",
            "Thank you for contacting us! We've received your inquiry and will get back to you shortly.",
        )
