/*
NodeJS CMX Receiver

A basic web service to accept CMX data from a Cisco Meraki network
- Accept a GET request from Meraki and respond with a validator
- Meraki will POST to server, if validated.
- POST will contain a secret, which can be verified by the server.
- JSON data will be in the req.body.data. This will be available in the cmxData function's data object.

-- This skeleton app will only place the data received on the console. It's up to the developer to use this how ever required

*/

// CHANGE THESE CONFIGURATIONS to match your CMX configuration
const port = process.env.OVERRIDE_PORT || process.env.PORT || 1890;
const secret = process.env.SECRET || 'herma123';
const validator = process.env.VALIDATOR || '9c86aa5639b285e4df551ed15623c01ce01f6f50';
const route = process.env.ROUTE || '/cmx';

const responses = [];

let temp = [];
// All CMX JSON data will end up here. Send it to a database or whatever you fancy.
// data format specifications: https://documentation.meraki.com/MR/Monitoring_and_Reporting/CMX_Analytics#Version_2.0
function cmxData(data) {
  console.log(`JSON Feed: ${JSON.stringify(data, null, 2)}`);
}

//* *********************************************************

// Express Server
const express = require('express');

const app = express();
const bodyParser = require('body-parser');

//
app.use(bodyParser.json({ limit: '25mb' }));

// CMX Location Protocol, see https://documentation.meraki.com/MR/Monitoring_and_Reporting/CMX_Analytics#API_Configuration
//
// Meraki asks for us to know the secret
app.get(route, (req, res) => {
  console.log(`Validator = ${validator}`);
  res.status(200).send(validator);
});

app.get('/', (req, res) => {
  res.status(200).send('Hermano');
});
//
// Getting the flow of data every 1 to 2 minutes
app.post(route, (req, res) => {
  if (req.body.secret == secret) {
    console.log('Secret verified');
    cmxData(req.body);
    responses.push(req.body);
    temp = filterData(req.body);
  } else {
    console.log('Secret was invalid');
  }
  res.status(200);
});

const filterData = (data) => {
  const TIME_FRAME = new Date().getTime() - 10 * 60 * 1000;
  const response = [];
  const { observations } = data.data;
  for (let i = 0; i < observations.length; i++) {
    if (new Date(observations[i].seenTime).getTime() > TIME_FRAME) {
      response.push(observations[i]);
      console.log('++++++++++++++++++++++++++++++++');
    }
  }
  return response;
};

app.get('/response', (req, res) => {
  res.status(200).send({
    responses,
    length: responses.length,
  });
});

app.get('/temp', (req, res) => {
  res.status(200).send(temp);
});

// Start server
app.listen(port, () => {
  console.log(`CMX Receiver listening on port: ${port}`);
});
