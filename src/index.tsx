import React from 'react'
import { CommentsContextProvider } from './context/CommentsContext'
import { OperationContextProvider } from './context/OperationContext'
import { OptionsContextProvider } from './context/OptionsContext'
import { StateContextProvider } from './context/StateContext'
import Gitalk from './gitalk'
import 'github-markdown-css/github-markdown.css'

export default function Index() {
  return (
    <OptionsContextProvider>
      <StateContextProvider>
        <OperationContextProvider>
          <CommentsContextProvider>
            <Gitalk />
          </CommentsContextProvider>
        </OperationContextProvider>
      </StateContextProvider>
    </OptionsContextProvider>
  )
}
