import React from "react"
import ReactDOM from "react-dom"
import { Client } from "urql"
import { getCredentials } from "src/auth"
import { clientSsrExchange } from "src/graphql"
import { graphqlClient } from "src/graphql/client"
import { PageContext, PageShell, rootElementId } from "./PageShell"

async function getClient() {
  const token = await getCredentials()
  return graphqlClient(token)
}
let clientPromise: null | Promise<Client> = null

export async function render(pageContext: PageContext) {
  const { urqlState } = pageContext
  clientSsrExchange.restoreData(urqlState)
  const client = clientPromise
    ? await clientPromise
    : await (clientPromise = getClient())
  const page = <PageShell pageContext={pageContext} client={client} />
  const elem = document.getElementById(rootElementId)
  ReactDOM.hydrate(page, elem)
}

export const clientRouting = true
