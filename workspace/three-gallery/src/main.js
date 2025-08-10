import './style.css'
import { makeRouter } from './router.js'

const viewport = document.getElementById('viewport')
const router = makeRouter({ container: viewport })

function setActiveLink() {
  const hash = location.hash || '#/galaxy'
  const links = document.querySelectorAll('nav.nav a[data-route]')
  links.forEach((a) => {
    if (a.getAttribute('href') === hash) a.classList.add('active')
    else a.classList.remove('active')
  })
}

window.addEventListener('hashchange', () => {
  setActiveLink()
  router.navigate(location.hash)
})

// initial
if (!location.hash) {
  location.hash = '#/galaxy'
} else {
  router.navigate(location.hash)
}
setActiveLink()
