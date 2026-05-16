# Auditoria fase Codex memory

## 1. Initial audit

- The repository did not expose a root `AGENTS.md` or `CODEX*.md` file in the initial file scan.
- Existing audit documentation lives under `docs/audits`.
- The project already has a Next.js-oriented structure with `app`, `components`, `src`, `data`, and `docs`.

## 2. Technical plan

- Add a root `AGENTS.md` so future Codex sessions receive project-specific constraints.
- Preserve the crypto intelligence product direction and explicit non-goals.
- Keep this phase documentation-only. No runtime code, API contracts, dependencies, or data models are changed.

## 3. Files created

- `AGENTS.md`
- `docs/audits/auditoria-fase-codex-memory.md`

## 4. Files modified

- `AGENTS.md`
- `docs/audits/auditoria-fase-codex-memory.md`

## 5. Implementation

- Added project memory covering product identity, architecture direction, multi-agent design, orchestration flow, output rules, security rules, API route rules, validation expectations, and current priority.
- Added an extended platform memory section covering automation, adoption map, autoprovisioning, routing strategy, maturity model, deprovisioning, continuous improvement, optimization, reference values, operational change control, and ecosystem change points.
- Normalized Markdown formatting for repository documentation.
- Kept instructions focused on crypto intelligence and decision support, not trade execution.

## 6. Validation

- File discovery was performed before adding documentation.
- No lint or build command was required because this phase only adds Markdown documentation.
- `git status` could not be read because Git reported the repository as a dubious ownership path on this Windows filesystem. The suggested Git fix is:

```powershell
git config --global --add safe.directory D:/projects/ai-trader-terminal
```

## 7. Risks

- The down-arrow characters in the orchestration flow were preserved from the provided memory. If strict ASCII-only documentation is required later, replace them with `->`.
- The root `AGENTS.md` will influence future agent behavior. This is intentional, but future edits should be reviewed carefully because broad instructions can affect implementation choices.

## 8. Final audit

- The project now has a root Codex memory file.
- The root memory now includes the operating system layer for progressive platform governance.
- No application behavior changed.
- No secrets, private keys, exchange credentials, or wallet access were introduced.
- The documented priority remains the crypto multi-agent intelligence layer.

## 9. Suggested commit

```txt
docs: add Codex project memory
```
