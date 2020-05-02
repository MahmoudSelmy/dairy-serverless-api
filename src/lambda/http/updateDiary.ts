import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { DiaryRequest } from '../../requests/DiaryRequest'
import { updateDiary } from '../../buisnessLogic/diary'
import {getUserId} from '../utils'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const diaryId = event.pathParameters.diaryId
  const updatedDiaryRequest: DiaryRequest = JSON.parse(event.body)

  const userId = getUserId(event);

  await updateDiary(diaryId, userId, updatedDiaryRequest)

  return {
    statusCode: 200,
    headers: {'Access-Control-Allow-Origin': '*'},
    body: JSON.stringify({})
  }
}
