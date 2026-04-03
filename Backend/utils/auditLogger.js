const AuditLog = require('../models/AuditLog');

const logAudit = async (data) => {
  try {
    const log = new AuditLog({
      action: data.action,
      actionType: data.actionType,
      performedBy: data.performedBy || null,
      targetId: data.targetId,
      targetModel: data.targetModel,
      description: data.description,
      ipAddress: data.ipAddress,
      metadata: data.metadata
    });
    await log.save();
    return log;
  } catch (error) {
    console.error('Audit log error:', error);
    return null;
  }
};

module.exports = { logAudit };
