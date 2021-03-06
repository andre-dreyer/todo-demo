import React from 'react'
import {
  cleanup,
  fireEvent,
  render,
  waitForElement,
  waitForElementToBeRemoved
} from '@testing-library/react'

import fetchMock from '../support/fetch-mock'
import App from '../../src/component/app'

describe('TO DO App', function() {
  afterEach(cleanup)
  afterEach(fetchMock.reset)

  it('lists, creates and completes tasks', async function() {
    // Load empty list.
    fetchMock.getOnce('path:/api/tasks', { tasks: [] })

    const { getByText, getByLabelText } = render(<App />)

    const description = getByLabelText('new task description')
    const addTask = getByLabelText('add task')

    await waitForElementToBeRemoved(() => getByText(/loading/i))

    // Create 'find keys' task.
    fetchMock.postOnce('path:/api/tasks', {
      task: { id: 1, description: 'find keys' }
    })
    fetchMock.getOnce('path:/api/tasks', {
      tasks: [{ id: 1, description: 'find keys' }]
    })
    fireEvent.change(description, { target: { value: 'find keys' } })
    fireEvent.click(addTask)

    await waitForElement(() => getByText('find keys'))

    // Create 'buy milk' task.
    fetchMock.postOnce('path:/api/tasks', {
      task: { id: 2, description: 'buy milk' }
    })
    fetchMock.getOnce('path:/api/tasks', {
      tasks: [
        { id: 1, description: 'find keys' },
        { id: 2, description: 'buy milk' }
      ]
    })
    fireEvent.change(description, { target: { value: 'buy milk' } })
    fireEvent.click(addTask)

    await waitForElement(() => getByText('buy milk'))

    // Complete 'buy milk' task.
    fetchMock.deleteOnce('path:/api/tasks/2', 204)
    fetchMock.getOnce('path:/api/tasks', {
      tasks: [{ id: 1, description: 'find keys' }]
    })

    fireEvent.click(getByLabelText('mark buy milk complete'))

    await waitForElementToBeRemoved(() => getByText('buy milk'))

    // Complete 'find keys' task.
    fetchMock.deleteOnce('path:/api/tasks/1', 204)
    fetchMock.getOnce('path:/api/tasks', { tasks: [] })

    fireEvent.click(getByLabelText('mark find keys complete'))

    await waitForElementToBeRemoved(() => getByText('find keys'))
  })
})
