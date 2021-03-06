'use strict';

const temperatureManager = require('./temperatureManager');

module.exports.hello = (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Hello iot helsinki',
      input: event,
    }),
  };

  callback(null, response);

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};

module.exports.setTemperature = (event, context, callback) => {
  var temperature = event.body;

  temperatureManager.saveTemperature(temperature)
  .then(() => {
    const response = {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Hello iot helsinki the temperature is: ' + temperature,
        input: event,
      }),
    };

    callback(null, response);
  });
};

module.exports.getTemperatures = (event, context, callback) => {
  var temperature = event.body;

  temperatureManager.getTemperatures()
  .then((temperatures) => {
    const response = {
      statusCode: 200,
      body: JSON.stringify({
        message: temperatures
      }),
    };

    callback(null, response);
  });
};
