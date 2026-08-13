const logger = require('../utils/logger');

/**
 * Lightweight audit trail for money-moving and moderation actions.
 * MVP implementation logs structurally via Winston (searchable in
 * combined.log); swap the `log()` body for a dedicated AuditLog
 * Mongo collection later if the admin Reports screen needs querying.
 */
const log = async ({ action, entityType, entityId, actorId = null, details = {} }) => {
  logger.info(
    `AUDIT | action=${action} entity=${entityType}:${entityId} actor=${actorId || 'system'} details=${JSON.stringify(
      details
    )}`
  );
};

module.exports = { log };