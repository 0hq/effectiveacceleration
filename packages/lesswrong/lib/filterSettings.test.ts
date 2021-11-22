import { renderHook, act } from '@testing-library/react-hooks'
import { FilterSettings, useFilterSettings } from './filterSettings'
import { testStartup } from "../testing/testMain"

testStartup()

jest.mock('../components/common/withUser', () => ({
  useCurrentUser: () => ({
    frontpageFilterSettings: {
      personalBlog: 'Hidden',
      tags: [],
    } as FilterSettings
  }),
}))

jest.mock('../components/hooks/useUpdateCurrentUser', () => ({
  useUpdateCurrentUser: jest.fn().mockReturnValue(jest.fn()),
}))

jest.mock('./crud/withMulti', () => ({
  useMulti: jest.fn()
    .mockReturnValueOnce({
      results: undefined,
      loading: true,
      error: undefined,
    })
    .mockReturnValue({
      // Did you know that something sets our useMulti results to be frozen? And
      // did you know that if you don't run in strict mode, attempts to modify
      // the results will silently fail? And did you know that we don't run in
      // strict mode? I didn't. Now you do. You're welcome.
      results: [Object.freeze({_id: '1', name: 'Paperclips'})],
      loading: false,
      error: null,
    })
}))

describe('useFilterSettings', () => {
  it('useFilterSettings', () => {
    // initial return, loading state
    const {result: filterSettingsResults, rerender} = renderHook(() => useFilterSettings())
    expect(filterSettingsResults.current).toMatchObject({
      filterSettings: {
        personalBlog: 'Hidden',
        tags: [],
      },
      loadingSuggestedTags: true,
    })
    
    // set personalBlog filter
    rerender() // To trigger useMulti's non-loading state
    act(() => {
      filterSettingsResults.current.setPersonalBlogFilter!('Reduced')
    })
    rerender()
    expect(filterSettingsResults.current).toMatchObject({
      filterSettings: {
        personalBlog: 'Reduced',
        // These get set because of suggested tags
        tags: [{tagId: '1', tagName: 'Paperclips', filterMode: 'Default'}],
      },
    })
    
    //  add tag filter
    act(() => {
      filterSettingsResults.current.setTagFilter!({tagId: '2', tagName: 'Dank Memes', filterMode: 'Subscribed'})
    })
    rerender()
    expect(filterSettingsResults.current).toMatchObject({
      filterSettings: {
        personalBlog: 'Reduced',
        tags: [
          {tagId: '1', tagName: 'Paperclips', filterMode: 'Default'},
          {tagId: '2', tagName: 'Dank Memes', filterMode: 'Subscribed'}
        ],
      },
    })
    
    // try to add tag filter with no tagName
    act(() => {
      let error: any
      try {
        filterSettingsResults.current.setTagFilter!({tagId: '3', tagName: '', filterMode: 'Subscribed'})
      } catch (err) {
        error = err
      }
      expect(error).toBeTruthy()
    })
    
    // update tag filter
    act(() => {
      filterSettingsResults.current.setTagFilter!({tagId: '2', tagName: 'Dank Memes', filterMode: 'Hidden'})
    })
    rerender()
    expect(filterSettingsResults.current).toMatchObject({
      filterSettings: {
        personalBlog: 'Reduced',
        tags: [
          {tagId: '1', tagName: 'Paperclips', filterMode: 'Default'},
          {tagId: '2', tagName: 'Dank Memes', filterMode: 'Hidden'}
        ],
      },
    })
    
    // remove tag filter
    act(() => {
      filterSettingsResults.current.removeTagFilter!('2')
    })
    rerender()
    expect(filterSettingsResults.current).toMatchObject({
      filterSettings: {
        personalBlog: 'Reduced',
        tags: [{tagId: '1', tagName: 'Paperclips', filterMode: 'Default'}],
      },
    })
    
    // try to remove suggested tag filter
    act(() => {
      let error: any
      try {
        filterSettingsResults.current.removeTagFilter!('1')
      } catch (err) {
        error = err
      }
      expect(error).toBeTruthy()
    })
  })
})
