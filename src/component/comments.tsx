import React from 'react'
import FlipMove from 'react-flip-move'
import Button from './button'
import Comment from './comment'

const Comments = ({
  user,
  comments,
  pagerDirection,
  accessToken,
  flipMoveOptions,
  handleCommentLoad,
  admin,
  unLike,
  like,
  isLoading,
  isLoadOver,
  isLoadMore,
}: any) => {
  const totalComments = comments.concat([])
  if (pagerDirection === 'last' && accessToken) {
    totalComments.reverse()
  }
  return (
    <div className='gt-comments' key='comments'>
      <FlipMove {...flipMoveOptions}>
        {totalComments.map((c: any) => (
          <Comment
            comment={c}
            key={c.id}
            user={user}
            commentedText='发表于'
            admin={admin}
            replyCallback={reply(c)}
            likeCallback={
              c.reactions && c.reactions.viewerHasReacted
                ? unLike.bind(this, c)
                : like.bind(this, c)
            }
          />
        ))}
      </FlipMove>
      {!totalComments.length && <p className='gt-comments-null'>来做第一个留言的人吧！</p>}
      {!isLoadOver && totalComments.length ? (
        <div className='gt-comments-controls'>
          <Button
            className='gt-btn-loadmore'
            onClick={handleCommentLoad}
            isLoading={isLoadMore}
            text='加载更多'
          />
        </div>
      ) : null}
    </div>
  )
}
export default Comments
function reply(c: any) {
  throw new Error('Function not implemented.')
}
