# Instructions to run

1. Setup
    - Create a virtual environment using `python -m venv venv`
    - Activate the envrionment using `.\venv\Scripts\activate`
    - Navigate to client `cd client`
    - Install the dependencies `npm install`
    - Navigate to server `cd server`
    - Install the requirements `pip install -r requirements.txt`

2. Generate the public and private key pairs from the server directory
    - `ssh-keygen -t rsa -b 2048 -f server.key`

3. To run the ssh honeypot
    - Navigate to the server directory `cd server`
    - Run the ssh server `python honeypy.py -a 127.0.0.1 -p 2223 --ssh`
    - Open command line and remove any previous keys if present `ssh-keygen -R [127.0.0.1]:2223`
    - Connect with command line `ssh -p 2223 [username]@127.0.0.1`

4. To run the web honeypot
    - Navigate to the server directory `cd server`
    - Run the http server `python honeypy.py -a 127.0.0.1 -p 5000 --http`
    - Navigate to the client directory `cd client`
    - Run the client `npm run dev`
