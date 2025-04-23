# Instructions to run

1. Generate the public private key pairs
`ssh-keygen -t rsa -b 2048 -f server.key`
2. For running the ssh honeypot
`python honeypy.py -a 127.0.0.1 -p 2223 --ssh`
3. For running the web honeypot
`python honeypy.py -a 127.0.0.1 -p 5000 --http`