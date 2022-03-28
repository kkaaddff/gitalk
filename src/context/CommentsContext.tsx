import { axiosGithub, formatErrorMsg, getMetaContent } from '@/util'
import * as React from 'react'
import { useOptions } from './OptionsContext'
import { useGitalkState } from './StateContext'
import QLGetComments from '../graphql/getComments'

// ========================= Path Register =========================
export interface CommentsContextProps {
  handleCommentChange: (direction: any) => void
  handleCommentFocus: (e: React.FocusEvent<HTMLTextAreaElement, Element>) => void
  handleCommentBlur: (e: React.FocusEvent<HTMLTextAreaElement, Element>) => void
  handleCommentKeyDown: (e: any) => void
  handleCommentCreate: (e: any) => void
  handleCommentPreview: (e: any) => void
  handleCommentLoad: () => void
  handleIssueCreate: () => void
  getComments: (issue: any) => Promise<void>
  getIssue: () => Promise<void>
}

export const CommentsContext = React.createContext<CommentsContextProps>(null)

export function useComments() {
  return React.useContext(CommentsContext)
}

export function CommentsContextProvider({ children }) {
  const {
    publicBtnEL,
    commentEL,
    enableHotKey,
    clientID,
    clientSecret,
    perPage,
    owner,
    repo,
    accessToken,
    title,
    body,
    id,
    labels,
    url,
    number,
    distractionFreeMode,
    createIssueManually,
  } = useOptions()

  const {
    comment,
    localComments,
    comments,
    isPreview,
    issue,
    isLoadMore,
    page,
    isCreating,
    setGitalkState,
  } = useGitalkState()

  const createIssue = async () => {
    const res = await axiosGithub.post(
      `/repos/${owner}/${repo}/issues`,
      {
        title,
        labels: labels.concat(id),
        body:
          body ||
          `${url} \n\n ${getMetaContent('description') ||
            getMetaContent('description', 'og:description') ||
            ''}`,
      },
      {
        headers: {
          Authorization: `token ${accessToken}`,
        },
      }
    )
    setGitalkState({ issue: res.data })
    return res.data
  }

  const handleIssueCreate = async () => {
    setGitalkState({ isIssueCreating: true })
    try {
      const issue = await createIssue()
      setGitalkState({
        isIssueCreating: false,
        isOccurError: false,
      })
      const res = getComments(issue)
      if (res) {
        setGitalkState({
          isNoInit: false,
        })
      }
    } catch (error) {
      setGitalkState({
        isIssueCreating: false,
        isOccurError: true,
        errorMsg: formatErrorMsg(error),
      })
    }
  }

  const handleCommentBlur = (e: React.FocusEvent<HTMLTextAreaElement, Element>) => {
    if (!distractionFreeMode) {
      return e.preventDefault()
    }
    setGitalkState({ isInputFocused: false })
  }

  const createComment = async () => {
    const issue = await getIssue()
    const res = await axiosGithub.post(
      issue.comments_url,
      {
        body: comment,
      },
      {
        headers: {
          Accept: 'application/vnd.github.v3.full+json',
          Authorization: `token ${accessToken}`,
        },
      }
    )
    setGitalkState({
      comment: '',
      comments: comments.concat(res.data),
      localComments: localComments.concat(res.data),
    })
  }

  const handleCommentCreate = async (e) => {
    if (!comment.length) {
      e && e.preventDefault()
      commentEL.current.focus()
      return
    }

    if (isCreating) {
      return
    }
    try {
      await createComment()

      setGitalkState({
        isCreating: false,
        isOccurError: false,
      })
    } catch (error) {
      setGitalkState({
        isCreating: false,
        isOccurError: true,
        errorMsg: formatErrorMsg(error),
      })
    }
  }

  const handleCommentKeyDown = (e) => {
    if (enableHotKey && (e.metaKey || e.ctrlKey) && e.keyCode === 13) {
      publicBtnEL.current.focus()
      handleCommentCreate(e)
    }
  }

  const handleCommentPreview = (e) => {
    setGitalkState({
      isPreview: !isPreview,
    })

    axiosGithub
      .post(
        '/markdown',
        {
          text: comment,
        },
        {
          headers: accessToken && { Authorization: `token ${accessToken}` },
        }
      )
      .then((res) => {
        setGitalkState({
          previewHtml: res.data,
        })
      })
      .catch((err) => {
        setGitalkState({
          isOccurError: true,
          errorMsg: formatErrorMsg(err),
        })
      })
  }

  const handleCommentChange = (e) => setGitalkState({ comment: e.target.value })

  const handleCommentFocus = (e: React.FocusEvent<HTMLTextAreaElement, Element>) => {
    if (!distractionFreeMode) {
      return e.preventDefault()
    }
    setGitalkState({ isInputFocused: true })
  }

  const getIssueById = () => {
    const getUrl = `/repos/${owner}/${repo}/issues/${number}`

    return new Promise((resolve, reject) => {
      axiosGithub
        .get(getUrl, {
          auth: {
            username: clientID,
            password: clientSecret,
          },
          params: {
            t: Date.now(),
          },
        })
        .then((res) => {
          let issue = null

          if (res && res.data && res.data.number === number) {
            issue = res.data

            setGitalkState({ issue, isNoInit: false })
          }
          resolve(issue)
        })
        .catch((err) => {
          // When the status code is 404, promise will be resolved with null
          if (err.response.status === 404) resolve(null)
          reject(err)
        })
    })
  }

  const getIssueByLabels = async () => {
    const res = await axiosGithub.get(`/repos/${owner}/${repo}/issues`, {
      auth: {
        username: clientID,
        password: clientSecret,
      },
      params: {
        labels: labels.concat(id).join(','),
        t: Date.now(),
      },
    })

    let isNoInit = false
    let issue = null
    if (!(res && res.data && res.data.length)) {
      if (!createIssueManually && this.isAdmin) {
        return this.createIssue()
      }

      isNoInit = true
    } else {
      issue = res.data[0]
    }
    setGitalkState({ issue, isNoInit })
    return issue
  }

  const getIssue = async () => {
    if (issue) {
      setGitalkState({ isNoInit: false })
      return Promise.resolve(issue)
    }

    if (typeof number === 'number' && number > 0) {
      const resIssue = await getIssueById()
      if (!resIssue) return getIssueByLabels()
      return resIssue
    }
    return getIssueByLabels()
  }

  // Get comments via v3 api, don't require login, but sorting feature is disable
  const getCommentsV3 = async () => {
    const issue_1 = await getIssue()
    if (!issue_1) return
    const res = await axiosGithub.get(issue_1.comments_url, {
      headers: {
        Accept: 'application/vnd.github.v3.full+json',
      },
      auth: {
        username: clientID,
        password: clientSecret,
      },
      params: {
        per_page: perPage,
        page,
      },
    })
    const issue_2 = issue

    let isLoadOver = false
    const cs = comments.concat(res.data)
    // @ts-ignore
    if (cs.length >= issue_2.comments || res.data.length < perPage) {
      isLoadOver = true
    }
    this.setState({
      comments: cs,
      isLoadOver,
      page: page + 1,
    })
    return cs
  }

  const getComments = (issue) => {
    if (!issue) return
    // Get comments via v4 graphql api, login required and sorting feature is available
    if (accessToken) return QLGetComments(issue)
    return getCommentsV3()
  }

  const handleCommentLoad = () => {
    if (isLoadMore) return
    setGitalkState({ isLoadMore: true })
    getComments(issue).then(() => this.setState({ isLoadMore: false }))
  }

  const inheritableContext = {
    handleCommentBlur,
    handleCommentKeyDown,
    handleCommentCreate,
    handleCommentPreview,
    handleCommentChange,
    handleCommentFocus,
    handleCommentLoad,
    handleIssueCreate,
    getComments,
    getIssue,
  }

  return <CommentsContext.Provider value={inheritableContext}>{children}</CommentsContext.Provider>
}
