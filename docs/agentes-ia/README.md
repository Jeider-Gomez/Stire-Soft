# Trabajo con herramientas de IA

STIRE se construye con varias herramientas de IA, cada una con un papel. Esta carpeta guarda sus
planes, lo que reportó cada sesión y los prompts que se les dieron, para que el proceso sea
auditable.

| Carpeta | Herramienta | Qué hay |
|---|---|---|
| [`antigravity/`](antigravity/README.md) | Google Antigravity (frontend Nuxt) | Plan de implementación vigente (Insumo 15), plan de tipos de actividad e informes de sesión |
| [`codex/`](codex/README.md) | Codex | Plan de fases delegadas e informes |
| [`claude-code/`](claude-code/README.md) | Claude Code (líder técnico asistido: backend, auditorías, despliegue) | Informes de sesión con verificación en vivo |
| [`prompts/`](prompts/README.md) | Todas | Prompts multifase tal como se enviaron (evidencia de ingeniería de prompts) |

Los planes ya ejecutados se archivan en [`../_archivo/`](../_archivo/README.md) con su fecha; aquí
queda solo lo vigente. El historial completo de cambios, con commits, está en
[`../../CHANGELOG.md`](../../CHANGELOG.md).
