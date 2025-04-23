import logging
from logging.handlers import RotatingFileHandler
import socket
import paramiko
import threading

logging_format = logging.Formatter("%(asctime)s %(message)s")

SSH_BANNER = "SSH-2.0-OpenSSH_8.4p1 Ubuntu-6ubuntu2.1"
host_key = paramiko.RSAKey(filename="server.key")

funnel_logger = logging.getLogger("FunnelLogger")
funnel_logger.setLevel(logging.INFO)
funnel_handler = RotatingFileHandler("audits.log", maxBytes=2000, backupCount=5)
funnel_handler.setFormatter(logging_format)
funnel_logger.addHandler(funnel_handler)

creds_logger = logging.getLogger("CredsLogger")
creds_logger.setLevel(logging.INFO)
creds_handler = RotatingFileHandler("cmd_audits.log", maxBytes=2000, backupCount=5)
creds_handler.setFormatter(logging_format)
creds_logger.addHandler(creds_handler)

def emulated_shell(channel, client_ip):
    channel.send(b'corpuser1@corp-linux01:~$ ')
    command = b""

    while True:
        char = channel.recv(1)
        channel.send(char)

        if not char:
            channel.close()

        command += char

        if char == b"\r":
            if command.strip() == b"exit":
                response = b"\n Goodbye!\n"
                channel.close()
            elif command.strip() == b"pwd":
                response = b"\n" + b"\\user\\local" + b"\r\n"
                creds_logger.info(f"Command: [{command.strip()}] executed by [{client_ip}]")
            elif command.strip() == b"whoami":
                response = b"\n" + b"corpuser1" + b"\r\n"
                creds_logger.info(f"Command: [{command.strip()}] executed by [{client_ip}]")
            elif command.strip() == b"ls":
                response = b"\n" + b"secret.txt" + b"\r\n"
                creds_logger.info(f"Command: [{command.strip()}] executed by [{client_ip}]")
            elif command.strip() == b"cat secret.txt":
                response = b"\n" + b"Super secret message" + b"\r\n"
                creds_logger.info(f"Command: [{command.strip()}] executed by [{client_ip}]")
            else:
                response = b"\n" + bytes(command.strip()) + b"\r\n"
                creds_logger.info(f"Command: [{command.strip()}] executed by [{client_ip}]")

            channel.send(response)
            channel.send(b"corpuser1@corp-linux01:~$ ")
            command = b""



class Server(paramiko.ServerInterface):
    def __init__(self, client_ip, input_username=None, input_password=None):
        self.event = threading.Event()
        self.client_ip = client_ip
        self.input_username = input_username
        self.input_password = input_password

    def check_channel_request(self, kind, chanid):
        if kind == "session":
            return paramiko.OPEN_SUCCEEDED
        
    def get_allowed_auths(self, username):
        return "password"
    
    def check_auth_password(self, username, password):
        funnel_logger.info(f"Client [{self.client_ip}] attempted connection with username: [{username}] and password: [{password}]")
        creds_logger.info(f"[{self.client_ip}], [{username}], [{password}]")

        if self.input_username is not None and self.input_password is not None:
            if username == self.input_username and password == self.input_password:
                return paramiko.AUTH_SUCCESSFUL
            else:
                return paramiko.AUTH_FAILED
        else:
            return paramiko.AUTH_SUCCESSFUL
        
    def check_channel_shell_request(self, channel):
        self.event.set()
        return True
    
    def check_channel_pty_request(self, channel, term, width, height, pixelwidth, pixelheight, modes):
        return True
    
    def check_channel_exec_request(self, channel, command):
        command = str(command)
        return True
    
def client_handle(client, address, username, password):
    client_ip = address[0]
    print(f"{client_ip} has connected to the server.")

    try:
        transport = paramiko.Transport(client)
        transport.local_version = SSH_BANNER

        server = Server(client_ip=client_ip, input_username=username, input_password=password)

        transport.add_server_key(host_key)
        transport.start_server(server=server)

        channel = transport.accept(100)
        if channel is None:
            print("No channel was opened.")

        standard_banner = "Welcome to Ubuntu 22.204 LTS (Jammy Jellyfish)!\r\n\r\n"
        channel.send(standard_banner)
        emulated_shell(channel, client_ip=client_ip)
    except Exception as error:
        print(error)
        print("!!! Error !!!")
    finally:
        try:
            transport.close()
        except Exception as error:
            print(error)
            print("!!! Error !!!")
        client.close()

def honeypot(address, port, username, password):
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    sock.bind((address, port))
    sock.listen(5)

    print(f"SSH server is listening on port {port}.")

    while True:
        try:
            client, address = sock.accept()

            ssh_honeypot_thread = threading.Thread(target=client_handle, args=(client, address, username, password))
            ssh_honeypot_thread.start()
        except Exception as error:
            print(error)
            print("!!! Error !!!")

