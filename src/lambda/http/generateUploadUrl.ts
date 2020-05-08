import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createMemoryAttachmentUploadUrl } from '../../buisnessLogic/memory'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const memoryId = event.pathParameters.memoryId
  const url = await createMemoryAttachmentUploadUrl(memoryId)
  if (url.length != 0)
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