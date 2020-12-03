const fs = require('fs')
const os = require('os')
const path = require('path')

const SYMBOL_list = require('./symbols.js');
const symbolList = SYMBOL_list.symbolList();

const AutoTrader = require('./at.js');
const crypto = require('crypto');
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

// ************** IMPORTS END ************** 
class makeTradeController {
  constructor($container, options = null, data = null)
  {
    this.$container = document.getElementById($container);

    this.options = Object.assign({
    }, options);

    this.data = Object.assign({
      lastPrice: {},
      lastPayload: {},
      lastDataQueryString: "",
    }, data);

    let self = this;

    this.autoTrader = new AutoTrader({
      "lastArgument": "?",
    },{});

    this.form = {
      symbol: "BTCUSDT",
      side: "BUY",
      force: "MARKET",
      quantity: document.getElementById('input-tradeQuantity'),
      price: document.getElementById('input-tradePrice'),
      pnl: document.getElementById('input-tradePNL'),

      hasProfit: document.getElementById('input-tradeHasProfit'),
      profit: document.getElementById('input-tradeProfit'),
      hasLoss: document.getElementById('input-tradeHasLoss'),
      loss: document.getElementById('input-tradeLoss'),

      confirmTrade: document.getElementById('trade-execute-confirm'),
      makeTrade: document.getElementById('trade-execute-makeTrade'),
      withPNL: document.getElementById('trade-execute-withPNL'),
    };
    this.formError = {
      price: document.getElementById('label-error-form-price'),
      quantity: document.getElementById('label-error-form-quantity'),

      profit: document.getElementById('label-error-form-profit'),
      loss: document.getElementById('label-error-form-loss'),
    };
    this.formCard = {
      price: document.getElementById('card-label-price'),
      side: document.getElementById('card-label-side'),
      quantity: document.getElementById('card-label-quantity'),
      balance: document.getElementById('card-label-balance'),

      loss_price: document.getElementById('card-label-loss-price'),
      loss_balance: document.getElementById('card-label-loss-balance'),
      loss_pnl: document.getElementById('card-label-loss-pnl'),
      loss_percent: document.getElementById('card-label-loss-percent'),
      profit_price: document.getElementById('card-label-profit-price'),
      profit_balance: document.getElementById('card-label-profit-balance'),
      profit_pnl: document.getElementById('card-label-profit-pnl'),
      profit_percent: document.getElementById('card-label-profit-percent'),


      info: document.getElementById('card-label-info'),
    };

    this.requests =
    {
    };
    this.updaters =
    {
      cardTrade(event = null)
      {
        self.formCard.side.innerHTML = '<i class="demo-meta fa fa-2x fa-arrow-'+ (self.form.side == 'BUY' ? 'up color-green' : 'down color-red') +'"></i>';

        let price = self.form.price.value.length ? self.form.price.value : self.data.lastPrice[self.form.symbol];
        let tradeResponse = self.autoTrader.payload.trade(
            self.form.symbol,
            self.form.side,
            self.form.quantity.value,
            price,
            50,
            [self.form.profit.value,self.form.loss.value],
            self.form.force,
            self.form.makeTrade.checked)
        ;

        self.formCard.price.innerHTML = tradeResponse.data.bidPrice;
        document.getElementById('card-label-price1').innerHTML = tradeResponse.data.bidPrice;
        self.formCard.quantity.innerHTML = tradeResponse.data.quantity;
        self.formCard.balance.innerHTML = ((tradeResponse.data.quantity * tradeResponse.data.bidPrice) / 50).toFixed(2);

        self.formCard.loss_price.innerHTML = self.form.loss.value == 0 ? "-" : tradeResponse.data.lossPrice;
        self.formCard.loss_balance.innerHTML = self.form.loss.value == 0 ? "-" : (tradeResponse.data.lossBalance>0 ? "- " : "+ ") + tradeResponse.data.lossBalance.toFixed(2);
        self.formCard.loss_pnl.innerHTML = self.form.loss.value == 0 ? "-" : (tradeResponse.data.lossAmount>0 ? "+" : "") + tradeResponse.data.lossAmount;
        self.formCard.loss_percent.innerHTML = self.form.loss.value == 0 ? "-" : tradeResponse.data.lossPercent;
        self.formCard.profit_price.innerHTML = self.form.profit.value == 0 ? "-" : tradeResponse.data.profitPrice;
        self.formCard.profit_balance.innerHTML = self.form.profit.value == 0 ? "-" : (tradeResponse.data.profitBalance>0 ? "+ " : "- ") + tradeResponse.data.profitBalance.toFixed(2);
        self.formCard.profit_pnl.innerHTML = self.form.profit.value == 0 ? "-" : (tradeResponse.data.profitAmount>0 ? "+" : "") + tradeResponse.data.profitAmount;
        self.formCard.profit_percent.innerHTML = self.form.profit.value == 0 ? "-" : tradeResponse.data.profitPercent;

        document.getElementById('card-label-price1').innerHTML = !self.form.makeTrade.checked ? "-" : self.form.price.value;

        self.data.lastPayload = tradeResponse.payload;
        self.data.lastDataQueryString = tradeResponse.dataQueryString; 
        // self.formCard.info.innerHTML = tradeResponse.dataQueryString;
      },
      refreshPriceButton(loading)
      {
        if (loading)
        {
          document.getElementById("refreshPrice-button").className += " fa-spin";
        } else {
          document.getElementById("refreshPrice-button").className = document.getElementById("refreshPrice-button").className.replace(" fa-spin", "");
        }
      },
    };
    this.watchers =
    {
      priceChanged(event = null)
      {
        if (!isFinite(self.form.price.value))
        {
          self.formError.price.innerHTML = "Price is not finite";
          self.form.price.value = "";
          self.form.force = "MARKET";
          self.updaters.cardTrade();
          return;
        }

        self.formError.price.innerHTML = "";
        self.form.force = "LIMIT";

        self.updaters.cardTrade();
      },
      quantityChanged(event = null)
      {
        self.formError.quantity.innerHTML = "$"+self.form.quantity.value;

        self.updaters.cardTrade();
      },
      setHasProfit(event = null)
      {
        if (self.form.hasProfit.checked)
          return

        self.form.profit.value = 0;
        self.formError.profit.innerHTML = 0;

        self.updaters.cardTrade();
      },
      setProfit(event = null)
      {
        if (self.form.profit.value)
        {
          self.form.hasProfit.checked = true;
        }

        self.formError.profit.innerHTML = self.form.profit.value;

        self.updaters.cardTrade();
      },
      setHasLoss(event = null)
      {
        if (self.form.hasLoss.checked)
          return

        self.form.loss.value = 0;
        self.formError.loss.innerHTML = 0;

        self.updaters.cardTrade();
      },
      setLoss(event = null)
      {
        if (self.form.loss.value)
        {
          self.form.hasLoss.checked = true;
        }

        self.formError.loss.innerHTML = self.form.loss.value;

        self.updaters.cardTrade();
      },
    };
    this.clickers =
    {

      makeTradeChange(event = null)
      {
        self.updaters.cardTrade();
      },
      sendBatchOrder(event = null)
      {
        // self.formCard.info.innerHTML += `<p>payload: ${JSON.stringify(self.data.lastPayload)}</p>`;
        // if (!!self.data.lastPayload && self.data.lastPayload.length > 0)
        // {
        //   self.formCard.info.innerHTML += `<p>payload[0]: ${JSON.stringify(self.data.lastPayload[0])}</p>`;
        // }
        // if (!!self.data.lastPayload && self.data.lastPayload.length > 1)
        // {
        //   self.formCard.info.innerHTML += `<p>payload[1]: ${JSON.stringify(self.data.lastPayload[1])}</p>`;
        // }
        // if (!!self.data.lastPayload && self.data.lastPayload.length > 2)
        // {
        //   self.formCard.info.innerHTML += `<p>payload[2]: ${JSON.stringify(self.data.lastPayload[2])}</p>`;
        // }
        self.formCard.info.innerHTML =  "";
        for (var i = 0; i < self.data.lastPayload.length; i++)
        {
          if (!Object.keys(self.data.lastPayload[i]))
          {
            self.formCard.info.innerHTML +=  `<p class="my-0">Order N°${i}: - </p>`;
          } else {
            self.formCard.info.innerHTML += 
    `<p class="my-0">Order N°${i}: ${self.data.lastPayload[i].side} (${self.data.lastPayload[i].quantity}) ${self.data.lastPayload[i].symbol} ${self.data.lastPayload[i].price ? self.data.lastPayload[i].price : "MARKET"} ${self.data.lastPayload[i].reduceOnly ? "[reduceOnly]" : ""}</p>`;
          }
        }

        let tradePriceRequest = self.autoTrader.order.getTradePriceRequest("futures", self.form.symbol, self.data.lastDataQueryString).priceRequest;
        let localOnloadReponse = tradePriceRequest.onload;

        let response = () => {
          let signedRequestUrl = localOnloadReponse();

          let TheRequest = self.autoTrader.getTheRequest("post", signedRequestUrl.signedRequestUrl);


          TheRequest.onload = () => {
            // inputMsg.innerHTML += '<p class="mt-0">Trade executed.</p>'
            // inputMsg.innerHTML += '<i class="fas demo-meta fa-6x text-danger fa-check"></i>'
            self.formCard.info.innerHTML += "SENT";
            self.formCard.info.innerHTML += '<i class="fas demo-meta fa-8x fa-check"></i>';
            self.formCard.info.innerHTML += "SENT";
            self.formCard.info.innerHTML += `<p>TheRequest.responseText: ${TheRequest.responseText}</p>`;
          };
          
          TheRequest.send();

          // self.formCard.info.innerHTML += `<p>tradePriceRequest.responseText: ${tradePriceRequest.responseText}</p>`;

          self.autoTrader = new AutoTrader({"lastArgument": "?",},{});

          // self.formCard.info.innerHTML = tradePriceRequest.responseText;
          // self.formCard.info.innerHTML += signedRequestUrl;
        };

        tradePriceRequest.onload = response;

        if (self.form.confirmTrade.checked)
        {
          tradePriceRequest.send();
        } else {
          self.formCard.info.innerHTML += "NOT SEND";
          self.formCard.info.innerHTML += '<i class="fas demo-meta fa-8x fa-times"></i>';
        }

        self.form.confirmTrade.checked = false;

        // let response = () =>{
        //   let newBaseUrl = self.urls[exchange].baseUrl;
        //   let endPoint = self.urls[exchange].batchOrder;

        //   let signedRequestUrl = self.signRequest(newBaseUrl, endPoint, dataQueryString);

        //   return {
        //     signedRequestUrl: signedRequestUrl,
        //   };
        // };
      },
      setToken(event = null)
      {
        self.updaters.refreshPriceButton(true); 

        let token = event.currentTarget.dataset.token;
        const activeTokenDom = document.getElementsByClassName('active-token');
        for (var i = 0; i < activeTokenDom.length; i++)
        {
          activeTokenDom[i].className = activeTokenDom[i].className.replace("active-token", "");
        }
        const tokenDom = document.getElementById('token-'+token);
        tokenDom.className += " active-token";
        let symbol = token+"usdt";
        self.form.symbol = (token+"usdt").toUpperCase();

        let localPriceRequest = self.autoTrader.query.price("futures", self.form.symbol);
        let localOnloadReponse = localPriceRequest.onload;

        let response = () => {
          console.log(`Network response`);
          let bidPrice = JSON.parse(localPriceRequest.responseText).bidPrice;

          self.data.lastPrice[self.form.symbol] = bidPrice;

          self.updaters.refreshPriceButton(false); 
          self.form.price.value = bidPrice;
          self.formError.price.innerHTML = "";
          self.form.force = "LIMIT";
          self.updaters.cardTrade();
        };

        localPriceRequest.onload = response;
        localPriceRequest.onprogress = (event)=> { 
          console.log(`Received ${event.loaded} of ${event.total}`)
        };
        localPriceRequest.onerror = () =>{
          console.log(`Network Error`);
        };

        localPriceRequest.send();

        // alert(response)
        console.log("localPriceRequest sent")
        
        // self.updaters.cardTrade();
      },
      setSide(event = null)
      {
        self.form.side = event.currentTarget.dataset.side.toUpperCase();

        self.updaters.cardTrade();
      },
      clearPriceInput(event = null)
      {
        self.form.price.value = "";
        self.formError.price.innerHTML = "";
        self.form.force = "MARKET";
        self.updaters.cardTrade();
      },
      refreshPrice(event = null)
      {
        self.clickers.setToken({currentTarget:{dataset:{token: self.form.symbol.substr(0, self.form.symbol.length - 4).toLowerCase()}}});
      }
    };

    this.initListeners();
    // this.clickers.setToken({currentTarget:{dataset:{token: "btc"}}});
  }
  initListeners()
  {
    let self = this;

    var watchers = document.getElementsByClassName("data-watcher");
    for (var i = 0; i < watchers.length; i++) {
       watchers[i].addEventListener('change', (event) =>
       {
         self.watchers[event.currentTarget.dataset.watch](event);
       });
    }

    var clickers = document.getElementsByClassName("data-clicker");
    for (var i = 0; i < clickers.length; i++) {
       clickers[i].addEventListener("click", (event) => {
         self.clickers[event.currentTarget.dataset.click](event);
       });
    }
  }
  validateForm()
  {
  }
}


