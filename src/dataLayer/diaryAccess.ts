import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { DiaryItem } from '../models/DiaryItem'
import { DiaryRequest } from '../requests/DiaryRequest'

export class DiaryAccess 
{

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly diaryTable = process.env.DIARY_TABLE,
    private readonly diaryIdIndex = process.env.DIARY_ID_INDEX) {
  }

  async getUserDiaryItems(userId: String): Promise<DiaryItem[]>
  {
    const result = await this.docClient.query
    (
      {
        TableName: this.diaryTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {':userId': userId},
        ScanIndexForward: false
      }
    ).promise();
    
    const items = result.Items;
    return items as DiaryItem[]
  }

  async addAttachmentUrlToDiary(diaryId: String, url: String): Promise<boolean>
  {
    const result = await this.docClient.query({
      TableName : this.diaryTable,
      IndexName : this.diaryIdIndex,
      KeyConditionExpression: 'diaryId = :diaryId',
      ExpressionAttributeValues: {
          ':diaryId': diaryId
      }
    }).promise()
  
    if (result.Count !=  0)
    {
      const diary = {
        ...result.Items[0],
        attachmentUrl: url
      }
  
       await this.docClient.put({
        TableName: this.diaryTable,
        Item: diary
      }).promise();

      return true;
    }
    
    return false;
  }


  async createDiaryItem(diary: DiaryItem): Promise<DiaryItem> 
  {
    await this.docClient.put
    (
      {
        TableName: this.diaryTable,
        Item: diary
      }
    ).promise();

    return diary
  }

  async updateDiaryItem(diaryId: String, userId: String, updatedDiary: DiaryRequest) {
    await this.docClient.update
    (
      {
        TableName: this.diaryTable,
        Key: 
        {
          userId: userId,
          diaryId: diaryId
        },
        UpdateExpression: 'SET #t = :title, details = :details',
        ExpressionAttributeValues : 
        {
          ':title': updatedDiary.title,
          ':details': updatedDiary.details
        },
        ExpressionAttributeNames: 
        {
          '#t': 'title'
        }
      }
    ).promise();
  }

  async deleteDiaryItem(diaryId: String, userId: String) {
    await this.docClient.delete
    (
      {
        TableName: this.diaryTable,
        Key: 
        {
          userId: userId,
          diaryId: diaryId
        }
      }
    ).promise();
  }
 
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new AWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000',
      service: AWSXRay.captureAWSClient(new AWS.DynamoDB)
    })
  }

  return new AWS.DynamoDB.DocumentClient({service: AWSXRay.captureAWSClient(new AWS.DynamoDB)})
}
