const VueGentX = {};

VueGentX.install = function(Vue, options={}) {
  let {
    $bindSub= '$bindSub',
    $unsubscribe= '$unsubscribe'
  } = options;

  // bind sub
  Vue.prototype[$bindSub] = function(sub, name='anonymous', removePrevious=true) {
    const subs = vm['_gentx_subs_'];

    // remove previous
    if (name != 'anonymous' && removePrevious) 
      this[$unsubscribe](name);  
    
    // bind sub
    if (!subs[name]) subs[name] = [];
    subs[name].push(sub);
  }

  // unsubscribe
  Vue.prototype[$unsubscribe] = function(ns) {
    const vm = this;
    const subs = vm['_gentx_subs_'];

    try {
      // unsubscribe one
      if (ns && subs[ns] && subs[ns].length) {
        subs[ns].forEach(sub => {
          if (sub && typeof sub.unsubscribe === 'function') {
            sub.unsubscribe();
          }
        });
        delete subs[ns];
        return;
      }

      // unsubscribe all
      Object.keys(subs).forEach(ns => {
        if (subs[ns] && subs[ns].length) {
          subs[ns].forEach(sub => {
            if (sub && typeof sub.unsubscribe === 'function') {
              sub.unsubscribe();
            }
          });
          delete subs[ns];
          return;
        }
      });
    } catch(e) {
      console.log(e);
    }
  }

  // mixin
  Vue.mixin({
    beforeCreate() {
      this._gentx_subs_ = {};
    },
    beforeDestroy() {
      this[$unsubscribe]();
    }
  });
}

export { VueGentX };
