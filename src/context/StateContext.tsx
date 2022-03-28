import * as React from 'react'
import { useSetState } from 'ahooks'
import { SetState } from 'ahooks/lib/useSetState'
import { useOptions } from './OptionsContext'

export type StateContextProps = {
  isIniting: boolean
  isNoInit: boolean
  isOccurError: boolean
  errorMsg: string
  isInputFocused: boolean
  user: { login: string }
  issue: null
  cursor: null
  comments: TComment[]
  localComments: TComment[]
  comment: string
  page: number
  pagerDirection: 'last' | 'first'
  previewHtml: string
  isCreating: boolean
  isLoading: boolean
  isLoadMore: boolean
  isLoadOver: boolean
  isIssueCreating: boolean
  isPopupVisible: boolean
  isAdmin: boolean
  isPreview: boolean
  setGitalkState?: SetState<StateContextProps>
}

const InitialState: StateContextProps = {
  user: null,
  issue: null,
  comments: [],
  localComments: [],
  comment: '',
  page: 1,
  pagerDirection: 'last',
  cursor: null,
  previewHtml: '',
  isNoInit: false,
  isIniting: true,
  isCreating: false,
  isLoading: false,
  isLoadMore: false,
  isLoadOver: false,
  isIssueCreating: false,
  isPopupVisible: false,
  isInputFocused: false,
  isPreview: false,
  isOccurError: false,
  isAdmin: false,
  errorMsg: '',
}

export const StateContext = React.createContext<StateContextProps>(null)

export function useGitalkState() {
  return React.useContext(StateContext)
}

export function StateContextProvider({ children }) {
  const [gitalkState, setGitalkState] = useSetState(InitialState)
  const { admin } = useOptions()
  const { user } = gitalkState

  React.useEffect(() => {
    const isAdmin =
      user &&
      !!~[]
        .concat(admin)
        .map((a) => a.toLowerCase())
        .indexOf(user.login.toLowerCase())

    setGitalkState({ isAdmin })
  }, [])

  return (
    <StateContext.Provider value={{ ...gitalkState, setGitalkState }}>
      {children}
    </StateContext.Provider>
  )
}

type TComment = {
  url: string
  html_url: string
  issue_url: string
  id: number
  node_id: string
  user: {
    login: string
    id: number
    node_id: string
    avatar_url: string
    gravatar_id: string
    url: string
    html_url: string
    followers_url: string
    following_url: string
    gists_url: string
    starred_url: string
    subscriptions_url: string
    organizations_url: string
    repos_url: string
    events_url: string
    received_events_url: string
    type: string
    site_admin: boolean
  }
  created_at: string
  updated_at: string
  author_association: string
  body_html: string
  body_text: string
  body: string
  reactions: {
    nodes: any
    viewerHasReacted?: boolean
    url?: string
    totalCount?: number
    '+1'?: number
    '-1'?: number
    laugh?: number
    hooray?: number
    confused?: number
    heart?: number
    rocket?: number
    eyes?: number
  }
  performed_via_github_app: null
}
