import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWSXRay from 'aws-xray-sdk'
import { parseUserId } from '../../auth/utils'
import { updateUrl } from '../../businessLogic/journals'

const XAWS = AWSXRay.captureAWS(AWS)
import * as AWS  from 'aws-sdk'
const s3 = new XAWS.S3({
    signatureVersion: 'v4'
})

const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const journalId = event.pathParameters.journalId

  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const userId = parseUserId(jwtToken)

  const uploadUrl = getUploadUrl(journalId)

  await updateUrl(journalId, userId)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      uploadUrl
    })
  }
}

function getUploadUrl(journalId: string) {
    return s3.getSignedUrl('putObject', {
      Bucket: bucketName,
      Key: journalId,
      Expires: urlExpiration
    })
  }