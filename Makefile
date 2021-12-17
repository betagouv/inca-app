backup:
	@echo "Dumping PotsgreSQL database…"
	./scripts/db/backup.sh

restore:
	@echo "Restoring PotsgreSQL database…"
	./scripts/db/restore.sh

start:
	@echo "Starting application (production)…"
	./scripts/prod/start.sh
