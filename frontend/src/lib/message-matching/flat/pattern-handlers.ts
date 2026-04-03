export { matchesPattern, extractIndexFromMatch, matchesPatternWithResult } from './pattern-utils'
export { handleContentPattern } from './content-handlers'
export {
  handleToolCallFunctionNamePattern,
  handleToolCallIdPattern,
  handleToolCallFunctionArgumentPattern,
  handleToolMessageCallIdPattern,
} from './tool-handlers'
export { handleRolePattern, handleNamePattern, type RolePatternResult } from './role-handlers'
