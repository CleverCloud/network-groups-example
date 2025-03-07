import express from 'express';
import axios from 'axios';
import os from 'os';

const app = express();
const PRIVATE_SERVICE_URL = process.env.PRIVATE_SERVICE_URL;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Clever Cloud's Network Groups demo</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 1024px; margin: 0 auto; padding: 20px; }
        .card { border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin-bottom: 20px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; }
        input[type="text"] { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
        button { background-color: #4CAF50; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background-color: #45a049; }
        #result { display: none; }
        .network-path { display: flex; align-items: center; margin: 20px 0; }
        .service { padding: 10px; border: 1px solid #ddd; border-radius: 4px; background-color: #f9f9f9; flex: 1; }
        .arrow { margin: 0 15px; font-size: 24px; }
        pre { background-color: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; }
      </style>
    </head>
    <body>
      <h1>Network Groups Demo - Inverter service</h1>

      <div class="card">
        <h2>About This Demo</h2>
        <p>This demo shows how two services can communicate securely via Clever Cloud Network Groups:</p>
        <ul>
          <li>The <strong>Public Service</strong> (this page) is accessible from the Internet</li>
          <li>The <strong>Private Service</strong> has two interfaces:
            <ul>
              <li>A <strong>public endpoint</strong> on port 9000 that only returns "OK" for monitoring</li>
              <li>A <strong>private endpoint</strong> on port 4242 that processes messages, only accessible within the Network Group</li>
            </ul>
          </li>
          <li>Messages are sent securely between services through a Network Group via the private endpoint</li>
        </ul>
      </div>

      <div class="card">
        <h2>Invert a message</h2>
        <form id="messageForm">
          <div class="form-group">
            <label for="message">Message:</label>
            <input type="text" id="message" name="message" placeholder="Enter your message" required>
          </div>
          <button type="submit">Send to Private Service</button>
        </form>
      </div>

      <div id="result" class="card">
        <h2>Message Processing Result</h2>

        <div class="network-path">
          <div class="service">Public Service<br>(Exposed to Internet)</div>
          <div class="arrow">→</div>
          <div class="service">Network Group<br>(WireGuard based tunnel)</div>
          <div class="arrow">→</div>
          <div class="service">Private Service<br>(Port 4242, Private)</div>
        </div>

        <h3>Response:</h3>
        <pre id="responseData"></pre>
      </div>

      <script>
        document.getElementById('messageForm').addEventListener('submit', async function(e) {
          e.preventDefault();
          const message = document.getElementById('message').value;

          try {
            // Show processing
            document.getElementById('responseData').textContent = 'Processing...';
            document.getElementById('result').style.display = 'block';

            // Send to our backend
            const response = await fetch('/process', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ message })
            });

            if (!response.ok) {
              throw new Error('Network response was not ok');
            }

            const data = await response.json();
            document.getElementById('responseData').textContent = JSON.stringify(data, null, 2);
          } catch (error) {
            document.getElementById('responseData').textContent = 'Error: ' + error.message;
          }
        });
      </script>
    </body>
    </html>
  `);
});

app.post('/process', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`Sending message to private service at ${PRIVATE_SERVICE_URL}`);
    const response = await axios.post(`${PRIVATE_SERVICE_URL}/transform`, {
      message
    });

    const result = {
      ...response.data,
      public_service: {
        hostname: os.hostname(),
        environment: process.env.NODE_ENV || 'development',
        contacted_private_service_at: PRIVATE_SERVICE_URL
      }
    };

    res.json(result);
  } catch (error) {
    console.error('Error calling private service:', error.message);
    res.status(500).json({
      error: 'Failed to process message',
      details: error.message,
      service_attempted: PRIVATE_SERVICE_URL
    });
  }
});
app.listen(8080, () => {
  console.log(`Public service listening at http://O.O.O.O:8080`);
  console.log(`Configured to use private service at: ${PRIVATE_SERVICE_URL}`);
});
