import * as uuid from 'uuid'

import { MemoryItem } from '../models/MemoryItem'
import { MemoryAccess } from '../dataLayer/memoryAccess'
import { MemoryRequest } from '../requests/MemoryRequest'

const memoryAccess = new MemoryAccess()

export async function getUserMemoryItems(userId: String): Promise<MemoryItem[]> 
{
  return memoryAccess.getUserMemoryItems(userId)
}

export async function addAttachmentUrlToMemory(memoryId: String, url: String): Promise<boolean> 
{
  return memoryAccess.addAttachmentUrlToMemory(memoryId, url)
}


export async function createMemory(memoryRequest: MemoryRequest, userId: string): Promise<MemoryItem> 
{
  const memoryId =  uuid.v4();
  const createdAt = new Date().toISOString()
  const newMemory = {
    userId,
    memoryId: memoryId,
    createdAt,
    ...memoryRequest
  }

  return memoryAccess.createMemoryItem(newMemory)
}

export async function updateMemory(memoryId: String, userId: string, memoryRequest: MemoryRequest)
{
    return memoryAccess.updateMemoryItem(memoryId, userId, memoryRequest)
}

export async function deleteMemory(memoryId: String, userId: string)
{
    return memoryAccess.deleteMemoryItem(memoryId, userId)
}

export async function createMemoryAttachmentUploadUrl(memoryId: String)
{
  return memoryAccess.createMemoryAttachmentUploadUrl(memoryId)
}