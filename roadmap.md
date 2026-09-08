# Beeyield roadmap

## Done
- Inspections, Acoustic Audit, Integrations, Settings tools
- Hive Health Dashboard (real inspections + acoustic audits + live weather, trends, alerts, in-place hive record entry)
- Support & Tickets page
- Shopify: real order creation per synced record (+ metafield, tag fallback)
- QuickBooks: find-or-create tracking account, stamp latest record, file report note
- Acoustic Audit: own-file upload + confidence shown on results

## In progress
- Record sync timeline (what reached Shopify/QuickBooks) with one-click re-sync for failures
- Test Connection + credential validation gate before any sync
- Download PDF report on inspections and acoustic audits
- Model metadata + confidence explanation on the Acoustic Audit result screen
- Move tools out of the Tools dropdown into a permanent left sidebar, one per row

## Open
- GitHub Pages deployment fails: this app needs a server (SSR + AI + integrations), Pages only serves static files. Publish via Lovable instead; beeyield.com can be attached as a custom domain.
- Acoustic model is corpus-calibrated (statistics from the BEE-SOUND-ANALYSIS pipeline), not retrained on the 300k clips — no dataset access from the build environment.
