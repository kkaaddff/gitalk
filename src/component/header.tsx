import { useComments } from '@/context/CommentsContext'
import { useOperation } from '@/context/OperationContext'
import { useOptions } from '@/context/OptionsContext'
import React from 'react'
import Avatar from './avatar'
import Button from './button'
import Svg from './svg'

const Header = ({ user, isPreview, previewHtml, comment, isCreating }: any) => {
  const {
    handleCommentKeyDown,
    handleCommentBlur,
    handleCommentFocus,
    handleCommentChange,
    handleCommentCreate,
    handleCommentPreview,
  } = useComments()

  const { commentEL } = useOptions()

  const { handleLogin } = useOperation()

  return (
    <div className='gt-header' key='header'>
      {user ? (
        <Avatar className='gt-header-avatar' src={user.avatar_url} alt={user.login} />
      ) : (
        <a className='gt-avatar-github' onClick={handleLogin}>
          <Svg className='gt-ico-github' name='github' />
        </a>
      )}
      <div className='gt-header-comment'>
        <textarea
          ref={commentEL}
          className={`gt-header-textarea ${isPreview ? 'hide' : ''}`}
          value={comment}
          onChange={handleCommentChange}
          onFocus={handleCommentFocus}
          onBlur={handleCommentBlur}
          onKeyDown={handleCommentKeyDown}
          placeholder='说点什么'
        />
        <div
          className={`gt-header-preview markdown-body ${isPreview ? '' : 'hide'}`}
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
        <div className='gt-header-controls'>
          {/* 考虑支不支持 markdown */}
          {/* <a
            className='gt-header-controls-tip'
            href='https://guides.github.com/features/mastering-markdown/'
            target='_blank'
            rel='noopener noreferrer'>
            <Svg className='gt-ico-tip' name='tip' text='支持 Markdown 语法' />
          </a> */}
          {user && (
            <Button
              className='gt-btn-public'
              onClick={handleCommentCreate}
              text='评论'
              isLoading={isCreating}
            />
          )}

          <Button
            className='gt-btn-preview'
            onClick={handleCommentPreview}
            text={isPreview ? '预览' : '编辑'}
            isLoading={isPreview}
          />
          {!user && (
            <Button className='gt-btn-login' onClick={handleLogin} text='使用 GitHub 登录' />
          )}
        </div>
      </div>
    </div>
  )
}
export default Header
