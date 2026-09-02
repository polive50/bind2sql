# Bind2SQL

Bind2SQL is a small, browser-only tool that rebuilds executable SQL from Java `PreparedStatement` code. Paste Java code and, optionally, log/map values to see its bound SQL without sending your data anywhere.

## Run locally

Requires Node.js 18+.

```bash
npm test
npm start
```

Then open the local URL printed by the server. The app is static: all parsing happens in the browser; SQL, Java code, and pasted values never leave your device.

## v0.1

- Extracts SQL Java strings, including common `+` concatenations.
- Reads common `PreparedStatement#set*` methods, dates/times, literals, simple casts and `map.get("KEY")` values.
- Replaces placeholders by binding index, escapes SQL quotes, and flags unresolved values.
- Provides copy, example, clear, detected-binding and warning views.

## Known limitations

This is a pragmatic parser, not a complete Java or SQL parser. Complex Java expressions, dynamically assembled SQL, nested method calls, advanced Java string syntax, and all SQL dialect nuances may need manual review. Unresolved bindings deliberately remain marked instead of guessed.

## Roadmap

- Hibernate logs
- Spring JdbcTemplate
- MyBatis
- `.sql` export
- Data anonymization
