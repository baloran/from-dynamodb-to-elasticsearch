/* @flow */

import inquirer from 'inquirer'

import {
  isConnected,
  describeTable,
  startSpinner,
  stopSpinner,
  scanTable,
  pushToElastic,
} from './utils'
import { client } from './elasticsearch'

/**
 * Sync data between dynamodb and elasticsearch
 */

export const init = () => {
  return new Promise(async (resolve, reject) => {
    try {
      startSpinner()
      await isConnected // Test if connected

      // Get the table info
      const table = await describeTable()

      stopSpinner()

      // Ask for confirmation
      const confirmTable = await inquirer.prompt({
        type: 'confirm',
        name: 'verif_table',
        message: `${table.Table.TableName} is the right table ?`,
      })

      // Is not the correct table
      if (!confirmTable.verif_table) {
        return console.log('Change the configuration')
      }

      // Connect to elastic search
      const elastic = client()

      // Ping ES 🤓
      await elastic.ping()

      const elements = await scanTable()
      const pushed = await pushToElastic(elements)

      console.log('imported !')
    } catch (err) {
      return reject(err)
    }
  })
}

init()
