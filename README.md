# Bloom
Simplifying Plant Identification in a Fun Way!

## Local Development Setup

### Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/ZDiriye/Bloom.git
   ```

### Mobile Setup

1. Install Expo Go on your mobile device:
   - iOS: Download from the [App Store](https://apps.apple.com/app/expo-go/id982107779)

### Server Configuration

1. **IP Address Setup**
   - Open `utils/new_mlModel.js`
   - Replace `172.20.10.6` from the variable `SERVER_URL` with your local network IP address
   
2. **Port Configuration**
   - The server runs on port 5000 by default
   - If port 5000 is already in use for you:
     - Open `assets/newModel/server.py` and change the port number to a different port number in `app.run(host='0.0.0.0', port=5000)`
     - Open `utils/new_mlModel.js` and replace `5000` from the variable `SERVER_URL`.
     - Make sure to use the same port number in both files

### Running the Application

1. Make sure you're in the Bloom directory and install dependencies:
   ```bash
   npm install
   ```

2. Then start the React Native application:
   ```bash
   clear
   npm run ios
   ```
   Note: If the first attempt fails, try running `npm run ios` again.

3. Once the application starts, open another terminal window and start the Python server:
   ```bash
   cd assets/newModel
   python server.py
   ```
   Note: If you encounter any errors on the server terminal, revisit the Server Configuration steps above to ensure your IP address and port settings are correct.

4. Once both are running:
   - Scan the QR code that appears in your terminal with your phone's camera
   - The app will open in Expo Go and from there you can interact with the application

Note: Make sure both the server and the application on the mobile phone are running simultaneously and are on the same wifi connetion for the app to function properly.

### Tests

1. Tests are in "components/__tests__"
