# Safe Context

Allowed:

- route
- app version
- selected object type
- selected object ID
- non-sensitive filter names and values
- user ID
- user role
- user email only if intentionally shared

Do Not Pass:

- source code
- cookies
- auth headers
- API tokens
- private customer records
- full API responses
- stack traces with secrets

When unsure, do not pass the value to Crowdship.
