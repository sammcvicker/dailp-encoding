//! This program encodes spreadsheets hosted on Google Drive annotating source documents with linguistic information into equivalent database entries.

mod audio;
mod connections;
mod contributors;
mod early_vocab;
mod edited_collection;
mod lexical;
mod spreadsheets;
mod tags;
mod translations;

use anyhow::Result;
use dailp::{Database, Uuid};
use log::{error, info};
use std::time::Duration;

pub const METADATA_SHEET_NAME: &str = "Metadata";
pub const REFERENCES_SHEET_NAME: &str = "References";

/// Migrates DAILP data from several Google spreadsheets to a database.
#[tokio::main]
async fn main() -> Result<()> {
    dotenv::dotenv().ok();
    pretty_env_logger::init();

    println!("Validating manuscript spreadsheets...");
   // validate_documents().await?;

    let db = Database::connect(Some(1)).await?;

    // println!("Migrating Image Sources...");
    // migrate_image_sources(&db).await?;

    // println!("Migrating contributors...");
    // contributors::migrate_all(&db).await?;

    // println!("Migrating tags to database...");
    // tags::migrate_tags(&db).await?;

    // println!("Migrating DF1975 and DF2003...");
    // lexical::migrate_dictionaries(&db).await?;

    // println!("Migrating early vocabularies...");
    // early_vocab::migrate_all(&db).await?;

    // migrate_data(&db).await?;

    // println!("Migrating connections...");
    // connections::migrate_connections(&db).await?;

    println!("Migrating collections...");
    edited_collection::migrate_edited_collection(&db).await?;

    Ok(())
}

async fn migrate_image_sources(db: &Database) -> Result<()> {
    db.upsert_image_source("beinecke", "https://collections.library.yale.edu/iiif/2")
        .await?;
    db.upsert_image_source(
        "dailp",
        "https://wd0ahsivs3.execute-api.us-east-1.amazonaws.com/latest/iiif/2",
    )
    .await?;
    Ok(())
}

/// Parses our annotated document spreadsheets, migrating that data to our
/// database and writing them into TEI XML files.
async fn migrate_data(db: &Database) -> Result<()> {
    // Pull the list of annotated documents from our index sheet.
    let index =
        spreadsheets::SheetResult::from_sheet("1sDTRFoJylUqsZlxU57k1Uj8oHhbM3MAzU8sDgTfO7Mk", None)
            .await?
            .into_index()?;

    println!("Migrating documents to database...");

    // Retrieve data for spreadsheets in sequence.
    // Because of Google API rate limits, we have to process them sequentially
    // rather than in parallel.
    // This process encodes the ordering in the Index sheet to allow us to
    // manually order different document collections.
    let mut morpheme_relations = Vec::new();
    let mut document_contents = Vec::new();
    for (coll_index, collection) in index.collections.into_iter().enumerate() {
        let collection_id = db
            .insert_top_collection(collection.title, coll_index as i64)
            .await?;
        for (order_index, sheet_id) in collection.sheet_ids.into_iter().enumerate() {
            if let Some((doc, mut refs)) =
                fetch_sheet(Some(db), &sheet_id, collection_id, order_index as i64).await?
            {
                morpheme_relations.append(&mut refs);
                // spreadsheets::write_to_file(&doc)?;
                document_contents.push(doc);
            } else {
                error!("Failed to process {}", sheet_id);
            }
        }
    }

    // Each document takes a bunch of operations to insert, so do them
    // sequentially instead of concurrently to avoid starving the tasks.
    for doc in document_contents {
        db.insert_document_contents(doc).await?;
    }

    db.insert_morpheme_relations(morpheme_relations).await?;

    Ok(())
}

