# ShopFlow MVC — E-commerce Local-First v3

Aplicação web mobile-first em HTML5, CSS3 e JavaScript ES Modules, estruturada em MVC e persistência com `localStorage`.

## Funcionalidades

### Vendas
- Catálogo de produtos com categorias e busca.
- Carrinho com inclusão, exclusão e ajuste de quantidade.
- Controle de estoque no carrinho/checkout.
- Checkout em etapas: cliente, entrega, pagamento e cupom.
- Cálculo de subtotal, desconto, frete e total.
- Cupons demonstrativos: `BEMVINDO10`, `DESCONTO20` e `FRETEGRATIS`.
- Meios de pagamento por Strategy: PIX, crédito, débito e dinheiro na entrega.
- Finalização do pedido com número, data, cliente, itens, frete e total.
- Histórico de pedidos.
- Consulta detalhada do pedido.
- Comprar novamente a partir de um pedido anterior.
- Backup JSON dos dados de negócio.

### Gravações
- Botão flutuante de gravação.
- Permissão explícita do microfone.
- Indicador de microfone ativo/pausado.
- Temporizador.
- Armazenamento local dos blobs no IndexedDB.
- Tela própria de gravações com reprodução, salvamento e exclusão.

> Os dados de negócio usam `localStorage`. Os arquivos de áudio usam IndexedDB, pois `localStorage` armazena strings e não é adequado para blobs de áudio.

## Arquitetura

```text
MVC
├── Models
│   ├── AppModel
│   ├── CartModel
│   └── OrderModel
├── Views
│   ├── HomeView
│   ├── CartView
│   ├── CheckoutView
│   ├── OrdersView
│   ├── RecordingsView
│   ├── SettingsView
│   └── ModalView
├── Controllers
│   └── AppController
├── Repositories
│   ├── LocalStorageRepository
│   └── AudioRepository
├── Services
│   ├── CartService
│   ├── CheckoutService
│   └── AudioService
├── Strategies
│   └── PaymentStrategy
└── Utils
    ├── EventBus
    └── helpers
```

### Padrões utilizados

**MVC:** separa dados, interface e coordenação da aplicação.

**Repository:** concentra acesso a `localStorage`/IndexedDB.

**Strategy:** permite trocar a lógica de meios de pagamento sem acoplar o checkout a uma implementação.

**Observer / EventBus:** propaga mudanças de carrinho, pedido e gravação sem criar dependências diretas entre todas as telas.

## Execução no Android

O acesso ao microfone em navegador normalmente exige contexto seguro. Use `https://` ou `localhost`. Hospedar os arquivos em HTTPS é a forma prática para testar o PWA em um telefone.

O pagamento deste projeto é **demonstrativo/local**. Não existe cobrança real, gateway, PIX real ou processamento de cartão. Para produção, o checkout deve ser integrado a um backend e a um provedor de pagamento compatível.
