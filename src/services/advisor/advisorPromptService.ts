import { AdvisorProjectContext, AdvisorToolKey } from './advisorTypes';

function listItems(items: { title?: string; name?: string; system?: string; status?: string }[], fallback: string) {
  if (!items.length) return fallback;

  return items
    .slice(0, 8)
    .map(item => `- ${item.title || item.name || 'Item'}${item.system ? ` (${item.system})` : ''}${item.status ? ` — ${item.status}` : ''}`)
    .join('\n');
}

export function buildAdvisorContextSummary(context: AdvisorProjectContext) {
  const project = context.project;

  return [
    `Project: ${project?.name || 'No selected project'}`,
    `Category: ${context.category || project?.category || 'Unknown'}`,
    `Phase: ${context.phase || project?.phase || 'Unknown'}`,
    `Status: ${project?.status || 'Unknown'}`,
    `Progress: ${project?.progress ?? 0}%`,
    '',
    'Open Tasks:',
    listItems(context.openTasks, '- None recorded'),
    '',
    'Needed or Ordered Parts:',
    listItems([...context.neededParts, ...context.orderedParts], '- None recorded'),
    '',
    'Recent Activity:',
    context.recentActivity.length
      ? context.recentActivity.slice(0, 8).map(item => `- ${item.title}${item.detail ? ` — ${item.detail}` : ''}`).join('\n')
      : '- None recorded',
  ].join('\n');
}

export function buildAdvisorPrompt(tool: AdvisorToolKey, context: AdvisorProjectContext, missingInformation?: string) {
  const contextSummary = buildAdvisorContextSummary(context);
  const userInfo = missingInformation?.trim()
    ? `\nAdditional information from user:\n${missingInformation.trim()}\n`
    : '\nAdditional information from user: None provided. Use project context first.\n';

  const commonRules = [
    'You are Fabricator Advisor, a project assistant for garage, fabrication, restoration, woodworking, electronics, and home improvement projects.',
    'Do not act as a chatbot.',
    'Return one structured response only.',
    'Use the provided project context first.',
    'Ask for missing information only when it blocks a useful answer.',
    'Keep recommendations practical, specific, and safety-minded.',
    'Format the answer as JSON with: headline, summary, sections, nextAction.',
    'sections must be an array of objects with title and items.',
  ].join('\n');

  const toolInstruction = {
    priority: 'Tool: Priority Advisor. Prioritize what should happen next. Focus on blockers, next shop session order, and what not to do yet.',
    troubleshooting: 'Tool: Troubleshooting Assistant. Diagnose the described problem using project context and propose a safe test-first plan.',
    photoReview: 'Tool: Photo Review. Review the provided photo context and project data for visible fitment, routing, support, safety, missing parts, and next actions.',
  }[tool];

  return [commonRules, '', toolInstruction, '', 'Project context:', contextSummary, userInfo].join('\n');
}
