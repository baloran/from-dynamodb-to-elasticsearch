/* @noflow */

import {
  buildParamsDynamo,
  providerAws,
  isConnected,
  describeTable,
  scanElements,
  scanTable,
  pushToElastic,
  buildDataForES,
} from '../utils'

const context = describe

describe('Utils', () => {
  context('build params for dynamodb', () => {
    it('should return a object with endpoint', () => {
      const params = buildParamsDynamo()
      expect(params).not.toBeNull()
      expect(params).toEqual({
        endpoint: 'http://localhost:8000',
      })
    })
  })
  context('aws configuration', () => {
    it('should return aws with configuration', () => {
      const aws = providerAws()

      expect(aws).not.toBeNull()
    })
  })

  context('retrieve a connection to aws', () => {
    it('should connect to aws', async () => {
      const connected = await isConnected()

      expect(connected).not.toBeNull()
      expect(connected).toHaveProperty('Table')
      expect(connected.Table).toHaveProperty('TableName')
      expect(connected.Table.TableName).toMatch(process.env.DYNAMO_TABLE)
    })
  })

  context('describe table', () => {
    it('should describe table', async () => {
      const table = await describeTable()

      expect(table).not.toBeNull()
      expect(table).toHaveProperty('Table')
      expect(table.Table).toHaveProperty('TableName')
      expect(table.Table.TableName).toMatch(process.env.DYNAMO_TABLE)
    })
  })

  context('scan elements', () => {
    it('should return promise of scan dynamodb', async () => {
      const scanPromise = await scanElements()

      expect(scanPromise).not.toBeNull()
      expect(scanPromise).toHaveProperty('Items')
      expect(scanPromise).toHaveProperty('Count')
      expect(scanPromise).toHaveProperty('ScannedCount')
    })
  })

  context('scan table', () => {
    it('should return all elements scanned', async () => {
      const scanPromise = await scanTable()
      console.log(scanPromise)
      expect(scanPromise).not.toBeNull()
    })
  })

  context('build data for elasticSeach', () => {
    it('should return a formed data', async () => {
      const scanPromise = await scanTable()
      const elements = await buildDataForES(scanPromise)

      console.log(elements)

      expect(elements).not.toBeNull()
    })
  })

  context('push to ES', () => {
    it('should push elements to ES', async () => {
      const scanPromise = await scanTable()
      const pushed = await pushToElastic(scanPromise)

      console.log(pushed)

      expect(pushed).not.toBeNull()
    })
  })
})
