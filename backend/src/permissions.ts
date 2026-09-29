import { createAccessControl } from 'better-auth/plugins/access'
import { adminAc, defaultStatements } from 'better-auth/plugins/admin/access'

const statement = {
  ...defaultStatements,
  staff: [
    'manage_content',
    'publish_content',
    'manage_opportunities',
    'review_applications',
    'manage_users',
  ],
  work: ['track'],
} as const

export const ac = createAccessControl(statement)

export const admin = ac.newRole({
  staff: [...statement.staff],
  ...adminAc.statements,
})

export const editor = ac.newRole({
  staff: ['manage_content', 'publish_content'],
})

export const reviewer = ac.newRole({
  staff: ['manage_opportunities', 'review_applications'],
})

export const user = ac.newRole({
  staff: [],
})

export const volunteer = ac.newRole({
  work: ['track'],
})

export const roles = { admin, editor, reviewer, user, volunteer }
