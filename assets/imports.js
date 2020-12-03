const {BrowserWindow} = require('electron').remote
const path = require('path')

var externalLinks = document.getElementsByClassName("open-externalLink");
for (var i = 0; i < externalLinks.length; i++) {
	externalLinks[i].addEventListener('click', (event) =>
   {
     let settings = { width: 480, height: 768 };
      if (!!event.currentTarget.dataset.width) { settings.width = parseInt(event.currentTarget.dataset.width) }
      if (!!event.currentTarget.dataset.height) { settings.height = parseInt(event.currentTarget.dataset.height) }
      let win = new BrowserWindow(settings);
      win.on('close', () => { win = null })
      // const modalPath = path.join('file://', __dirname, '../../sections/windows/modal.html')
      // win.loadURL(modalPath)
      win.loadURL(event.currentTarget.dataset.href)
      win.show()
   });
}

const links = document.querySelectorAll('link[rel="import"]')

// Import and add each page to the DOM
Array.prototype.forEach.call(links, (link) => {
  let template = link.import.querySelector('.task-template')
  let clone = document.importNode(template.content, true)
  if (link.href.match('about.html')) {
    document.querySelector('body').appendChild(clone)
  } else {
    document.querySelector('.content').appendChild(clone)
  }
})


