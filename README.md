# Bind2SQL

Bind2SQL turns Java `PreparedStatement` code into executable SQL. Paste Java/JDBC code and optional log/map values to reconstruct bound SQL without sending your data anywhere.

**Live demo:** https://polive50.github.io/bind2sql/

## Run locally

Requires Node.js 18+.

```bash
npm test
npm start
```

Then open the local URL printed by the server. The app is static: all parsing happens in the browser; SQL, Java code, and pasted values never leave your device.

## Pro version

Bind2SQL Pro — Batch Workspace adds multi-PreparedStatement reconstruction, batch copy and .sql export.

Purchase:
https://payhip.com/b/UwDFo

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
