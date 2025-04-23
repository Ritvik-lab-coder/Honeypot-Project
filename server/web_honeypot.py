import logging
from logging.handlers import RotatingFileHandler
from flask import Flask, request
from flask_cors import CORS 

logging_format = logging.Formatter("%(asctime)s %(message)s")

Http_logger = logging.getLogger("HTTPLogger")
Http_logger.setLevel(logging.INFO)
Http_handler = RotatingFileHandler("web_audits.log", maxBytes=2000, backupCount=5)
Http_handler.setFormatter(logging_format)
Http_logger.addHandler(Http_handler)

def web_honeypot(input_username="admin", input_password="admin"):
    app = Flask(__name__)
    CORS(app, origins=["http://localhost:3000"]) 

    @app.route("/process-payment/card", methods=["POST"])
    def log_card():
        ip_address = request.remote_addr
        data = request.json

        Http_logger.info(f"""[Card Payment Attempt]
        IP: {ip_address}
        Name: {data.get('name')}
        Email: {data.get('email')}
        Card Number: {data.get('cardNumber')}
        Expiry Month: {data.get('expiryMonth')}
        Expiry Year: {data.get('expiryYear')}
        CVV: {data.get('cvv')}
        Save Card: {data.get('saveCard')}
        Terms Accepted: {data.get('termsAccepted')}
        """)

        return {"status": "logged"}, 200

    @app.route("/process-payment/upi", methods=["POST"])
    def log_upi():
        ip_address = request.remote_addr
        data = request.json

        Http_logger.info(f"""[UPI Payment Attempt]
        IP: {ip_address}
        Email: {data.get('email')}
        UPI ID: {data.get('upiId')}
        Terms Accepted: {data.get('termsAccepted')}
        """)

        return {"status": "logged"}, 200

    @app.route("/process-payment/netbanking", methods=["POST"])
    def log_netbanking():
        ip_address = request.remote_addr
        data = request.json

        Http_logger.info(f"""[Net Banking Attempt]
        IP: {ip_address}
        Email: {data.get('email')}
        Bank: {data.get('bank')}
        Terms Accepted: {data.get('termsAccepted')}
        """)

        return {"status": "logged"}, 200

    @app.route("/process-payment/wallet", methods=["POST"])
    def log_wallet():
        ip_address = request.remote_addr
        data = request.json

        Http_logger.info(f"""[Wallet Payment Attempt]
        IP: {ip_address}
        Email: {data.get('email')}
        Wallet Type: {data.get('walletType')}
        Terms Accepted: {data.get('termsAccepted')}
        """)

        return {"status": "logged"}, 200

    return app

def run_web_honeypot(port=5000, input_username="admin", input_password="password"):
    run_web_honeypot_app = web_honeypot(input_username=input_username, input_password=input_password)
    run_web_honeypot_app.run(debug=True, port=port, host="0.0.0.0")

    return run_web_honeypot_app
