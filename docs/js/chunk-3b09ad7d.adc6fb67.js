(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-3b09ad7d"],{"057f":function(e,t,r){var n=r("c6b6"),a=r("fc6a"),o=r("241c").f,f=r("4dae"),c="object"==typeof window&&window&&Object.getOwnPropertyNames?Object.getOwnPropertyNames(window):[],i=function(e){try{return o(e)}catch(t){return f(c)}};e.exports.f=function(e){return c&&"Window"==n(e)?i(e):o(a(e))}},"4dae":function(e,t,r){var n=r("da84"),a=r("23cb"),o=r("07fa"),f=r("8418"),c=n.Array,i=Math.max;e.exports=function(e,t,r){for(var n=o(e),u=a(t,n),s=a(void 0===r?n:r,n),d=c(i(s-u,0)),p=0;u<s;u++,p++)f(d,p,e[u]);return d.length=p,d}},"4fad":function(e,t,r){var n=r("d039"),a=r("861d"),o=r("c6b6"),f=r("d86b"),c=Object.isExtensible,i=n((function(){c(1)}));e.exports=i||f?function(e){return!!a(e)&&((!f||"ArrayBuffer"!=o(e))&&(!c||c(e)))}:c},8418:function(e,t,r){"use strict";var n=r("a04b"),a=r("9bf2"),o=r("5c6c");e.exports=function(e,t,r){var f=n(t);f in e?a.f(e,f,o(0,r)):e[f]=r}},bb2f:function(e,t,r){var n=r("d039");e.exports=!n((function(){return Object.isExtensible(Object.preventExtensions({}))}))},cb3c:function(e,t,r){"use strict";r.r(t);var n=function(){var e=this,t=e.$createElement,r=e._self._c||t;return r("div",[r("h1",[e._v("ParentView")]),r("div",[r("h2",[e._v("Criar uma oferta")]),r("button",{on:{click:function(t){return e.createOffer()}}},[e._v("criar oferta")]),r("textarea",{directives:[{name:"model",rawName:"v-model",value:e.offer,expression:"offer"}],attrs:{readonly:"",disabled:!e.offer},domProps:{value:e.offer},on:{input:function(t){t.target.composing||(e.offer=t.target.value)}}})]),r("div",[r("h2",[e._v("Ler uma resposta")]),r("textarea",{directives:[{name:"model",rawName:"v-model",value:e.answer,expression:"answer"}],domProps:{value:e.answer},on:{input:function(t){t.target.composing||(e.answer=t.target.value)}}}),r("button",{on:{click:function(t){return e.readAnswer()}}},[e._v("ler resposta")])]),r("button",{on:{click:function(t){return e.sendText()}}},[e._v("Send text")])])},a=[],o=r("1da1"),f=(r("96cf"),r("dca8"),r("e9c4"),r("1127")),c={name:"ParentView",data:function(){return{offer:"",answer:"",peerParentListFreeze:[null]}},computed:{peerParent:function(){return this.peerParentListFreeze[0]}},mounted:function(){this.peerParentListFreeze=Object.freeze([new f["a"]]),console.debug(this.peerParent)},beforeDestroy:function(){},methods:{createOffer:function(){var e=this;return Object(o["a"])(regeneratorRuntime.mark((function t(){var r;return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:return t.prev=0,t.next=3,e.peerParent.getOffer();case 3:r=t.sent,t.next=10;break;case 6:return t.prev=6,t.t0=t["catch"](0),console.error(t.t0.message),t.abrupt("return");case 10:console.debug(r),e.offer=JSON.stringify(r);case 12:case"end":return t.stop()}}),t,null,[[0,6]])})))()},readAnswer:function(){var e=JSON.parse(this.answer);this.peerParent.step_4_accept_answer(e)},sendText:function(){this.peerParent.send_text("texto")}}},i=c,u=r("2877"),s=Object(u["a"])(i,n,a,!1,null,null,null);t["default"]=s.exports},d86b:function(e,t,r){var n=r("d039");e.exports=n((function(){if("function"==typeof ArrayBuffer){var e=new ArrayBuffer(8);Object.isExtensible(e)&&Object.defineProperty(e,"a",{value:8})}}))},dca8:function(e,t,r){var n=r("23e7"),a=r("bb2f"),o=r("d039"),f=r("861d"),c=r("f183").onFreeze,i=Object.freeze,u=o((function(){i(1)}));n({target:"Object",stat:!0,forced:u,sham:!a},{freeze:function(e){return i&&f(e)?i(c(e)):e}})},f183:function(e,t,r){var n=r("23e7"),a=r("e330"),o=r("d012"),f=r("861d"),c=r("1a2d"),i=r("9bf2").f,u=r("241c"),s=r("057f"),d=r("4fad"),p=r("90e3"),b=r("bb2f"),l=!1,v=p("meta"),w=0,m=function(e){i(e,v,{value:{objectID:"O"+w++,weakData:{}}})},x=function(e,t){if(!f(e))return"symbol"==typeof e?e:("string"==typeof e?"S":"P")+e;if(!c(e,v)){if(!d(e))return"F";if(!t)return"E";m(e)}return e[v].objectID},g=function(e,t){if(!c(e,v)){if(!d(e))return!0;if(!t)return!1;m(e)}return e[v].weakData},h=function(e){return b&&l&&d(e)&&!c(e,v)&&m(e),e},O=function(){y.enable=function(){},l=!0;var e=u.f,t=a([].splice),r={};r[v]=1,e(r).length&&(u.f=function(r){for(var n=e(r),a=0,o=n.length;a<o;a++)if(n[a]===v){t(n,a,1);break}return n},n({target:"Object",stat:!0,forced:!0},{getOwnPropertyNames:s.f}))},y=e.exports={enable:O,fastKey:x,getWeakData:g,onFreeze:h};o[v]=!0}}]);
//# sourceMappingURL=chunk-3b09ad7d.adc6fb67.js.map