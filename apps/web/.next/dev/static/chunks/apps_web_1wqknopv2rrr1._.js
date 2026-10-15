(()=>{"use strict";(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/apps/web/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/motion/dist/es/react.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$chat$2d$panel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/components/chat-panel.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$city$2d$map$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/components/city-map.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$deal$2d$panel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/components/deal-panel.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$onboarding$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/components/onboarding.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$use$2d$game$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/use-game.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature(), _s4 = __turbopack_context__.k.signature(), _s5 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
const CARD_COPY = {
    infiltrate: {
        name: "Infiltrate",
        symbol: "IN",
        copy: "Add 2 stake to one district."
    },
    fortify: {
        name: "Fortify",
        symbol: "FT",
        copy: "Add 1 stake and shield 1 this round."
    },
    sabotage: {
        name: "Sabotage",
        symbol: "SB",
        copy: "Remove up to 2 stake from a rival."
    },
    "shake-down": {
        name: "Shake Down",
        symbol: "SD",
        copy: "Collect 2 Influence."
    },
    surveillance: {
        name: "Surveillance",
        symbol: "SV",
        copy: "Gain private intelligence on a rival."
    },
    "double-cross": {
        name: "Double Cross",
        symbol: "DX",
        copy: "Break a deal for a district advantage."
    }
};
const OBJECTIVE_NAMES = {
    "city-crown": "City Crown",
    kingmaker: "Kingmaker",
    "deep-roots": "Deep Roots",
    untouchable: "Untouchable",
    mastermind: "Mastermind",
    "shadow-broker": "Shadow Broker",
    "district-boss": "District Boss",
    "cash-reserve": "Cash Reserve",
    "citywide-network": "Citywide Network",
    "wrecking-crew": "Wrecking Crew",
    "honorable-word": "Honorable Word",
    "reliable-operator": "Reliable Operator",
    strongholds: "Strongholds",
    "knife-in-the-dark": "Knife in the Dark"
};
function useCountdown(state) {
    _s();
    const [now, setNow] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(Date.now());
    const serverOffset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useCountdown.useEffect": ()=>{
            const interval = setInterval({
                "useCountdown.useEffect.interval": ()=>setNow(Date.now())
            }["useCountdown.useEffect.interval"], 250);
            return ({
                "useCountdown.useEffect": ()=>clearInterval(interval)
            })["useCountdown.useEffect"];
        }
    }["useCountdown.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useCountdown.useEffect": ()=>{
            if (state) serverOffset.current = state.room.serverNow - Date.now();
        }
    }["useCountdown.useEffect"], [
        state?.room.serverNow
    ]);
    if (!state?.room.deadlineAt) return null;
    return Math.max(0, state.room.deadlineAt - (now + serverOffset.current));
}
_s(useCountdown, "x0Tqob6bjAXroR4n/9s+Ed1VN40=");
function Home() {
    _s1();
    const game = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$use$2d$game$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGame"])();
    const countdown = useCountdown(game.publicState);
    const [nickname, setNickname] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [roomCode, setRoomCode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [mode, setMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("create");
    const [mobileView, setMobileView] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("action");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Home.useEffect": ()=>{
            const code = new URLSearchParams(window.location.search).get("room");
            if (code) {
                setRoomCode(code.toUpperCase());
                setMode("join");
            }
        }
    }["Home.useEffect"], []);
    if (!game.publicState) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "entry-page",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$onboarding$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Onboarding"], {}, void 0, false, {
                fileName: "[project]/apps/web/app/page.tsx",
                lineNumber: 55,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "entry-ambient",
                "aria-hidden": "true",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {}, void 0, false, {
                        fileName: "[project]/apps/web/app/page.tsx",
                        lineNumber: 56,
                        columnNumber: 55
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {}, void 0, false, {
                        fileName: "[project]/apps/web/app/page.tsx",
                        lineNumber: 56,
                        columnNumber: 60
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {}, void 0, false, {
                        fileName: "[project]/apps/web/app/page.tsx",
                        lineNumber: 56,
                        columnNumber: 65
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/app/page.tsx",
                lineNumber: 56,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "brand-block",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "brand-seal",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: "E·S"
                        }, void 0, false, {
                            fileName: "[project]/apps/web/app/page.tsx",
                            lineNumber: 58,
                            columnNumber: 35
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/app/page.tsx",
                        lineNumber: 58,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "eyebrow",
                        children: "A five-round struggle for the city"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/app/page.tsx",
                        lineNumber: 59,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Empire of Sin"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/app/page.tsx",
                                lineNumber: 60,
                                columnNumber: 11
                            }, this),
                            "Quick Takeover"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/app/page.tsx",
                        lineNumber: 60,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "entry-copy",
                        children: "Draft in secret. Make dangerous promises. Own the night before it owns you."
                    }, void 0, false, {
                        fileName: "[project]/apps/web/app/page.tsx",
                        lineNumber: 61,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "feature-line",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "2–8 players"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/app/page.tsx",
                                lineNumber: 62,
                                columnNumber: 37
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {}, void 0, false, {
                                fileName: "[project]/apps/web/app/page.tsx",
                                lineNumber: 62,
                                columnNumber: 61
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "5–8 minutes"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/app/page.tsx",
                                lineNumber: 62,
                                columnNumber: 66
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {}, void 0, false, {
                                fileName: "[project]/apps/web/app/page.tsx",
                                lineNumber: 62,
                                columnNumber: 90
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "No account"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/app/page.tsx",
                                lineNumber: 62,
                                columnNumber: 95
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/app/page.tsx",
                        lineNumber: 62,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/app/page.tsx",
                lineNumber: 57,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "entry-card",
                "aria-label": "Enter a game room",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "entry-tabs",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: mode === "create" ? "active" : "",
                                onClick: ()=>setMode("create"),
                                children: "Create a room"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/app/page.tsx",
                                lineNumber: 65,
                                columnNumber: 35
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: mode === "join" ? "active" : "",
                                onClick: ()=>setMode("join"),
                                children: "Join by code"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/app/page.tsx",
                                lineNumber: 65,
                                columnNumber: 145
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/app/page.tsx",
                        lineNumber: 65,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                        onSubmit: async (event)=>{
                            event.preventDefault();
                            if (mode === "create") await game.createRoom(nickname);
                            else await game.joinRoom(roomCode, nickname);
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                children: [
                                    "Your syndicate name",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        autoFocus: true,
                                        minLength: 2,
                                        maxLength: 20,
                                        value: nickname,
                                        onChange: (event)=>setNickname(event.target.value),
                                        placeholder: "The Velvet Knives"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/app/page.tsx",
                                        lineNumber: 67,
                                        columnNumber: 35
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/app/page.tsx",
                                lineNumber: 67,
                                columnNumber: 9
                            }, this),
                            mode === "join" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                children: [
                                    "Room code",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        className: "code-input",
                                        minLength: 6,
                                        maxLength: 6,
                                        value: roomCode,
                                        onChange: (event)=>setRoomCode(event.target.value.toUpperCase().replace(/[^A-Z2-9]/g, "")),
                                        placeholder: "N0IR88"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/app/page.tsx",
                                        lineNumber: 68,
                                        columnNumber: 45
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/app/page.tsx",
                                lineNumber: 68,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "gold-button wide",
                                disabled: game.busy || !game.connected || nickname.trim().length < 2 || mode === "join" && roomCode.length !== 6,
                                children: !game.connected ? "Connecting…" : game.busy ? "Opening the door…" : mode === "create" ? "Claim a table" : "Enter the room"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/app/page.tsx",
                                lineNumber: 69,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/app/page.tsx",
                        lineNumber: 66,
                        columnNumber: 7
                    }, this),
                    game.error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "error-banner",
                        role: "alert",
                        children: game.error
                    }, void 0, false, {
                        fileName: "[project]/apps/web/app/page.tsx",
                        lineNumber: 71,
                        columnNumber: 22
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "entry-footnote",
                        children: "Private room · Shareable code · Nothing to install"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/app/page.tsx",
                        lineNumber: 72,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/app/page.tsx",
                lineNumber: 64,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/app/page.tsx",
        lineNumber: 54,
        columnNumber: 33
    }, this);
    if (!game.publicState.game) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Lobby, {
        state: game.publicState,
        playerId: game.session?.playerId ?? "",
        busy: game.busy,
        error: game.error,
        onStart: game.startMatch,
        onLeave: game.leaveRoom
    }, void 0, false, {
        fileName: "[project]/apps/web/app/page.tsx",
        lineNumber: 76,
        columnNumber: 38
    }, this);
    const publicGame = game.publicState.game;
    const me = publicGame.players.find((player)=>player.id === game.session?.playerId);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "game-page",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$onboarding$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Onboarding"], {}, void 0, false, {
                fileName: "[project]/apps/web/app/page.tsx",
                lineNumber: 82,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "game-header",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "compact-brand",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "brand-seal small",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: "E·S"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/app/page.tsx",
                                    lineNumber: 84,
                                    columnNumber: 72
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/apps/web/app/page.tsx",
                                lineNumber: 84,
                                columnNumber: 38
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Empire of Sin"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/app/page.tsx",
                                        lineNumber: 84,
                                        columnNumber: 99
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                        children: "Quick Takeover"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/app/page.tsx",
                                        lineNumber: 84,
                                        columnNumber: 125
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/app/page.tsx",
                                lineNumber: 84,
                                columnNumber: 94
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/app/page.tsx",
                        lineNumber: 84,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "round-display",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Round"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/app/page.tsx",
                                lineNumber: 85,
                                columnNumber: 38
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                children: [
                                    publicGame.round,
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("em", {
                                        children: "/5"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/app/page.tsx",
                                        lineNumber: 85,
                                        columnNumber: 77
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/app/page.tsx",
                                lineNumber: 85,
                                columnNumber: 56
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/app/page.tsx",
                        lineNumber: 85,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "phase-display",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: publicGame.phase
                            }, void 0, false, {
                                fileName: "[project]/apps/web/app/page.tsx",
                                lineNumber: 86,
                                columnNumber: 38
                            }, this),
                            countdown !== null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                className: countdown < 5_000 ? "urgent" : "",
                                children: [
                                    Math.ceil(countdown / 1000),
                                    "s"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/app/page.tsx",
                                lineNumber: 86,
                                columnNumber: 92
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/app/page.tsx",
                        lineNumber: 86,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "player-chip",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                                style: {
                                    background: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$city$2d$map$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FACTIONS"][me?.seat ?? 0]
                                }
                            }, void 0, false, {
                                fileName: "[project]/apps/web/app/page.tsx",
                                lineNumber: 87,
                                columnNumber: 36
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: [
                                    me?.nickname,
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                                className: game.connected ? "online" : "offline",
                                                children: game.connected ? "Live" : "Reconnecting"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/app/page.tsx",
                                                lineNumber: 87,
                                                columnNumber: 116
                                            }, this),
                                            " · ",
                                            me?.influence ?? 0,
                                            " Influence"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/app/page.tsx",
                                        lineNumber: 87,
                                        columnNumber: 109
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/app/page.tsx",
                                lineNumber: 87,
                                columnNumber: 89
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/app/page.tsx",
                        lineNumber: 87,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/app/page.tsx",
                lineNumber: 83,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                className: "mobile-game-nav",
                "aria-label": "Game views",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: mobileView === "action" ? "active" : "",
                        onClick: ()=>setMobileView("action"),
                        children: "Action"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/app/page.tsx",
                        lineNumber: 90,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: mobileView === "city" ? "active" : "",
                        onClick: ()=>setMobileView("city"),
                        children: "City"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/app/page.tsx",
                        lineNumber: 91,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: mobileView === "wire" ? "active" : "",
                        onClick: ()=>setMobileView("wire"),
                        children: "Wire"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/app/page.tsx",
                        lineNumber: 92,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/app/page.tsx",
                lineNumber: 89,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "game-layout",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: `map-column ${mobileView === "city" ? "mobile-active" : ""}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$city$2d$map$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CityMap"], {
                                game: publicGame
                            }, void 0, false, {
                                fileName: "[project]/apps/web/app/page.tsx",
                                lineNumber: 95,
                                columnNumber: 89
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "map-caption",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "City control"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/app/page.tsx",
                                        lineNumber: 95,
                                        columnNumber: 147
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: "Highest stake owns the district. A new tie leaves it contested."
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/app/page.tsx",
                                        lineNumber: 95,
                                        columnNumber: 172
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/app/page.tsx",
                                lineNumber: 95,
                                columnNumber: 118
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/app/page.tsx",
                        lineNumber: 95,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                        className: `action-column ${mobileView === "action" ? "mobile-active" : ""}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                                mode: "wait",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].div, {
                                    initial: {
                                        opacity: 0,
                                        x: 12
                                    },
                                    animate: {
                                        opacity: 1,
                                        x: 0
                                    },
                                    exit: {
                                        opacity: 0,
                                        x: -12
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PhasePanel, {
                                        state: game.publicState,
                                        privateState: game.privateState,
                                        playerId: game.session?.playerId ?? "",
                                        busy: game.busy,
                                        setReady: game.setReady,
                                        submitDraft: game.submitDraft,
                                        submitOperation: game.submitOperation,
                                        voteRematch: game.voteRematch
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/app/page.tsx",
                                        lineNumber: 98,
                                        columnNumber: 11
                                    }, this)
                                }, `${publicGame.round}-${publicGame.phase}`, false, {
                                    fileName: "[project]/apps/web/app/page.tsx",
                                    lineNumber: 97,
                                    columnNumber: 38
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/apps/web/app/page.tsx",
                                lineNumber: 97,
                                columnNumber: 9
                            }, this),
                            game.privateState && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Objectives, {
                                privateState: game.privateState
                            }, void 0, false, {
                                fileName: "[project]/apps/web/app/page.tsx",
                                lineNumber: 101,
                                columnNumber: 31
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/app/page.tsx",
                        lineNumber: 96,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                        className: `social-column ${mobileView === "wire" ? "mobile-active" : ""}`,
                        children: [
                            publicGame.phase === "negotiation" && game.privateState && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$deal$2d$panel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DealPanel"], {
                                game: publicGame,
                                privateState: game.privateState,
                                playerId: game.session?.playerId ?? "",
                                disabled: game.busy,
                                propose: game.proposeDeal,
                                respond: game.respondDeal,
                                withdraw: game.withdrawDeal
                            }, void 0, false, {
                                fileName: "[project]/apps/web/app/page.tsx",
                                lineNumber: 104,
                                columnNumber: 69
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$chat$2d$panel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ChatPanel"], {
                                state: game.publicState,
                                onSend: game.sendChat,
                                disabled: game.busy
                            }, void 0, false, {
                                fileName: "[project]/apps/web/app/page.tsx",
                                lineNumber: 106,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/app/page.tsx",
                        lineNumber: 103,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/app/page.tsx",
                lineNumber: 94,
                columnNumber: 5
            }, this),
            game.error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: "toast",
                onClick: game.clearError,
                role: "alert",
                children: [
                    game.error,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: "Dismiss"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/app/page.tsx",
                        lineNumber: 109,
                        columnNumber: 97
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/app/page.tsx",
                lineNumber: 109,
                columnNumber: 20
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/app/page.tsx",
        lineNumber: 81,
        columnNumber: 10
    }, this);
}
_s1(Home, "qqofdMk25VXSddvWgjtuSONXGHg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$use$2d$game$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGame"],
        useCountdown
    ];
});
_c = Home;
function Lobby({ state, playerId, busy, error, onStart, onLeave }) {
    const isHost = state.room.hostPlayerId === playerId;
    const joinUrl = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : window.location.href;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "lobby-page",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$onboarding$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Onboarding"], {}, void 0, false, {
                fileName: "[project]/apps/web/app/page.tsx",
                lineNumber: 117,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "lobby-brand",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "brand-seal",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: "E·S"
                        }, void 0, false, {
                            fileName: "[project]/apps/web/app/page.tsx",
                            lineNumber: 118,
                            columnNumber: 65
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/app/page.tsx",
                        lineNumber: 118,
                        columnNumber: 37
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "eyebrow",
                                children: "Private table"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/app/page.tsx",
                                lineNumber: 118,
                                columnNumber: 92
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                children: "Gather the families"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/app/page.tsx",
                                lineNumber: 118,
                                columnNumber: 132
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/app/page.tsx",
                        lineNumber: 118,
                        columnNumber: 87
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/app/page.tsx",
                lineNumber: 118,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "room-code-card",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: "Room code"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/app/page.tsx",
                        lineNumber: 119,
                        columnNumber: 41
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                        children: state.room.code
                    }, void 0, false, {
                        fileName: "[project]/apps/web/app/page.tsx",
                        lineNumber: 119,
                        columnNumber: 63
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>navigator.clipboard.writeText(joinUrl),
                        children: "Copy invite link"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/app/page.tsx",
                        lineNumber: 119,
                        columnNumber: 97
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/app/page.tsx",
                lineNumber: 119,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "lobby-table panel",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "eyebrow",
                                        children: "The guest list"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/app/page.tsx",
                                        lineNumber: 120,
                                        columnNumber: 57
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        children: [
                                            state.room.players.length,
                                            " of 8 syndicates"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/app/page.tsx",
                                        lineNumber: 120,
                                        columnNumber: 104
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/app/page.tsx",
                                lineNumber: 120,
                                columnNumber: 52
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "live-pill",
                                children: "Room open"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/app/page.tsx",
                                lineNumber: 120,
                                columnNumber: 162
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/app/page.tsx",
                        lineNumber: 120,
                        columnNumber: 44
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "player-list",
                        children: state.room.players.map((player, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                                        style: {
                                            background: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$city$2d$map$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FACTIONS"][index]
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/app/page.tsx",
                                        lineNumber: 121,
                                        columnNumber: 104
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                                children: player.nickname
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/app/page.tsx",
                                                lineNumber: 121,
                                                columnNumber: 154
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    player.id === state.room.hostPlayerId ? "Host · " : "",
                                                    player.connected ? "At the table" : "Reconnecting"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/web/app/page.tsx",
                                                lineNumber: 121,
                                                columnNumber: 178
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/app/page.tsx",
                                        lineNumber: 121,
                                        columnNumber: 149
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("em", {
                                        children: String(index + 1).padStart(2, "0")
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/app/page.tsx",
                                        lineNumber: 121,
                                        columnNumber: 305
                                    }, this)
                                ]
                            }, player.id, true, {
                                fileName: "[project]/apps/web/app/page.tsx",
                                lineNumber: 121,
                                columnNumber: 79
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/apps/web/app/page.tsx",
                        lineNumber: 121,
                        columnNumber: 7
                    }, this),
                    Array.from({
                        length: Math.max(0, 2 - state.room.players.length)
                    }).map((_, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "waiting-seat",
                            children: "Waiting for another syndicate…"
                        }, index, false, {
                            fileName: "[project]/apps/web/app/page.tsx",
                            lineNumber: 122,
                            columnNumber: 93
                        }, this)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "lobby-actions",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "text-button",
                                onClick: onLeave,
                                children: "Leave room"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/app/page.tsx",
                                lineNumber: 123,
                                columnNumber: 38
                            }, this),
                            isHost ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "gold-button",
                                disabled: busy || state.room.players.length < 2,
                                onClick: onStart,
                                children: state.room.players.length < 2 ? "Waiting for rivals" : "Begin takeover"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/app/page.tsx",
                                lineNumber: 123,
                                columnNumber: 117
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "host-wait",
                                children: "Waiting for the host to begin…"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/app/page.tsx",
                                lineNumber: 123,
                                columnNumber: 301
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/app/page.tsx",
                        lineNumber: 123,
                        columnNumber: 7
                    }, this),
                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "error-banner",
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/apps/web/app/page.tsx",
                        lineNumber: 124,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/app/page.tsx",
                lineNumber: 120,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "lobby-tip",
                children: "Five rounds. Every promise has a price."
            }, void 0, false, {
                fileName: "[project]/apps/web/app/page.tsx",
                lineNumber: 126,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/app/page.tsx",
        lineNumber: 116,
        columnNumber: 10
    }, this);
}
_c1 = Lobby;
function PhasePanel({ state, privateState, playerId, busy, setReady, submitDraft, submitOperation, voteRematch }) {
    const game = state.game;
    if (game.phase === "negotiation") return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Negotiation, {
        game: game,
        state: state,
        busy: busy,
        setReady: setReady
    }, void 0, false, {
        fileName: "[project]/apps/web/app/page.tsx",
        lineNumber: 135,
        columnNumber: 44
    }, this);
    if (game.phase === "draft") return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Draft, {
        game: game,
        privateState: privateState,
        busy: busy,
        submit: submitDraft
    }, void 0, false, {
        fileName: "[project]/apps/web/app/page.tsx",
        lineNumber: 136,
        columnNumber: 38
    }, this);
    if (game.phase === "operations") return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Operation, {
        game: game,
        privateState: privateState,
        playerId: playerId,
        busy: busy,
        submit: submitOperation
    }, void 0, false, {
        fileName: "[project]/apps/web/app/page.tsx",
        lineNumber: 137,
        columnNumber: 43
    }, this);
    if (game.phase === "reveal") return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Reveal, {
        game: game
    }, void 0, false, {
        fileName: "[project]/apps/web/app/page.tsx",
        lineNumber: 138,
        columnNumber: 39
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Finale, {
        state: state,
        playerId: playerId,
        busy: busy,
        vote: voteRematch
    }, void 0, false, {
        fileName: "[project]/apps/web/app/page.tsx",
        lineNumber: 139,
        columnNumber: 10
    }, this);
}
_c2 = PhasePanel;
function Negotiation({ game, state, busy, setReady }) {
    _s2();
    const [ready, setLocalReady] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "phase-card panel",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "eyebrow",
                children: "Phase one"
            }, void 0, false, {
                fileName: "[project]/apps/web/app/page.tsx",
                lineNumber: 144,
                columnNumber: 48
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                children: "Make your promises"
            }, void 0, false, {
                fileName: "[project]/apps/web/app/page.tsx",
                lineNumber: 144,
                columnNumber: 90
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                children: "Talk openly or send private terms. Agreements reward loyalty, but the city remembers betrayal."
            }, void 0, false, {
                fileName: "[project]/apps/web/app/page.tsx",
                lineNumber: 144,
                columnNumber: 117
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "ready-meter",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                children: state.room.readyCount
                            }, void 0, false, {
                                fileName: "[project]/apps/web/app/page.tsx",
                                lineNumber: 145,
                                columnNumber: 39
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: [
                                    "of ",
                                    game.players.length,
                                    " ready"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/app/page.tsx",
                                lineNumber: 145,
                                columnNumber: 69
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/app/page.tsx",
                        lineNumber: 145,
                        columnNumber: 34
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "meter",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                            style: {
                                width: `${state.room.readyCount / game.players.length * 100}%`
                            }
                        }, void 0, false, {
                            fileName: "[project]/apps/web/app/page.tsx",
                            lineNumber: 145,
                            columnNumber: 141
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/app/page.tsx",
                        lineNumber: 145,
                        columnNumber: 118
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/app/page.tsx",
                lineNumber: 145,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: ready ? "outline-button wide" : "gold-button wide",
                disabled: busy,
                onClick: async ()=>{
                    await setReady(!ready);
                    setLocalReady(!ready);
                },
                children: ready ? "Not ready yet" : "Lock in & continue"
            }, void 0, false, {
                fileName: "[project]/apps/web/app/page.tsx",
                lineNumber: 146,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/app/page.tsx",
        lineNumber: 144,
        columnNumber: 10
    }, this);
}
_s2(Negotiation, "VcbAyC04GdYh975m7RvRrrpYVF8=");
_c3 = Negotiation;
function Draft({ game, privateState, busy, submit }) {
    _s3();
    const [selected, setSelected] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(privateState?.draftPreferences[0] ?? null);
    const choose = async (id)=>{
        setSelected(id);
        await submit([
            id,
            ...game.market.map((card)=>card.id).filter((cardId)=>cardId !== id)
        ]);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "phase-card panel",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "eyebrow",
                children: "Blind draft"
            }, void 0, false, {
                fileName: "[project]/apps/web/app/page.tsx",
                lineNumber: 153,
                columnNumber: 48
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                children: "Choose your leverage"
            }, void 0, false, {
                fileName: "[project]/apps/web/app/page.tsx",
                lineNumber: 153,
                columnNumber: 92
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                children: "Your first choice is secret. Rotating priority decides collisions."
            }, void 0, false, {
                fileName: "[project]/apps/web/app/page.tsx",
                lineNumber: 153,
                columnNumber: 121
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "card-market",
                children: game.market.map((card)=>{
                    const copy = CARD_COPY[card.type];
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: `action-card ${selected === card.id ? "selected" : ""}`,
                        disabled: busy,
                        onClick: ()=>choose(card.id),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "card-symbol",
                                children: copy.symbol
                            }, void 0, false, {
                                fileName: "[project]/apps/web/app/page.tsx",
                                lineNumber: 155,
                                columnNumber: 7
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                children: copy.name
                            }, void 0, false, {
                                fileName: "[project]/apps/web/app/page.tsx",
                                lineNumber: 155,
                                columnNumber: 57
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                                children: copy.copy
                            }, void 0, false, {
                                fileName: "[project]/apps/web/app/page.tsx",
                                lineNumber: 155,
                                columnNumber: 75
                            }, this),
                            selected === card.id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("em", {
                                children: "Preference locked"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/app/page.tsx",
                                lineNumber: 155,
                                columnNumber: 126
                            }, this)
                        ]
                    }, card.id, true, {
                        fileName: "[project]/apps/web/app/page.tsx",
                        lineNumber: 154,
                        columnNumber: 105
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/apps/web/app/page.tsx",
                lineNumber: 154,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "submission-note",
                children: [
                    game.submissionCount,
                    " of ",
                    game.players.length,
                    " selections received"
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/app/page.tsx",
                lineNumber: 156,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/app/page.tsx",
        lineNumber: 153,
        columnNumber: 10
    }, this);
}
_s3(Draft, "pznULLVCM5V08KmLBlzvbIWGzjg=");
_c4 = Draft;
function Operation({ game, privateState, playerId, busy, submit }) {
    _s4();
    const card = privateState?.draftedCard;
    const [districtId, setDistrict] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(privateState?.operation?.districtId ?? game.activeDistricts[0]);
    const rivals = game.players.filter((player)=>player.id !== playerId);
    const [targetPlayerId, setTarget] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(privateState?.operation?.targetPlayerId ?? rivals[0]?.id ?? "");
    const deals = privateState?.deals.filter((deal)=>deal.status === "accepted" && deal.round === game.round) ?? [];
    const [dealId, setDeal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(privateState?.operation?.dealId ?? deals[0]?.id ?? "");
    if (!card) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "phase-card panel",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
            children: "Receiving your card…"
        }, void 0, false, {
            fileName: "[project]/apps/web/app/page.tsx",
            lineNumber: 167,
            columnNumber: 59
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/web/app/page.tsx",
        lineNumber: 167,
        columnNumber: 21
    }, this);
    const type = card.type;
    const needsDistrict = [
        "infiltrate",
        "fortify",
        "sabotage",
        "double-cross"
    ].includes(type);
    const needsRival = [
        "sabotage",
        "surveillance"
    ].includes(type);
    const copy = CARD_COPY[type];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "phase-card panel",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "eyebrow",
                children: "Hidden operation"
            }, void 0, false, {
                fileName: "[project]/apps/web/app/page.tsx",
                lineNumber: 171,
                columnNumber: 48
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "chosen-card",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: copy.symbol
                    }, void 0, false, {
                        fileName: "[project]/apps/web/app/page.tsx",
                        lineNumber: 171,
                        columnNumber: 126
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                children: copy.name
                            }, void 0, false, {
                                fileName: "[project]/apps/web/app/page.tsx",
                                lineNumber: 171,
                                columnNumber: 157
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: copy.copy
                            }, void 0, false, {
                                fileName: "[project]/apps/web/app/page.tsx",
                                lineNumber: 171,
                                columnNumber: 177
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/app/page.tsx",
                        lineNumber: 171,
                        columnNumber: 152
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/app/page.tsx",
                lineNumber: 171,
                columnNumber: 97
            }, this),
            needsDistrict && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "control-label",
                children: [
                    "Target district",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        value: districtId,
                        onChange: (event)=>setDistrict(event.target.value),
                        children: game.activeDistricts.map((id)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: id,
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$city$2d$map$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DISTRICT_LABELS"][id]
                            }, id, false, {
                                fileName: "[project]/apps/web/app/page.tsx",
                                lineNumber: 172,
                                columnNumber: 200
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/apps/web/app/page.tsx",
                        lineNumber: 172,
                        columnNumber: 71
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/app/page.tsx",
                lineNumber: 172,
                columnNumber: 23
            }, this),
            needsRival && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "control-label",
                children: [
                    "Target rival",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        value: targetPlayerId,
                        onChange: (event)=>setTarget(event.target.value),
                        children: rivals.map((rival)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: rival.id,
                                children: rival.nickname
                            }, rival.id, false, {
                                fileName: "[project]/apps/web/app/page.tsx",
                                lineNumber: 173,
                                columnNumber: 171
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/apps/web/app/page.tsx",
                        lineNumber: 173,
                        columnNumber: 65
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/app/page.tsx",
                lineNumber: 173,
                columnNumber: 20
            }, this),
            type === "double-cross" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "control-label",
                children: [
                    "Agreement to betray",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        value: dealId,
                        onChange: (event)=>setDeal(event.target.value),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "",
                                children: "No deal — convert to Infiltrate"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/app/page.tsx",
                                lineNumber: 174,
                                columnNumber: 158
                            }, this),
                            deals.map((deal)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: deal.id,
                                    children: deal.type.replaceAll("-", " ")
                                }, deal.id, false, {
                                    fileName: "[project]/apps/web/app/page.tsx",
                                    lineNumber: 174,
                                    columnNumber: 236
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/app/page.tsx",
                        lineNumber: 174,
                        columnNumber: 85
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/app/page.tsx",
                lineNumber: 174,
                columnNumber: 33
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: "gold-button wide",
                disabled: busy,
                onClick: ()=>submit({
                        cardId: card.id,
                        ...needsDistrict ? {
                            districtId
                        } : {},
                        ...needsRival ? {
                            targetPlayerId
                        } : {},
                        ...type === "double-cross" && dealId ? {
                            dealId
                        } : {}
                    }),
                children: privateState?.operation ? "Update hidden move" : "Lock hidden move"
            }, void 0, false, {
                fileName: "[project]/apps/web/app/page.tsx",
                lineNumber: 175,
                columnNumber: 5
            }, this),
            privateState?.operation && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "locked-note",
                children: "Move received. You may revise it before time expires."
            }, void 0, false, {
                fileName: "[project]/apps/web/app/page.tsx",
                lineNumber: 176,
                columnNumber: 33
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/app/page.tsx",
        lineNumber: 171,
        columnNumber: 10
    }, this);
}
_s4(Operation, "JB+JzQrgqzq4Xnt29MSsx1+ix1Q=");
_c5 = Operation;
function Reveal({ game }) {
    const entries = game.revealLog.filter((entry)=>entry.round === game.round);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "phase-card panel reveal-card",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "eyebrow",
                children: "The city moves"
            }, void 0, false, {
                fileName: "[project]/apps/web/app/page.tsx",
                lineNumber: 182,
                columnNumber: 60
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                children: "Operations revealed"
            }, void 0, false, {
                fileName: "[project]/apps/web/app/page.tsx",
                lineNumber: 182,
                columnNumber: 107
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "reveal-list",
                children: entries.map((entry, index)=>{
                    const player = game.players.find((candidate)=>candidate.id === entry.playerId);
                    const card = CARD_COPY[entry.cardType];
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].div, {
                        initial: {
                            opacity: 0,
                            y: 8
                        },
                        animate: {
                            opacity: 1,
                            y: 0
                        },
                        transition: {
                            delay: index * .12
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                                style: {
                                    background: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$city$2d$map$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FACTIONS"][player.seat]
                                }
                            }, void 0, false, {
                                fileName: "[project]/apps/web/app/page.tsx",
                                lineNumber: 182,
                                columnNumber: 458
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                        children: player.nickname
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/app/page.tsx",
                                        lineNumber: 182,
                                        columnNumber: 515
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                                        children: [
                                            card.name,
                                            entry.automatic ? " · automatic" : ""
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/app/page.tsx",
                                        lineNumber: 182,
                                        columnNumber: 539
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/app/page.tsx",
                                lineNumber: 182,
                                columnNumber: 509
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("em", {
                                className: entry.successful ? "success" : "failed",
                                children: entry.successful ? "Success" : "Foiled"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/app/page.tsx",
                                lineNumber: 182,
                                columnNumber: 611
                            }, this)
                        ]
                    }, entry.playerId, true, {
                        fileName: "[project]/apps/web/app/page.tsx",
                        lineNumber: 182,
                        columnNumber: 327
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/apps/web/app/page.tsx",
                lineNumber: 182,
                columnNumber: 135
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/app/page.tsx",
        lineNumber: 182,
        columnNumber: 10
    }, this);
}
_c6 = Reveal;
function Finale({ state, playerId, busy, vote }) {
    _s5();
    const [voted, setVoted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const score = state.finalScore;
    const winners = score?.winnerIds.map((id)=>state.game.players.find((player)=>player.id === id)?.nickname).join(" & ");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "phase-card panel finale-card",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "eyebrow",
                children: "The books are closed"
            }, void 0, false, {
                fileName: "[project]/apps/web/app/page.tsx",
                lineNumber: 188,
                columnNumber: 60
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                children: score?.winnerIds.includes(playerId) ? "The city is yours" : `${winners} takes the city`
            }, void 0, false, {
                fileName: "[project]/apps/web/app/page.tsx",
                lineNumber: 188,
                columnNumber: 113
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "score-table",
                children: score?.standings.map((entry, index)=>{
                    const player = state.game.players.find((candidate)=>candidate.id === entry.playerId);
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: entry.playerId === playerId ? "me" : "",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: index + 1
                            }, void 0, false, {
                                fileName: "[project]/apps/web/app/page.tsx",
                                lineNumber: 189,
                                columnNumber: 251
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                        children: player.nickname
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/app/page.tsx",
                                        lineNumber: 189,
                                        columnNumber: 285
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                                        children: [
                                            "Missions ",
                                            entry.primary + entry.sides,
                                            " · Districts ",
                                            entry.districts,
                                            " · Ops ",
                                            entry.operations
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/app/page.tsx",
                                        lineNumber: 189,
                                        columnNumber: 309
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/app/page.tsx",
                                lineNumber: 189,
                                columnNumber: 279
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("em", {
                                children: entry.total
                            }, void 0, false, {
                                fileName: "[project]/apps/web/app/page.tsx",
                                lineNumber: 189,
                                columnNumber: 424
                            }, this)
                        ]
                    }, entry.playerId, true, {
                        fileName: "[project]/apps/web/app/page.tsx",
                        lineNumber: 189,
                        columnNumber: 173
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/apps/web/app/page.tsx",
                lineNumber: 189,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                className: "objective-reveal",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                        children: "Reveal every objective"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/app/page.tsx",
                        lineNumber: 190,
                        columnNumber: 43
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: state.finalObjectives?.map((entry)=>{
                            const player = state.game.players.find((candidate)=>candidate.id === entry.playerId);
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                        children: player.nickname
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/app/page.tsx",
                                        lineNumber: 190,
                                        columnNumber: 257
                                    }, this),
                                    entry.objectives.map((objective)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: objective.completed ? "complete" : "missed",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                                                    children: objective.completed ? "✓" : "×"
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/app/page.tsx",
                                                    lineNumber: 190,
                                                    columnNumber: 399
                                                }, this),
                                                OBJECTIVE_NAMES[objective.id] ?? objective.id,
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("em", {
                                                    children: objective.points
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/app/page.tsx",
                                                    lineNumber: 190,
                                                    columnNumber: 486
                                                }, this)
                                            ]
                                        }, objective.id, true, {
                                            fileName: "[project]/apps/web/app/page.tsx",
                                            lineNumber: 190,
                                            columnNumber: 318
                                        }, this))
                                ]
                            }, entry.playerId, true, {
                                fileName: "[project]/apps/web/app/page.tsx",
                                lineNumber: 190,
                                columnNumber: 227
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/apps/web/app/page.tsx",
                        lineNumber: 190,
                        columnNumber: 84
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/app/page.tsx",
                lineNumber: 190,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: "gold-button wide",
                disabled: busy || voted,
                onClick: async ()=>{
                    await vote();
                    setVoted(true);
                },
                children: voted ? `Rematch vote cast · ${state.room.rematchVoteCount}/${state.room.players.length}` : "Demand a rematch"
            }, void 0, false, {
                fileName: "[project]/apps/web/app/page.tsx",
                lineNumber: 191,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/app/page.tsx",
        lineNumber: 188,
        columnNumber: 10
    }, this);
}
_s5(Finale, "MDVy9VGtK0hwxORn5oBSzh89pCw=");
_c7 = Finale;
function Objectives({ privateState }) {
    const latestIntel = privateState.intelligence.at(-1);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "panel objective-panel",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "eyebrow",
                        children: "Eyes only"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/app/page.tsx",
                        lineNumber: 197,
                        columnNumber: 61
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                        children: "Secret objectives"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/app/page.tsx",
                        lineNumber: 197,
                        columnNumber: 103
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/app/page.tsx",
                lineNumber: 197,
                columnNumber: 53
            }, this),
            privateState.objectives.map((objective)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: objective.tier === "primary" ? "Primary" : "Side job"
                        }, void 0, false, {
                            fileName: "[project]/apps/web/app/page.tsx",
                            lineNumber: 197,
                            columnNumber: 218
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                            children: OBJECTIVE_NAMES[objective.id] ?? objective.id
                        }, void 0, false, {
                            fileName: "[project]/apps/web/app/page.tsx",
                            lineNumber: 197,
                            columnNumber: 286
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("em", {
                            children: [
                                objective.points,
                                " pts"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/app/page.tsx",
                            lineNumber: 197,
                            columnNumber: 340
                        }, this)
                    ]
                }, objective.id, true, {
                    fileName: "[project]/apps/web/app/page.tsx",
                    lineNumber: 197,
                    columnNumber: 190
                }, this)),
            latestIntel && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "intel-slip",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: [
                            "Surveillance · round ",
                            latestIntel.round
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/app/page.tsx",
                        lineNumber: 198,
                        columnNumber: 49
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                        children: CARD_COPY[latestIntel.cardType].name
                    }, void 0, false, {
                        fileName: "[project]/apps/web/app/page.tsx",
                        lineNumber: 198,
                        columnNumber: 102
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: [
                            "Strongest position: ",
                            latestIntel.strongestDistrictId ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$city$2d$map$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DISTRICT_LABELS"][latestIntel.strongestDistrictId] : "No stake detected",
                            latestIntel.hasDealWithYou ? " · Deal connected to you" : ""
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/app/page.tsx",
                        lineNumber: 198,
                        columnNumber: 147
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/app/page.tsx",
                lineNumber: 198,
                columnNumber: 21
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/app/page.tsx",
        lineNumber: 197,
        columnNumber: 10
    }, this);
}
_c8 = Objectives;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8;
__turbopack_context__.k.register(_c, "Home");
__turbopack_context__.k.register(_c1, "Lobby");
__turbopack_context__.k.register(_c2, "PhasePanel");
__turbopack_context__.k.register(_c3, "Negotiation");
__turbopack_context__.k.register(_c4, "Draft");
__turbopack_context__.k.register(_c5, "Operation");
__turbopack_context__.k.register(_c6, "Reveal");
__turbopack_context__.k.register(_c7, "Finale");
__turbopack_context__.k.register(_c8, "Objectives");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/components/chat-panel.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ChatPanel",
    ()=>ChatPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function ChatPanel({ state, onSend, disabled }) {
    _s();
    const [body, setBody] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const endRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChatPanel.useEffect": ()=>{
            endRef.current?.scrollIntoView({
                behavior: "smooth"
            });
        }
    }["ChatPanel.useEffect"], [
        state.room.chats.length
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "chat-panel panel",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "eyebrow",
                        children: "The wire"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/chat-panel.tsx",
                        lineNumber: 13,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                        children: "Public room"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/chat-panel.tsx",
                        lineNumber: 13,
                        columnNumber: 54
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/components/chat-panel.tsx",
                lineNumber: 13,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "chat-log",
                "aria-live": "polite",
                children: [
                    state.room.chats.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "empty-copy",
                        children: "No one has broken the silence."
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/chat-panel.tsx",
                        lineNumber: 15,
                        columnNumber: 41
                    }, this),
                    state.room.chats.map((message)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "chat-message",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                    children: message.nickname
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/components/chat-panel.tsx",
                                    lineNumber: 16,
                                    columnNumber: 89
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: message.body
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/components/chat-panel.tsx",
                                    lineNumber: 16,
                                    columnNumber: 114
                                }, this)
                            ]
                        }, message.id, true, {
                            fileName: "[project]/apps/web/components/chat-panel.tsx",
                            lineNumber: 16,
                            columnNumber: 42
                        }, this)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        ref: endRef
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/chat-panel.tsx",
                        lineNumber: 17,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/components/chat-panel.tsx",
                lineNumber: 14,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                onSubmit: async (event)=>{
                    event.preventDefault();
                    if (!body.trim()) return;
                    const next = body;
                    setBody("");
                    await onSend(next);
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        value: body,
                        maxLength: 280,
                        onChange: (event)=>setBody(event.target.value),
                        placeholder: "Send a message…",
                        "aria-label": "Chat message"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/chat-panel.tsx",
                        lineNumber: 20,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        disabled: disabled || !body.trim(),
                        "aria-label": "Send message",
                        children: "Send"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/chat-panel.tsx",
                        lineNumber: 21,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/components/chat-panel.tsx",
                lineNumber: 19,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/components/chat-panel.tsx",
        lineNumber: 12,
        columnNumber: 10
    }, this);
}
_s(ChatPanel, "WuSN5nzP6VY3Au8wZnhsUIP/Clw=");
_c = ChatPanel;
var _c;
__turbopack_context__.k.register(_c, "ChatPanel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/components/city-map.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CityMap",
    ()=>CityMap,
    "DISTRICT_LABELS",
    ()=>LABELS,
    "FACTIONS",
    ()=>FACTIONS
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
"use client";
;
const LABELS = {
    downtown: "Downtown",
    docks: "The Docks",
    "old-quarter": "Old Quarter",
    "financial-row": "Financial Row",
    heights: "The Heights",
    "industrial-yard": "Industrial Yard",
    "neon-strip": "Neon Strip"
};
const SHAPES = {
    downtown: "220,145 385,120 430,225 350,305 215,270 170,205",
    docks: "35,280 190,245 250,330 205,455 55,430 20,355",
    "old-quarter": "30,75 175,55 220,145 170,205 35,180",
    "financial-row": "385,120 545,80 610,180 570,285 430,225",
    heights: "175,55 300,20 385,120 220,145",
    "industrial-yard": "250,330 350,305 475,360 455,465 205,455",
    "neon-strip": "430,225 570,285 610,390 475,360 350,305"
};
const CENTERS = {
    downtown: [
        300,
        205
    ],
    docks: [
        130,
        350
    ],
    "old-quarter": [
        120,
        130
    ],
    "financial-row": [
        500,
        185
    ],
    heights: [
        285,
        85
    ],
    "industrial-yard": [
        350,
        400
    ],
    "neon-strip": [
        495,
        315
    ]
};
const FACTIONS = [
    "#C5A46A",
    "#9B4055",
    "#4E9299",
    "#725CA8",
    "#C56E45",
    "#6C8B58",
    "#D0C7B5",
    "#5174A4"
];
function CityMap({ game, selected, onSelect }) {
    const playerById = new Map(game.players.map((player)=>[
            player.id,
            player
        ]));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "map-shell",
        "aria-label": "City district map",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "map-grid",
                "aria-hidden": "true"
            }, void 0, false, {
                fileName: "[project]/apps/web/components/city-map.tsx",
                lineNumber: 32,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                className: "city-map",
                viewBox: "0 0 640 490",
                role: "group",
                children: game.activeDistricts.map((id)=>{
                    const district = game.districts[id];
                    const owner = district.ownerId ? playerById.get(district.ownerId) : null;
                    const [x, y] = CENTERS[id];
                    const stakes = Object.entries(district.stakes).filter(([, value])=>value > 0).sort((a, b)=>b[1] - a[1]);
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                        className: `district ${selected === id ? "is-selected" : ""}`,
                        role: "button",
                        tabIndex: onSelect ? 0 : -1,
                        "aria-label": `${LABELS[id]}, ${owner ? `controlled by ${owner.nickname}` : "neutral"}`,
                        onClick: ()=>onSelect?.(id),
                        onKeyDown: (event)=>{
                            if (event.key === "Enter" || event.key === " ") onSelect?.(id);
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polygon", {
                                points: SHAPES[id],
                                style: {
                                    "--owner": owner ? FACTIONS[owner.seat % FACTIONS.length] : "#34363d"
                                }
                            }, void 0, false, {
                                fileName: "[project]/apps/web/components/city-map.tsx",
                                lineNumber: 44,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                                x: x,
                                y: y - 8,
                                textAnchor: "middle",
                                className: "district-name",
                                children: LABELS[id]
                            }, void 0, false, {
                                fileName: "[project]/apps/web/components/city-map.tsx",
                                lineNumber: 45,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                                x: x,
                                y: y + 16,
                                textAnchor: "middle",
                                className: "district-owner",
                                children: owner?.nickname ?? "Neutral"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/components/city-map.tsx",
                                lineNumber: 46,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                                transform: `translate(${x - (stakes.length - 1) * 15}, ${y + 34})`,
                                children: stakes.map(([playerId, value], index)=>{
                                    const player = playerById.get(playerId);
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                                        transform: `translate(${index * 30},0)`,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                                r: "10",
                                                fill: FACTIONS[player.seat % FACTIONS.length]
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/components/city-map.tsx",
                                                lineNumber: 51,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                                                y: "4",
                                                textAnchor: "middle",
                                                className: "stake-count",
                                                children: value
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/components/city-map.tsx",
                                                lineNumber: 52,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, playerId, true, {
                                        fileName: "[project]/apps/web/components/city-map.tsx",
                                        lineNumber: 50,
                                        columnNumber: 26
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/apps/web/components/city-map.tsx",
                                lineNumber: 47,
                                columnNumber: 15
                            }, this)
                        ]
                    }, id, true, {
                        fileName: "[project]/apps/web/components/city-map.tsx",
                        lineNumber: 41,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/apps/web/components/city-map.tsx",
                lineNumber: 33,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "map-legend",
                children: game.players.map((player)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                                style: {
                                    background: FACTIONS[player.seat % FACTIONS.length]
                                }
                            }, void 0, false, {
                                fileName: "[project]/apps/web/components/city-map.tsx",
                                lineNumber: 61,
                                columnNumber: 61
                            }, this),
                            player.nickname
                        ]
                    }, player.id, true, {
                        fileName: "[project]/apps/web/components/city-map.tsx",
                        lineNumber: 61,
                        columnNumber: 39
                    }, this))
            }, void 0, false, {
                fileName: "[project]/apps/web/components/city-map.tsx",
                lineNumber: 60,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/components/city-map.tsx",
        lineNumber: 31,
        columnNumber: 5
    }, this);
}
_c = CityMap;
;
var _c;
__turbopack_context__.k.register(_c, "CityMap");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/components/deal-panel.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DealPanel",
    ()=>DealPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$city$2d$map$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/components/city-map.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
