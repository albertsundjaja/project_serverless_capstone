import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateJournalRequest } from '../../requests/CreateJournalRequest'

import { parseUserId } from '../../auth/utils'
import { createLogger } from '../../utils/logger'

import { createJournal } from '../../businessLogic/journals'

const logger = createLogger('auth')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newJournal: CreateJournalRequest = JSON.parse(event.body)

  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const userId = parseUserId(jwtToken)

  logger.info(`${userId} create journal`)
  
  const journal = await createJournal(newJournal, userId)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      item: journal
    })
  }
}
