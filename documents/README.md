# Licence and compliance document workflow

Do not upload a licence file directly to the public website until it passes this checklist.

## Collect

For each document, confirm:

1. Full document name and type.
2. Exact legal holder name.
3. Issuing authority.
4. Reference or licence number.
5. Issue date and expiry date, if any.
6. Current status: active, expired, pending, transferred, cancelled, or unknown.
7. Mineral, project, licence area, and region where applicable.
8. Whether the document belongs to Fortenous Metals or a third party.
9. Written management approval to publish a public version.

## Redact from public copies

- Signatures and handwritten marks
- National ID, passport, or tax-identification details that are not intended for public display
- Personal residential addresses and private contacts
- Bank, payment, and receipt details
- QR codes, barcodes, or security features that reveal protected data
- Internal notes and unrelated personal data

Keep the original unchanged in secure company storage. Create a separate redacted copy for the website and watermark it `PUBLIC VERIFICATION COPY`.

## Website card format

Each public licence card should contain:

- Document title
- Issuing authority
- Holder name
- High-level scope
- Issue and expiry dates
- Status
- Partially masked reference, where appropriate
- Link to a redacted copy or a `Request document` button

Never describe an application, memorandum object, expired record, or third-party document as an active Fortenous Metals licence.

## Publishing a verified record

The public register reads from `data/documents.json` and its structure is defined by `data/documents.schema.json`. Keep `documents` empty until a record passes the collection, ownership, status, redaction, and management-approval checks above.

Add one object per approved record using this structure:

```json
{
  "id": "unique-record-id",
  "published": true,
  "category": "mineral-right",
  "categoryLabel": "Mineral right",
  "title": "Exact document title",
  "status": "active",
  "statusLabel": "Active",
  "issuingAuthority": "Exact authority name",
  "holder": "Exact legal holder",
  "issueDate": "YYYY-MM-DD",
  "expiryDate": "YYYY-MM-DD",
  "mineral": "Mineral where applicable",
  "region": "High-level location where safe",
  "scope": "Accurate public scope",
  "summary": "Short verified summary",
  "publicReference": "Safely masked reference",
  "publicFile": "documents/public/redacted-file.pdf"
}
```

Allowed categories are `mineral-right`, `environmental`, and `corporate`. Supported statuses are `active`, `expired`, `pending`, and `unknown`. Omit `publicFile` when a record should be available by request only.

Place only management-approved, redacted copies inside `documents/public/`. Never place original records, unredacted scans, the TRA payment slip, or private due-diligence documents in the public repository.