let $makeTrade = new makeTradeController('make-trade-section', {}, {
});

const tradeExecuteBuy = document.getElementById('trade-execute-buy')
const tradeExecuteSell = document.getElementById('trade-execute-sell')

const tradeExecuteMsg = document.getElementById('trade-execute-msg')
const inputMsg = document.getElementById('trade-input-msg')
const tradeMsg = document.getElementById('trade-info-msg')
const pnlMsg = document.getElementById('trade-pnl-msg')
const ordersMsg = document.getElementById('trade-orders-msg')
const sideMsg = document.getElementById('trade-info-side')

const confirmTradeCheckbox = document.getElementById('trade-execute-confirm');
const makeTradeCheckbox = document.getElementById('trade-execute-makeTrade');
const withPNLCheckbox = document.getElementById('trade-execute-withPNL');

let symbol = "btcusdt";

let inputFormGroup = {
  tradeQuantity: document.getElementById('input-tradeQuantity'),
  tradePrice: document.getElementById('input-tradePrice'),
  tradePNL: document.getElementById('input-tradePNL'),
};

let tradeEvent = (event) =>
{
  // EXAMPLE REQUEST
  let quantity = "";
  let price = "";
  let pnl = "";

  let exchange = "futures";
  let side = event.currentTarget.dataset.side;
  if (inputFormGroup.tradeQuantity.value.length)
  {
    quantity = inputFormGroup.tradeQuantity.value;
  } else {
    quantity = "1";
  }
  if (inputFormGroup.tradePrice.value.length)
  {
    price = "@" + inputFormGroup.tradePrice.value + (makeTradeCheckbox.checked ? "" : "*");
  } else {
    price = "@market" + (makeTradeCheckbox.checked ? "" : "*");
  }
  if (withPNLCheckbox.checked)
  {
    pnl = inputFormGroup.tradePNL.value;
  } else {
    pnl = "";
  }
  
  var myArgs = ["futures",side,symbol,quantity,price,pnl];

  tradeMsg.innerHTML = "";
  sideMsg.innerHTML = "";
  ordersMsg.innerHTML = "";

  let autoTraderResponse = getAutoTrader(myArgs);

  if (!autoTraderResponse.success)
  {
    inputMsg.innerHTML = '<p>Trade not executed.</p>'
    inputMsg.innerHTML += '<i class="fas demo-meta fa-6x text-danger fa-times"></i>'
    inputMsg.innerHTML += "<h2>ERROR</h2>";    
    inputMsg.innerHTML += "<h2>"+autoTraderResponse.msg+"</h2>";    
    return;
  }

  let autoTrader = autoTraderResponse.autoTraderObject;
  let response = autoTrader.order.atMarket(   autoTraderResponse.data.exchange,
                                              autoTraderResponse.data.side,
                                              autoTraderResponse.data.symbol,
                                              autoTraderResponse.data.quantity,
                                              autoTraderResponse.data.price,
                                              autoTraderResponse.data.pnl);


  exchange = response.exchange;
  side = response.side;
  symbol = response.symbol;
  quantity = response.quantity;
  price = response.price;
  pnl = response.pnl;
  
  inputMsg.innerHTML = "<p>requesting price..."+"</p>";
  inputMsg.innerHTML += '<i class="fas demo-meta fa-8x fa-circle-notch  fa-spin"></i>'

  // tradeExecuteMsg.innerHTML += "<h2>EXAMPLE INPUT</h2>";
  // tradeExecuteMsg.innerHTML += "<ul>";
  // tradeExecuteMsg.innerHTML += "<li>exchange: "+exchange+"</li>";
  // tradeExecuteMsg.innerHTML += "<li>side: "+side+"</li>";
  // tradeExecuteMsg.innerHTML += "<li>symbol: "+symbol+"</li>";
  // tradeExecuteMsg.innerHTML += "<li>quantity: "+quantity+"</li>";
  // tradeExecuteMsg.innerHTML += "<li>price: "+price+"</li>";
  // tradeExecuteMsg.innerHTML += "<li>pnl: "+pnl+"</li>";
  // tradeExecuteMsg.innerHTML += "</ul>";

  let newPriceRequest = response.priceRequest;
  let onLoadFunction = newPriceRequest.onload;

  newPriceRequest.onload = () =>
  {
    let data = onLoadFunction(newPriceRequest.responseText);
    
    tradeExecuteMsg.innerHTML += `<pre>responseText: <code class="language-bash">${newPriceRequest.responseText}</code></pre>`;
    tradeExecuteMsg.innerHTML += "<br>";

    tradeExecuteMsg.innerHTML += `<pre>signedRequestUrl: <code class="language-bash">${data.signedRequestUrl}</code></pre>`;


    ordersMsg.innerHTML = `<div class="color-red txt-center">Settings>Confirm Trade: ${confirmTradeCheckbox.checked}<div>`;
    ordersMsg.innerHTML += '<hr class="my-4 transparent">';
    ordersMsg.innerHTML += "<h2>ORDERS</h2>";
    // ordersMsg.innerHTML += `<pre>responseText: <code class="language-bash">`;
    // ordersMsg.innerHTML += "<ul>";
    for (var i = 0; i < data.payload.length; i++)
    {
      if (!Object.keys(data.payload[i]))
      {
        ordersMsg.innerHTML +=  `<p class="my-0">Order N°${i}: - </p>`;
      } else {
        ordersMsg.innerHTML +=  `<p class="my-0">Order N°${i}: ${data.payload[i].side} (${data.payload[i].quantity}) ${data.payload[i].symbol} ${data.payload[i].price ? data.payload[i].price : data.pnl.tradePrice} ${data.payload[i].reduceOnly ? "[reduceOnly]" : ""}</p>`;
      }
    }
    // ordersMsg.innerHTML += "</ul>";
    // ordersMsg.innerHTML += `</code></pre>`;

    sideMsg.innerHTML = '<i class="demo-meta fa fa-2x fa-arrow-'+ (side == 'BUY' ? 'up color-green' : 'down color-red') +'"></i>';

    tradeMsg.innerHTML = "";
    tradeMsg.innerHTML += `
    <div class="row between-xs">
      <span class="col-xs demo-meta">action:</span>
      <span class="col-xs demo-meta">price</span>
      <span class="col-xs demo-meta">quantity</span>
      <span class="col-xs demo-meta">pnl</span>
      <span class="col-xs demo-meta">percent</span>
    </div>`;
    if (withPNLCheckbox.checked && parseFloat(data.pnl.profitPercent) != 0)
    {
      tradeMsg.innerHTML += `
      <div class="row between-xs">
        <span class="col-xs">
          <span>profit:</span>
        </span>
        <span class="col-xs">
          <span>${data.pnl.profitPrice}</span>
        </span>
        <span class="col-xs">${data.pnl.profitAmount}</span>
        <span class="col-xs">+$${((data.pnl.profitPercent * 50) / 100) * quantity}</span>
        <span class="col-xs">+$${parseInt(data.pnl.profitPercent * 50)}%</span>
      </div>`;
    } else {
      tradeMsg.innerHTML += `
      <div class="row between-xs">
        <span class="col-xs demo-meta">profit:</span>
        <span class="col-xs demo-meta">-</span>
        <span class="col-xs demo-meta">-</span>
        <span class="col-xs demo-meta">-</span>
        <span class="col-xs demo-meta">-</span>
      </div>`;
    }
        // <span class="col-xs">${data.pnl.profitPercent * 50}% * ${quantity}</span>

    if (makeTradeCheckbox.checked)
    {
      tradeMsg.innerHTML += `
      <div class="row between-xs">
        <span class="col-xs">
          <span>trade:</span>
        </span>
        <span class="col-xs">
          <span><b>${data.pnl.tradePrice}</b></span>
        </span>
        <span class="col-xs">-</span>
        <span class="col-xs">-</span>
        <span class="col-xs">-</span>
      </div>`;
    } else {
      tradeMsg.innerHTML += `
      <div class="row between-xs">
        <span class="col-xs demo-meta">trade:</span>
        <span class="col-xs demo-meta">-</span>
        <span class="col-xs demo-meta">-</span>
        <span class="col-xs demo-meta">-</span>
        <span class="col-xs demo-meta">-</span>
      </div>`;
    }

    if (withPNLCheckbox.checked && parseFloat(data.pnl.lossPercent) != 0)
    {
      tradeMsg.innerHTML += `
      <div class="row between-xs">
        <span class="col-xs">
          <span>loss:</span>
        </span>
        <span class="col-xs">
          <span>${data.pnl.lossPrice}</span>
        </span>
        <span class="col-xs">${data.pnl.lossAmount}</span>
        <span class="col-xs">-$${((data.pnl.lossPercent * 50) / 100) * quantity}</span>
        <span class="col-xs">+$${parseInt(data.pnl.lossPercent * 50)}%</span>
      </div>`;
    } else {
      tradeMsg.innerHTML += `
      <div class="row between-xs">
        <span class="col-xs demo-meta">loss:</span>
        <span class="col-xs demo-meta">-</span>
        <span class="col-xs demo-meta">-</span>
        <span class="col-xs demo-meta">-</span>
        <span class="col-xs demo-meta">-</span>
      </div>`;
    }

    // pnlMsg.innerHTML = "<h2>PNL ANALYSIS</h2>";
    // pnlMsg.innerHTML += "<ul>";
    // pnlMsg.innerHTML += "<li>hasProfit: "+data.pnl.hasProfit+"</li>";
    // pnlMsg.innerHTML += "<li>profitAmount: "+data.pnl.profitAmount+"</li>";
    // pnlMsg.innerHTML += "<li>makeTrade: "+data.pnl.makeTrade+"</li>";
    // pnlMsg.innerHTML += "<li>hasLoss: "+data.pnl.hasLoss+"</li>";
    // pnlMsg.innerHTML += "<li>lossAmount: "+data.pnl.lossAmount+"</li>";
    // pnlMsg.innerHTML += "</ul>";

    let TheRequest = autoTrader.getTheRequest("post", data.signedRequestUrl);
    inputMsg.innerHTML = "";
    inputMsg.innerHTML += '<hr class="my-4 transparent w-100">';
    TheRequest.onload = () => {
      inputMsg.innerHTML += '<p class="mt-0">Trade executed.</p>'
      inputMsg.innerHTML += '<i class="fas demo-meta fa-6x text-danger fa-check"></i>'
    };
    if (!confirmTradeCheckbox.checked)
    {
      confirmTradeCheckbox.checked = false;
      inputMsg.innerHTML += '<p class="mt-0">Trade not executed.</p>'
      inputMsg.innerHTML += '<i class="fas demo-meta fa-6x text-danger fa-times"></i>'
      // inputMsg.innerHTML += `<div class="demo-meta" >confirmTrade: ${confirmTradeCheckbox.checked}</div>`;
      tradeExecuteMsg.innerHTML = "";
    } else {
      confirmTradeCheckbox.checked = false;
      TheRequest.send();
    }
  };
  newPriceRequest.send();
};

