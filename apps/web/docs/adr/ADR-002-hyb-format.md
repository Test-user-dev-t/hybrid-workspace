# ADR-002: .hyb File Format Specification

**Status:** Proposed  
**Date:** 2025-07-28  
**Deciders:** Test-user-dev-t (orchestrator), claude-ai, chatgpt-ai

## Context

Our hybrid creative workspace requires a standardized file format that supports:

- **Encrypted storage** of Yjs CRDT documents
- **Cross-platform compatibility** (web, desktop via Tauri)
- **Offline-first capabilities** with import/export functionality
- **Future extensibility** for metadata, assets, and collaboration features
- **User-friendly branding** that differentiates from generic formats

The `.hyb` format will serve as the primary file exchange mechanism between users and across devices, encapsulating both document content and metadata in an encrypted, self-contained package.

## Decision

**We will implement the `.hyb` file format as an encrypted ZIP-like container with a structured manifest.**

## File Format Structure

### Binary Layout

```
.hyb File Structure:
┌─────────────────────────────────────┐
│ Magic Header (4 bytes)              │ "HYB\x00"
├─────────────────────────────────────┤
│ Format Version (2 bytes)            │ 0x0001 (v1.0 - major.minor)
├─────────────────────────────────────┤
│ Encryption Header (64 bytes)        │ Salt + IV + Key derivation params
├─────────────────────────────────────┤
│ Encrypted Payload                   │ ZIP archive containing:
│ ┌─────────────────────────────────┐ │   - manifest.json
│ │ manifest.json                   │ │   - doc.bin (Yjs document)
│ │ doc.bin                         │ │   - assets/ (optional)
│ │ assets/ (directory)             │ │   - metadata.json
│ │ metadata.json                   │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Manifest Structure

```json
{
  "version": "1.0.0",
  "created": 1690732800000,
  "modified": 1690732850000,
  "title": "Untitled Document",
  "author": "user@example.com",
  "hybrid": {
    "yjsVersion": "13.6.7",
    "blockCount": 5,
    "contentTypes": ["text", "code", "canvas"],
    "features": ["collaboration", "encryption"]
  },
  "files": {
    "doc.bin": {
      "size": 2048,
      "sha256": "abc123def456...",
      "compression": "deflate"
    },
    "assets/": {
      "count": 3,
      "totalSize": 15360
    }
  },
  "encryption": {
    "algorithm": "AES-256-GCM",
    "keyDerivation": "Argon2id",
    "iterations": 100000
  }
}
```

## Encryption Boundary Decision

**Whole-file encryption** at the container level:

### Rationale

- **Simplicity**: Single encryption/decryption operation
- **Performance**: No per-block overhead during editing
- **Security**: All metadata and content protected uniformly
- **Compatibility**: Standard ZIP tools can extract decrypted content

### Implementation

```typescript
interface HybEncryption {
  algorithm: 'AES-256-GCM';
  keyDerivation: 'Argon2id';
  salt: Uint8Array; // 32 bytes, random per file
  iv: Uint8Array; // 12 bytes, random per encryption
  iterations: number; // minimum 100k, target 500k on desktop builds
}
```

## Alternatives Considered

### Option 1: JSON-based Format

**Pros:** Human-readable, simple parsing  
**Cons:** Larger file sizes, no native compression, harder to extend  
**Verdict:** Rejected - doesn't scale for binary assets

### Option 2: Custom Binary Format

**Pros:** Maximum performance, minimal overhead  
**Cons:** Complex implementation, compatibility issues, debugging difficulty  
**Verdict:** Rejected - over-engineering for current needs

### Option 3: SQLite Database

**Pros:** Mature, queryable, supports incremental updates  
**Cons:** Overkill for document format, larger runtime dependency  
**Verdict:** Rejected - too heavyweight

### Option 4: Block-level Encryption

**Pros:** Granular sharing capabilities, selective decryption  
**Cons:** Complex key management, performance overhead, implementation complexity  
**Verdict:** Deferred - can be added in v2.0 if collaboration requires it

## Implementation Plan

### Phase 1: Basic Container (Sprint 1)

- Implement `.hyb` file creation from Yjs document
- Basic ZIP container with manifest.json
- Whole-file AES-256-GCM encryption
- Import/export functionality in web app

### Phase 2: Asset Support (Sprint 2)

- Embedded images, files in assets/ directory
- Checksum validation for integrity
- Compression optimization

### Phase 3: Advanced Features (Sprint 3)

- Version history support
- Collaboration metadata (cursors, comments)
- Cross-platform compatibility testing

## Security Considerations

### Key Derivation

- **Argon2id** with minimum 100k iterations, target 500k on desktop builds
- **32-byte salt** generated per file
- **User passphrase** required for encryption/decryption

### Integrity Protection

- **SHA-256 checksums** for all internal files (stored as `sha256` field)
- **AEAD** (Authenticated Encryption) prevents tampering
- **Magic header** `HYB\x00` with version validation

### Privacy

- **No plaintext metadata** in file headers
- **Filename obfuscation** within encrypted container
- **Zero-knowledge** architecture - we never see user content

## Migration Strategy

### Forward Compatibility

- **Version field** in manifest supports format evolution
- **Feature flags** enable graceful degradation
- **Extension points** for new content types

### Backward Compatibility

- **Version 1.x** maintains read compatibility
- **Migration utilities** for major version changes
- **Export to standard formats** (Markdown, HTML) as fallback

## Success Metrics

- **File size efficiency**: <5% overhead vs raw Yjs document
- **Encryption performance**: <100ms for typical documents
- **Cross-platform compatibility**: Works on Windows, macOS, Linux
- **Corruption resistance**: 0% data loss in normal usage scenarios

## Consequences

### Positive

- **User data portability** across devices and platforms
- **Strong security** with industry-standard encryption
- **Professional file format** enhances product credibility
- **Future-proof design** supports feature evolution

### Negative

- **Implementation complexity** for encryption/decryption
- **Performance overhead** for large documents
- **Key management** burden on users (lost password = lost data)
- **Binary format** harder to debug than JSON

## File Extension Registration

**.hyb** extension registration for hybrid workspace documents:

- **MIME type**: `application/vnd.hybrid-workspace.document`
- **Icon**: Custom .hyb file icon for OS integration
- **Double-click behavior**: Open in Hybrid Workspace app

## Votes

- **Test-user-dev-t** — ⏳ (pending orchestrator review)
- **claude-ai** — ✅ (approve - balances security, simplicity, and extensibility)
- **chatgpt-ai** — ✅ (approve with minor header improvements - implemented)

---

_This ADR establishes the foundation for secure, portable document storage. The .hyb format will enable seamless collaboration while maintaining user privacy and data ownership._
