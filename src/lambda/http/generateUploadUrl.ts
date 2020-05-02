import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk'

import { addAttachmentUrlToDiary } from '../../buisnessLogic/diary'

const XAWSS3 = AWSXRay.captureAWS(AWS)
const s3 = new XAWSS3.S3({
  signatureVersion: 'v4'
})

const bucketName = process.env.DIARY_S3_BUCKET;
const urlExpiration = Number(process.env.SIGNED_URL_EXPIRATION);

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const diaryId = event.pathParameters.diaryId


  const url = s3.getSignedUrl('putObject', 
  {
    Bucket: bucketName,
    Key: diaryId,
    Expires: urlExpiration
  })

  const attachmenturl = `https://${bucketName}.s3.amazonaws.com/${diaryId}`

  const success = await addAttachmentUrlToDiary(diaryId, attachmenturl)

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