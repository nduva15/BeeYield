# Security Documentation

## Fixed Vulnerabilities

### ✅ Fixed (December 2025)
- **glob** (High severity) - Command injection vulnerability - Updated to safe version
- **js-yaml** (Moderate severity) - Prototype pollution vulnerability - Updated to safe version

## Known Vulnerabilities Requiring Breaking Changes

### Remaining Vulnerabilities

#### 1. d3-color ReDoS Vulnerability (High - Not Exploitable)
- **Package**: d3-color (indirect dependency via react-simple-maps)
- **Severity**: High
- **Status**: Not exploitable in current usage
- **Details**: ReDoS vulnerability in color parsing. However, the application only uses hardcoded colors and static map data with no user input to color parsing functions.
- **Fix**: Would require downgrading react-simple-maps from 3.0.0 to 1.0.0 (breaking change)
- **Risk Assessment**: Low - no user-controlled input reaches the vulnerable code path

#### 2. esbuild Development Server Vulnerability (Moderate - Dev Only)
- **Package**: esbuild (indirect dependency via vite)
- **Severity**: Moderate
- **Status**: Development environment only
- **Details**: Development server can accept requests from any website. Does not affect production builds.
- **Fix**: Would require upgrading vite from 5.x to 7.x (breaking change)
- **Risk Assessment**: Low - only affects development environment, not production

## Recommendations

1. **For d3-color vulnerability**: Monitor for react-simple-maps updates that include newer d3 dependencies
2. **For esbuild vulnerability**: Use only in trusted development environments; consider Vite upgrade when ready for breaking changes
3. **Regular audits**: Run `npm audit` regularly to catch new vulnerabilities

## Security Best Practices

- All direct security fixes that don't require breaking changes have been applied
- Production build is not affected by remaining vulnerabilities
- Continue monitoring for updates to affected packages
