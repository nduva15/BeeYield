from http.server import BaseHTTPRequestHandler

from api._forms import contact_message_payload, handle_form, handle_options


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        handle_options(self)

    def do_POST(self):
        handle_form(
            self,
            contact_message_payload,
            "contact_messages",
            "Message sent! We will get back to you shortly.",
        )
