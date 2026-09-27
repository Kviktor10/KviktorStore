export class PaymentStrategy {
  label(){ throw new Error('Strategy não implementada.'); }
  build(){ throw new Error('Strategy não implementada.'); }
}
export class PixStrategy extends PaymentStrategy {
  label(){return 'PIX';}
  build(total){return {method:'pix',label:this.label(),instruction:`PIX demonstrativo — valor de ${new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(total)}.`};}
}
export class CreditCardStrategy extends PaymentStrategy {
  label(){return 'Cartão de crédito';}
  build(total){return {method:'credit_card',label:this.label(),instruction:`Cartão de crédito demonstrativo — total ${new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(total)}.`};}
}
export class DebitCardStrategy extends PaymentStrategy {
  label(){return 'Cartão de débito';}
  build(total){return {method:'debit_card',label:this.label(),instruction:`Cartão de débito demonstrativo — total ${new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(total)}.`};}
}
export class CashStrategy extends PaymentStrategy {
  label(){return 'Dinheiro na entrega';}
  build(total){return {method:'cash',label:this.label(),instruction:`Pagamento em dinheiro na entrega — ${new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(total)}.`};}
}

export class PaymentStrategyFactory {
  static create(method){
    return ({pix:new PixStrategy(),credit_card:new CreditCardStrategy(),debit_card:new DebitCardStrategy(),cash:new CashStrategy()})[method] || new PixStrategy();
  }
}
