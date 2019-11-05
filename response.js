const requestify = require('requestify');

const fs = require('fs');


requestify.get('https://cmx-test.herokuapp.com/response').then((res) => { // eslint-disable-line
  // console.log(res.getBody());
  const result = res.getBody();
  // console.log({ result });
  analize(result.responses);
}).catch((err) => {
  console.log(err);
});


const analize = (a) => {
  a = a || [];
  const response = {};
  for (let i = 0; i < a.length; i++) {
    const { data } = a[i];
    const { observations } = data;
    for (let j = 0; j < observations.length; j++) {
      const obs = observations[j];
      if (!response[obs.clientMac]) {
        response[obs.clientMac] = {
          manufacturer: obs.manufacturer,
          location: null,
          seenTime: new Date(obs.seenTime),
        };
      }
      if (obs.location !== null) response[obs.clientMac].location = obs.location;
    }
  }
  console.log(Object.keys(response), Object.keys(response).length, response);
};
