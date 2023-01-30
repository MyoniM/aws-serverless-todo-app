import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateTodo } from '../../businessLogic/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

    const userId = getUserId(event)

    if (updatedTodo.name.trim().length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Bad Request. The todo name cannot be empty string'
        })
      }
    }

    return await updateTodo(updatedTodo, todoId, userId)
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
