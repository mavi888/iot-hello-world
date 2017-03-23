## Coding example IoT Helsinki

## Part 1 - Set up

1. Run in the terminal
```
npm init
```

2. Run in the terminal
```
serverless create --template aws-nodejs
```

3. update the service name

4. Log in to the AWS console and show that there is nothing

5. Deploy de lambda and show that there is a lamdba

6. Show the code in the console

7. Update the message, deploy again, and show the code. Test the Lambda

8. Add a http trigger
```
events:
  - http:
      path: hello
      method: get
```

9. Deploy, try the URL and check the AWS console

10. Check the logs for the Lambda

## Part 2 - Saving the temperature

Let's imagine that we have a smart sensor that sends the temperature to a server, so it can analyse it, store it and later show it to a user.

- First we need to create an endpoint that the sensor can send the info to
- Then we need to store it in the database
- After we need to create another endpoint that we can get all the values stored in the database

1. Add the new lambda and api gateway in serverless.yml
```
setTemperature:
  handler: handler.setTemperature
  events:
    - http:
        path: temperature
        method: post
```

2. Add the new handler method for the Lambda
```
module.exports.setTemperature = (event, context, callback) => {
  var temperature = event.body;

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Hello iot helsinki the temperature is: ' + temperature,
      input: event,
    }),
  };

  callback(null, response);
};
```

3. Let's save this to a DynamoDB database, first let create the table
```
resources:
  Resources:
    TemperaturesTable:
      Type: "AWS::DynamoDB::Table"
      Properties:
        AttributeDefinitions:
        - AttributeName: "temperatureId"
          AttributeType: "S"
        KeySchema:
        - AttributeName: "temperatureId"
          KeyType: "HASH"
        ProvisionedThroughput:
          ReadCapacityUnits: 1
          WriteCapacityUnits: 1
        TableName: "temperatures-table"
```

We also need to give permission to get to that table

```
iamRoleStatements:
  - Effect: "Allow"
    Action:
      - "dynamodb:Scan"
      - "dynamodb:GetItem"
      - "dynamodb:PutItem"
      - "dynamodb:DeleteItem"
    Resource:
      - arn:aws:dynamodb:us-east-1:388044143604:table/temperatures-table
```

4. Now we create the code to save this to the table

create a new file called temperatureManager

```
'use strict';

const AWS = require('aws-sdk');
const promisify = require('es6-promisify');
const shortid = require('shortid');

const dynamo = new AWS.DynamoDB.DocumentClient();
const putAsync = promisify(dynamo.put, dynamo);

const temperatureTableName = process.env.TEMPERATURE_DYNAMODB_TABLE;

module.exports.saveTemperature = (temperature) => {
  const item = {};
  item.temperatureId = shortid.generate();
  item.temperature = temperature;
  item.created = Date.now().toString();

  const params = {
    TableName: temperatureTableName,
    Item: item,
    ConditionExpression: 'attribute_not_exists(temperatureId)',
  };

  return putAsync(params)
  .then(() => {
    console.log(`Saving new temperature ${JSON.stringify(item)}`);
    return item;
  });
}
```

!!dont forget to npm install the missing libs

update the handler.js
```
const temperatureManager = require('./temperatureManager');

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
```

## Part 3 - Getting all the temperatures


1. Add the new lambda and api gateway in serverless.yml
```
getTemperatures:
  handler: handler.getTemperatures
  events:
    - http:
        path: temperature
        method: get
```

2. Add the new handler method for the Lambda
```
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
```

3. Add the function in the temperatures Manager to control this
```
const scanAsync = promisify(dynamo.scan, dynamo);

module.exports.getTemperatures = () => {
  const params = {
    TableName: temperatureTableName,
  };

  return scanAsync(params)
  .then(response => {
    return response.Items
  });
}

```

4. Deploy and test 
