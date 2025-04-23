# Instructions to run

1. Create a virtual environment
`python -m venv venv`
2. Activate virtual environment
`.\venv\Scripts\activate`
3. Install required libraries
`pip install -r requirements.txt`
4. Generate the public private key pairs
`ssh-keygen -t rsa -b 2048 -f server.key`
5. For running the ssh honeypot
`python honeypy.py -a 127.0.0.1 -p 2223 --ssh`
6. For running the web honeypot
`python honeypy.py -a 127.0.0.1 -p 5000 --http`