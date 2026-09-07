// viz.js — playground simulation for the AI agent system lesson.
// Classic script (no modules) so it works under file://.
// Exposes window.AgentPlayground with init(). main.js calls it after load.

// Node centers in the SVG viewBox (must match index.html layout).
var NODE_POS = {
  user: { x: 55, y: 177 },
  orch: { x: 210, y: 177 },
  brain: { x: 350, y: 177 },
  tools: { x: 520, y: 107 },
  mem: { x: 520, y: 267 },
  verify: { x: 530, y: 177 }
};

// Per-model cost/latency. Keeps numbers realistic and comparable.
var MODELS = {
  fast: { label: "fast", per1k: 0.0005, lat: 0.6, tokMul: 0.7 },
  balanced: { label: "balanced", per1k: 0.002, lat: 1.1, tokMul: 1.0 },
  reasoning: { label: "reasoning", per1k: 0.008, lat: 2.2, tokMul: 1.6 }
};

// Task templates. Each step is Thought/Action/Observation at one node.
var TASKS = {
  travel: {
    title: "Travel: flight + hotel under $800",
    base: [
      { node: "orch", t: "Parse goal + constraints.", a: "Set budget=$800, maxIter, timeouts.", o: "Plan skeleton: flights → hotels → verify.", tok: 320 },
      { node: "brain", t: "Decompose: need dates, prefs, prices.", a: "Draft tool plan (flight_search, hotel_search).", o: "2 parallel calls possible.", tok: 650 },
      { node: "mem", t: "Recall traveler prefs?", a: "vector recall: 'aisle, no red-eye, Marriott'.", o: "3 past trips retrieved.", tok: 480 },
      { node: "tools", t: "Search flights first.", a: "flight_search({from:'SFO', to:'NYC', max:500})", o: "3 options: $320 / $410 / $610.", tok: 900 },
      { node: "tools", t: "Search hotels within remainder.", a: "hotel_search({city:'NYC', max:480})", o: "2 options: $380, $440/night total.", tok: 950 },
      { node: "brain", t: "Combine: $320+$380=$700 fits.", a: "Compose itinerary + hold request.", o: "Candidate ready for checks.", tok: 700 },
      { node: "verify", t: "Policy + budget check.", a: "validate(budget<=800, dates, refundable?)", o: "PASS — safe to present/book.", tok: 300 },
      { node: "user", t: "Done.", a: "Present itinerary + book button.", o: "User books. Trace logged.", tok: 250 }
    ]
  },
  debug: {
    title: "Debug: fix a traceback",
    base: [
      { node: "orch", t: "Goal: reproduce then fix.", a: "Set sandbox, maxIter, no prod writes.", o: "Safety scope locked.", tok: 280 },
      { node: "brain", t: "Read traceback bottom-up.", a: "Plan: read file → run repro → patch.", o: "Suspect: None-check missing.", tok: 600 },
      { node: "mem", t: "Similar bug before?", a: "recall('TypeError NoneType similar')", o: "1 prior fix: guard clause.", tok: 450 },
      { node: "tools", t: "Read code + run repro.", a: "read_file + run_tests(sandbox)", o: "Repro confirmed on line 42.", tok: 1100 },
      { node: "tools", t: "Apply minimal patch.", a: "edit_file(guard clause) + rerun", o: "Tests pass 12/12.", tok: 1000 },
      { node: "brain", t: "Summarize diff + risk.", a: "Draft explanation + rollback plan.", o: "Ready for review.", tok: 550 },
      { node: "verify", t: "No secrets, tests green?", a: "lint + secret-scan + human approve", o: "PASS — merge allowed.", tok: 320 },
      { node: "user", t: "Done.", a: "Show diff + test report.", o: "User merges.", tok: 200 }
    ]
  },
  research: {
    title: "Research: EV battery prices",
    base: [
      { node: "orch", t: "Goal: sourced price table.", a: "Require ≥3 sources + citations.", o: "Anti-hallucination rule set.", tok: 300 },
      { node: "brain", t: "Split by chemistry.", a: "Plan: LFP vs NMC queries.", o: "2 search batches.", tok: 620 },
      { node: "mem", t: "Prior report cached?", a: "recall('EV battery 2025')", o: "Stale (6 mo) — refresh needed.", tok: 420 },
      { node: "tools", t: "Search sources.", a: "web_search x3 (statista, BNEF, DOE)", o: "5 docs, 2 paywalled (skipped).", tok: 1200 },
      { node: "tools", t: "Extract numbers.", a: "extract($/kWh per source)", o: "LFP ~$95, NMC ~$120/kWh.", tok: 1050 },
      { node: "brain", t: "Reconcile conflicts.", a: "Median + note variance.", o: "Table + caveats drafted.", tok: 680 },
      { node: "verify", t: "Citations cover every claim?", a: "check(citations>=3, no bare numbers)", o: "PASS with 4 citations.", tok: 310 },
      { node: "user", t: "Done.", a: "Present table + sources.", o: "User exports.", tok: 220 }
    ]
  }
};

