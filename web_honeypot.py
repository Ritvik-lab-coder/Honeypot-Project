import logging
from logging.handlers import RotatingFileHandler
from flask import Flask, render_template, request, redirect, url_for

logging_format = logging.Formatter("%(asctime)s %(message)s")

Http_logger = logging.getLogger("HTTPLogger")
Http_logger.setLevel(logging.INFO)
Http_handler = RotatingFileHandler("web_audits.log", maxBytes=2000, backupCount=5)
Http_handler.setFormatter(logging_format)
Http_logger.addHandler(Http_handler)

def web_honeypot(input_username="admin", input_password="password"):
    app = Flask(__name__)

    @app.route("/")
    def index():
        return render_template("fakepage.html")
    
    @app.route("/access", methods=["POST"])
    def login():
        username = request.form.get("username")
        password = request.form.get("password")
        bank_account_number = request.form.get("account-no")
        ip_address = request.remote_addr

        Http_logger.info(f"Client with IP address: [{ip_address}] entered Username: [{username}], Password: [{password}], Bank Account Number: [{bank_account_number}]")

        return render_template("fakepage.html", submitted=True)

    return app

def run_web_honeypot(port=5000, input_username="admin", input_password="password"):
    run_web_honeypot_app = web_honeypot(input_username=input_username, input_password=input_password)
    run_web_honeypot_app.run(debug=True, port=port, host="0.0.0.0")

    return run_web_honeypot_app