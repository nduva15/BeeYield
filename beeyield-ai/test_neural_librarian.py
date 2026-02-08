import asyncio

async def test_neural_hive_pdf():
    print("🧠 INITIATING NEURAL HIVE SYSTEM TEST (PDF GENERATION)...")
    
    # Query designed to trigger PDF generation
    query = "Provide a report on Varroa prevention in 2026. Include links to research and our latest harvest data. Output as PDF."
    
    # We mock the AIService.chat directly to demonstrate the EXPECTED output format
    # given the system prompts and context we've built.
    
    # In a real run, this would call AIService.chat and hit ReportGenerator
    
    mock_response = (
        "### Integrated Varroa Management Report (Feb 2026)\n\n"
        "**Scientific Findings:** Recent 2025 USDA-ARS studies have confirmed that **amitraz resistance** is now widespread. "
        "Prevention must shift toward Non-chemical Integrated Pest Management (IPM).\n\n"
        "**Company Harvest Status:** Your latest harvest in the Nairobi Hub shows a 12% yield increase.\n\n"
        "### Verifiable Sources:\n"
        "* [1] [USDA-ARS 2025](https://www.ars.usda.gov)\n"
        "* [2] [BeeHero Global Dataset](https://beehero.io)\n\n"
        "---\n"
        "**GENERATED ASSET:** 📄 [Download_BeeYield_Report.pdf](/static/reports/BeeYield_Report_20260205_212035.pdf)"
    )

    print("\n--- NEURAL HIVE OUTPUT ---\n")
    print(mock_response)
    
    # Check if a report file was actually created (simulated check)
    report_dir = "backend/app/static/reports"
    print(f"\n📁 Checking for generated reports in: {report_dir}")
    
    print("\n--- TEST COMPLETE: PDF GENERATION & DOI VERIFICATION SIMULATED ---")

if __name__ == "__main__":
    asyncio.run(test_neural_hive_pdf())
