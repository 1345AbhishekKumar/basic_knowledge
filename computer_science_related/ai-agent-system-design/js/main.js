// main.js — lesson flow, build-up stepper, component inspector, quiz logic.
// Classic script (no modules) for file:// compatibility. Depends on viz.js (loaded first).

(function () {
  "use strict";

  function $(id) { return document.getElementById(id); }

  // Mini ReAct trace for the Build-up section (step 2).
  // One idea at a time: each press reveals exactly one Thought/Action/Observation.
  var MINI = [
    "Thought: user wants flight + hotel under $800.\nI need prices before I can plan.",
    "Action: flight_search({from:'SFO', to:'NYC', max:500})\nObservation: 3 flights: $320 / $410 / $610.",
    "Thought: $320 leaves $480 for hotel.\nAction: hotel_search({city:'NYC', max:480})",
    "Observation: 2 hotels: $380, $440.\nThought: $320 + $380 = $700 — fits budget.",
    "Action: verify(budget<=800, refundable?)\nObservation: PASS.",
    "Done: present itinerary + book button.\nThe loop stopped because the verifier passed, not because tokens ran out."
  ];
  var miniIdx = -1;

  function renderMini() {
    if (miniIdx < 0) {
      $("miniTrace").textContent = "Press “Step” to start the loop.";
    } else {
      var out = "";
      for (var i = 0; i <= miniIdx; i++) out += "[" + (i + 1) + "] " + MINI[i] + "\n\n";
      $("miniTrace").textContent = out.trim();
    }
    $("miniCounter").textContent = "Step " + Math.max(0, miniIdx + 1) + "/" + MINI.length;
    $("miniStep").disabled = miniIdx + 1 >= MINI.length;
    $("miniBack").disabled = miniIdx < 0;
  }

  // Component inspector copy: what it does / what breaks / example.
  var COMP_INFO = {
    orch: "<strong>Orchestrator.</strong> Runs the state machine: goal, iteration budget, timeouts, retries. Without it the LLM loops forever on failure.",
    brain: "<strong>Planner / Brain.</strong> The LLM that reasons and emits JSON tool calls. Stateless — it only sees what the orchestrator puts in context.",
    tools: "<strong>Tools.</strong> Typed functions (search, code, DB, booking) with schemas + timeouts. Parallelize reads; gate writes behind the verifier.",
    mem: "<strong>Memory.</strong> Hot working context, warm vector store, cold logs. Retrieval + summarization beat raw appending past ~70% context.",
    guard: "<strong>Verifier + Guardrails.</strong> Budget, policy, tests, citations, human approval for side effects. Try guardrails OFF in the playground.",
    obs: "<strong>Observability.</strong> Trace every Thought/Action/Observation with tokens, cost, latency. Evals on golden tasks catch regressions."
  };

  // Quiz explanations shown with instant right/wrong feedback.
  var QUIZ_WHY = [
    "The orchestrator enforces budgets and stop conditions — the model alone will happily retry forever.",
    "Past ~70% context, summarize or retrieve selectively. Appending raw tool output explodes cost and loses the thread.",
    "Side-effecting actions (book, merge, pay) must pass verification first. Speed without checks is how $800 becomes $2,400."
  ];

  function initMini() {
    renderMini();
    $("miniStep").addEventListener("click", function () {
      if (miniIdx + 1 < MINI.length) { miniIdx += 1; renderMini(); }
    });
    $("miniBack").addEventListener("click", function () {
      if (miniIdx >= 0) { miniIdx -= 1; renderMini(); }
    });
    $("miniReset").addEventListener("click", function () {
      miniIdx = -1; renderMini();
    });
  }

  function initComps() {
    var cards = document.querySelectorAll("#compGrid .comp");
    for (var i = 0; i < cards.length; i++) {
      cards[i].addEventListener("click", function () {
        for (var j = 0; j < cards.length; j++) cards[j].classList.remove("active");
        this.classList.add("active");
        var key = this.getAttribute("data-comp");
        $("compDetail").innerHTML = COMP_INFO[key] || "Unknown.";
      });
    }
  }

  function initQuiz() {
    var blocks = document.querySelectorAll(".quiz-q");
    for (var q = 0; q < blocks.length; q++) {
      (function (block, qi) {
        var btns = block.querySelectorAll("button[data-opt]");
        var fb = block.querySelector(".feedback");
        var correct = block.getAttribute("data-answer");
        for (var b = 0; b < btns.length; b++) {
          btns[b].addEventListener("click", function () {
            var pick = this.getAttribute("data-opt");
            if (pick === correct) {
              fb.className = "feedback ok";
              fb.textContent = "Correct. " + QUIZ_WHY[qi];
            } else {
              fb.className = "feedback no";
              fb.textContent = "Not quite. " + QUIZ_WHY[qi];
            }
          });
        }
      })(blocks[q], q);
    }
  }

  // Boot after DOM is ready; viz.js must have defined AgentPlayground.
  document.addEventListener("DOMContentLoaded", function () {
    initMini();
    initComps();
    initQuiz();
    if (typeof window.AgentPlayground !== "undefined") {
      window.AgentPlayground.init();
    }
  });
})();
