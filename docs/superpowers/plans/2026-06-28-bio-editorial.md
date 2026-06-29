# Bio Editorial Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesenhar a secao de biografia com layout editorial fashion baseado na opcao B aprovada.

**Architecture:** A alteracao fica concentrada no componente publico `BioSection`, mantendo o conteudo local da secao e os padroes atuais de `MotionReveal`, `framer-motion` e `next/image`. A nova imagem sera publicada em `public/images` para uso estavel pelo Next.js.

**Tech Stack:** Next.js, React, Tailwind CSS, Framer Motion, Next Image.

---

### Task 1: Asset Editorial

**Files:**
- Create: `public/images/thais-editorial-bw.png`

- [ ] **Step 1: Copiar a imagem aprovada**

Copiar `C:\Users\alexs\Downloads\ChatGPT Image 28_06_2026, 21_40_19.png` para `public/images/thais-editorial-bw.png`.

- [ ] **Step 2: Verificar disponibilidade**

Run: `Test-Path public/images/thais-editorial-bw.png`
Expected: `True`

### Task 2: Redesign do BioSection

**Files:**
- Modify: `src/components/public/BioSection.tsx`

- [ ] **Step 1: Atualizar layout**

Trocar o layout atual por uma composicao split fashion: imagem preto e branco no lado esquerdo, painel textual no lado direito, monograma `T` em fonte de assinatura e gradientes discretos.

- [ ] **Step 2: Reduzir peso do texto**

Manter tres paragrafos curtos com fonte menor no desktop e mobile, evitando o texto grande atual.

- [ ] **Step 3: Preservar animacoes elegantes**

Usar `MotionReveal`, parallax leve no monograma e entrada suave da imagem/texto.

### Task 3: Verificacao

**Files:**
- Test: `src/components/public/BioSection.tsx`

- [ ] **Step 1: Rodar lint**

Run: `npm run lint`
Expected: sem erros.

- [ ] **Step 2: Rodar build**

Run: `npm run build`
Expected: build completo.

- [ ] **Step 3: Capturar desktop/mobile**

Usar Playwright para capturar a secao `#bio` em desktop e mobile e confirmar que nao ha overflow horizontal nem texto cobrindo o rosto.
