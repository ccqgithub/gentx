export function gentx(opts={}) {
  let {
    $bindSub= '$bindSub',
    $unsubscribe= '$unsubscribe'
  } = opts;

  return function gentxDecorator(target) {
    target.prototype['_gentx_subs_'] = {};

    // bind sub
    target.prototype[$bindSub] = function(sub, name='anonymous', removePrevious=true) {
      const subs = vm['_gentx_subs_'];
      if (!subs[name]) subs[name] = [];
  
      // remove previous
      if (name != 'anonymous' && removePrevious) 
        this[$unsubscribe](name);  
      
      // bind sub
      subs[name].push(sub);
    }

    // unsubscribe
    target.prototype[$unsubscribe] = function(ns) {
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

    // componentWillUnMount
    target.prototype._gentx_componentWillUnMount_ = target.prototype.componentWillUnMount;
    target.prototype.componentWillUnMount = function() {
      this[$unsubscribe]();
      this._gentx_componentWillUnMount_();
    }
  }
}
