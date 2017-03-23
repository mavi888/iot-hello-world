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
