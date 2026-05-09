import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export type LoginStoreState = {
  loginUrl: string | null
  loading: boolean
  error: string | null
  code: string | null
  userCode: string | null
  isWaitingForEnter: boolean
  hasOpenedBrowser: boolean
  sheenPosition: number
  copyMessage: string | null
  justCopied: boolean
  hasClickedLink: boolean
}

type LoginStoreActions = {
  setLoginUrl: (
    value: string | null | ((prev: string | null) => string | null),
  ) => void
  setLoading: (loading: boolean) => void
  setError: (
    value: string | null | ((prev: string | null) => string | null),
  ) => void
  setCode: (
    value: string | null | ((prev: string | null) => string | null),
  ) => void
  setUserCode: (
    value: string | null | ((prev: string | null) => string | null),
  ) => void
  setIsWaitingForEnter: (waiting: boolean) => void
  setHasOpenedBrowser: (opened: boolean) => void
  setSheenPosition: (value: number | ((prev: number) => number)) => void
  setCopyMessage: (
    value: string | null | ((prev: string | null) => string | null),
  ) => void
  setJustCopied: (copied: boolean) => void
  setHasClickedLink: (clicked: boolean) => void
  resetLoginState: () => void
}

type LoginStore = LoginStoreState & LoginStoreActions

const initialState: LoginStoreState = {
  loginUrl: null,
  loading: false,
  error: null,
  code: null,
  userCode: null,
  isWaitingForEnter: false,
  hasOpenedBrowser: false,
  sheenPosition: 0,
  copyMessage: null,
  justCopied: false,
  hasClickedLink: false,
}

export const useLoginStore = create<LoginStore>()(
  immer((set) => ({
    ...initialState,

    setLoginUrl: (value) =>
      set((state) => {
        state.loginUrl =
          typeof value === 'function' ? value(state.loginUrl) : value
      }),

    setLoading: (loading) =>
      set((state) => {
        state.loading = loading
      }),

    setError: (value) =>
      set((state) => {
        state.error = typeof value === 'function' ? value(state.error) : value
      }),

    setCode: (value) =>
      set((state) => {
        state.code =
          typeof value === 'function' ? value(state.code) : value
      }),

    setUserCode: (value) =>
      set((state) => {
        state.userCode =
          typeof value === 'function' ? value(state.userCode) : value
      }),

    setIsWaitingForEnter: (waiting) =>
      set((state) => {
        state.isWaitingForEnter = waiting
      }),

    setHasOpenedBrowser: (opened) =>
      set((state) => {
        state.hasOpenedBrowser = opened
      }),

    setSheenPosition: (value) =>
      set((state) => {
        state.sheenPosition =
          typeof value === 'function' ? value(state.sheenPosition) : value
      }),

    setCopyMessage: (value) =>
      set((state) => {
        state.copyMessage =
          typeof value === 'function' ? value(state.copyMessage) : value
      }),

    setJustCopied: (copied) =>
      set((state) => {
        state.justCopied = copied
      }),

    setHasClickedLink: (clicked) =>
      set((state) => {
        state.hasClickedLink = clicked
      }),

    resetLoginState: () =>
      set((state) => {
        state.loginUrl = initialState.loginUrl
        state.loading = initialState.loading
        state.error = initialState.error
        state.code = initialState.code
        state.userCode = initialState.userCode
        state.isWaitingForEnter = initialState.isWaitingForEnter
        state.hasOpenedBrowser = initialState.hasOpenedBrowser
        state.sheenPosition = initialState.sheenPosition
        state.copyMessage = initialState.copyMessage
        state.justCopied = initialState.justCopied
        state.hasClickedLink = initialState.hasClickedLink
      }),
  })),
)
