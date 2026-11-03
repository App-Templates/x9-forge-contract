const hash = 'a'.repeat(64), date = '2026-10-09T00:00:00Z';
export function workspace() {
  return { agentId: 'agent-1', ownerId: 'owner-1', tenantId: 'tenant-1', version: 7,
    files: ['IDENTITY.md', 'SOUL.md', 'POLICIES.md', 'USER.md'].map(name => ({ name, load: 'always',
      versions: { desired: 1, applied: 1, failed: null }, history: [{ version: 1, origin: { kind: 'agent' }, hash, bytes: 100, updatedAt: date }] })),
    tools: { name: 'TOOLS.md', origin: 'generated', editable: false, load: 'always', version: 7, hash, bytes: 200, updatedAt: date },
    registry: { capabilities: [] }, skills: [] };
}
