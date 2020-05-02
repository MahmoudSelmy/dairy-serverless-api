import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import {getUserId} from '../utils'
import { deleteDiary } from '../../buisnessLogic/diary'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const diaryId = event.pathParameters.diaryId

  const userId = getUserId(event)

  await deleteDiary(diaryId, userId)

  return {
    statusCode: 200,
    headers: {'Access-Control-Allow-Origin': '*'},
    body: JSON.stringify({})
  }
}
