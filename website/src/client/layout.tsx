import React, { useMemo } from "react"
import { Provider as GraphQLProvider } from "urql"
import { apolloClient } from "../apollo"
import { useCredentials } from "../auth"

export const LayoutClient = (p: { children: any }) => {
  // const creds = useCredentials()
  const token = useCredentials() // uses credentials
  const client = useMemo(() => apolloClient(token), [token])
  return <GraphQLProvider value={client}>{p.children}</GraphQLProvider>
}

// export default (p: { children: any }) => (
// <UserProvider>
// <LayoutClient {...p} />
// </UserProvider>
// )
