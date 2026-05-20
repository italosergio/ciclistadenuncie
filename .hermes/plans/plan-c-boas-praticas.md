# Plano C — Boas Práticas de Denúncia

## Objetivo
Criar documento de boas práticas para registro de denúncia, com ênfase na importância do horário do ocorrido para comprovação futura via câmeras/testemunhas.

## Justificativa
Denúncias precisas (horário, local, placa) são fundamentais para:
- Comprovação via imagens de câmeras de segurança
- Validação cruzada por testemunhas
- Credibilidade da plataforma perante poder público e academia
- Futuras punições formais (multas, pontos na carteira)

## Conteúdo do documento

### Informações essenciais ao denunciar
1. **Horário aproximado** — fundamental para cruzar com câmeras
2. **Endereço exato** — usar o mapa para marcar o ponto
3. **Placa do veículo** — sempre que possível
4. **Descrição detalhada** — direção, velocidade, testemunhas
5. **Fotos/vídeos** — guardar para futuro compartilhamento

### O que NÃO fazer
- Denúncias anônimas sem localização precisa
- Múltiplas denúncias da mesma ocorrência
- Denúncias falsas ou maliciosas (sujeito a banimento)

## Arquivos modificados
```
app/routes/denunciar.tsx                        → aviso/link "Boas Práticas" no formulário
app/routes/termo-responsabilidade-usuario.tsx   → link para o documento
```

## Observação técnica
O campo `createdAt` já existe. Para registrar o **horário do ocorrido** (que pode ser diferente do momento do registro), adicionar campo `horarioOcorrido?: string` no formulário de denúncia e no schema salvo.