const DEAL_NAMES = {
    "joint-operation": "Joint Operation",
    "non-aggression": "Non-Aggression",
    "protection-pact": "Protection Pact"
};
function DealPanel({ game, privateState, playerId, disabled, propose, respond, withdraw }) {
    _s();
    const rivals = game.players.filter((player)=>player.id !== playerId);
    const [recipientId, setRecipient] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(rivals[0]?.id ?? "");
    const [type, setType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("non-aggression");
    const [districtId, setDistrict] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(game.activeDistricts[0]);
    const pending = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "DealPanel.useMemo[pending]": ()=>privateState.deals.filter({
                "DealPanel.useMemo[pending]": (deal)=>deal.round === game.round && deal.status !== "resolved"
            }["DealPanel.useMemo[pending]"])
    }["DealPanel.useMemo[pending]"], [
        privateState.deals,
        game.round
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "panel deal-panel",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "eyebrow",
                        children: "Back-room terms"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/deal-panel.tsx",
                        lineNumber: 22,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                        children: "Private deals"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/deal-panel.tsx",
                        lineNumber: 22,
                        columnNumber: 61
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/components/deal-panel.tsx",
                lineNumber: 22,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "deal-list",
                children: [
                    pending.map((deal)=>{
                        const incoming = deal.recipientId === playerId && deal.status === "pending";
                        const otherId = deal.proposerId === playerId ? deal.recipientId : deal.proposerId;
                        const other = game.players.find((player)=>player.id === otherId)?.nickname ?? "Unknown";
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                            className: "deal",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                            children: DEAL_NAMES[deal.type]
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/components/deal-panel.tsx",
                                            lineNumber: 28,
                                            columnNumber: 61
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: [
                                                "with ",
                                                other,
                                                deal.terms.districtId ? ` · ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$city$2d$map$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DISTRICT_LABELS"][deal.terms.districtId]}` : ""
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/apps/web/components/deal-panel.tsx",
                                            lineNumber: 28,
                                            columnNumber: 91
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/web/components/deal-panel.tsx",
                                    lineNumber: 28,
                                    columnNumber: 56
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("em", {
                                    className: `status status-${deal.status}`,
                                    children: deal.status
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/components/deal-panel.tsx",
                                    lineNumber: 29,
                                    columnNumber: 11
                                }, this),
                                incoming && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mini-actions",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>respond(deal.id, false),
                                            children: "Reject"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/components/deal-panel.tsx",
                                            lineNumber: 30,
                                            columnNumber: 54
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>respond(deal.id, true),
                                            children: "Accept"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/components/deal-panel.tsx",
                                            lineNumber: 30,
                                            columnNumber: 117
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/web/components/deal-panel.tsx",
                                    lineNumber: 30,
                                    columnNumber: 24
                                }, this),
                                deal.proposerId === playerId && deal.status === "pending" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "link-action",
                                    onClick: ()=>withdraw(deal.id),
                                    children: "Withdraw"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/components/deal-panel.tsx",
                                    lineNumber: 31,
                                    columnNumber: 73
                                }, this)
                            ]
                        }, deal.id, true, {
                            fileName: "[project]/apps/web/components/deal-panel.tsx",
                            lineNumber: 28,
                            columnNumber: 16
                        }, this);
                    }),
                    pending.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "empty-copy",
                        children: "No promises on the table."
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/deal-panel.tsx",
                        lineNumber: 34,
                        columnNumber: 32
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/components/deal-panel.tsx",
                lineNumber: 23,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "deal-compose",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        "aria-label": "Deal recipient",
                        value: recipientId,
                        onChange: (event)=>setRecipient(event.target.value),
                        children: rivals.map((player)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: player.id,
                                children: player.nickname
                            }, player.id, false, {
                                fileName: "[project]/apps/web/components/deal-panel.tsx",
                                lineNumber: 37,
                                columnNumber: 142
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/deal-panel.tsx",
                        lineNumber: 37,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        "aria-label": "Deal type",
                        value: type,
                        onChange: (event)=>setType(event.target.value),
                        children: Object.entries(DEAL_NAMES).map(([value, name])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: value,
                                children: name
                            }, value, false, {
                                fileName: "[project]/apps/web/components/deal-panel.tsx",
                                lineNumber: 38,
                                columnNumber: 164
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/deal-panel.tsx",
                        lineNumber: 38,
                        columnNumber: 7
                    }, this),
                    type !== "non-aggression" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        "aria-label": "Deal district",
                        value: districtId,
                        onChange: (event)=>setDistrict(event.target.value),
                        children: game.activeDistricts.map((id)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: id,
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$city$2d$map$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DISTRICT_LABELS"][id]
                            }, id, false, {
                                fileName: "[project]/apps/web/components/deal-panel.tsx",
                                lineNumber: 39,
                                columnNumber: 193
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/deal-panel.tsx",
                        lineNumber: 39,
                        columnNumber: 37
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "outline-button",
                        disabled: disabled || !recipientId,
                        onClick: ()=>propose({
                                recipientId,
                                type,
                                ...type !== "non-aggression" ? {
                                    districtId
                                } : {},
                                ...type === "protection-pact" ? {
                                    protectedPlayerId: playerId
                                } : {}
                            }),
                        children: "Propose terms"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/deal-panel.tsx",
                        lineNumber: 40,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/components/deal-panel.tsx",
                lineNumber: 36,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/components/deal-panel.tsx",
        lineNumber: 21,
        columnNumber: 10
    }, this);
}
_s(DealPanel, "0d4aTIQZslsWsVCwI/xVkFwvXVE=");
_c = DealPanel;
var _c;
__turbopack_context__.k.register(_c, "DealPanel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/components/onboarding.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Onboarding",
    ()=>Onboarding
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/motion/dist/es/react.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
const STEPS = [
    [
        "Choose your name",
        "Your syndicate is represented by a unique color. Everything you control carries your mark."
    ],
    [
        "Take the city",
        "Build stake across active districts. The highest stake controls a district; contested ties can turn it neutral."
    ],
    [
        "Draft in secret",
        "Rank the card you want. Rotating priority breaks collisions, then everyone locks a hidden operation."
    ],
    [
        "Make dangerous promises",
        "Deals reward cooperation, but a well-timed Double Cross can steal the night—and cost your Influence."
    ],
    [
        "Win your own way",
        "Complete your secret primary mission, two side jobs, successful operations, and district control across five rounds."
    ]
];
const VISUALS = [
    [
        "You",
        "Faction color",
        "2 Influence"
    ],
    [
        "Downtown",
        "+2 stake",
        "Control"
    ],
    [
        "Draft",
        "Lock move",
        "Reveal"
    ],
    [
        "Promise",
        "Honor",
        "Betray"
    ],
    [
        "10 pt mission",
        "Side jobs",
        "Districts"
    ]
];
function Onboarding() {
    _s();
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [step, setStep] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Onboarding.useEffect": ()=>{
            setOpen(localStorage.getItem("underworld.onboarded") !== "yes");
        }
    }["Onboarding.useEffect"], []);
    const finish = ()=>{
        localStorage.setItem("underworld.onboarded", "yes");
        setOpen(false);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
        children: open && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].div, {
            className: "onboarding-backdrop",
            initial: {
                opacity: 0
            },
            animate: {
                opacity: 1
            },
            exit: {
                opacity: 0
            },
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].section, {
                className: "onboarding-card",
                initial: {
                    y: 18,
                    scale: .98
                },
                animate: {
                    y: 0,
                    scale: 1
                },
                exit: {
                    y: 18,
                    scale: .98
                },
                role: "dialog",
                "aria-modal": "true",
                "aria-labelledby": "onboarding-title",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "eyebrow",
                        children: [
                            "The family briefing · ",
                            step + 1,
                            "/5"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/components/onboarding.tsx",
                        lineNumber: 30,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "onboarding-mark",
                        children: String(step + 1).padStart(2, "0")
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/onboarding.tsx",
                        lineNumber: 31,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        id: "onboarding-title",
                        children: STEPS[step][0]
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/onboarding.tsx",
                        lineNumber: 32,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: STEPS[step][1]
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/onboarding.tsx",
                        lineNumber: 33,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "onboarding-visual",
                        "aria-hidden": "true",
                        children: VISUALS[step].map((label, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: index === 1 ? "accent" : "",
                                children: label
                            }, label, false, {
                                fileName: "[project]/apps/web/components/onboarding.tsx",
                                lineNumber: 34,
                                columnNumber: 99
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/onboarding.tsx",
                        lineNumber: 34,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "progress-dots",
                        "aria-hidden": "true",
                        children: STEPS.map((_, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                                className: index <= step ? "active" : ""
                            }, index, false, {
                                fileName: "[project]/apps/web/components/onboarding.tsx",
                                lineNumber: 35,
                                columnNumber: 82
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/apps/web/components/onboarding.tsx",
                        lineNumber: 35,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "dialog-actions",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "text-button",
                                onClick: finish,
                                children: "Skip briefing"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/components/onboarding.tsx",
                                lineNumber: 36,
                                columnNumber: 39
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "gold-button",
                                onClick: ()=>step === STEPS.length - 1 ? finish() : setStep(step + 1),
                                children: step === STEPS.length - 1 ? "Enter the city" : "Continue"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/components/onboarding.tsx",
                                lineNumber: 37,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/components/onboarding.tsx",
                        lineNumber: 36,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/components/onboarding.tsx",
                lineNumber: 28,
                columnNumber: 5
            }, this)
        }, void 0, false, {
            fileName: "[project]/apps/web/components/onboarding.tsx",
            lineNumber: 27,
            columnNumber: 36
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/web/components/onboarding.tsx",
        lineNumber: 27,
        columnNumber: 10
    }, this);
}
_s(Onboarding, "ARG7Ws+KJ5KUHeJBVxJYS4j8vn0=");
_c = Onboarding;
var _c;
__turbopack_context__.k.register(_c, "Onboarding");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/lib/use-game.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useGame",
    ()=>useGame
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$socket$2e$io$2d$client$2f$build$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/socket.io-client/build/esm/index.js [app-client] (ecmascript) <locals>");
var _s = __turbopack_context__.k.signature();
"use client";
;
;
const STORAGE_KEY = "underworld.quick-takeover.session";
const SERVER_URL = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_GAME_SERVER_URL ?? "http://localhost:3001";
function commandId() {
    return `${Date.now().toString(36)}-${crypto.randomUUID()}`;
}
function useGame() {
    _s();
    const socketRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [connected, setConnected] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [publicState, setPublicState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const publicStateRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [privateState, setPrivateState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [session, setSession] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [busy, setBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useGame.useEffect": ()=>{
            const socket = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$socket$2e$io$2d$client$2f$build$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["io"])(SERVER_URL, {
                transports: [
                    "websocket"
                ],
                reconnection: true,
                reconnectionDelayMax: 2_000
            });
            socketRef.current = socket;
            socket.on("connect", {
                "useGame.useEffect": ()=>{
                    setConnected(true);
                    const raw = sessionStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(STORAGE_KEY);
                    if (raw) {
                        try {
                            const saved = JSON.parse(raw);
                            sessionStorage.setItem(STORAGE_KEY, raw);
                            localStorage.removeItem(STORAGE_KEY);
                            socket.emit("room:resume", saved, {
                                "useGame.useEffect": (ack)=>{
                                    if (!ack.ok && ack.error?.code !== "INVALID_CREDENTIALS") setError(ack.error?.message ?? "Could not reconnect");
                                    if (!ack.ok && ack.error?.code === "INVALID_CREDENTIALS") sessionStorage.removeItem(STORAGE_KEY);
                                }
                            }["useGame.useEffect"]);
                        } catch  {
                            sessionStorage.removeItem(STORAGE_KEY);
                        }
                    }
                }
            }["useGame.useEffect"]);
            socket.on("disconnect", {
                "useGame.useEffect": ()=>setConnected(false)
            }["useGame.useEffect"]);
            socket.on("session:established", {
                "useGame.useEffect": (next)=>{
                    setSession(next);
                    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
                    const url = new URL(window.location.href);
                    url.searchParams.set("room", next.roomCode);
                    window.history.replaceState({}, "", url);
                }
            }["useGame.useEffect"]);
            socket.on("state:public", {
                "useGame.useEffect": (next)=>{
                    publicStateRef.current = next;
                    setPublicState(next);
                }
            }["useGame.useEffect"]);
            socket.on("state:private", setPrivateState);
            socket.on("command:error", {
                "useGame.useEffect": (ack)=>setError(ack.error?.message ?? "The city rejected that move")
            }["useGame.useEffect"]);
            return ({
                "useGame.useEffect": ()=>{
                    socket.disconnect();
                    socketRef.current = null;
                }
            })["useGame.useEffect"];
        }
    }["useGame.useEffect"], []);
    const emitRaw = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useGame.useCallback[emitRaw]": (event, payload)=>new Promise({
                "useGame.useCallback[emitRaw]": (resolve, reject)=>{
                    const socket = socketRef.current;
                    if (!socket?.connected) {
                        reject(new Error("Not connected to the game server"));
                        return;
                    }
                    socket.timeout(5_000).emit(event, payload, {
                        "useGame.useCallback[emitRaw]": (timeoutError, response)=>{
                            if (timeoutError) reject(new Error("The server did not answer in time"));
                            else resolve(response);
                        }
                    }["useGame.useCallback[emitRaw]"]);
                }
            }["useGame.useCallback[emitRaw]"])
    }["useGame.useCallback[emitRaw]"], []);
    const run = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useGame.useCallback[run]": async (event, payload, includeVersion = true)=>{
            setBusy(true);
            setError(null);
            try {
                let ack = await emitRaw(event, {
                    commandId: commandId(),
                    ...includeVersion ? {
                        expectedStateVersion: publicStateRef.current?.stateVersion ?? 0
                    } : {},
                    ...payload
                });
                if (includeVersion && !ack.ok && ack.error?.code === "STALE_VERSION") {
                    await new Promise({
                        "useGame.useCallback[run]": (resolve)=>{
                            const socket = socketRef.current;
                            if (!socket?.connected) {
                                resolve();
                                return;
                            }
                            let timer;
                            const receive = {
                                "useGame.useCallback[run].receive": (next)=>{
                                    clearTimeout(timer);
                                    publicStateRef.current = next;
                                    socket.off("state:public", receive);
                                    resolve();
                                }
                            }["useGame.useCallback[run].receive"];
                            timer = setTimeout({
                                "useGame.useCallback[run]": ()=>{
                                    socket.off("state:public", receive);
                                    resolve();
                                }
                            }["useGame.useCallback[run]"], 1_000);
                            socket.on("state:public", receive);
                            socket.emit("state:resync");
                        }
                    }["useGame.useCallback[run]"]);
                    ack = await emitRaw(event, {
                        commandId: commandId(),
                        expectedStateVersion: publicStateRef.current?.stateVersion ?? 0,
                        ...payload
                    });
                }
                if (!ack.ok) setError(ack.error?.message ?? "Command rejected");
                else setError(null);
                return ack;
            } catch (caught) {
                const message = caught instanceof Error ? caught.message : "Connection failed";
                setError(message);
                return {
                    ok: false,
                    error: {
                        code: "CLIENT_ERROR",
                        message,
                        retryable: true
                    }
                };
            } finally{
                setBusy(false);
            }
        }
    }["useGame.useCallback[run]"], [
        emitRaw
    ]);
    const leaveLocal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useGame.useCallback[leaveLocal]": ()=>{
            sessionStorage.removeItem(STORAGE_KEY);
            setSession(null);
            setPublicState(null);
            setPrivateState(null);
            window.history.replaceState({}, "", window.location.pathname);
        }
    }["useGame.useCallback[leaveLocal]"], []);
    return {
        connected,
        publicState,
        privateState,
        session,
        error,
        busy,
        clearError: ()=>setError(null),
        createRoom: (nickname)=>run("room:create", {
                nickname
            }, false),
        joinRoom: (roomCode, nickname)=>run("room:join", {
                roomCode,
                nickname
            }, false),
        startMatch: ()=>run("room:start", {}),
        setReady: (ready)=>run("negotiation:setReady", {
                ready
            }),
        submitDraft: (cardIds)=>run("draft:submitPreferences", {
                cardIds
            }),
        submitOperation: (choice)=>run("operation:submit", {
                choice
            }),
        proposeDeal: (payload)=>run("deal:propose", payload),
        respondDeal: (dealId, accept)=>run("deal:respond", {
                dealId,
                accept
            }),
        withdrawDeal: (dealId)=>run("deal:withdraw", {
                dealId
            }),
        sendChat: (body)=>run("chat:send", {
                body
            }),
        voteRematch: ()=>run("rematch:vote", {}),
        leaveRoom: async ()=>{
            await run("room:leave", {});
            leaveLocal();
        },
        forgetSession: leaveLocal
    };
}
_s(useGame, "WFCGawW5mc3CaduNGH61aKTAh9A=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);})()

//# sourceMappingURL=apps_web_1wqknopv2rrr1._.js.map