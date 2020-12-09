mod connections;
mod lexical;
mod spreadsheets;
mod tags;
mod translations;

use anyhow::Result;
use std::time::Duration;

/// Migrates DAILP data from several Google spreadsheets to a MongoDB instance.
#[tokio::main]
async fn main() -> Result<()> {
    dotenv::dotenv().ok();

    println!("Migrating connections...");
    connections::migrate_connections().await?;

    migrate_data().await?;

    println!("Migrating early vocabularies...");
    lexical::migrate_old_lexical().await?;

    println!("Migrating DF1975 and DF2003...");
    lexical::migrate_dictionaries().await?;

    println!("Migrating tags to database...");
    tags::migrate_tags().await?;

    Ok(())
}

/// Parses our annotated document spreadsheets, migrating that data to our
/// database and writing them into TEI XML files.
async fn migrate_data() -> Result<()> {
    // Pull the list of annotated documents from our index sheet.
    let index =
        spreadsheets::SheetResult::from_sheet("1sDTRFoJylUqsZlxU57k1Uj8oHhbM3MAzU8sDgTfO7Mk", None)
            .await?
            .into_index()?;

    println!("Migrating documents to database...");

    // Retrieve data for spreadsheets in sequence.
    // Because of Google API rate limits, we have to limit the number of
    // simultaneous connections to the sheets endpoint.
    for sheet_id in &index.sheet_ids {
        if let Some((doc, refs)) = fetch_sheet(sheet_id).await? {
            spreadsheets::write_to_file(&doc)?;
            spreadsheets::migrate_documents_to_db(&[(doc, refs)]).await?;
        }
        tokio::time::delay_for(Duration::from_millis(1700)).await;
    }
    Ok(())
}

/// Fetch the contents of the sheet with the given ID, validating the first page as
/// annotation lines and the "Metadata" page as [dailp::DocumentMetadata].
async fn fetch_sheet(
    sheet_id: &str,
) -> Result<Option<(dailp::AnnotatedDoc, Vec<dailp::LexicalConnection>)>> {
    use crate::spreadsheets::AnnotatedLine;
    println!("parsing sheet {}...", sheet_id);

    // Split the contents of each main sheet into semantic lines with
    // several layers.
    let lines = spreadsheets::SheetResult::from_sheet(sheet_id, None)
        .await?
        .split_into_lines();

    // Parse the metadata on the second page of each sheet.
    // This includes publication information and a link to the translation.
    let meta = spreadsheets::SheetResult::from_sheet(sheet_id, Some("Metadata")).await;
    if let Ok(meta_sheet) = meta {
        let meta = meta_sheet.into_metadata(false).await?;

        // Parse references for this particular document.
        let refs = spreadsheets::SheetResult::from_sheet(sheet_id, Some("References")).await;
        let refs = if let Ok(refs) = refs {
            refs.into_references(&meta.id).await
        } else {
            Vec::new()
        };

        let annotated = AnnotatedLine::many_from_semantic(&lines, &meta);
        let segments = AnnotatedLine::to_segments(annotated, &meta.id, &meta.date);
        let doc = dailp::AnnotatedDoc::new(meta, segments);

        Ok(Some((doc, refs)))
    } else {
        Ok(None)
    }
}

async fn graphql_mutate(method: &str, contents: String) -> Result<()> {
    lazy_static::lazy_static! {
        static ref CLIENT: reqwest::Client = reqwest::Client::new();
        static ref ENDPOINT: String = std::env::var("DAILP_GRAPHQL_URL").unwrap();
        static ref PASSWORD: String = std::env::var("MONGODB_PASSWORD").unwrap();
    }
    let b = base64::encode(&contents);
    let query = serde_json::json!({
            "operationName": null,
            "query": format!(r#"mutation {{
            {}(password: "{}", contents: "{}")
        }}"#, method, *PASSWORD, b)
    });
    // println!("{}", query);
    let res = CLIENT.post(&*ENDPOINT).json(&query).send().await?;
    // println!("{:?}", res);
    Ok(())
}

async fn update_tag(tag: &dailp::MorphemeTag) -> Result<()> {
    let json = serde_json::to_string(tag)?;
    graphql_mutate("updateTag", json).await
}

async fn update_document(tag: &dailp::AnnotatedDoc) -> Result<()> {
    let json = serde_json::to_string(tag)?;
    graphql_mutate("updateDocument", json).await
}

async fn update_form(tag: &dailp::AnnotatedForm) -> Result<()> {
    let json = serde_json::to_string(tag)?;
    graphql_mutate("updateForm", json).await
}

async fn update_connection(tag: &dailp::LexicalConnection) -> Result<()> {
    let json = serde_json::to_string(tag)?;
    graphql_mutate("updateConnection", json).await
}