/// Parses our annotated document spreadsheets, migrating that data to our
/// database and writing them into TEI XML files.
async fn validate_documents() -> Result<()> {
    // Pull the list of annotated documents from our index sheet.
    let index =
        spreadsheets::SheetResult::from_sheet("1sDTRFoJylUqsZlxU57k1Uj8oHhbM3MAzU8sDgTfO7Mk", None)
            .await?
            .into_index()?;

    // Retrieve data for spreadsheets in sequence.
    // Because of Google API rate limits, we have to process them sequentially
    // rather than in parallel.
    // This process encodes the ordering in the Index sheet to allow us to
    // manually order different document collections.
    let mut results = Vec::new();
    for collection in index.collections {
        let collection_id = Default::default();
        for (order_index, sheet_id) in collection.sheet_ids.into_iter().enumerate() {
            results.push((
                sheet_id.clone(),
                fetch_sheet(None, &sheet_id, collection_id, order_index as i64).await,
            ));
            tokio::time::sleep(Duration::from_millis(1300)).await;
        }
    }

    let mut failed = false;
    for (sheet_id, r) in results {
        match r {
            Err(e) => {
                error!("Failed to process {}: {}", sheet_id, e);
                failed = true;
            }
            Ok(None) => {
                error!("Failed to process {}", sheet_id);
            }
            Ok(Some(_)) => {
                info!("{} validated", sheet_id);
            }
        }
    }

    if failed {
        Err(anyhow::anyhow!("One or more documents failed to process"))
    } else {
        Ok(())
    }
}

/// Fetch the contents of the sheet with the given ID, validating the first page as
/// annotation lines and the "Metadata" page as [dailp::DocumentMetadata].
async fn fetch_sheet(
    db: Option<&Database>,
    sheet_id: &str,
    collection_id: Uuid,
    order_index: i64,
) -> Result<Option<(dailp::AnnotatedDoc, Vec<dailp::LexicalConnection>)>> {
    use crate::spreadsheets::AnnotatedLine;

    // Parse the metadata on the second page of each sheet.
    // This includes publication information and a link to the translation.
    let meta = spreadsheets::SheetResult::from_sheet(sheet_id, Some(METADATA_SHEET_NAME)).await;
    if let Ok(meta_sheet) = meta {
        let meta = meta_sheet.into_metadata(db, false, order_index).await?;

        println!("---Processing document: {}---", meta.short_name);

        // Parse references for this particular document.
        println!("parsing references...");
        let refs =
            spreadsheets::SheetResult::from_sheet(sheet_id, Some(REFERENCES_SHEET_NAME)).await;
        let refs = if let Ok(refs) = refs {
            refs.into_references(&meta.short_name).await
        } else {
            Vec::new()
        };

        let document_id = if let Some(db) = db {
            db.insert_document(&meta, collection_id, order_index)
                .await?
        } else {
            Default::default()
        };
        // Fill in blank UUID.
        let meta = dailp::DocumentMetadata {
            id: document_id,
            ..meta
        };

        let page_count = meta
            .page_images
            .as_ref()
            .map(|images| images.count())
            .unwrap_or(0);
        let mut all_lines = Vec::new();
        // Each document page lives in its own tab.
        for index in 0..page_count {
            let tab_name = if page_count > 1 {
                println!("Pulling Page {}...", index + 1);
                Some(format!("Page {}", index + 1))
            } else {
                None
            };

            // Split the contents of each main sheet into semantic lines with
            // several layers.
            let mut lines = spreadsheets::SheetResult::from_sheet(sheet_id, tab_name.as_deref())
                .await?
                .split_into_lines();
            // TODO Consider page breaks embedded in the last word of a page.
            lines.last_mut().unwrap().ends_page = true;

            all_lines.append(&mut lines);
            tokio::time::sleep(Duration::from_millis(1000)).await;
        }
        let annotated = AnnotatedLine::many_from_semantic(&all_lines, &meta)?;
        let segments = AnnotatedLine::lines_into_segments(annotated, &document_id, &meta.date);
        let doc = dailp::AnnotatedDoc::new(meta, segments);

        Ok(Some((doc, refs)))
    } else {
        Ok(None)
    }
}
