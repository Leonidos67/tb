(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([[7220], {
    22346: (e, r, t) => {
        "use strict";
        t.d(r, {
            Separator: () => o
        });
        var a = t(95155)
          , s = t(12115)
          , i = t(87489)
          , l = t(59434);
        let o = s.forwardRef( (e, r) => {
            let {className: t, orientation: s="horizontal", decorative: o=!0, ...n} = e;
            return (0,
            a.jsx)(i.b, {
                ref: r,
                decorative: o,
                orientation: s,
                className: (0,
                l.cn)("shrink-0 bg-muted", "horizontal" === s ? "h-[1px] w-full" : "h-full w-[1px]", t),
                ...n
            })
        }
        );
        o.displayName = i.b.displayName
    }
    ,
    51869: (e, r, t) => {
        Promise.resolve().then(t.t.bind(t, 6874, 23)),
        Promise.resolve().then(t.t.bind(t, 33063, 23)),
        Promise.resolve().then(t.t.bind(t, 69243, 23)),
        Promise.resolve().then(t.bind(t, 62461)),
        Promise.resolve().then(t.bind(t, 61008)),
        Promise.resolve().then(t.bind(t, 61432)),
        Promise.resolve().then(t.bind(t, 81487)),
        Promise.resolve().then(t.bind(t, 49003)),
        Promise.resolve().then(t.bind(t, 45531)),
        Promise.resolve().then(t.bind(t, 91394)),
        Promise.resolve().then(t.bind(t, 22346))
    }
    ,
    62461: (e, r, t) => {
        "use strict";
        t.d(r, {
            WebsitePreview: () => s
        });
        var a = t(95155);
        let s = () => (0,
        a.jsx)("div", {
            className: "relative w-full max-w-[1280px] mx-auto px-4",
            children: (0,
            a.jsxs)("div", {
                className: "relative w-full aspect-[3/2] lg:aspect-[21/9] md:aspect-[3/2] max-[640px]:aspect-[9/16]",
                children: [(0,
                a.jsx)("div", {
                    className: "absolute inset-0 overflow-hidden rounded-t-xl border-2 border-neutral-700 border-b-0",
                    children: (0,
                    a.jsx)("iframe", {
                        src: "/",
                        title: "Playtester Platform Live Preview",
                        scrolling: "no",
                        loading: "lazy",
                        className: "absolute top-0 left-1/2 w-full h-full pointer-events-none",
                        style: {
                            transform: "translateX(-50%) scale(0.8)",
                            transformOrigin: "top center",
                            width: "125%",
                            height: "125%",
                            overflow: "hidden",
                            border: "none"
                        }
                    })
                }), (0,
                a.jsx)("div", {
                    className: "absolute bottom-0 w-[calc(100%+12rem)] max-w-[98vw] left-1/2 -translate-x-1/2 h-[2px]",
                    style: {
                        background: "linear-gradient(to right, transparent 0%, rgb(64, 64, 64) 5%, rgb(64, 64, 64) 95%, transparent 100%)"
                    }
                })]
            })
        })
    }
    ,
    87489: (e, r, t) => {
        "use strict";
        t.d(r, {
            b: () => d
        });
        var a = t(12115)
          , s = t(63540)
          , i = t(95155)
          , l = "horizontal"
          , o = ["horizontal", "vertical"]
          , n = a.forwardRef( (e, r) => {
            var t;
            let {decorative: a, orientation: n=l, ...d} = e
              , v = (t = n,
            o.includes(t)) ? n : l;
            return (0,
            i.jsx)(s.sG.div, {
                "data-orientation": v,
                ...a ? {
                    role: "none"
                } : {
                    "aria-orientation": "vertical" === v ? v : void 0,
                    role: "separator"
                },
                ...d,
                ref: r
            })
        }
        );
        n.displayName = "Separator";
        var d = n
    }
}, e => {
    var r = r => e(e.s = r);
    e.O(0, [4277, 6874, 4039, 8543, 3063, 3951, 875, 8441, 1684, 7358], () => r(51869)),
    _N_E = e.O()
}
]);
