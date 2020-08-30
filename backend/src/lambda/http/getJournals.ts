import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import { parseUserId } from '../../auth/utils'

import { createLogger } from '../../utils/logger'
import { getJournals } from '../../businessLogic/journals'

const logger = createLogger('auth')


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const userId = parseUserId(jwtToken)
  logger.info(`${userId} request journals`)

  const result = await getJournals(userId)

  const items = result.Items

  return {
    statusCode:200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      items
    })
  }
}
