/* ==========================================================================
   viz.js — the attention lab
   --------------------------------------------------------------------------
   Implements the scaled dot-product attention arithmetic on toy Q/K/V
   vectors and renders it as interactive heat grids.

   IMPORTANT (honesty note): the per-word vectors in this lesson are
   illustrative stand-ins tuned by hand so the *pattern* reads clearly. The
   arithmetic — dot product, ÷√d_k, softmax, weighted sum — is the real
   operation used by every transformer. A real model's vectors are learned,
   live in ~64 dimensions per head, and the model runs 8 heads per layer.

   Loads after the HTML, before main.js. No THREE, no fetch, no modules —
   fully offline.
   ========================================================================== */

(function (global) {
  "use strict";

  /* --- Toy vector machinery ---------------------------------------------- */

  // Deterministic PRNG (mulberry32). Seeded per sentence so the grids are
  // stable between page loads — identical to the numbers tuned offline.
  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  var DIM = 9;          // toy vector width  ->  d_k = 9, so we divide by √9 = 3
  var SQRT_D = Math.sqrt(DIM);
  var MAG = 3.0;        // length of each word's identity vector

  // One Box-Muller draw (two uniforms in, two gaussians out).
  function gaussPair(rnd) {
    var u1 = Math.max(rnd(), 1e-12);
    var u2 = rnd();
    var r = Math.sqrt(-2.0 * Math.log(u1));
    return [r * Math.cos(2 * Math.PI * u2), r * Math.sin(2 * Math.PI * u2)];
  }

  // Random unit vector in DIM dims (mirrors the offline tuning script: pulls
  // ceil(DIM/2) gaussian pairs, slices, then normalizes).
  function unitVector(rnd) {
    var vals = [];
    while (vals.length < DIM) {
      var p = gaussPair(rnd);
      vals.push(p[0], p[1]);
    }
    vals = vals.slice(0, DIM);
    var n = 0;
    for (var i = 0; i < DIM; i++) n += vals[i] * vals[i];
    n = Math.sqrt(n);
    var out = [];
    for (var j = 0; j < DIM; j++) out.push(vals[j] / n);
    return out;
  }

  function scale(v, s) {
    var out = [];
    for (var i = 0; i < v.length; i++) out.push(v[i] * s);
    return out;
  }

  // a + s*b
  function add(a, b, s) {
    var out = [];
    for (var i = 0; i < a.length; i++) out.push(a[i] + s * b[i]);
    return out;
  }

  function dot(a, b) {
    var s = 0;
    for (var i = 0; i < a.length; i++) s += a[i] * b[i];
    return s;
  }

  /* --- The sentences ------------------------------------------------------ */

  var SENTENCES = [
    {
      label: '"it" finds "animal"',
      words: ["The", "animal", "didn't", "cross", "the", "street", "because", "it", "was", "too", "tired"],
      refs: { it: 1 },   // "it" refers to "animal"
      note: "The classic example from the 2017 paper's own visualizations."
    },
    {
      label: '"it" finds "case"',
      words: ["The", "trophy", "didn't", "fit", "in", "its", "case", "because", "it", "was", "too", "big"],
      refs: { it: 6 },   // "it" refers to "case" (the trophy is too big FOR the case)
      note: "Here the referent comes *before* the pronoun but four words earlier."
    },
    {
      label: '"it" = fox, not rabbit',
      words: ["The", "fox", "chased", "the", "rabbit", "because", "it", "was", "hungry"],
      refs: { it: 1 },   // "it" refers to "fox" (the fox was hungry)
      note: "Two animals, one pronoun — attention must pick the hungry one."
    }
  ];

  // Semantic role buckets used to hand-tune each word's query. Keys are
  // matched on the lowercased word; everything else acts as plain content.
  var REF_PRONS = { it: true, he: true, she: true, him: true, her: true, they: true, them: true };
  var POSS_PRONS = { its: true, his: true, her: true, their: true };
  var DETS = { the: true, a: true, an: true, in: true, at: true, on: true, so: true };
  var AUX = { was: true, too: true, because: true, not: true, is: true, are: true };
  var NEG = { "didn't": true, "couldn't": true, "won't": true, "don't": true };
  var VERBS = { cross: true, fit: true, chased: true, left: true, ran: true, saw: true };

  function roleClass(w) {
    if (REF_PRONS[w]) return "pron";
    if (POSS_PRONS[w]) return "poss";
    if (DETS[w]) return "det";
    if (NEG[w]) return "neg";
    if (AUX[w]) return "aux";
    if (VERBS[w]) return "verb";
    return "content";
  }

  // Build one sentence's toy vectors: identity ids, values, then queries for
  // the "meaning" head and the "position" head.
  function buildSentence(si) {
    var words = SENTENCES[si].words;
    var refs = SENTENCES[si].refs;
    var n = words.length;
    var rnd = mulberry32(100 + si * 977);   // seeds match the tuning runs

    var ids = [];
    for (var i = 0; i < n; i++) ids.push(scale(unitVector(rnd), MAG));

    // value = the word's identity ("content") + a little learned-looking noise
    var v = [];
    for (var k = 0; k < n; k++) v.push(add(ids[k], scale(unitVector(rnd), 0.15)));

    var nextIdx = function (i) { return Math.min(i + 1, n - 1); };

    // ---- meaning head: hand-tuned query *directions* -----------------------
    var qMeaning = [];
    for (var m = 0; m < n; m++) {
      var w = words[m].toLowerCase();
      var cls = roleClass(w);
      if (refs[w] !== undefined) {
        // pronoun: query points mostly at its referent's key, a little at self
        qMeaning.push(add(ids[refs[w]], ids[m], 0.35));
      } else if (cls === "poss") {
        qMeaning.push(add(ids[m], ids[nextIdx(m)], 0.3));
      } else if (cls === "det") {
        // determiner: leans on the noun that follows
        qMeaning.push(add(ids[nextIdx(m)], ids[m], 0.15));
      } else if (cls === "neg") {
        qMeaning.push(add(ids[m], ids[nextIdx(m)], 0.45));
      } else if (cls === "aux") {
        qMeaning.push(add(ids[m], ids[nextIdx(m)], 0.4));
      } else if (cls === "verb") {
        qMeaning.push(add(ids[m], ids[nextIdx(m)], 0.25));
      } else {
        qMeaning.push(ids[m]);   // content words mostly attend to themselves
      }
    }

    // ---- position head: "which word comes next?" ---------------------------
    var qPosition = [];
    for (var p = 0; p < n; p++) {
      qPosition.push(add(ids[nextIdx(p)], ids[p], 0.25));
    }

    return { words: words, qMeaning: qMeaning, qPosition: qPosition, k: ids, v: v };
  }

  /* --- Scaled dot-product attention --------------------------------------- */

  // Returns { weights, scaled, scores, output } for one query vector against
  // all keys, exactly as Attention(Q,K,V) = softmax(QK^T / sqrt(d_k)) V.
  function attentionRow(q, K, V) {
    var n = K.length;
    var scores = [];
    for (var i = 0; i < n; i++) scores.push(dot(q, K[i]));
    var scaled = [];
    for (var j = 0; j < n; j++) scaled.push(scores[j] / SQRT_D);   // ÷ √d_k

    // softmax (numerically stable: subtract the max before exp)
    var mx = -Infinity;
    for (var s = 0; s < n; s++) if (scaled[s] > mx) mx = scaled[s];
    var exps = [];
    var total = 0;
    for (var e = 0; e < n; e++) {
      exps.push(Math.exp(scaled[e] - mx));
      total += exps[e];
    }
    var weights = [];
    for (var wI = 0; wI < n; wI++) weights.push(exps[wI] / total);

    var out = [];
    for (var d = 0; d < DIM; d++) out.push(0);
    for (var wJ = 0; wJ < n; wJ++) {
      for (var dd = 0; dd < DIM; dd++) out[dd] += weights[wJ] * V[wJ][dd];
    }
    return { weights: weights, scaled: scaled, scores: scores, output: out };
  }

  // Whole attention matrix for one head of one sentence.
  function matrix(sentence, head) {
    var qs = head === "position" ? sentence.qPosition : sentence.qMeaning;
    var rows = [];
    for (var i = 0; i < qs.length; i++) {
      rows.push(attentionRow(qs[i], sentence.k, sentence.v));
    }
    return rows;
  }

  /* --- Rendering ----------------------------------------------------------- */

  function fmt2(x) { return (Math.round(x * 100) / 100).toFixed(2); }
  function pct(x) { return Math.round(x * 100); }

  // Heat color: accent blue over the dark stage, intensity ~ weight.
  function fillAlpha(w) { return 0.05 + 0.88 * Math.pow(w, 0.55); }

  var HEAD_INFO = {
    meaning: {
      id: "meaning",
      title: "Head — meaning & coreference",
      caption: 'A "content" head (illustrative). Watch the pronoun "it" point at its referent.'
    },
    position: {
      id: "position",
      title: "Head — next word",
      caption: 'A "position" head (illustrative). Each word watches the word right after it.'
    }
  };

  /* --- Module state -------------------------------------------------------- */

  var els = null;              // container elements, injected by init()
  var state = {
    sentence: 0,
    head: "meaning",           // "meaning" | "position" | "both"
    activeHead: "meaning",     // which grid the readout/math currently shows
    query: -1,                 // selected row (query word)
    cell: null                 // selected (row, col) pair or null
  };
  var built = null;            // { sentenceData, matrices: {meaning, position} }

  function currentWords() { return built.sentenceData.words; }

  function pronounIndex(words) {
    for (var i = 0; i < words.length; i++) {
      if (REF_PRONS[words[i].toLowerCase()]) return i;
    }
    return 0;
  }

  /* --- Builders ------------------------------------------------------------ */

  function buildSentenceButtons() {
    var wrap = els.sentenceBtns;
    wrap.innerHTML = "";
    SENTENCES.forEach(function (s, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = s.label;
      b.setAttribute("aria-pressed", String(i === state.sentence));
      b.addEventListener("click", function () { api.setSentence(i); });
      wrap.appendChild(b);
    });
  }

  function buildHeadButtons() {
    var wrap = els.headBtns;
    wrap.innerHTML = "";
    var opts = [
      { id: "meaning", label: "Meaning head" },
      { id: "position", label: "Position head" },
      { id: "both", label: "Both heads" }
    ];
    opts.forEach(function (o) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = o.label;
      b.setAttribute("aria-pressed", String(state.head === o.id));
      b.addEventListener("click", function () { api.setHead(o.id); });
      wrap.appendChild(b);
    });
  }

  // Token chips let the learner pick the query word directly.
  function buildTokenChips() {
    var wrap = els.tokenChips;
    if (!wrap) return;
    wrap.innerHTML = "";
    var words = currentWords();
    words.forEach(function (w, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "tok-chip";
      b.textContent = w;
      b.setAttribute("aria-pressed", String(i === state.query));
      b.addEventListener("click", function () { api.setQuery(i); });
      wrap.appendChild(b);
    });
  }

  function cellButton(headId, words, i, j, w, isSel) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "heat-cell" + (isSel ? " sel" : "");
    b.setAttribute("aria-label", "attention from " + words[i] + " to " + words[j] + ": " + pct(w) + " percent");
    b.title = words[i] + " \u2192 " + words[j] + ": " + pct(w) + "%";
    b.style.setProperty("--fill", fillAlpha(w).toFixed(3));
    b.addEventListener("click", function () { api.selectCell(i, j, headId); });
    return b;
  }

  // One heat grid for a given head's weight matrix.
  function buildGrid(headId) {
    var words = currentWords();
    var n = words.length;
    var rows = built.matrices[headId];

    var stage = document.createElement("div");
    stage.className = "stage";

    var title = document.createElement("p");
    title.className = "stage-title";
    title.textContent = HEAD_INFO[headId].title;
    stage.appendChild(title);

    var cap = document.createElement("p");
    cap.className = "stage-caption";
    cap.textContent = HEAD_INFO[headId].caption;
    stage.appendChild(cap);

    var wrapDiv = document.createElement("div");
    wrapDiv.className = "grid-wrap";

    var grid = document.createElement("div");
    grid.className = "heat-grid";
    var cols = "auto " + Array(n).fill("minmax(30px, 1fr)").join(" ");
    grid.style.gridTemplateColumns = cols;

    // corner + column headers
    var corner = document.createElement("div");
    corner.className = "heat-blank";
    grid.appendChild(corner);
    words.forEach(function (w) {
      var l = document.createElement("div");
      l.className = "heat-label col";
      l.textContent = w;
      grid.appendChild(l);
    });

    // one row per query word
    for (var i = 0; i < n; i++) {
      var lab = document.createElement("div");
      lab.className = "heat-label" + (i === state.query ? " qrow" : "");
      lab.textContent = words[i];
      grid.appendChild(lab);

      for (var j = 0; j < n; j++) {
        var w = rows[i].weights[j];
        var isSel = state.cell && state.activeHead === headId &&
                    state.cell[0] === i && state.cell[1] === j;
        grid.appendChild(cellButton(headId, words, i, j, w, isSel));
      }
    }

    wrapDiv.appendChild(grid);
    stage.appendChild(wrapDiv);
    return stage;
  }

  function renderGrids() {
    els.gridArea.innerHTML = "";
    if (state.head === "both") {
      els.gridArea.appendChild(buildGrid("meaning"));
      els.gridArea.appendChild(buildGrid("position"));
    } else {
      els.gridArea.appendChild(buildGrid(state.head));
    }
    buildTokenChips();
  }

  /* --- Readout & math panel ----------------------------------------------- */

  function fmtVec(vec) {
    var parts = [];
    for (var i = 0; i < vec.length; i++) parts.push(fmt2(vec[i]));
    return "[ " + parts.join(", ") + " ]";
  }

  function topContributors(row, words, k) {
    // indices sorted by weight, descending
    var idx = row.weights.map(function (_, i) { return i; });
    idx.sort(function (a, b) { return row.weights[b] - row.weights[a]; });
    var out = [];
    for (var i = 0; i < Math.min(k, idx.length); i++) {
      out.push({ word: words[idx[i]], w: row.weights[idx[i]] });
    }
    return out;
  }

  // The "selected word" readout: bars of the whole attention row.
  function renderReadout() {
    var words = currentWords();
    var i = state.query;
    var headId = state.activeHead;
    var row = built.matrices[headId][i];

    var selWord = words[i];
    var top = topContributors(row, words, 3);

    var html = "";
    html += '<p class="m-label">' + escapeHtml(SENTENCES[state.sentence].note) + "</p>";
    html += '<h4>Reading <span class="chip q">' + escapeHtml(selWord) + "</span> (row " + i + ")</h4>";
    html += '<p class="selected-line">' + escapeHtml(selWord) +
      " gives <strong>" + top[0].word + " " + pct(top[0].w) + "%</strong> of its attention" +
      (top.length > 1 ? ", then " + top[1].word + " " + pct(top[1].w) + "% and " + top[2].word + " " + pct(top[2].w) + "%." : ".") +
      " The row below shows the full distribution." +
      " This is the distribution softmax produced — it always sums to 100%.</p>";

    html += '<div class="bars">';
    for (var j = 0; j < words.length; j++) {
      var w = row.weights[j];
      html += '<div class="bar-row">';
      html += '<span class="bar-token">' + escapeHtml(words[j]) + "</span>";
      html += '<span class="bar-track"><span class="bar-fill" style="width:' + (w * 100).toFixed(1) + '%"></span></span>';
      html += '<span class="bar-pct">' + pct(w) + "%</span>";
      html += "</div>";
    }
    html += "</div>";

    els.readout.innerHTML = html;
  }

  // Detailed four-step arithmetic for one (query, key) pair.
  function renderMath(i, j) {
    var words = currentWords();
    var headId = state.activeHead;
    var sData = built.sentenceData;
    var qs = headId === "position" ? sData.qPosition : sData.qMeaning;
    var row = built.matrices[headId][i];

    var raw = dot(qs[i], sData.k[j]);          // step 1: raw dot product
    var scaledVal = raw / SQRT_D;              // step 2: ÷ √d_k

    // step 3: softmax over the whole row (stable exp: subtract row max)
    var rowMax = -Infinity;
    for (var mI = 0; mI < row.scaled.length; mI++) {
      if (row.scaled[mI] > rowMax) rowMax = row.scaled[mI];
    }
    var sumExp = 0;
    for (var eI = 0; eI < row.scaled.length; eI++) {
      sumExp += Math.exp(row.scaled[eI] - rowMax);
    }
    var w = Math.exp(scaledVal - rowMax) / sumExp;

    var headName = HEAD_INFO[headId].title.replace("Head — ", "");
    var top = topContributors(row, words, 2);

    var html = "";
    html += "<h4>Show me the math: " + escapeHtml(words[i]) + " \u2192 " + escapeHtml(words[j]) + "</h4>";
    html += '<p class="m-label">Head: ' + escapeHtml(headName) +
      " · toy dimension d\u2096 = " + DIM + " (\u221ad\u2096 = 3; the 2017 model used d\u2096 = 64, \u221ad\u2096 = 8)</p>";

    html += step("1", "Raw score — dot product",
      "score = q(" + escapeHtml(words[i]) + ") · k(" + escapeHtml(words[j]) + ") = " + fmt2(raw) +
      " — how aligned this word's query is with that word's key. It can be negative, and it is not yet a probability.");
    html += step("2", "Scale — keep softmax gradients healthy",
      "scaled = " + fmt2(raw) + " ÷ \u221a" + DIM + " = " + fmt2(scaledVal) +
      " — without this, dot products grow with the vector width and push softmax into the tiny-gradient region where learning stalls.");
    html += step("3", "Softmax over the whole row — weights that sum to 1",
      "w(" + escapeHtml(words[j]) + ") = exp(" + fmt2(scaledVal) + ") ÷ \u03a3 exp(scaled) = <strong>" + pct(w) + "%</strong>" +
      " — the other " + (words.length - 1) + " words share the remaining " + (100 - pct(w)) + "%.");
    html += step("4", "Blend — output is the weighted sum of every word's value",
      "output(" + escapeHtml(words[i]) + ") = \u03a3 w·v = " + fmtVec(row.output) +
      " — mostly " + top[0].word + " and " + top[1].word +
      " content. This context-rich vector is what the next layer receives.");

    html += "<div class=\"result\">Attention(" + escapeHtml(words[i]) + ", all words) = softmax( q·K\u1d40 ÷ \u221ad\u2096 ) · V</div>";
    els.mathPanel.innerHTML = html;
  }

  function step(no, label, body) {
    return '<div class="mstep"><span class="m-no">' + no + "</span>" +
      "<div><strong>" + escapeHtml(label) + "</strong><br>" + body + "</div></div>";
  }

  function escapeHtml(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function renderAll() {
    buildSentenceButtons();
    buildHeadButtons();
    renderGrids();
    if (state.query < 0) state.query = 0;
    renderReadout();
    if (state.cell) renderMath(state.cell[0], state.cell[1]);
  }

  /* --- Public API ---------------------------------------------------------- */

  // Rebuild the sentence data + both heads' matrices, then re-point the
  // selection at the pronoun row's strongest cell.
  function loadSentence(i) {
    state.sentence = i;
    state.activeHead = "meaning";
    var sd = buildSentence(i);
    built = {
      sentenceData: sd,
      matrices: {
        meaning: matrix(sd, "meaning"),
        position: matrix(sd, "position")
      }
    };
    var words = currentWords();
    state.query = pronounIndex(words);
    state.cell = [state.query, strongestCol(state.query, "meaning")];
  }

  // Column index of the biggest weight in row i of the given head.
  function strongestCol(i, headId) {
    var row = built.matrices[headId][i];
    var best = 0;
    for (var j = 1; j < row.weights.length; j++) {
      if (row.weights[j] > row.weights[best]) best = j;
    }
    return best;
  }

  var api = {
    init: function (elsIn) {
      els = elsIn;
      loadSentence(state.sentence);
      renderAll();
    },

    setSentence: function (i) {
      if (i === state.sentence) return;
      loadSentence(i);
      renderAll();
    },

    setHead: function (h) {
      state.head = h;
      if (h !== "both") state.activeHead = h;
      renderAll();
    },

    setQuery: function (i) {
      state.query = i;
      // jump the selection to the strongest cell of the new row so the math
      // panel always shows something interesting
      state.cell = [i, strongestCol(i, state.activeHead)];
      renderAll();
    },

    selectCell: function (i, j, headId) {
      state.query = i;
      state.cell = [i, j];
      if (headId) state.activeHead = headId;
      renderAll();
    },

    // Keyboard support: left/right move the selected word (row).
    moveQuery: function (delta) {
      var n = currentWords().length;
      var next = (state.query + delta + n) % n;
      api.setQuery(next);
    },

    sentenceCount: function () { return SENTENCES.length; },
    headInfo: HEAD_INFO,
    matrixFor: function (sentenceIdx, headId) {
      return matrix(buildSentence(sentenceIdx), headId);
    },
    fmtVec: fmtVec,
    fmt2: fmt2
  };

  global.AttentionLab = api;
})(window);
