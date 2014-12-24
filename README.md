arthrobots
==========

A reincarnation of Guido van Robot / Karl the Robot for the web

Developer Setup
---------------

After cloning the repository you'll want to install the dependencies using npm. Go to the cloned git repository in your command line and run:

    npm install

To start the server running use:

    npm start

If you are changing code around, you'll need to continuously rebuild the javascript that gets loaded. To do this open up a new terminal while your server remains running and run:

    npm run-script build

This will continuously update the build/main.js file with the latest code. You may periodically need to restart it if there are errors, though normally it works fine.

Facebook Login in Dev Environment
---------------------------------

A quick note about facebook login in your dev environment. If you want it to work, you need to go to http://local.carduner.net:8000 (which just points to 127.0.0.1) so that facebook will accept your authentication requests.
