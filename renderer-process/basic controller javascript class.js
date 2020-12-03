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
      refreshList(event = null)
      {
        alert();
      }
    };

    this.initListeners();
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