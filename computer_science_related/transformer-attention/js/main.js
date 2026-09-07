/* ==========================================================================
   main.js — lesson flow & check-yourself quiz
   --------------------------------------------------------------------------
   Wires the playground (viz.js) to the page, runs the interactive quiz, and
   adds keyboard support. Loaded after viz.js.
   ========================================================================== */

(function () {
  "use strict";

  function $(id) { return document.getElementById(id); }

  function initPlayground() {
    AttentionLab.init({
      sentenceBtns: $("sentenceBtns"),
      headBtns: $("headBtns"),
      gridArea: $("gridArea"),
      readout: $("readout"),
      mathPanel: $("mathPanel"),
      tokenChips: $("tokenChips")
    });
  }

  /* --- Check yourself: one shot per question, instant feedback ------------ */

  // Explanation shown after answering, per question.
  var EXPLAIN = {
    q1: {
      right: "Exactly. Raw dot products grow with the width of the key vectors, and very large numbers push softmax into the region where its gradient is nearly zero — training would stall. Dividing by \u221ad\u2096 keeps the scores in a healthy range.",
      wrong: "Not quite. The scaling isn't about probabilities (softmax does that) and it isn't for speed — it keeps large dot products from saturating softmax into the tiny-gradient region. Try the playground: click any cell and read step 2 of the math."
    },
    q2: {
      right: "Yes — the output is a weighted sum over every token's value vector. The referent's values simply dominate the blend, which is how the context gets baked into the word.",
      wrong: "The output is a blend, not a single pick. Attention multiplies every word's value by its weight and sums them all — the best match dominates, but all words contribute."
    },
    q3: {
      right: "Correct. Self-attention treats the input like a set: swap the words around and the attention pattern is unchanged. Positional encoding adds the order back into the embeddings.",
      wrong: "The problem is order-blindness. Without positional encoding, 'dog bit man' and 'man bit dog' look like the same bag of words to attention."
    },
    q4: {
      right: "8 heads, each working on 64-dimension keys (d\u2096 = 512 \u00f7 8 = 64). Scaling divides by \u221a64 = 8.",
      wrong: "In the 2017 paper it's 8 parallel heads with key width 64 (d_model 512 \u00f7 8 heads). That's where the \u00f78 scaling in step 3 comes from."
    }
  };

  function wireQuiz() {
    var blocks = document.querySelectorAll(".quiz");
    blocks.forEach(function (block) {
      var qid = block.getAttribute("data-question");
      var feedback = block.querySelector(".feedback");
      var answers = block.querySelectorAll(".ans");

      answers.forEach(function (btn) {
        btn.addEventListener("click", function () {
          var isCorrect = btn.hasAttribute("data-correct");

          // lock the question after the first answer
          answers.forEach(function (a) {
            a.disabled = true;
            if (a === btn) {
              a.classList.add(isCorrect ? "correct" : "wrong");
              a.setAttribute("aria-pressed", "true");
            } else if (a.hasAttribute("data-correct")) {
              a.classList.add("correct");   // show the right answer
            }
          });

          feedback.hidden = false;
          feedback.textContent = isCorrect
            ? "\u2713 " + EXPLAIN[qid].right
            : "\u2717 " + EXPLAIN[qid].wrong;
          if (!isCorrect) feedback.classList.add("wrong-fb");
        });
      });
    });
  }

  /* --- Keyboard support: \u2190 / \u2192 walk the words ---------------------- */

  function wireKeyboard() {
    document.addEventListener("keydown", function (e) {
      var inGrid = e.target && (e.target.closest(".stage") || e.target.closest("#tokenChips"));
      if (!inGrid) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        AttentionLab.moveQuery(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        AttentionLab.moveQuery(-1);
      }
    });
  }

  /* --- Boot ---------------------------------------------------------------- */

  function boot() {
    initPlayground();
    wireQuiz();
    wireKeyboard();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
