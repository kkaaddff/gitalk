import { GT_ACCESS_TOKEN, GT_COMMENT } from '@/const'
import { axiosGithub, hasClassInParent, queryStringify } from '@/util'
import * as React from 'react'
import { useOptions } from './OptionsContext'
import { useGitalkState } from './StateContext'

// ========================= Path Register =========================
export interface OperationContextProps {
  handleSort: (direction: 'first' | 'last') => void
  handlePopup: (direction: any) => void
  handleLogout: () => void
  handleLogin: (direction: any) => void
  like: (e: any) => void
  unLike: (e: any) => void
}

export const OperationContext = React.createContext<OperationContextProps>(null)

export function useOperation() {
  return React.useContext(OperationContext)
}

export function OperationContextProvider({ children }) {
  const { clientID, owner, repo } = useOptions()
  const { user, comments, setGitalkState } = useGitalkState()

  const loginLink = () => {
    const githubOauthUrl = 'https://github.com/login/oauth/authorize'
    const query = {
      client_id: clientID,
      redirect_uri: window.location.href,
      scope: 'public_repo',
    }
    return `${githubOauthUrl}?${queryStringify(query)}`
  }

  const like = async (comment) => {
    axiosGithub
      .post(
        `/repos/${owner}/${repo}/issues/comments/${comment.id}/reactions`,
        {
          content: 'heart',
        },
        {
          headers: {
            Authorization: `token ${this.accessToken}`,
            Accept: 'application/vnd.github.squirrel-girl-preview',
          },
        }
      )
      .then((res) => {
        const _comments = comments.map((c) => {
          if (c.id === comment.id) {
            if (c.reactions) {
              if (!~c.reactions.nodes.findIndex((n) => n.user.login === user.login)) {
                c.reactions.totalCount += 1
              }
            } else {
              c.reactions = { nodes: [] }
              c.reactions.totalCount = 1
            }

            c.reactions.nodes.push(res.data)
            c.reactions.viewerHasReacted = true
            return Object.assign({}, c)
          }
          return c
        })

        setGitalkState({
          comments: _comments,
        })
      })
  }

  const unLike = async (comment) => {
    const getQL = (id) => ({
      operationName: 'RemoveReaction',
      query: `
          mutation RemoveReaction{
            removeReaction (input:{
              subjectId: "${id}",
              content: HEART
            }) {
              reaction {
                content
              }
            }
          }
        `,
    })

    axiosGithub
      .post('/graphql', getQL(comment.gId), {
        headers: {
          Authorization: `bearer ${this.accessToken}`,
        },
      })
      .then((res) => {
        if (res.data) {
          const _comments = comments.map((c) => {
            if (c.id === comment.id) {
              const index = c.reactions.nodes.findIndex((n) => n.user.login === user.login)
              if (~index) {
                c.reactions.totalCount -= 1
                c.reactions.nodes.splice(index, 1)
              }
              c.reactions.viewerHasReacted = false
              return Object.assign({}, c)
            }
            return c
          })
          setGitalkState({
            comments: _comments,
          })
        }
      })
  }

  const handleLogin = () => {
    const { comment } = this.state
    window.localStorage.setItem(GT_COMMENT, encodeURIComponent(comment))
    window.location.href = loginLink()
  }

  const handleLogout = () => {
    setGitalkState({
      user: null,
    })

    window.localStorage.removeItem(GT_ACCESS_TOKEN)
    window.location.reload()
  }

  const handleSort = (direction: 'first' | 'last') => {
    setGitalkState({ pagerDirection: direction })
  }

  const handlePopup = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const isVisible = !this.state.isPopupVisible
    const hideHandle = (e1) => {
      if (hasClassInParent(e1.target, 'gt-user', 'gt-popup')) {
        return
      }
      window.document.removeEventListener('click', hideHandle)
      setGitalkState({ isPopupVisible: false })
    }
    setGitalkState({ isPopupVisible: isVisible })
    if (isVisible) {
      window.document.addEventListener('click', hideHandle)
    } else {
      window.document.removeEventListener('click', hideHandle)
    }
  }

  const inheritableContext = {
    like,
    unLike,
    handleLogin,
    handleLogout,
    handleSort,
    handlePopup,
  }

  return (
    <OperationContext.Provider value={inheritableContext}>{children}</OperationContext.Provider>
  )
}
