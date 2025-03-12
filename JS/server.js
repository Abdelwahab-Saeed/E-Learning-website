const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

dotenv.config();
const app = express();
const port = 3000;

// Middleware to parse request bodies
app.use(bodyParser.json());

// Route to create an order with PayPal
app.post('/create-order', async (req, res) => {
  const { amount } = req.body;

  try {
    // Get PayPal access token
    const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`).toString('base64');
    const tokenResponse = await axios.post(`${process.env.PAYPAL_API_URL}/v1/oauth2/token`, 'grant_type=client_credentials', {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const accessToken = tokenResponse.data.access_token;

    // Create an order
    const orderResponse = await axios.post(
      `${process.env.PAYPAL_API_URL}/v2/checkout/orders`,
      {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: amount,
            },
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({ orderID: orderResponse.data.id });
  } catch (error) {
    console.error('Error creating PayPal order:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to create PayPal order' });
  }
});

// Route to capture payment after approval
app.post('/capture-payment', async (req, res) => {
  const { orderID } = req.body;

  try {
    // Get PayPal access token
    const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`).toString('base64');
    const tokenResponse = await axios.post(`${process.env.PAYPAL_API_URL}/v1/oauth2/token`, 'grant_type=client_credentials', {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const accessToken = tokenResponse.data.access_token;

    // Capture the payment
    const captureResponse = await axios.post(
      `${process.env.PAYPAL_API_URL}/v2/checkout/orders/${orderID}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({ status: 'Payment captured', details: captureResponse.data });
  } catch (error) {
    console.error('Error capturing PayPal payment:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to capture payment' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
