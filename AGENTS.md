<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Texto, ortografia e encoding

- Todo texto visível ao usuário deve estar em português correto, com acentos, cedilhas e pontuação adequados.
- Antes de finalizar alterações de UI, verifique se não existem caracteres quebrados por encoding/mojibake, como `Ã`, `Â`, `�`, `AnalÃ­tico`, `PerÃ­odo`, `VisualizaÃ§Ãµes`.
- Não publique telas com textos truncados, quebrados visualmente, sem contraste ou com palavras cortadas de forma amadora.
- Quando corrigir um texto em uma seção, procure ocorrências semelhantes no mesmo fluxo ou componente para evitar correções parciais.
- Preserve nomes próprios, arrobas e termos técnicos, mas traduza rótulos de métricas para português quando forem exibidos para usuários externos.
