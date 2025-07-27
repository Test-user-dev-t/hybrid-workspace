# ADR-001: Adopt Yjs as CRDT for Block Tree Management

**Status:** Proposed  
**Date:** 2025-07-27  
**Deciders:** Test-user-dev-t (orchestrator), claude-ai, chatgpt-ai  

## Context

Our hybrid creative workspace requires a robust conflict-free replicated data type (CRDT) to manage the document's block tree structure. The application needs to support:

- **Offline-first editing** across text, code, and canvas blocks
- **Multi-device synchronization** when users work from different devices
- **Future collaboration** features without architectural rewrites
- **Mixed content types** (Markdown, code, drawings) in a unified document structure
- **Performance** with documents containing hundreds of blocks

The choice of CRDT is foundational and difficult to change later, making this our most critical early architectural decision.

## Decision

**We will adopt Yjs as our primary CRDT library.**

## Alternatives Considered

### Option 1: Yjs ✅ (Selected)
**Pros:**
- Battle-tested at scale (Figma, Linear, Notion-like apps)
- Excellent ecosystem: `y-prosemirror`, `y-codemirror`, `y-indexeddb`
- Strong TypeScript support and documentation
- Efficient binary encoding and network protocols
- Handles complex data types (Text, Map, Array) needed for our block structure
- Active development and large community

**Cons:**
- Larger bundle size (~50KB compressed)
- Somewhat complex internals for debugging
- Vendor lock-in to Y-ecosystem

### Option 2: Automerge
**Pros:**
- Beautiful immutable data model
- Rust-native implementation (aligns with Tauri)
- Theoretically superior conflict resolution
- Smaller conceptual surface area

**Cons:**
- Smaller ecosystem, fewer editor integrations
- Less proven at scale in production apps
- Would require custom integrations for ProseMirror/CodeMirror
- Performance characteristics less understood for our use case

### Option 3: Custom CRDT Implementation
**Pros:**
- Full control over behavior and performance
- Minimal dependencies
- Exact fit for our requirements

**Cons:**
- Massive engineering effort (6+ months)
- High risk of subtle bugs in conflict resolution
- No ecosystem benefits
- Reinventing extremely well-solved problems

## Consequences

### Positive
- **Fast development velocity**: Leverage existing editor integrations
- **Proven reliability**: Building on battle-tested foundations
- **Future-ready**: Easy path to real-time collaboration
- **Performance confidence**: Known to handle large documents efficiently

### Negative
- **Bundle size impact**: ~50KB added to client bundle
- **Abstraction overhead**: Learning Yjs patterns and debugging model
- **Migration risk**: Changing CRDTs later would require significant rewrites

## Implementation Plan

1. **Phase 1**: Integrate Yjs with basic block structure
   - `Y.Map` for document metadata
   - `Y.Array` for block sequence
   - `Y.Map` for individual block data

2. **Phase 2**: Add editor integrations
   - `y-prosemirror` for text blocks
   - `y-codemirror` for code blocks
   - Custom Yjs integration for canvas blocks

3. **Phase 3**: Persistence layer
   - `y-indexeddb` for local storage
   - Design `.hyb` file format around Yjs document snapshots

## Mitigation Strategies

**Bundle Size**: Use dynamic imports and code splitting to load Yjs only when editing
**Vendor Lock-in**: Design abstraction layer that could theoretically support other CRDTs
**Learning Curve**: Invest in team education and comprehensive documentation

## Success Metrics

- Single-user editing performance: <16ms for typical operations
- Document loading: <500ms for 100-block documents
- Memory usage: <10MB for large documents
- Zero data loss in offline/online scenarios

## Votes

- **Test-user-dev-t** — ⏳ (pending)
- **claude-ai** — ✅ (approve - aligns with ecosystem strategy)  
- **chatgpt-ai** — ⏳ (pending)
---

*This ADR establishes the foundational data layer for our creative workspace. Future ADRs will build upon this choice for editor integration, persistence, and collaboration features.*
