import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk'

import { addAttachmentUrlToMemory } from '../../buisnessLogic/memory'

const XAWSS3 = AWSXRay.captureAWS(AWS)
const s3 = new XAWSS3.S3({
  signatureVersion: 'v4'
})

const bucketName = process.env.MEMORIES_S3_BUCKET;
const urlExpiration = Number(process.env.SIGNED_URL_EXPIRATION);

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const memoryId = event.pathParameters.memoryId


  const url = s3.getSignedUrl('putObject', 
  {
    Bucket: bucketName,
    Key: memoryId,
    Expires: urlExpiration
  })

  const attachmenturl = `https://${bucketName}.s3.amazonaws.com/${memoryId}`

  const success = await addAttachmentUrlToMemory(memoryId, attachmenturl)

  if (success)
  {
    return {
      statusCode: 200,
      headers: {'Access-Control-Allow-Origin': '*'},
      body: JSON.stringify({uploadUrl: url})
    }
  }
  return {
    statusCode: 404,
    headers: {'Access-Control-Allow-Origin': '*'},
    body: ''
  }
}