import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { DiaryRequest } from '../../requests/DiaryRequest'

import {getUserId} from '../utils'
import { createDiary } from '../../buisnessLogic/diary'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newDiary: DiaryRequest = JSON.parse(event.body)

  const userId = getUserId(event)

  const createdDiary = await createDiary(newDiary, userId)

  return {
    statusCode: 201,
    headers:{'Access-Control-Allow-Origin': '*'},
    body: JSON.stringify({item: createdDiary})
  }
}
