# Cleanup Summary

## Files Moved

### Backend Root → Scripts
- `test_*.py` → `shared-backend/scripts/test/`
- `check_*.py` → `shared-backend/scripts/utilities/`
- `create_test_user.py` → `shared-backend/scripts/utilities/`
- `fix_login.py` → `shared-backend/scripts/fix/`
- `test_issue_flow.py` → `shared-backend/scripts/test/`

### Root → Scripts/Utils
- `launch-*.bat` → `scripts/utils/`
- `launch-*.ps1` → `scripts/utils/`
- `start_mcp_*.bat` → `scripts/utils/`
- `start_mcp_*.ps1` → `scripts/utils/`

### Root → Docs
- All `.md` files (except README.md) → `docs/`

### Management Commands
- `management_commands/fix_admin_user.py` → `crmApp/management/commands/`

## Files Removed

### Duplicate Files
- `shared-backend/requirement.txt` (duplicate of `requirements.txt`)

### Temporary Files
- `promp.txt`
- `package.json` (root level)
- `package-lock.json` (root level)

## Files Kept in Root

### Essential Files
- `README.md`: Main project README
- `database_schema.sql`: Database schema
- `PRD.pdf`: Product requirements document
- `mcp-config.json`: MCP configuration (if needed)

### Configuration Files
- `.gitignore`: Git ignore rules
- `package.json`: Only if needed for root-level scripts

## Directory Structure After Cleanup

```
too-good-crm/
├── docs/                    # All documentation
├── scripts/                 # Utility scripts
│   └── utils/               # Batch/PowerShell scripts
├── shared-backend/
│   ├── scripts/             # Backend scripts
│   │   ├── test/            # Test scripts
│   │   ├── fix/             # Fix scripts
│   │   ├── utilities/       # Utility scripts
│   │   └── verify/          # Verification scripts
│   └── ...
├── web-frontend/
│   ├── docs/                # Frontend documentation
│   └── ...
└── app-frontend/
    └── ...
```

## .gitignore Updates

Added proper ignore patterns for:
- Build outputs (dist/, build/)
- Node modules
- Python cache files
- Logs
- Environment files
- IDE files
- Temporary files

## Next Steps

1. Review `docs/` folder and organize documentation by topic
2. Update README files to reference new structure
3. Clean up any outdated documentation
4. Ensure all scripts have proper documentation

