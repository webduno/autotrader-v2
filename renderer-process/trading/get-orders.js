const fs = require('fs')
const os = require('os')
const path = require('path')

const SYMBOL_list = require('./symbols.js');
const symbolList = SYMBOL_list.symbolList();

const AutoTrader = require('./at.js');
const crypto = require('crypto');
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

// ************** IMPORTS END ************** 
class getOrdersController {
  constructor($container, options = null, data = null)
  {
    this.$container = document.getElementById($container);

    this.options = Object.assign({
    }, options);

    this.data = Object.assign({
    }, data);

    this.$table = document.getElementById("order-list");

    let self = this;

    this.autoTrader = new AutoTrader({
      "lastArgument": "?",
    },{});

    this.requests =
    {
    };
    this.updaters =
    {
    };
    this.watchers =
    {
    };
    this.clickers =
    {
      cancelAll(event = null)
      {

        let signedRequestUrl = self.autoTrader.order.cancelAllOrders("futures").signedRequestUrl;
        self.$table.innerHTML = '<span class="col-xs-12 txt-center"><i class="fas transparentful demo-meta fa-8x fa-circle-notch  fa-spin"></i></span>';

        let TheRequest = self.autoTrader.getTheRequest("delete", signedRequestUrl);

        TheRequest.onload = () => {
          let responseArray = JSON.parse(TheRequest.responseText);

          self.$table.innerHTML = "";

          self.autoTrader = new AutoTrader({"lastArgument": "?",},{});
        };
        
        TheRequest.send();
      },
      testEvent(event = null)
      {
        alert();
      },
      refreshList(event = null)
      {
        let signedRequestUrl = self.autoTrader.query.orders("futures").signedRequestUrl;
        self.$table.innerHTML = '<span class="col-xs-12 txt-center"><i class="fas transparentful demo-meta fa-8x fa-circle-notch  fa-spin"></i></span>';

        let TheRequest = self.autoTrader.getTheRequest("get", signedRequestUrl);

        TheRequest.onload = () => {
          let responseArray = JSON.parse(TheRequest.responseText);

          self.$table.innerHTML = "";
          for (var i = 0; i < responseArray.length; i++)
          {
            self.$table.innerHTML += "<div class='col-xs-12 row'>";
            self.$table.innerHTML += "<span class='col-xs'>"+responseArray[i].type+"</span>";
            self.$table.innerHTML += "<span class='col-xs'>"+responseArray[i].symbol+"</span>";
            self.$table.innerHTML += "<span class='col-xs'>"+responseArray[i].side+"</span>";
            self.$table.innerHTML += "<span class='col-xs'>"+responseArray[i].price+"</span>";
            self.$table.innerHTML += "<span class='col-xs'>"+responseArray[i].stopPrice+"</span>";
            self.$table.innerHTML += "<span class='col-xs'>"+responseArray[i].reduceOnly+"</span>";
            self.$table.innerHTML += "</div>";

            let deleteButton = document.createElement("button");
            deleteButton.dataset.id = responseArray[i].orderId;
            // deleteButton.dataset.id = Object.keys(responseArray[i]);
            deleteButton.innerHTML = "x";
            deleteButton.addEventListener("click", (e) => {
              let cancelTradeRequest = self.autoTrader.requests.getCancelTradeRequest(deleteButton.dataset.id)
              let localOnloadReponse = cancelTradeRequest.cancelRequestRequest.onload;

              self.$table.innerHTML += "<span class='col-xs-12'>"+(cancelTradeRequest.cancelRequestUrl)+"</span>";

              let response = () => {
                self.$table.innerHTML += "<span class='col-xs-12'>"+(cancelTradeRequest.cancelRequestRequest.responseText)+"</span>";
                deleteButton.innerHTML = cancelTradeRequest.cancelRequestRequest.status;
              };

              cancelTradeRequest.cancelRequestRequest.onload = response;

              cancelTradeRequest.cancelRequestRequest.send();
            })
            self.$table.appendChild(deleteButton)
          }

          self.autoTrader = new AutoTrader({"lastArgument": "?",},{});
        };
        
        TheRequest.send();

      }
    };

    this.initListeners();
    // this.clickers.refreshList();
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
}


let $makeTrade = new getOrdersController('get-orders-section', {}, {
});