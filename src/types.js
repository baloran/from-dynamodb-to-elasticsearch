/* @flow */

export type describeTableType = {
  Table: {
    AttributeDefinitions: Array,
    TableName: string,
    KeySchema: Array,
    TableStatus: string,
    CreationDateTime: date,
    ProvisionedThroughput: {
      LastIncreaseDateTime: date,
      LastDecreaseDateTime: date,
      NumberOfDecreasesToday: number,
      ReadCapacityUnits: number,
      WriteCapacityUnits: number,
    },
    TableSizeBytes: number,
    ItemCount: number,
    TableArn: string,
  },
}
