
# Image Maker

Ferramenta de Anotação de Imagens para Documentação
------

Aplicação web autocontida (single-file) que permite carregar imagens, criar marcações interativas (pontos e áreas) e exportar código HTML e CSS semântico, limpo e responsivo para manuais, tutoriais e documentação técnica.

Características principais:
- 100% Vanilla JS
- Zero dependências externas
- Funciona offline ao abrir o arquivo localmente

## Funcionalidades

- Carregamento de imagens locais via seletor de arquivos
- Marcações de ponto e área com desenho interativo
- Edição em tempo real: título, cor, duplicação e exclusão
- Barra lateral organizada com lista de marcações e controle de seleção
- Zoom e navegação fluida
- Exportação de código sem CSS inline, utilizando classes semânticas
- Output responsivo com posicionamento baseado em porcentagem
- Arquivo único: funciona diretamente no navegador

## Como Usar

1. Abra o arquivo image-maker.html no navegador
2. Clique em Carregar Imagem e selecione o arquivo desejado
3. Escolha a ferramenta na barra superior:
   - Selecionar/Editar
   - Adicionar ponto (clique simples)
   - Desenhar área (arraste o mouse)
4. Clique ou arraste sobre a imagem para criar marcações
5. Use a barra lateral para:
   - Renomear títulos
   - Trocar cores
6. Clique em Gerar Código
7. Copie o HTML e o CSS e integre no seu projeto

## Output Gerado

O exportador gera código limpo e semântico, separando estrutura de estilo. O posicionamento usa porcentagem para garantir responsividade em qualquer tamanho de tela.

Exemplo de HTML exportado:
```html
<div class="im-container">
    <img src="assets/prints/dashboard.png" alt="dashboard.png" class="im-image">
    <div class="im-annotation im-annotation--area im-color--blue" style="left:21.90%;top:12.30%;width:75.59%;height:25.79%">
        <span class="im-label">Preencha os dados</span>
    </div>
</div>
```

## Como Integrar no Seu Projeto

Metodo 1 - Recomendado (CSS externo):
Inclua o arquivo markers.css no head da sua pagina e cole o HTML exportado onde necessario.

Metodo 2 - Rapido (CSS inline no head):
Copie o CSS gerado e cole diretamente dentro de uma tag style no head da pagina.

Dica: Salve o CSS em um arquivo unico e reutilize em todas as paginas da sua documentacao. Assim, qualquer alteracao de estilo e propagada globalmente.

## Como Funciona o Posicionamento

Todas as coordenadas (left, top, width, height) sao calculadas em porcentagem relativa a imagem. Isso garante que as marcacoes escalem automaticamente em telas maiores ou menores. Nao e necessario JavaScript no front-end de consumo: apenas CSS puro.

## Personalização Avancada

- Cores das marcacoes: Edite as classes .im-color--* ou adicione novas
- Tamanho/estilo dos pontos: Modifique .im-annotation--point no CSS
- Posicao das labels: Ajuste bottom: 100% ou top: 100% em .im-label
- Animacao de pulso: Remova ou edite @keyframes im-pulse
- Responsividade mobile: Use @media (max-width: 768px) para ajustar fontes e bordas

## Requisitos e Compatibilidade

- Navegadores: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Execucao: Local (file://) ou qualquer servidor estatico
- Dependencias: Nenhuma (zero frameworks, zero build step)
- Acessibilidade: Respeita prefers-reduced-motion e usa currentColor para contraste natural

## Boas Práticas

1. Use labels curtas e objetivas
2. Mantenha o CSS separado para facilitar manutencao e versionamento
3. Teste o output em 3 larguras diferentes antes de publicar
4. Para documentacao em larga escala, crie um template base com o link para o CSS
5. Evite sobreposicao excessiva de marcacoes em areas criticas da imagem

## Licença

MIT. Uso livre para projetos pessoais, comerciais ou educacionais.

