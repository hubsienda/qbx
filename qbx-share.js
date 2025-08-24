/*! QBX Share Bar — WhatsApp-first, ES5-only */
(function(window, document){
  function $(id){ return document.getElementById(id); }
  function make(el, cls, txt){ var b=document.createElement(el); if(cls) b.className=cls; if(txt) b.textContent=txt; return b; }

  // Inject minimal CSS once
  function ensureStyles(){
    if(document.getElementById('qbx-share-style')) return;
    var css = ".qbx-share{display:flex;gap:10px;flex-wrap:wrap;align-items:center}"+
      ".qbx-share .qbx-btn{cursor:pointer;border-radius:12px;border:1px solid #2b2b31;background:#111113;color:#f5f5f6;padding:10px 14px;font-weight:700}"+
      ".qbx-share .qbx-btn:hover{filter:brightness(1.06)}"+
      ".qbx-share .muted{font-size:13px;color:#b6b6ba;margin-left:auto}"+
      ".qbx-share .accent{background:var(--qbx-accent,#00cc00);border-color:var(--qbx-accent,#00cc00);color:#000}";
    var style = document.createElement('style'); style.id='qbx-share-style'; style.type='text/css';
    style.appendChild(document.createTextNode(css)); document.head.appendChild(style);
  }

  var state = {
    mountId: null,
    message: "Check this out from QBX Labs.",
    url: null,
    accent: "#00cc00",
    show: { copy:true, twitter:true, whatsapp:true, link:true }
  };

  function currentURL(){ return location.href; }
  function setStatus(msg){
    var s = document.querySelector('#'+state.mountId+' .muted');
    if(s) s.textContent = msg;
  }

  function build(){
    ensureStyles();
    var mount = $(state.mountId);
    if(!mount) return;
    var bar = make('div','qbx-share'); bar.style.setProperty('--qbx-accent', state.accent || '#00cc00');

    function addBtn(label, id, accent){
      var b = make('button','qbx-btn'+(accent?' accent':''), label);
      b.id = state.mountId+'-'+id;
      bar.appendChild(b); return b;
    }

    if(state.show.copy)     addBtn('📋 Copy','copy',false);
    if(state.show.twitter)  addBtn('🐦 Twitter','tw',false);
    if(state.show.whatsapp) addBtn('🟢 WhatsApp','wa',true);
    if(state.show.link)     addBtn('🔗 Share link','link',false);
    bar.appendChild(make('span','muted','Ready.'));
    mount.innerHTML=''; mount.appendChild(bar);

    // Prefer canonical <link>, fall back to location + hash
    function canonicalURL() {
      if (state.url) return state.url; // explicit override still wins
      var ln = document.querySelector('link[rel=canonical]');
      var base = (ln && ln.href) ? ln.href : location.href.split('#')[0];
      var hash = location.hash || '';
      return base + hash;
    }

    // Wire up
    var copyBtn = $(state.mountId+'-copy');
    if(copyBtn) copyBtn.onclick = function(){
      // 🔧 use canonical URL in the copied text
      var text = state.message + "\n" + canonicalURL();
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(text).then(function(){ setStatus('Copied to clipboard.'); })
          .catch(function(){ setStatus('Clipboard blocked — select and copy manually.'); });
      } else setStatus('Clipboard unsupported — select and copy manually.');
    };

    var twBtn = $(state.mountId+'-tw');
    if(twBtn) twBtn.onclick = function(){
      // 🔧 use canonical URL for Twitter
      var msg = state.message;
      var u = canonicalURL();
      var t = 'https://twitter.com/intent/tweet?text='+encodeURIComponent(msg)+'&url='+encodeURIComponent(u)+'&hashtags=QBXLabs';
      window.open(t,'_blank');
    };

    var waBtn = $(state.mountId+'-wa');
    if(waBtn) waBtn.onclick = function(){
      // 🔧 use canonical URL for WhatsApp
      var msg = state.message + '\n' + canonicalURL();
      var w = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(msg);
      window.open(w,'_blank');
    };

    var linkBtn = $(state.mountId+'-link');
    if(linkBtn) linkBtn.onclick = function(){
      // 🔧 copy canonical URL
      var u = canonicalURL();
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(u).then(function(){ setStatus('Share link copied.'); })
          .catch(function(){ setStatus('Clipboard blocked — copy from the address bar."); });
      } else setStatus('Copy from the address bar.');
    };
  }

  window.QBXShare = {
    /**
     * init({
     *   mountId: 'qbx-share-bar',
     *   getMessage: () => string,
     *   getURL: () => string,      // optional; defaults to canonical <link> + hash
     *   accent: '#00cc00',         // button colour
     *   show: { copy, twitter, whatsapp, link } // booleans
     * })
     */
    init: function(opts){
      opts = opts || {};
      state.mountId = opts.mountId || 'qbx-share-bar';
      state.message = (opts.getMessage && opts.getMessage()) || state.message;
      state.url = (opts.getURL && opts.getURL()) || null;
      state.accent = opts.accent || '#00cc00';
      if(opts.show){
        for(var k in state.show){
          if(state.show.hasOwnProperty(k) && typeof opts.show[k] === 'boolean') state.show[k]=opts.show[k];
        }
      }
      build();
    },
    // Update after content changes (e.g., after generating a new apocalypse)
    update: function(message, url){
      if(typeof message === 'string') state.message = message;
      if(typeof url === 'string') state.url = url;
      setStatus('Ready to share.');
    }
  };
})(window, document);
