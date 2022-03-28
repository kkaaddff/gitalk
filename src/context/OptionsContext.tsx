import * as React from 'react'
import { useSetState } from 'ahooks'
import { GT_ACCESS_TOKEN } from '@/const'
import { SetState } from 'ahooks/lib/useSetState'

export type OptionsContextProps = {
  id: string
  clientID: string
  admin: string[]
  owner: string
  repo: string
  number: number
  labels: string[]
  accessToken: string
  title: string
  clientSecret: string
  body: string
  language: string
  perPage: number
  pagerDirection: 'last' | 'first'
  createIssueManually: boolean
  distractionFreeMode: boolean
  proxy: string
  flipMoveOptions: {
    staggerDelayBy: number
    appearAnimation: string
    enterAnimation: string
    leaveAnimation: string
  }
  enableHotKey: boolean
  url: string
  defaultAuthor: {
    avatarUrl: string
    login: string
    url: string
  }
  updateCountCallback: (count: number) => void
  commentEL: React.RefObject<HTMLTextAreaElement>
  publicBtnEL: React.RefObject<HTMLButtonElement>
  setGitalkOptions?: SetState<OptionsContextProps>
}

export const InitialOptions: OptionsContextProps = {
  // id: window.location.href,
  id: 'Demo',
  admin: ['booxood', 'mamboer'],
  clientID: 'e46f6dec7c07145c652c',
  clientSecret: 'd1a0b627f9b76d21bd3080d1777d0aa0ad55dd83',
  accessToken:
    window.localStorage.getItem(GT_ACCESS_TOKEN) || '',
  repo: 'gitalk',
  owner: 'gitalk',
  distractionFreeMode: true,

  number: -1,
  labels: ['Gitalk'],
  title: window.document.title,
  body: '', // window.location.href + header.meta[description]
  // @ts-ignore
  language: window.navigator.language || window.navigator.userLanguage,
  perPage: 10,
  pagerDirection: 'last', // last or first
  createIssueManually: false,

  proxy: 'https://cors-anywhere.azm.workers.dev/https://github.com/login/oauth/access_token',
  flipMoveOptions: {
    staggerDelayBy: 150,
    appearAnimation: 'accordionVertical',
    enterAnimation: 'accordionVertical',
    leaveAnimation: 'accordionVertical',
  },
  enableHotKey: true,
  url: window.location.href,
  defaultAuthor: {
    avatarUrl: '//avatars1.githubusercontent.com/u/29697133?s=50',
    login: 'null',
    url: '',
  },
  updateCountCallback: null,
  commentEL: React.createRef<HTMLTextAreaElement>(),
  publicBtnEL: React.createRef<HTMLButtonElement>(),
}

export const OptionsContext = React.createContext<OptionsContextProps>(null)

export function useOptions() {
  return React.useContext(OptionsContext)
}

export function OptionsContextProvider({ children }) {
  const [options, setGitalkOptions] = useSetState(InitialOptions)

  React.useEffect(() => {
    window.localStorage.setItem(GT_ACCESS_TOKEN, options.accessToken)
  }, [options.accessToken])

  return (
    <OptionsContext.Provider value={{ ...options, setGitalkOptions }}>
      {children}
    </OptionsContext.Provider>
  )
}
