# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly:

1. **Do NOT** open a public issue
2. **Email** the maintainers at: [security@example.com](mailto:security@example.com)
3. **Include** the following information:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 1 week
- **Resolution**: Within 30 days (depending on severity)

## Security Considerations

This library handles carbon emission calculations and should be used with appropriate validation:

- **Input Validation**: Always validate user inputs
- **Factor Verification**: Verify emission factors from trusted sources
- **Audit Trail**: Maintain audit trails for carbon calculations
- **Data Integrity**: Ensure data integrity in production environments

## Best Practices

- Use HTTPS in production
- Validate all inputs
- Keep dependencies updated
- Monitor for security advisories
- Use environment variables for sensitive data

## Disclaimer

The default emission factors included in this library are for demonstration purposes only. For production use, replace with authoritative, region-specific emission factors from official sources.
