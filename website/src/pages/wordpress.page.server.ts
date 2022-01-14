import { client } from "src/graphql"
import * as Wordpress from "src/graphql/wordpress"

export async function prerender() {
  const { data } = await client.wordpress
    .query<Wordpress.PageIndexQuery, Wordpress.PageIndexQueryVariables>(
      Wordpress.PageIndexDocument
    )
    .toPromise()

  return data!.pages!.nodes!.map((page) => ({
    url: page!.uri,
  }))
}
