import * as uuid from 'uuid'

import { DiaryItem } from '../models/DiaryItem'
import { DiaryAccess } from '../dataLayer/diaryAccess'
import { DiaryRequest } from '../requests/DiaryRequest'

const diaryAccess = new DiaryAccess()

export async function getUserDiaryItems(userId: String): Promise<DiaryItem[]> 
{
  return diaryAccess.getUserDiaryItems(userId)
}

export async function addAttachmentUrlToDiary(diaryId: String, url: String): Promise<boolean> 
{
  return diaryAccess.addAttachmentUrlToDiary(diaryId, url)
}


export async function createDiary(diaryRequest: DiaryRequest, userId: string): Promise<DiaryItem> 
{
  const diaryId =  uuid.v4();
  const createdAt = new Date().toISOString()
  const newDiary = {
    userId,
    diaryId,
    createdAt,
    ...diaryRequest
  }

  return diaryAccess.createDiaryItem(newDiary)
}

export async function updateDiary(diaryId: String, userId: string, diaryRequest: DiaryRequest)
{
    return diaryAccess.updateDiaryItem(diaryId, userId, diaryRequest)
}

export async function deleteDiary(diaryId: String, userId: string)
{
    return diaryAccess.deleteDiaryItem(diaryId, userId)
}
