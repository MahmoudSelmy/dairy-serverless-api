import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { MemoryItem } from '../models/MemoryItem'
import { MemoryRequest } from '../requests/MemoryRequest'

const XAWSS3 = AWSXRay.captureAWS(AWS)

export class MemoryAccess 
{

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly memoriesTable = process.env.MEMORIES_TABLE,
    private readonly memoryIdIndex = process.env.MEMORIES_ID_INDEX,
    private readonly s3 = new XAWSS3.S3({signatureVersion: 'v4'}),
    private readonly bucketName = process.env.MEMORIES_S3_BUCKET,
    private readonly urlExpiration = Number(process.env.SIGNED_URL_EXPIRATION)) {
  }

  async getUserMemoryItems(userId: String): Promise<MemoryItem[]>
  {
    const result = await this.docClient.query
    (
      {
        TableName: this.memoriesTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {':userId': userId},
        ScanIndexForward: false
      }
    ).promise();
    
    const items = result.Items;
    return items as MemoryItem[]
  }

  async addAttachmentUrlToMemory(memoryId: String, url: String): Promise<boolean>
  {
    const result = await this.docClient.query({
      TableName : this.memoriesTable,
      IndexName : this.memoryIdIndex,
      KeyConditionExpression: 'memoryId = :memoryId',
      ExpressionAttributeValues: {
          ':memoryId': memoryId
      }
    }).promise()
  
    if (result.Count !=  0)
    {
      const memory = {
        ...result.Items[0],
        attachmentUrl: url
      }
  
       await this.docClient.put({
        TableName: this.memoriesTable,
        Item: memory
      }).promise();

      return true;
    }
    
    return false;
  }


  async createMemoryItem(memory: MemoryItem): Promise<MemoryItem> 
  {
    await this.docClient.put
    (
      {
        TableName: this.memoriesTable,
        Item: memory
      }
    ).promise();

    return memory
  }

  async updateMemoryItem(memoryId: String, userId: String, updatedMemory: MemoryRequest) {
    await this.docClient.update
    (
      {
        TableName: this.memoriesTable,
        Key: 
        {
          userId: userId,
          memoryId: memoryId
        },
        UpdateExpression: 'SET #t = :title, details = :details',
        ExpressionAttributeValues : 
        {
          ':title': updatedMemory.title,
          ':details': updatedMemory.details
        },
        ExpressionAttributeNames: 
        {
          '#t': 'title'
        }
      }
    ).promise();
  }

  async deleteMemoryItem(memoryId: String, userId: String) {
    await this.docClient.delete
    (
      {
        TableName: this.memoriesTable,
        Key: 
        {
          userId: userId,
          memoryId: memoryId
        }
      }
    ).promise();
  }

  async createMemoryAttachmentUploadUrl(memoryId: String)
  {
    const url = this.s3.getSignedUrl('putObject', 
    {
      Bucket: this.bucketName,
      Key: memoryId,
      Expires: this.urlExpiration
    })
    const attachmenturl = `https://${this.bucketName}.s3.amazonaws.com/${memoryId}`
    const success = await this.addAttachmentUrlToMemory(memoryId, attachmenturl)
    if (success)
    {
      return url;
    }
    return ''
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
