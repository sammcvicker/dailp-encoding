use uuid::Uuid;

#[derive(Debug, Clone)]
pub struct Collection {
    pub title: String,

    pub slug: String,

    pub wordpress_menu_id: Option<i64>,

    pub chapters: Vec<Chapter>,
}

#[derive(Debug, Clone)]
pub struct Chapter {
    pub id: Option<Uuid>,

    pub url_slug: String,

    pub index_in_parent: i64,

    pub chapter_name: String,

    pub document_short_name: Option<String>,

    pub wordpress_id: Option<i64>,

    pub section: CollectionSection,
}

#[derive(async_graphql::Enum, Copy, Eq, Debug, Clone, PartialEq, sqlx::Type)]
#[sqlx(type_name = "collection_section")]
pub enum CollectionSection {
    Intro,
    Body,
}
