use crate::Uuid;
use {
    crate::async_graphql::{self, dataloader::DataLoader, Context, FieldResult},
    crate::Database,
};

#[derive(async_graphql::Enum, Clone, Copy, PartialEq, Eq, Debug)]
pub enum CollectionSection {
    Intro,
    Body,
}

/// Structure to represent an edited collection. Missing certain fields and chapters in it.
/// Used for sending data to the front end
#[derive(Debug, Clone, async_graphql::SimpleObject)]
#[graphql(complex)]
pub struct EditedCollection {
    /// UUID for the collection
    pub id: Uuid,
    /// Full title of the collection
    pub title: String,
    /// ID of WordPress menu for navigating the collection
    pub wordpress_menu_id: std::option::Option<i64>,
    /// URL slug for the collection, like "cwkw"
    pub slug: String,
}

/// Structure to represent a single chapter. Used to send data to the front end.
#[derive(Debug, Clone, async_graphql::SimpleObject)]
pub struct ChapterSingle {
    /// UUID for the chapter
    pub id: Uuid,
    /// Full title of the chapter
    pub title: String,
    /// ID of WordPress page with text of the chapter
    pub wordpress_id: std::option::Option<i64>,
    /// Order within the parent chapter or collection
    pub index_in_parent: i64,
}

#[async_graphql::ComplexObject]
impl EditedCollection {
    async fn all_chapters(&self, context: &Context<'_>) -> FieldResult<Option<Vec<ChapterSingle>>> {
        Ok(context
            .data::<DataLoader<Database>>()?
            .load_one(crate::CollectionChapter(self.slug.clone()))
            .await?)
    }
}
