/**
 * @file Dispatcher.test.js
 * @description Test dispatcher class
 */

/*************************************************
 * IMPORT LIBRARIES
 *************************************************/
import Dispatcher from '../utils/Dispatcher'

/*************************************************
 * COMPONENTS TO TEST
 *************************************************/

/*************************************************
 * CONSTANTS
 *************************************************/
const type = 'test'

/*************************************************
 * TEST CODE
 *************************************************/

describe('Test Dispatcher', () => {
  let store
  const useDispatch = () => (newStore) => {
    store = newStore.callback(store)
  }
  const setName = (dispatch, name) =>
    dispatch({
      type,
      callback: (state) => {
        state.name = name
        return state
      },
    })
  const setDate = (dispatch, date) =>
    dispatch({
      type,
      callback: (state) => {
        state.date = date
        return state
      },
    })
  const setMonth = (dispatch, month) =>
    dispatch({
      type,
      callback: (state) => {
        state.month = month
        return state
      },
    })
  const setYear = (dispatch, year) =>
    dispatch({
      type,
      callback: (state) => {
        state.year = year
        return state
      },
    })
  const setBirthday = (dispatch, year, month, date) =>
    dispatch({
      type,
      callback: (state) => {
        state.year = year
        state.month = month
        state.date = date
        return state
      },
    })

  test('Single action', () => {
    let dispatcher = new Dispatcher(useDispatch)

    store = {}
    dispatcher.add(setName, 'Jimmy').run()
    expect(store).toStrictEqual({ name: 'Jimmy' })

    store = {}
    dispatcher.run(setName, 'John')
    expect(store).toStrictEqual({ name: 'John' })
  })

  test('Multiple actions', () => {
    let dispatcher = new Dispatcher(useDispatch)

    store = {}
    dispatcher.add(setName, 'Jimmy').add(setBirthday, 2001, 5, 7).run()
    expect(store).toStrictEqual({ name: 'Jimmy', year: 2001, month: 5, date: 7 })

    store = {}
    dispatcher.add(setName, 'Jimmy').add(setYear, 2001).add(setMonth, 5).add(setDate, 7).run()
    expect(store).toStrictEqual({ name: 'Jimmy', year: 2001, month: 5, date: 7 })
  })
})
