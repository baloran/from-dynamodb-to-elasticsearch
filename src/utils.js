/* @flow */

require('dotenv').config()

import AWS from 'aws-sdk'
import { Spinner } from 'cli-spinner'
import _ from 'lodash'
import throat from 'throat'

import { describeTableType } from './types'
import { client } from './elasticsearch'

Spinner.setDefaultSpinnerString('Loading')
const loader = new Spinner()

const es = client()
let globalIndex = 0

/**
 * Build params object for dynamoDB
 */
export const buildParamsDynamo = (): Object => {
  return {
    endpoint: process.env.DYNAMO_ENDPOINT,
  }
}

/**
 * configuration and return AWS
 */
export const providerAws = (): AWS => {
  if (!process.env.AWS_REGION) throw new Error('missing region in env file')

  AWS.config.region = process.env.AWS_REGION || 'eu-west-1'

  return AWS
}

/**
 * test if connected to the table
 */
export const isConnected = (): Promise<Boolean> => {
  return new Promise(async (resolve, reject) => {
    if (!process.env.DYNAMO_TABLE) return reject('missing arguments')
    try {
      const credential = await describeTable()
      return resolve(credential)
    } catch (err) {
      return reject(err)
    }
  })
}

/**
 * Return info of table
 */
export const describeTable = (): Promise<describeTableType> => {
  return new Promise(async (resolve, reject) => {
    try {
      const aws = providerAws()
      const dynamodb = new aws.DynamoDB(buildParamsDynamo())
      const credential = await dynamodb
        .describeTable({
          TableName: process.env.DYNAMO_TABLE,
        })
        .promise()
      return resolve(credential)
    } catch (err) {
      return reject(err)
    }
  })
}

/**
 * Retrieve elements from table
 * @param {Object} lastEvaluatedKey 
 */
export const scanElements = lastEvaluatedKey => {
  const aws = providerAws()
  const dynamodb = new aws.DynamoDB.DocumentClient(buildParamsDynamo())
  let params = {
    TableName: process.env.DYNAMO_TABLE,
  }

  if (lastEvaluatedKey) params.ExclusiveStartKey = lastEvaluatedKey

  return dynamodb.scan(params).promise()
}

/**
 * Paginate results with lastEvaluatedKey and a do..While
 */
export const scanTable = () => {
  return new Promise(async (resolve, reject) => {
    let currentScan
    let data = []
    do {
      if (currentScan && currentScan.LastEvaluatedKey) {
        currentScan = await scanElements(currentScan.LastEvaluatedKey)
      } else {
        currentScan = await scanElements()
      }
      data = [...data, ...currentScan.Items]
    } while (currentScan.LastEvaluatedKey)

    return resolve(data)
  })
}

/**
 * mechanism of push to elastic
 */
export const pushToElastic = (datas: Array) => {
  return new Promise((resolve, reject) => {
    if (!datas) return reject('missing data')
    const chunck = _.chunk(datas, 4)

    const preparedData = _.map(chunck, buildDataForES)

    Promise.all(
      preparedData.map(
        throat(1, async el => {
          return await processIndexES(el)
        }),
      ),
    )
      .then(es => {
        return resolve('done')
      })
      .catch(err => {
        console.log(err)
        return reject(err)
      })
  })
}

/**
 * bulk index to ES
 * @param {Array} data 
 */
export const processIndexES = data => {
  return es.bulk({
    body: data,
  })
}

/**
 * Build object for bulk insert
 * @param {Array} datas 
 */
export const buildDataForES = datas => {
  const data = []

  _.each(datas, el => {
    data.push({
      index: {
        _index: process.env.ES_INDEX,
        _type: process.env.ES_TYPE,
        _id: globalIndex,
      },
    })
    data.push(el)
    globalIndex++
  })

  return data
}

/**
 * Interface for spinner
 * Start the spinner
 */
export const startSpinner = () => {
  loader.start()
}

/**
 * Interface for spinner
 * stop the spinner
 */
export const stopSpinner = () => {
  loader.stop()
}
