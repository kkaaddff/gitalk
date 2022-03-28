import { useComments } from '@/context/CommentsContext'
import { useOperation } from '@/context/OperationContext'
import React from 'react'
import Button from './button'

const NoInit = ({ isAdmin, user, isIssueCreating, owner, repo, admin }: any) => {
  const { handleLogin } = useOperation()
  const { handleIssueCreate } = useComments()

  return (
    <div className='gt-no-init' key='no-init'>
      <p
        dangerouslySetInnerHTML={{
          __html: `未找到相关的 <a href="https://github.com/${owner}/${repo}/issues">Issues</a> 进行评论`,
        }}
      />
      <p>
        {`请联系 ${[]
          .concat(admin)
          .map((u) => `@${u}`)
          .join(' ')}初始化创建`}
      </p>
      {isAdmin ? (
        <p>
          <Button onClick={handleIssueCreate} isLoading={isIssueCreating} text='初始化 Issue' />
        </p>
      ) : null}
      {!user && <Button className='gt-btn-login' onClick={handleLogin} text='使用 GitHub 登录' />}
    </div>
  )
}
export default NoInit
