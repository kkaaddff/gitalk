import { GT_VERSION } from '@/const'
import React from 'react'
import Action from './action'
import Avatar from './avatar'
import Button from './button'
import Svg from './svg'

const Meta = ({
  handleLogin,
  user,
  handleCommentPreview,
  isPreview,
  handleCommentChange,
  previewHtml,
  handlePopup,
  handleLogout,
  handleSort,
  isDesc,
  isPopupVisible,
  cnt,
  issue,
  updateCountCallback,
}: any) => {
  // window.GITALK_COMMENTS_COUNT = cnt
  if (updateCountCallback && {}.toString.call(updateCountCallback) === '[object Function]') {
    try {
      updateCountCallback(cnt)
    } catch (err) {
      console.log('An error occurred executing the updateCountCallback:', err)
    }
  }

  return (
    <div className='gt-meta' key='meta'>
      <span
        className='gt-counts'
        dangerouslySetInnerHTML={{
          __html: `<a class="gt-link gt-link-counts" href="${issue &&
            issue.html_url}" target="_blank" rel="noopener noreferrer">${cnt}</a>条评论`,
        }}
      />
      {isPopupVisible && (
        <div className='gt-popup'>
          {user ? (
            <Action
              className={`gt-action-sortasc${!isDesc ? ' is--active' : ''}`}
              onClick={handleSort('first')}
              text='从旧到新排序'
            />
          ) : null}
          {user ? (
            <Action
              className={`gt-action-sortdesc${isDesc ? ' is--active' : ''}`}
              onClick={handleSort('last')}
              text='从新到旧排序'
            />
          ) : null}
          {user ? (
            <Action className='gt-action-logout' onClick={handleLogout} text='注销' />
          ) : (
            <a className='gt-action gt-action-login' onClick={handleLogin}>
              使用 GitHub 登录
            </a>
          )}
          <div className='gt-copyright'>
            <a
              className='gt-link gt-link-project'
              href='https://github.com/gitalk/gitalk'
              target='_blank'
              rel='noopener noreferrer'>
              Gitalk
            </a>
            <span className='gt-version'>{GT_VERSION}</span>
          </div>
        </div>
      )}
      <div className='gt-user'>
        {user ? (
          <div
            className={isPopupVisible ? 'gt-user-inner is--poping' : 'gt-user-inner'}
            onClick={handlePopup}>
            <span className='gt-user-name'>{user.login}</span>
            <Svg className='gt-ico-arrdown' name='arrow_down' />
          </div>
        ) : (
          <div
            className={isPopupVisible ? 'gt-user-inner is--poping' : 'gt-user-inner'}
            onClick={handlePopup}>
            <span className='gt-user-name'>未登录用户</span>
            <Svg className='gt-ico-arrdown' name='arrow_down' />
          </div>
        )}
      </div>
    </div>
  )
}
export default Meta
