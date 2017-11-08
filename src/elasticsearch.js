import elasticsearch from 'elasticsearch'

export const client = (): elasticsearch => {
  // test if configuration is complete
  if (process.env.ELASTIC_HOST) throw Error('missing argument')

  // test if elasticsearch is loaded
  if (!elasticsearch || typeof elasticsearch === undefined) {
    throw Error('elasticsearch not work')
  }

  const client = new elasticsearch.Client({
    host: 'http://localhost:9200',
    log: 'error',
  })

  return client
}
