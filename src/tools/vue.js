const VueGentX = {};

VueGentX.install = function(Vue, options={}) {
  let {
    $subs= '$subs',
    $unsubscribe= '$unsubscribe'
  } = options;

  Vue.prototype[$unsubscribe] = function(ns) {
    const vm = this;
    const subs = vm[$subs];

    try {
      // unsubscribe one
      if (ns) {
        let sub = subs[ns]; 
        if (sub && typeof sub.unsubscribe === 'function') {
          sub.unsubscribe();
        }
        delete subs[ns];
        return;
      }

      // unsubscribe all
      Object.keys(subs).forEach(key => {
        let sub = subs[key];
        if (sub && typeof sub.unsubscribe === 'function') {
          sub.unsubscribe();
        }
        delete subs[key];
      });
    } catch(e) {
      console.log(e);
    }
  }

  // mixin
  Vue.mixin({
    beforeCreate() {
      this[$subs] = {};
    },
    beforeDestroy() {
      this[$unsubscribe]();
    }
  });
}

export {VueGentX};