// tradeExecuteBuy.addEventListener('click', tradeEvent);
// tradeExecuteSell.addEventListener('click', tradeEvent);

function getAutoTrader(myArgs)
{
  let exchange = myArgs[0];

  if (exchange != "futures" && exchange != "spot")
  {
    console.log("Invalid exchange"); return {success:false,msg:"Invalid exchange"}
    return;
  }

  let action = myArgs[1];

  if (
    (action != "buy" && action != "sell" && action != "leverage")
    ||
    (exchange == "spot" && action == "leverage")
    )
  {
    console.log("Invalid action");; return {success:false,msg:"Invalid action"}
    return;
  }

  let symbol = myArgs[2];

  if (!symbol)
  {
    console.log("Invalid symbol: ", symbol); return {success:false,msg:"Invalid symbol"}
    return;
  }

  symbol = symbol.toUpperCase();

  if (action == "leverage")
  {
    let leverage = myArgs[3];

    if (!isFinite(leverage))
    {
      console.log("Invalid leverage: ", leverage); return {success:false,msg:"Invalid leverage"}
      return;
    }

    let newTrade = new AutoTrader({},{});

    newTrade.settings.leverage(symbol, leverage);
    return;
  } 

  if (action == "buy" || action == "sell")
  {
    let side = action.toUpperCase();
    let quantity = myArgs[3];

    if (!isFinite(quantity))
    {
      console.log("Invalid quantity: ", quantity); return {success:false,msg:"Invalid quantity"}
      return;
    }

    let price = myArgs[4];

    if (!price || price[0] != "@")
    {
      console.log("Invalid price: ", price); return {success:false,msg:"Invalid price"}
      return;
    }

    price = price.substr(1);

    if (!((isFinite(price) || isFinite(price.substr(0,price.length - 2))) || ["market", "market*"].indexOf(price) != -1))
    {
      console.log("Invalid price: ", price); return {success:false,msg:"Invalid price"}
      return;
    }

    let pnlString = myArgs[5];
    let pnl = [];

    if (pnlString)
    {
      if (pnlString != "send")
      {
        pnl = pnlString.split(":");

        if (pnl.length > 1)
        {
          if (!isFinite(pnl[0]) || !isFinite(pnl[1]))
          {
            console.log("Invalid profit and loss: ", pnlString); return {success:false,msg:"Invalid profit and loss"}
            return;
          }
        } else {
          pnl = [];
        }
      }
    }


    let newTrade = new AutoTrader({
      "lastArgument": myArgs[myArgs.length - 1],
    },{});

    return {
      success: true,
      autoTraderObject: newTrade,
      data: {
        exchange: exchange,
        action: action,
        symbol: symbol,
        side: side,
        quantity: quantity,
        price: price,
        pnl: pnl,
      },
    }
  }
}
