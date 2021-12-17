backup:
	@echo "Dumping PotsgreSQL database…"
	./scripts/db/backup.sh

start:
	@echo "Starting application (production)…"
	./scripts/prod/start.sh
