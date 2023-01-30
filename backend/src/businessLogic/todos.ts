import * as uuid from 'uuid'

import { TodosAccess } from '../dataLayer/todosAccess'
import { createSignedUrl, generateAttachmentUrl } from '../dataLayer/attachmentUtils'

import { TodoItem } from '../models/TodoItem'

import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const todoAccess = new TodosAccess()

export async function getAllTodos(userId: string): Promise<TodoItem[]> {
  return await todoAccess.getAllTodos(userId)
}

export async function createTodo(
  CreateTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  const todoId = uuid.v4()
  const url = null

  return await todoAccess.createTodo({
    todoId: todoId,
    userId: userId,
    name: CreateTodoRequest.name,
    dueDate: CreateTodoRequest.dueDate,
    createdAt: new Date().toISOString(),
    done: false,
    attachmentUrl: url
  })
}

export async function updateTodo(
  UpdateTodoRequest: UpdateTodoRequest,
  todoId: string,
  userId: string
): Promise<any> {
  const todo = await todoAccess.getTodo(todoId, userId)

  if (!todo) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'Todo does not exist'
      })
    }
  }

  if (todo.userId !== userId) {
    return {
      statusCode: 403,
      body: JSON.stringify({
        error: 'Not authorized'
      })
    }
  }

  return await todoAccess.updateTodo(UpdateTodoRequest, todoId, userId)
}

export async function deleteTodo(todoId: string, userId: string): Promise<any> {
  const todo = await todoAccess.getTodo(todoId, userId)

  if (!todo) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'Todo does not exist'
      })
    }
  }

  if (todo.userId !== userId) {
    return {
      statusCode: 403,
      body: JSON.stringify({
        error: 'Not authorized'
      })
    }
  }

  return await todoAccess.deleteTodo(todoId, userId)
}

export async function createAttachmentPresignedUrl(
  todoId: string,
  userId: string
): Promise<any> {
  const todo = await todoAccess.getTodo(todoId, userId)

  if (!todo) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'Todo does not exist'
      })
    }
  }

  if (todo.userId !== userId) {
    return {
      statusCode: 403,
      body: JSON.stringify({
        error: 'Not authorized'
      })
    }
  }

  const signedUrl = await createSignedUrl(todoId)
  const attachmentUrl = await generateAttachmentUrl(todoId)
  await todoAccess.updateAttachmentUrl(todoId, attachmentUrl, userId)

  return {
    statusCode: 200,
    body: JSON.stringify({
      uploadUrl: signedUrl
    })
  }
}
