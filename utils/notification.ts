/**
 * Funciones de utilidad para notificaciones
 */
import { notify } from "@kyvg/vue3-notification";

/**
 * Muestra una notificación de alerta
 * @param text Texto de la notificación
 * @param type Tipo de notificación (success, info, warn, error)
 * @param duration Duración en milisegundos
 * @param group Grupo de notificaciones
 */
export const alert = (text: string, type = "success", duration = 3000, group = "app") => 
  notify({ text, type, duration, group });

/**
 * Muestra una notificación de información
 * @param text Texto de la notificación
 * @param duration Duración en milisegundos
 * @param group Grupo de notificaciones
 */
export const info = (text: string, duration = 3000, group = "app") => 
  notify({ text, type: "info", duration, group });

/**
 * Muestra una notificación de advertencia
 * @param text Texto de la notificación
 * @param duration Duración en milisegundos
 * @param group Grupo de notificaciones
 */
export const warning = (text: string, duration = 3000, group = "app") => 
  notify({ text, type: "warn", duration, group });
