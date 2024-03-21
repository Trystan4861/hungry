/* eslint-disable no-console */

import { register } from 'register-service-worker'
import Swal from 'sweetalert2'

if (process.env.NODE_ENV === 'production') {
  register(`${process.env.BASE_URL}service-worker.js`, {
    ready () {
      console.log(
        'App is being served from cache by a service worker.\n' +
        'For more details, visit https://goo.gl/AFskqB'
      )
    },
    registered () {
      console.log('Service worker has been registered.')
    },
    cached () {
      console.log('Content has been cached for offline use.')
    },
    updatefound () {
      Swal.fire({
        title: 'Actualización disponible',
        html: 'Existe una nueva versión de la aplicación.<br /><br />¿Desea actualizarla?',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'No'
        }).then((result) => {
          if (result.value) {
            window.location.reload()
          }
        })
    },
    updated () {
      console.log('New content is available; please refresh.')
    },
    offline () {
      console.log('No internet connection found. App is running in offline mode.')
    },
    error (error) {
      console.error('Error during service worker registration:', error)
    }
  })
}
