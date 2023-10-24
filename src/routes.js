import { randomUUID } from 'node:crypto'

import { Database } from './database.js';
import { buildRoutePath } from './utils/build-route-path.js'

const database = new Database()

export const routes = [
    {
        method: 'GET',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            const users = database.select('tasks')
            return res.end(JSON.stringify(users))
        }
    },
    {
        method: 'POST',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            const {title, description} = req.body
            const currentDateTime = new Date().toLocaleString()
            const user = {
                id: randomUUID(),
                title,
                description,
                completed_at: null,
                created_at: currentDateTime,
                update_at: currentDateTime
            }
            database.insert('tasks', user)
            return res.writeHead(201).end()
        }
    },
    {
        method: 'DELETE',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params
            database.delete('tasks', id)
            return res.writeHead(204).end()
        }
    },
    {
        method: 'PUT',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params
            const currentDateTime = new Date().toLocaleString()
            const { title, description } = req.body
            // Verificar se estão preenchidos
            if (!title || !description) {
                return res.writeHead(400).end(
                  JSON.stringify({ message: 'title or description are required' })
                )
            }
            // Verificar se Id é valido
            const [task] = database.select('tasks', { id })
            if (!task) {
                return res.writeHead(404).end()
            }

            database.update('tasks', id, {
                title,
                description,
                update_at: currentDateTime
            }, false)
            return res.writeHead(204).end()
        }
    },
    {
        method: 'PATCH',
        path: buildRoutePath('/tasks/:id/complete'),
        handler: (req, res) => {
            const { id } = req.params
            // Verificar se Id é valido
            const [task] = database.select('tasks', { id })
            if (!task) {
                return res.writeHead(404).end()
            }
            const isTaskCompleted = !!task.completed_at
            const completed_at = isTaskCompleted ? null : new Date().toLocaleString()
            database.update('tasks', id, { completed_at })
            return res.writeHead(201).end()
        }
    }
]