import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateJournalRequest } from '../../requests/UpdateJournalRequest'

import { parseUserId } from '../../auth/utils'
import { createLogger } from '../../utils/logger'
import { updateJournal } from '../../businessLogic/journals'

const logger = createLogger('auth')


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const journalId = event.pathParameters.journalId
  const updatedJournal: UpdateJournalRequest = JSON.parse(event.body)
  logger.info(`${journalId} updated, ${updatedJournal.title}, ${updatedJournal.content}`)
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const userId = parseUserId(jwtToken)
  let result = await updateJournal(journalId, userId, updatedJournal)
  logger.info(`${journalId} result: `)
  console.log(result)
  return {
    statusCode: 202,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: null
  }
}
