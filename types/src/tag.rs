use serde::{Deserialize, Serialize};

/// Represents a morphological gloss tag without committing to a single representation.
#[derive(async_graphql::SimpleObject, Serialize, Deserialize, Debug)]
pub struct MorphemeTag {
    /// Standard annotation tag for this morpheme, defined by DAILP.
    #[serde(rename = "_id")]
    pub id: String,
    /// Alternate form that conveys a simple English representation.
    pub learner: Option<String>,
    /// Alternate form of this morpheme from Cherokee Reference Grammar.
    pub crg: String,
    /// English title
    pub name: String,
    /// The kind of morpheme, whether prefix or suffix.
    pub morpheme_type: String,
}
