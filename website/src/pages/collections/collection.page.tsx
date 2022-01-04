import React from "react"
import { usePageContext } from "renderer/PageShell"
import { Breadcrumbs } from "src/breadcrumbs"
import * as Dailp from "src/graphql/dailp"
import * as Wordpress from "src/graphql/wordpress"
import Layout from "src/layout"
import { documentRoute } from "src/routes"
import { fullWidth, paddedCenterColumn } from "src/sprinkles.css"
import WordpressPage from "src/wordpress-page"

const CollectionPage = () => {
  const {
    routeParams: { slug },
  } = usePageContext()

  const [{ data: dailp }] = Dailp.useCollectionQuery({
    variables: { slug },
  })
  const documents = [...(dailp?.collection.documents ?? [])]
  // Sort documents into natural order by their ID.
  // This means that "10" comes after "9" instead of after "1".
  documents
    .sort((a, b) => collator.compare(a.id, b.id))
    .sort((a, b) =>
      collator.compare(a.orderIndex.toString(), b.orderIndex.toString())
    )

  return (
    <Layout title={dailp?.collection.name}>
      <main className={paddedCenterColumn}>
        <article className={fullWidth}>
          <header>
            <Breadcrumbs>
              <a href="/">Collections</a>
            </Breadcrumbs>
            <h1>{dailp?.collection.name}</h1>
          </header>
          <WordpressPage slug={slug} />
          <ul>
            {documents.map((document) => (
              <li key={document.slug}>
                <a href={documentRoute(document.slug)}>{document.title}</a>
                {document.date && ` (${document.date.year})`}
              </li>
            ))}
          </ul>
        </article>
      </main>
    </Layout>
  )
}
export default CollectionPage

// This collator allows us to sort strings for a particular locale.
const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
})