// Inspector copy for playground nodes.
var NODE_INFO = {
  user: "<strong>User</strong> — sets goal + hard limits (budget, timeout). Without limits the loop has no stop condition.",
  orch: "<strong>Orchestrator</strong> — owns state machine, iteration budget, timeouts, retries. Calls brain, routes tools.",
  brain: "<strong>Planner (LLM)</strong> — ReAct reasoning. Emits strict JSON tool calls. Stateless: all context comes from orchestrator.",
  tools: "<strong>Tools</strong> — typed APIs with schemas, timeouts, idempotency. Side effects (book, merge, pay) need verifier first.",
  mem: "<strong>Memory</strong> — hot: chat window; warm: vector recall; cold: traces. Toggle it off to feel the cost of forgetting.",
  verify: "<strong>Verifier</strong> — budget/policy/tests/citations check + human-in-loop. Toggle off to see unsafe booking pass."
};

window.AgentPlayground = (function () {
  // Internal state for the simulation.
  var state = {
    query: "travel",
    steps: [],
    idx: -1,
    playing: false,
    speed: 1,
    maxIter: 6,
    memory: true,
    guard: true,
    model: "balanced",
    totals: { tok: 0, cost: 0, lat: 0 },
    rafId: null,
    anim: null // {from,to,t}
  };

  function $(id) { return document.getElementById(id); }

  // Build the step list from task template + current toggles.
  function buildSteps() {
    var tpl = TASKS[state.query].base.slice();
    var m = MODELS[state.model];
    var steps = tpl.map(function (s) {
      var c = { node: s.node, t: s.t, a: s.a, o: s.o, tok: Math.round(s.tok * m.tokMul) };
      return c;
    });

    // Memory OFF: replace recall with a miss + add rework tokens later.
    if (!state.memory) {
      for (var i = 0; i < steps.length; i++) {
        if (steps[i].node === "mem") {
          steps[i].t = "Memory disabled — nothing recalled.";
          steps[i].a = "skip recall (no prefs/history)";
          steps[i].o = "MISS — planner must re-ask / re-search (+tokens).";
          steps[i].tok = 150;
          break;
        }
      }
      // Rework penalty on the tool step after memory.
      for (var j = 0; j < steps.length; j++) {
        if (steps[j].node === "tools") { steps[j].tok += 500; break; }
      }
    }

    // Guardrails OFF: verifier becomes a skipped warning.
    if (!state.guard) {
      for (var k = 0; k < steps.length; k++) {
        if (steps[k].node === "verify") {
          steps[k].t = "Verifier SKIPPED (guardrails off).";
          steps[k].a = "no policy check — allow side effect";
          steps[k].o = "WARN: $2,400 option could slip through. Unsafe!";
          steps[k].warn = true;
          break;
        }
      }
    }

    // Max iterations truncates the loop — teaches budget.
    var truncated = false;
    if (steps.length > state.maxIter) {
      steps = steps.slice(0, state.maxIter);
      truncated = true;
    }
    if (truncated) {
      steps.push({
        node: "orch", t: "Iteration budget exhausted.",
        a: "stop loop (maxIter=" + state.maxIter + ")",
        o: "INCOMPLETE — raise budget or split task.",
        tok: 120, incomplete: true
      });
    }
    return steps;
  }

  // Node + edge highlighting helpers.
  function clearMarks() {
    var nodes = document.querySelectorAll("#archSvg .node");
    for (var i = 0; i < nodes.length; i++) nodes[i].classList.remove("active", "done", "blocked");
    var edges = document.querySelectorAll("#archSvg .edge");
    for (var j = 0; j < edges.length; j++) edges[j].classList.remove("active");
  }

  function markUpTo(idx) {
    clearMarks();
    for (var i = 0; i <= idx && i < state.steps.length; i++) {
      var s = state.steps[i];
      var el = document.querySelector('#archSvg .node[data-node="' + s.node + '"]');
      if (!el) continue;
      if (s.warn) el.classList.add("blocked");
      else if (s.incomplete) el.classList.add("blocked");
      else if (i === idx) el.classList.add("active");
      else el.classList.add("done");
    }
  }

  // Recompute totals from steps[0..idx] and paint metrics.
  function renderMetrics() {
    var m = MODELS[state.model];
    var tok = 0, lat = 0;
    for (var i = 0; i <= state.idx && i < state.steps.length; i++) {
      tok += state.steps[i].tok;
      lat += m.lat;
    }
    var cost = (tok / 1000) * m.per1k;
    state.totals = { tok: tok, cost: cost, lat: lat };
    $("mStep").textContent = Math.max(0, state.idx + 1) + "/" + state.steps.length;
    $("mTokens").textContent = String(tok);
    $("mCost").textContent = "$" + cost.toFixed(3);
    $("mLat").textContent = lat.toFixed(1) + "s";
    // Context usage: each step adds ~9%, memory ON saves ~12%.
    var ctx = 10 + (state.idx + 1) * 9 - (state.memory ? 6 : 0);
    ctx = Math.max(5, Math.min(98, ctx));
    $("ctxBar").style.width = ctx + "%";
    $("ctxVal").textContent = ctx + "%";
    $("ctxBar").style.background = ctx > 70 ? "#e53935" : "#2563eb";
  }

  // Render trace log lines for steps[0..idx].
  function renderLog() {
    var box = $("traceLog");
    if (state.idx < 0) {
      box.textContent = "Choose a task above, then press Play or Step forward. Each step appends here.";
      return;
    }
    var html = "";
    for (var i = 0; i <= state.idx && i < state.steps.length; i++) {
      var s = state.steps[i];
      var cls = s.warn || s.incomplete ? "warn" : "o";
      html += '<div><span class="t">[' + (i + 1) + " " + s.node + "] Thought:</span> " + escapeHtml(s.t) + "</div>";
      html += '<div><span class="a">Action:</span> ' + escapeHtml(s.a) + "</div>";
      html += '<div><span class="' + cls + '">Observation:</span> ' + escapeHtml(s.o) + " (" + s.tok + " tok)</div>";
      if (i < state.idx) html += "<div>—</div>";
    }
    box.innerHTML = html;
    box.scrollTop = box.scrollHeight;
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // Packet animation with requestAnimationFrame + clamped delta time.
  // Motion means something: the packet carries tokens between components.
  function animatePacket(from, to, done) {
    var packet = $("packet");
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { packet.style.display = "none"; if (done) done(); return; }
    cancelPacket();
    packet.style.display = "block";
    state.anim = { from: from, to: to, t: 0 };
    var last = performance.now();
    var dur = 0.7 / state.speed; // seconds; speed is a control, default stays readable
    function frame(now) {
      // Clamped delta keeps speed identical across machines / tab switches.
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!state.anim) return;
      state.anim.t += dt / dur;
      var t = Math.min(1, state.anim.t);
      var x = from.x + (to.x - from.x) * t;
      var y = from.y + (to.y - from.y) * t;
      packet.setAttribute("cx", x);
      packet.setAttribute("cy", y);
      if (t < 1) {
        state.rafId = requestAnimationFrame(frame);
      } else {
        state.anim = null;
        packet.style.display = "none";
        if (done) done();
      }
    }
    state.rafId = requestAnimationFrame(frame);
  }

  function cancelPacket() {
    if (state.rafId) cancelAnimationFrame(state.rafId);
    state.rafId = null;
    state.anim = null;
  }

  function prevNodePos() {
    if (state.idx <= 0) return NODE_POS.user;
    var prev = state.steps[state.idx - 1];
    return NODE_POS[prev.node] || NODE_POS.user;
  }

  // Advance one step with animation, then paint state.
  function stepForward() {
    if (state.idx + 1 >= state.steps.length) { pause(); return; }
    var next = state.steps[state.idx + 1];
    var from = state.idx < 0 ? NODE_POS.user : prevNodePos();
    // When stepping back then forward, from = current node pos.
    if (state.idx >= 0) from = NODE_POS[state.steps[state.idx].node];
    var to = NODE_POS[next.node];
    var target = state.idx + 1;
    animatePacket(from, to, function () {
      state.idx = target;
      markUpTo(state.idx);
      renderMetrics();
      renderLog();
      syncButtons();
      if (state.playing) {
        if (state.idx + 1 >= state.steps.length) pause();
        else stepForward();
      }
    });
    // Optimistic paint so rapid stepping still feels instant.
    state.idx = target;
    markUpTo(state.idx);
    renderMetrics();
    renderLog();
    syncButtons();
  }

  function stepBack() {
    pause();
    cancelPacket();
    if (state.idx < 0) return;
    state.idx -= 1;
    markUpTo(state.idx);
    renderMetrics();
    renderLog();
    syncButtons();
  }

  function reset(rebuild) {
    pause();
    cancelPacket();
    if (rebuild) state.steps = buildSteps();
    state.idx = -1;
    clearMarks();
    renderMetrics();
    renderLog();
    syncButtons();
  }

  function play() {
    if (state.idx + 1 >= state.steps.length) reset(false);
    state.playing = true;
    syncButtons();
    stepForward();
  }

  function pause() {
    state.playing = false;
    syncButtons();
  }

  function syncButtons() {
    $("btnPlay").textContent = state.playing ? "Pause" : "Play";
    $("btnStep").disabled = state.idx + 1 >= state.steps.length;
    $("btnBack").disabled = state.idx < 0;
    $("mStep").textContent = Math.max(0, state.idx + 1) + "/" + state.steps.length;
  }

  // Wire controls + node inspection.
  function init() {
    state.steps = buildSteps();
    reset(false);

    var presets = document.querySelectorAll("[data-query]");
    for (var i = 0; i < presets.length; i++) {
      presets[i].addEventListener("click", function () {
        state.query = this.getAttribute("data-query");
        state.steps = buildSteps();
        reset(false);
      });
    }

    $("btnPlay").addEventListener("click", function () {
      if (state.playing) pause(); else play();
    });
    $("btnStep").addEventListener("click", stepForward);
    $("btnBack").addEventListener("click", stepBack);
    $("btnReset").addEventListener("click", function () { reset(true); });

    $("speed").addEventListener("input", function () {
      state.speed = parseFloat(this.value);
      $("speedVal").textContent = this.value + "x";
    });
    $("maxIter").addEventListener("input", function () {
      state.maxIter = parseInt(this.value, 10);
      $("maxIterVal").textContent = this.value;
      state.steps = buildSteps();
      reset(false);
    });
    $("tglMemory").addEventListener("change", function () {
      state.memory = this.checked;
      state.steps = buildSteps();
      reset(false);
    });
    $("tglGuard").addEventListener("change", function () {
      state.guard = this.checked;
      state.steps = buildSteps();
      reset(false);
    });
    $("modelSel").addEventListener("change", function () {
      state.model = this.value;
      state.steps = buildSteps();
      reset(false);
    });

    // Click-to-inspect: packet nodes show details in the side panel.
    var nodes = document.querySelectorAll("#archSvg .node");
    for (var n = 0; n < nodes.length; n++) {
      nodes[n].addEventListener("click", function () {
        var key = this.getAttribute("data-node");
        $("nodeDetail").innerHTML = NODE_INFO[key] || "Unknown component.";
        var all = document.querySelectorAll("#archSvg .node");
        for (var k = 0; k < all.length; k++) all[k].classList.remove("active");
        // Keep completed marks; flash inspected node via outline.
        this.classList.add("active");
      });
    }

    // Keyboard: space toggles play when playground is focused.
    document.addEventListener("keydown", function (e) {
      if (e.code === "Space" && document.activeElement === document.body) {
        e.preventDefault();
        if (state.playing) pause(); else play();
      }
    });
  }

  return { init: init };
})();
