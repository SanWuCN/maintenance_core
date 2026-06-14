# SW.ART CORE Backend

Python standard-library API for the campus laptop cleaning booking mini program.

Default deployment:

- App directory: `/opt/swart-core`
- SQLite database: `/opt/swart-core/data/swart.sqlite3`
- Local service: `127.0.0.1:3107`
- Public Nginx path: `/swart-api/`

Core endpoints:

- `GET /health`
- `GET /api/config`
- `GET /api/slots?date=YYYY-MM-DD`
- `POST /api/orders`
- `GET /api/orders?phone=CONTACT`
