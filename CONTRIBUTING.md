# Contributing to Fabricator

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the Fabricator project.

## Code of Conduct

Be respectful, inclusive, and professional. We're building something amazing for creators.

## Getting Started

1. **Fork** the repository
2. **Clone** your fork locally
3. **Create a feature branch**: `git checkout -b feature/your-feature-name`
4. **Make changes** following the style guide below
5. **Test** your changes thoroughly
6. **Commit** with clear messages
7. **Push** to your fork
8. **Open a Pull Request** with a clear description

## Development Setup

```bash
cd fabricator-app
npm install
npm run typecheck
npm start
```

## Code Style

### TypeScript

- Use strict mode (already enabled in `tsconfig.json`)
- Add explicit return types to functions
- Use meaningful variable names
- Comment complex logic

```typescript
// ✅ Good
export const calculateBuildCost = (materials: Material[]): number => {
  return materials.reduce((sum, m) => sum + m.cost, 0);
};

// ❌ Avoid
const calc = (items: any[]) => {
  let total = 0;
  for (const item of items) {
    total += item.c;
  }
  return total;
};
```

### Formatting

- Run `npm run format` (uses Prettier)
- Run `npm run lint` to check for issues
- Line length: 100 characters (soft limit)

### Naming Conventions

```typescript
// Components: PascalCase
export const ProjectDashboard = () => {};

// Functions/variables: camelCase
const calculateMetrics = () => {};
let sessionDuration = 0;

// Constants: UPPER_SNAKE_CASE
const MAX_BUILD_ITEMS = 100;

// Types/Interfaces: PascalCase
interface ProjectData {}
type BuildSession = {};
```

## Commit Messages

Use clear, descriptive commit messages:

```
feat: Add project photo gallery
fix: Resolve session tracking bug
refactor: Simplify task component
docs: Update API documentation
test: Add tests for build cost calculator
style: Format files with Prettier
```

**Format**: `<type>: <description>`

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `docs`: Documentation changes
- `test`: Test additions/changes
- `style`: Formatting/styling changes
- `chore`: Dependencies or build changes

## Pull Request Process

1. Update the `CHANGELOG.md` with your changes
2. Ensure all tests pass: `npm run typecheck`
3. Provide a clear PR description:
   - What problem does this solve?
   - How does it work?
   - What testing was done?
4. Link any related issues
5. Request review from maintainers

## Documentation

- Add JSDoc comments to exported functions
- Update README.md if adding new features
- Document environment variables in `.env.example`
- Keep inline comments minimal but clear

```typescript
/**
 * Generates a summary of build session activities
 * @param sessions - Array of completed sessions
 * @returns Formatted summary string
 */
export const generateSessionSummary = (sessions: Session[]): string => {
  // Implementation...
};
```

## Testing

- Write tests for new features
- Maintain or improve code coverage
- Test on both iOS and Android when possible

```bash
npm run typecheck  # Type checking
npm test           # Run tests (when available)
```

## Reporting Issues

Use GitHub Issues with:
- **Clear title** describing the problem
- **Steps to reproduce** the issue
- **Expected vs actual** behavior
- **Screenshots** if applicable
- **Device/environment** information

## Questions?

- Check existing issues and discussions
- Open a discussion for questions
- Contact maintainers for guidance

## License

By contributing, you agree your code will be licensed under the MIT License.

---

**Thank you for making Fabricator better!** 🎉
