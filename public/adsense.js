/**
 * FCM Deck — AdSense placements
 *
 * Create two display ad units in AdSense (Ads → By ad unit), then paste each
 * data-ad-slot value into LOCAL_SLOTS below—or assign window.FCM_DECK_AD_SLOTS
 * before this script loads. Leave blank to hide that placement (no empty boxes).
 */
(function () {
  var CLIENT = 'ca-pub-8434552394574237';
  var LOCAL_SLOTS = {
    sidebar: '',
    footer: '',
  };
  var SLOTS = Object.assign(
    {},
    LOCAL_SLOTS,
    typeof window.FCM_DECK_AD_SLOTS === 'object' && window.FCM_DECK_AD_SLOTS !== null
      ? window.FCM_DECK_AD_SLOTS
      : {}
  );

  function hideIfNoSlot(key) {
    var wrap = document.querySelector('[data-ad-wrap="' + key + '"]');
    if (!wrap) return;
    if (!SLOTS[key]) wrap.style.display = 'none';
  }

  function sidebarVisible() {
    return !!(SLOTS.sidebar && window.matchMedia('(min-width: 961px)').matches);
  }

  function updateSidebarDisplay() {
    var wrap = document.querySelector('[data-ad-wrap="sidebar"]');
    if (!wrap || !SLOTS.sidebar) return;
    wrap.style.display = sidebarVisible() ? '' : 'none';
  }

  function pushIntoMount(mount, slot) {
    if (!mount || !slot || mount.querySelector('ins.adsbygoogle')) return;
    var ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.setAttribute('data-ad-client', CLIENT);
    ins.setAttribute('data-ad-slot', slot);
    ins.setAttribute('data-ad-format', 'auto');
    ins.setAttribute('data-full-width-responsive', 'true');
    mount.appendChild(ins);
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.warn('AdSense', e);
    }
  }

  function hydrate() {
    hideIfNoSlot('sidebar');
    hideIfNoSlot('footer');
    updateSidebarDisplay();

    if (sidebarVisible()) {
      pushIntoMount(
        document.querySelector('[data-ad-wrap="sidebar"] [data-ad-mount]'),
        SLOTS.sidebar
      );
    }
    pushIntoMount(
      document.querySelector('[data-ad-wrap="footer"] [data-ad-mount]'),
      SLOTS.footer
    );
  }

  hideIfNoSlot('sidebar');
  hideIfNoSlot('footer');
  updateSidebarDisplay();

  window.addEventListener('load', hydrate);
  window.matchMedia('(min-width: 961px)').addEventListener('change', function () {
    updateSidebarDisplay();
    if (sidebarVisible()) {
      pushIntoMount(
        document.querySelector('[data-ad-wrap="sidebar"] [data-ad-mount]'),
        SLOTS.sidebar
      );
    }
  });
})();
