# Backend Organization

## File Organization

### Root Level Files
- `manage.py` - Django management script
- `requirements.txt` - Python dependencies
- `mcp_server.py` - Local MCP server (for development)
- `mcp_server_remote.py` - Remote MCP server (for production)
- `README.md` - Backend documentation
- `ENV_SETUP.md` - Environment setup guide

### Core Application (`crmApp/`)
- **models/**: Database models
- **serializers/**: DRF serializers
- **viewsets/**: REST API endpoints
- **views/**: Custom API views
- **services/**: Business logic services
- **management/commands/**: Django management commands
- **middleware/**: Custom middleware
- **decorators/**: Custom decorators
- **utils/**: Utility functions

### Scripts (`scripts/`)
All utility scripts are organized in subdirectories:
- **test/**: Test scripts
- **fix/**: Fix/repair scripts
- **seed/**: Database seeding
- **utilities/**: Utility scripts
- **verify/**: Verification scripts

See [scripts/README.md](scripts/README.md) for details.

### Documentation (`docs/`)
- Backend-specific documentation
- API guides
- Integration guides

### Tests (`tests/`)
- Unit tests
- Integration tests

## Important Notes

1. **MCP Servers**: Keep `mcp_server.py` and `mcp_server_remote.py` in root (they're entry points)
2. **Logs**: Django logs are in `logs/` directory
3. **Media**: User uploads are in `media/` directory
4. **Database**: SQLite database is `db.sqlite3` (development only)

## Script Organization

### Test Scripts
All test scripts should be in `scripts/test/`:
- API endpoint tests
- Integration tests
- Flow tests

### Fix Scripts
All fix scripts should be in `scripts/fix/`:
- Database repair scripts
- Data migration scripts
- User/profile fix scripts

### Utility Scripts
All utility scripts should be in `scripts/utilities/`:
- Data checking scripts
- Data retrieval scripts
- Helper scripts

### Management Commands
Django management commands should be in `crmApp/management/commands/`:
- `python manage.py <command>`

## Best Practices

1. **Keep root clean**: Only essential files in root
2. **Organize scripts**: Use appropriate subdirectories
3. **Document scripts**: Add README files for complex scripts
4. **Version control**: Keep scripts in version control
5. **Test scripts**: Test scripts before committing

## Migration Notes

If you have scripts in the root directory, move them to the appropriate `scripts/` subdirectory:
- Test scripts → `scripts/test/`
- Fix scripts → `scripts/fix/`
- Utility scripts → `scripts/utilities/`

