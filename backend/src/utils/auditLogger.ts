import AuditLog from '../models/AuditLog';

export const logAudit = async (action: string, entity: string, entityId?: string, userId?: string, details?: any) => {
  try {
    await AuditLog.create({
      action,
      entity,
      entityId,
      userId,
      details
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};
