export function gentx(opts={}) {
  let {
    $subs= '$subs',
    $unsubscribe= '$unsubscribe'
  } = opts;

  return function gentxDecorator(target) {
    target.prototype[$subs] = {};
    target.prototype[$unsubscribe] = function(ns) {
      const subscriptionsKey = this[$subs];
      const comp = this;
      const subs = comp[subscriptionsKey];

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
    };

    // componentWillUnMount
    target.prototype._gentx_componentWillUnMount = target.prototype.componentWillUnMount;
    target.prototype.componentWillUnMount = function() {
      this[$unsubscribe]();
      this._gentx_componentWillUnMount();
    }
  }
}
