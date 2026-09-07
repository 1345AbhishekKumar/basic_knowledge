/* ==========================================================================
   main.js — lesson flow & check-yourself quiz
   --------------------------------------------------------------------------
   Wires the RAG playground (viz.js) to the page and runs the quiz.
   Loaded after viz.js.
   ========================================================================== */

(function () {
  "use strict";

  function $(id) { return document.getElementById(id); }

  function initPlayground() {
    RAGLab.init({
      chunkBand: $("chunkBand"),
      chunkCaption: $("chunkCaption"),
      canvas: $("mapCanvas"),
      queryBtns: $("queryBtns"),
      modeBtns: $("modeBtns"),
      rankingList: $("rankingList"),
      rankingMethod: $("rankingMethod"),
      promptBox: $("promptBox"),
      answerPanel: $("answerPanel"),
      chunkSlider: $("chunkSlider"),
      chunkVal: $("chunkVal"),
      overlapSlider: $("overlapSlider"),
      overlapVal: $("overlapVal"),
      topkSlider: $("topkSlider"),
      topkVal: $("topkVal")
    });
  }

  /* --- Check yourself: one shot per question, instant feedback ------------ */

  var EXPLAIN = {
    q1: {
      right: "Exactly. RAG never changes the model's weights — knowledge lives in an external index. Retrieval reduces hallucination a lot, but nothing guarantees it: if the wrong passage is retrieved, the model answers from the wrong context.",
      wrong: "Careful — that statement is false in real systems. Retrieval makes answers far more reliable, but it can't make a model error-proof: wrong chunks in means wrong answers out. The other three statements are true descriptions of how RAG works."
    },
    q2: {
      right: "Yes. 'Change my mind' is a paraphrase of 'returns', and the harmless-looking word 'order' appears in shipping sentences too — so exact-word search goes looking in the wrong place. Semantic search matches meaning regardless of vocabulary.",
      wrong: "Not quite. The struggle is vocabulary mismatch: the question rephrases the policy, and its one shared-looking word ('order') shows up in unrelated shipping sentences. Keyword search only works when the question happens to reuse the document's exact words."
    },
    q3: {
      right: "Correct. A chunk's embedding is an average of what it contains, so mixing several topics drags its point to the middle of the map — it becomes vaguely similar to everything and precisely similar to nothing.",
      wrong: "It actually hurts precision. The meaning-map dot you saw is the average of the chunk's sentences; blend returns + warranty + shipping and the point lands in the middle, far from any single question. Size 4 chunks in the playground kept each topic clean."
    },
    q4: {
      right: "Yes — cosine similarity ignores vector length and measures only the angle, so same direction ≈ 1 no matter how different the magnitudes are.",
      wrong: "Cosine looks at direction, not length. Two vectors pointing the same way give cosine ≈ 1 even if one is ten times longer. That's part of why it's a common similarity measure for embeddings."
    },
    q5: {
      right: "Exactly. In RAG the generator is only as good as the retrieval that feeds it. If the retriever returns off-topic chunks, the model answers confidently from irrelevant context — the classic 'garbage in, garbage out' of retrieval quality.",
      wrong: "Retrieval quality is the usual culprit. The model generates from whatever context it was given; when that context is the wrong chunks, the answer is wrong regardless of the model's size or the embedding model. That's why the playground's chunking and retrieval controls matter so much."
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

          answers.forEach(function (a) {
            a.disabled = true;
            if (a === btn) {
              a.classList.add(isCorrect ? "correct" : "wrong");
              a.setAttribute("aria-pressed", "true");
            } else if (a.hasAttribute("data-correct")) {
              a.classList.add("correct");
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

  function boot() {
    initPlayground();
    wireQuiz();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
