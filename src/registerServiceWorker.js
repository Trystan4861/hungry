/* eslint-disable no-console */

import { register } from 'register-service-worker'
import Swal from 'sweetalert2'
import { Notifications } from '@kyvg/vue3-notification'

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
      console.log('New update has been found')
    },
    updated () {
      console.log('New content is available; please refresh.')
      Swal.fire({
        title: 'Actualización disponible',
        html: 'Existe una nueva versión de la aplicación.<br /><br />¿Desea actualizarla?',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'No'
        }).then((result) => {
          if (result.value) {
            if(window.navigator && navigator.serviceWorker) {
              navigator.serviceWorker.getRegistrations()
              .then(function(registrations) {
                for(let registration of registrations) {
                  registration.unregister();
                }
              });
            }
            window.location.reload(true)
          }
        })
    },
    offline () {
      Notifications.notify({
        title: 'Sin conexión',
        text: 'No se encuentra conectado a Internet.',
        type: 'error'
      })
      console.log('Service Worker: offline')
    },
    error (error) {
      console.error('Error during service worker registration:', error)
    }
  })
}
