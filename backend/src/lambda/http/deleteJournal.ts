import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import { parseUserId } from '../../auth/utils'
import { createLogger } from '../../utils/logger'

import { deleteJournal } from '../../businessLogic/journals'

const logger = createLogger('auth')


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const journalId = event.pathParameters.journalId
  logger.info(`${journalId} deleted`)

  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const userId = parseUserId(jwtToken)
  
  await deleteJournal(journalId, userId)

  return {
    statusCode: 202,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: null
  }
}
