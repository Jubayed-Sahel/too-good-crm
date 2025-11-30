-- SQL script to create a default sales pipeline for organization ID 13
-- Run this with: sqlite3 db.sqlite3 < create_pipeline.sql  (or use your DB tool)

-- Insert Pipeline
INSERT INTO crmApp_pipeline (organization_id, code, name, description, is_active, is_default, created_at, updated_at)
VALUES (
    13,
    'SALES-13',
    'Sales Pipeline',
    'Default sales pipeline for managing deals',
    1,
    1,
    datetime('now'),
    datetime('now')
);

-- Get the pipeline ID (will be used for stages)
-- Assuming this is the first pipeline, it will get the next available ID

-- Insert Pipeline Stages
INSERT INTO crmApp_pipelinestage (pipeline_id, name, description, "order", probability, is_active, is_closed_won, is_closed_lost, auto_move_after_days, created_at)
VALUES 
    ((SELECT id FROM crmApp_pipeline WHERE organization_id = 13 AND code = 'SALES-13'), 'Lead', 'Initial contact or inquiry', 1, 10, 1, 0, 0, NULL, datetime('now')),
    ((SELECT id FROM crmApp_pipeline WHERE organization_id = 13 AND code = 'SALES-13'), 'Qualified', 'Lead has been qualified', 2, 25, 1, 0, 0, NULL, datetime('now')),
    ((SELECT id FROM crmApp_pipeline WHERE organization_id = 13 AND code = 'SALES-13'), 'Proposal', 'Proposal has been sent', 3, 50, 1, 0, 0, NULL, datetime('now')),
    ((SELECT id FROM crmApp_pipeline WHERE organization_id = 13 AND code = 'SALES-13'), 'Negotiation', 'In negotiation phase', 4, 75, 1, 0, 0, NULL, datetime('now')),
    ((SELECT id FROM crmApp_pipeline WHERE organization_id = 13 AND code = 'SALES-13'), 'Closed Won', 'Deal won', 5, 100, 1, 1, 0, NULL, datetime('now')),
    ((SELECT id FROM crmApp_pipeline WHERE organization_id = 13 AND code = 'SALES-13'), 'Closed Lost', 'Deal lost', 6, 0, 1, 0, 1, NULL, datetime('now'));

-- Verify the results
SELECT 'Pipeline created:' as message;
SELECT id, name, organization_id, is_default FROM crmApp_pipeline WHERE organization_id = 13;

SELECT 'Stages created:' as message;
SELECT ps.id, ps.name, ps."order", ps.probability, p.name as pipeline_name
FROM crmApp_pipelinestage ps
JOIN crmApp_pipeline p ON ps.pipeline_id = p.id
WHERE p.organization_id = 13
ORDER BY ps."order";

