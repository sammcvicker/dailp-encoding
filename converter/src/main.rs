mod encode;
mod retrieve;

use anyhow::Result;
use encode::DocumentMetadata;

#[tokio::main]
async fn main() -> Result<()> {
    let sheet_id = "188qlHBCMLSpuo9A1J5KIiCQv3iCuKfBpt9T0XDU_PH4";
    let sheet = retrieve::SheetResult::from_sheet(sheet_id)
        .await?
        .split_into_lines();

    encode::write_to_file(
        DocumentMetadata {
            title: "Story of Switch Striker",
            publication: None,
            source: None,
            people: vec!["Dolly Duncan"],
        },
        sheet,
    )?;
    Ok(())
}
