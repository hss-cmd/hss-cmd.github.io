/* 云端小窝 · 入口 */
(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded', function () {
    if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    }
    UI.init();
  });
})();
