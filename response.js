const requestify = require('requestify');

const fs = require('fs');


const TIME_FRAME = new Date().getTime() - 10 * 60 * 1000;

requestify.get('https://cmx-test.herokuapp.com/response').then((res) => { // eslint-disable-line
  // console.log(res.getBody());
  const result = res.getBody();
  // console.log({ result });
  analize(result.responses);
}).catch((err) => {
  console.log(err);
});


const analize = (a) => { // eslint-disable-line
  a = a || [];
  const response = {};
  for (let i = 0; i < a.length; i++) {
    const { data } = a[i];
    const { observations } = data;
    for (let j = 0; j < observations.length; j++) {
      const obs = observations[j];
      if (isReacent(obs)) {
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
  }
  console.log(Object.keys(response), Object.keys(response).length, response);
};


const isReacent = (input) => {
  const date = new Date(input.seenTime);
  return date.getTime() > TIME_FRAME;
  // return true;
};
