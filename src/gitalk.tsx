import React, { useEffect } from 'react'
import autosize from 'autosize'
import './style/index.less'
import { queryParse, queryStringify, axiosJSON, axiosGithub, formatErrorMsg, sleep } from './util'
import { GT_COMMENT } from './const'
import Initing from './component/initing'
import NoInit from './component/noInit'
import Header from './component/header'
import Comments from './component/comments'
import Meta from './component/meta'
import { useGitalkState } from './context/StateContext'
import { useOptions } from './context/OptionsContext'
import { useComments } from './context/CommentsContext'
import { useOperation } from './context/OperationContext'

const GitalkComponent = () => {
  const {
    isIniting,
    isNoInit,
    isOccurError,
    errorMsg,
    isInputFocused,
    comment,
    setGitalkState,
  } = useGitalkState()

  const { commentEL, proxy, accessToken, clientID, clientSecret, setGitalkOptions } = useOptions()
  const { handleLogout } = useOperation()

  const { getComments, getIssue } = useComments()

  const initComponent = async () => {
    const storedComment = window.localStorage.getItem(GT_COMMENT)
    if (storedComment) {
      setGitalkState({ comment: decodeURIComponent(storedComment) })
      window.localStorage.removeItem(GT_COMMENT)
    }

    const query = queryParse()
    if (query.code) {
      const code = query.code
      delete query.code
      const replacedUrl = `${window.location.origin}${window.location.pathname}${queryStringify(
        query
      )}${window.location.hash}`

      history.replaceState(null, null, replacedUrl)

      setGitalkOptions({
        url: replacedUrl,
        id: replacedUrl,
        // ...props.options,
      })

      try {
        const res = await axiosJSON.post(proxy, {
          code,
          client_id: clientID,
          client_secret: clientSecret,
        })

        if (res.data && res.data.access_token) {
          setGitalkState(res.data.access_token)

          try {
            await getInit()
            setGitalkState({ isIniting: false })
          } catch (err) {
            console.log('err:', err)
            setGitalkState({
              isIniting: false,
              isOccurError: true,
              errorMsg: formatErrorMsg(err),
            })
          }
        } else {
          // no access_token
          console.log('res.data err:', res.data)
          setGitalkState({
            isOccurError: true,
            errorMsg: formatErrorMsg(new Error('no access token')),
          })
        }
      } catch (err) {
        console.log('err: ', err)
        setGitalkState({
          isOccurError: true,
          errorMsg: formatErrorMsg(err),
        })
      }
    } else {
      try {
        await getInit()
        setGitalkState({ isIniting: false })
      } catch (err) {
        console.log('err:', err)
        setGitalkState({
          isIniting: false,
          isOccurError: true,
          errorMsg: formatErrorMsg(err),
        })
      }
    }
  }

  useEffect(() => {
    initComponent()
  }, [])

  useEffect(() => {
    autosize(commentEL.current)
  })

  const getInit = async () => {
    await getUserInfo()
    const issue = await getIssue()
    return getComments(issue)
  }

  const getUserInfo = async () => {
    if (!accessToken) {
      return
    }
    try {
      const res = await axiosGithub.get('/user', {
        headers: {
          Authorization: `token ${accessToken}`,
        },
      })
      setGitalkState({ user: res.data })
    } catch (err) {
      console.log(err)
      debugger
      handleLogout()
    }
  }

  const reply = async (replyComment) => {
    const replyCommentBody = replyComment.body
    let replyCommentArray = replyCommentBody.split('\n')
    replyCommentArray.unshift(`@${replyComment.user.login}`)
    replyCommentArray = replyCommentArray.map((t) => `> ${t}`)
    replyCommentArray.push('')
    replyCommentArray.push('')
    if (comment) replyCommentArray.unshift('')
    setGitalkState({ comment: comment + replyCommentArray.join('\n') })
    await sleep(100)
    autosize.update(commentEL.current)
    commentEL.current.focus()
  }

  return (
    <div className={`gt-container${isInputFocused ? ' gt-input-focused' : ''}`}>
      {isIniting && <Initing />}
      {!isIniting && (isNoInit ? [] : [<Meta />])}
      {isOccurError && <div className='gt-error'>{errorMsg}</div>}
      {!isIniting && (isNoInit ? [<NoInit />] : [<Header />, <Comments />])}
    </div>
  )
}

export default GitalkComponent
