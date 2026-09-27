const CACHE = 'shopflow-mvc-v3';
const ASSETS = [
  './', './index.html', './manifest.json', './css/styles.css',
  './js/app.js', './js/controllers/AppController.js',
  './js/models/AppModel.js', './js/models/CartModel.js', './js/models/OrderModel.js',
  './js/repositories/LocalStorageRepository.js', './js/repositories/AudioRepository.js',
  './js/services/CartService.js', './js/services/CheckoutService.js', './js/services/AudioService.js',
  './js/strategies/PaymentStrategy.js', './js/views/HomeView.js', './js/views/CartView.js',
  './js/views/CheckoutView.js', './js/views/OrdersView.js', './js/views/RecordingsView.js',
  './js/views/SettingsView.js', './js/views/ModalView.js', './js/utils/EventBus.js', './js/utils/helpers.js'
];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', event => event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request))));
