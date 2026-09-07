/* ==========================================================================
   viz.js — the RAG playground
   --------------------------------------------------------------------------
   A miniature knowledge base ("Aurora Electronics policy") the learner can
   chunk, embed, and query. Real pipeline, honest schematic:

   - Chunking is REAL: sentences are grouped by chunk size & overlap exactly
     as a document splitter would group them.
   - The "embeddings" are 2-D stand-ins (each sentence has a hand-placed
     point; a chunk's point is the average of its sentences' points) so the
     geometry — meaning lands near meaning, mixed chunks drift to the middle —
     is visible on a flat map. Real embeddings live in hundreds of dimensions.
   - Retrieval is REAL arithmetic on those points: nearest chunk wins
     (semantic mode) or exact-word overlap wins (keyword mode).
   - Generation is SIMULATED: no model runs here. We show the retrieved
     context and whether the sentence containing the true answer reached it.

   Loads after the HTML, before main.js. No modules, no fetch — fully
   offline, file:// friendly.
   ========================================================================== */

(function (global) {
  "use strict";

  /* --- Topic colors (must match the stage legend in index.html) ---------- */
  var TOPICS = {
    returns:  { label: "returns",  color: "#4f9dff" },
    warranty: { label: "warranty", color: "#ff8a65" },
    shipping: { label: "shipping", color: "#ffd166" }
  };
  var COLOR_MIXED = "#94a3b8";   // chunk blending several topics
  var COLOR_QUERY = "#ffffff";
  var COLOR_ANSWER = "#7dd3fc";

  // Dark text on light chips (yellow is too light for white text).
  var DARK_TEXT = { "#ffd166": "#1f2430" };

  /* --- The document --------------------------------------------------------
     One 12-sentence policy in document order: returns (1-4), warranty (5-8),
     shipping (9-12). Each sentence gets a hand-placed meaning point on a
     0-100 map so that "about the same thing" lands nearby.
     ------------------------------------------------------------------------ */
  var DOC = [
    { id: "r1", topic: "returns",
      text: "Returns are accepted within 30 days of delivery, as long as the item is in its original condition.",
      x: 18, y: 72 },
    { id: "r2", topic: "returns",
      text: "To start a return, open your account and print the prepaid shipping label.",
      x: 30, y: 78 },
    { id: "r3", topic: "returns",
      text: "Refunds go back to the original payment method within five business days.",
      x: 24, y: 84 },
    { id: "r4", topic: "returns",
      text: "Returned gifts are issued as store credit.",
      x: 36, y: 72 },
    { id: "w5", topic: "warranty",
      text: "Every Aurora product includes a one-year limited warranty.",
      x: 70, y: 20 },
    { id: "w6", topic: "warranty",
      text: "The warranty covers manufacturing defects and accidental damage.",
      x: 78, y: 26 },
    { id: "w7", topic: "warranty",
      text: "Accidental damage coverage excludes liquid damage and lost devices.",
      x: 70, y: 32 },
    { id: "w8", topic: "warranty",
      text: "Warranty service requires proof of purchase.",
      x: 82, y: 20 },
    { id: "s9", topic: "shipping",
      text: "Orders over $50 ship free with standard ground shipping.",
      x: 74, y: 74 },
    { id: "s10", topic: "shipping",
      text: "Standard delivery takes three to five business days.",
      x: 66, y: 80 },
    { id: "s11", topic: "shipping",
      text: "Expedited shipping costs an extra fee at checkout.",
      x: 76, y: 86 },
    { id: "s12", topic: "shipping",
      text: "International orders may be subject to customs duties.",
      x: 86, y: 78 }
  ];

  /* --- The questions -------------------------------------------------------
     Each question has a hand-placed meaning point near the sentence that
     truly answers it (the "target"). The words are chosen so the four
     retrievers behave differently:
       q1  paraphrase  — keyword search is lured away by "order" (shipping)
       q2  paraphrase  — no word overlaps the document at all (empty keyword)
       q3  exact words — keyword search succeeds easily
       q4  near match  — keyword search mostly works but with noise
     ------------------------------------------------------------------------ */
  var QUERIES = [
    {
      label: "How long do I have to change my mind about an order?",
      target: "r1", x: 12, y: 70,
      note: "The policy says returns are accepted within 30 days — but the question shares almost no words with that sentence."
    },
    {
      label: "My phone dropped in water — will you fix it?",
      target: "w7", x: 62, y: 38,
      note: "The policy says accidental-damage coverage excludes liquid damage. The question and the answer use completely different words."
    },
    {
      label: "What happens to returned gifts?",
      target: "r4", x: 42, y: 74,
      note: "The question repeats the document's exact words, so keyword search has an easy day."
    },
    {
      label: "Do you charge extra for faster shipping?",
      target: "s11", x: 70, y: 88,
      note: "Mostly exact words again — but 'shipping' also appears in the returns sentence, so keyword search picks up noise."
    }
  ];

  /* --- Keyword stopwords (removed before exact-word matching) ------------- */
  var STOPWORDS = {};
  ("a an the do does did is are was were i me my mine you your we our us to of in on for " +
   "with at from by about how long what when where which who will would can could should " +
   "have has had it its this that these those be been being if then than so or and but not " +
   "as over under up down out more most any want need get got may might").split(" ").forEach(function (w) {
    STOPWORDS[w] = true;
  });

  function tokenize(text) {
    return text.toLowerCase().replace(/[^a-z0-9\s$]/g, " ").split(/\s+/).filter(function (t) {
      return t.length > 0 && !STOPWORDS[t];
    });
  }

  // Exact-word-ish match with light inflection handling (plural / -ed / -ing).
  // Used ONLY by the keyword retriever to imitate a naive token search.
  function kwMatch(queryToken, docToken) {
    if (queryToken === docToken) return true;
    var forms = [queryToken + "s", queryToken + "ed", queryToken + "ing", queryToken + "es"];
    if (forms.indexOf(docToken) !== -1) return true;
    // doc token could be the base form of an inflected query token
    return [docToken + "s", docToken + "ed", docToken + "ing", docToken + "es"].indexOf(queryToken) !== -1;
  }

  /* --- Chunking (real grouping logic) -------------------------------------- */
  // Standard sliding window: chunk j covers document sentences
  //   [j*step , j*step + size)  where  step = size - overlap.
  // With overlap > 0 consecutive windows share sentences (duplicates).
  function chunkDoc(size, overlap) {
    var n = DOC.length;
    var step = size - overlap;          // > 0 guaranteed by callers
    var chunks = [];
    var start = 0;
    while (start < n) {
      var from = start;
      var to = Math.min(n - 1, start + size - 1);
      var sents = [];
      for (var i = from; i <= to; i++) sents.push(DOC[i]);
      chunks.push(makeChunk(sents, chunks.length));
      start += step;
    }
    return chunks;
  }

  function makeChunk(sents, index) {
    // count how many chunks each sentence belongs to (for overlap marking)
    var topicCounts = {};
    var s, i;
    for (i = 0; i < sents.length; i++) {
      var t = sents[i].topic;
      topicCounts[t] = (topicCounts[t] || 0) + 1;
    }
    var bestTopic = null, bestN = 0;
    for (var tp in topicCounts) {
      if (topicCounts[tp] > bestN) { bestN = topicCounts[tp]; bestTopic = tp; }
    }
    var mixed = Object.keys(topicCounts).length > 1;

    // embedding = average of the member sentences' meaning points
    var cx = 0, cy = 0;
    for (i = 0; i < sents.length; i++) { cx += sents[i].x; cy += sents[i].y; }
    cx /= sents.length; cy /= sents.length;

    var text = "";
    for (i = 0; i < sents.length; i++) {
      text += (i > 0 ? " " : "") + sents[i].text;
    }

    return {
      id: "C" + (index + 1),
      sentences: sents,
      topic: mixed ? null : bestTopic,
      mixed: mixed,
      dominantTopic: bestTopic,
      cx: cx, cy: cy,
      text: text
    };
  }

  // every sentence's ids with their chunk membership count (for overlap badges)
  function membership(chunks) {
    var mem = {};
    var c, s;
    for (c = 0; c < chunks.length; c++) {
      for (s = 0; s < chunks[c].sentences.length; s++) {
        var id = chunks[c].sentences[s].id;
        mem[id] = (mem[id] || 0) + 1;
      }
    }
    return mem;
  }

  /* --- Retrievers ---------------------------------------------------------- */

  // Semantic: nearest chunk point to the question point wins.
  // Returns per-chunk distance and a derived similarity score (higher = closer).
  function semanticRank(chunks, qx, qy) {
    var withDist = chunks.map(function (c) {
      var dx = c.cx - qx, dy = c.cy - qy;
      return { chunk: c, dist: Math.sqrt(dx * dx + dy * dy) };
    });
    withDist.sort(function (a, b) { return a.dist - b.dist; });
    // Absolute-ish similarity: map diagonal is ~141, so a fixed 120 reference
    // keeps scores meaningful even with a single chunk (vs score-of-itself).
    withDist.forEach(function (r) {
      r.score = Math.max(0, Math.min(100, Math.round(100 * (1 - r.dist / 120))));
      r.detail = "dist " + r.dist.toFixed(0);
    });
    return withDist;
  }

  // Keyword: count exact-word matches between question and chunk text.
  function keywordRank(chunks, queryTokens) {
    var rows = chunks.map(function (c) {
      var docTokens = tokenize(c.text);
      var hits = 0, matched = [];
      queryTokens.forEach(function (qt) {
        var found = false;
        for (var i = 0; i < docTokens.length; i++) {
          if (kwMatch(qt, docTokens[i])) { found = true; hits++; }
        }
        if (found) matched.push(qt);
      });
      return { chunk: c, hits: hits, matched: matched };
    });
    rows.sort(function (a, b) { return b.hits - a.hits; });
    var maxHits = rows.length ? rows[0].hits : 0;
    rows.forEach(function (r) {
      r.score = maxHits > 0 ? Math.round(100 * r.hits / maxHits) : 0;
      r.detail = r.hits + (r.hits === 1 ? " word" : " words");
    });
    return rows;
  }

  /* --- Module state --------------------------------------------------------- */

  var els = null;
  var state = {
    query: 0,              // index into QUERIES
    mode: "semantic",      // "semantic" | "keyword"
    chunkSize: 4,
    overlap: 0,
    topK: 1
  };
  var current = null;      // { chunks, rows, targetRow, chunkOfSentence, mem }
  var reducedMotion = false;
  var pulse = 0;           // animated ring phase

  function activeQuery() { return QUERIES[state.query]; }
  function clampTopK(k, nChunks) { return Math.max(1, Math.min(k, nChunks)); }

  /* --- Recompute from state -------------------------------------------------- */

  function compute() {
    var q = activeQuery();
    var chunks = chunkDoc(state.chunkSize, state.overlap);
    var rows = state.mode === "semantic"
      ? semanticRank(chunks, q.x, q.y)
      : keywordRank(chunks, tokenize(q.label));

    // which chunk(s) contain the sentence that truly answers the question
    var targetChunks = [];
    chunks.forEach(function (c) {
      for (var i = 0; i < c.sentences.length; i++) {
        if (c.sentences[i].id === q.target) { targetChunks.push(c.id); break; }
      }
    });

    var k = clampTopK(state.topK, chunks.length);
    var retrieved = [];
    for (var r = 0; r < k; r++) if (rows[r] && (state.mode === "semantic" || rows[r].hits > 0)) retrieved.push(rows[r]);

    var targetRetrieved = false;
    retrieved.forEach(function (row) {
      if (targetChunks.indexOf(row.chunk.id) !== -1) targetRetrieved = true;
    });

    var targetRank = -1;
    for (var r2 = 0; r2 < rows.length; r2++) {
      if (targetChunks.indexOf(rows[r2].chunk.id) !== -1) { targetRank = r2; break; }
    }

    current = {
      chunks: chunks,
      rows: rows,
      retrieved: retrieved,
      k: k,
      targetChunks: targetChunks,
      targetRetrieved: targetRetrieved,
      targetRank: targetRank,          // 0-based rank of first chunk holding the answer, -1 if split away
      mem: membership(chunks),
      nMixed: chunks.filter(function (c) { return c.mixed; }).length
    };
  }

  /* --- HTML helpers ---------------------------------------------------------- */

  function escapeHtml(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function topicColor(sentence) { return TOPICS[sentence.topic].color; }

  function chipColor(chunk) {
    if (!chunk.mixed && chunk.topic) return TOPICS[chunk.topic].color;
    return COLOR_MIXED;
  }
  function chipInk(chunk) {
    var c = chipColor(chunk);
    return DARK_TEXT[c] || "#ffffff";
  }

  /* --- Render: chunk band (top of stage) ------------------------------------- */

  function renderChunkBand() {
    var q = activeQuery();
    var wrap = els.chunkBand;
    wrap.innerHTML = "";

    // first occurrence of a sentence is primary; with overlap on, the
    // repeated copies appear dimmed (marked .dup)
    var seen = {};

    current.chunks.forEach(function (c) {
      var row = document.createElement("div");
      row.className = "chunk-row";

      var tag = document.createElement("span");
      tag.className = "chunk-tag";
      tag.style.background = chipColor(c);
      tag.style.color = chipInk(c);
      tag.textContent = c.id;
      row.appendChild(tag);

      var col = document.createElement("div");
      col.className = "chunk-sents";

      c.sentences.forEach(function (s) {
        var el = document.createElement("div");
        el.className = "sent";
        el.style.borderLeftColor = topicColor(s);
        if (seen[s.id]) el.classList.add("dup");   // overlap copy
        seen[s.id] = true;

        var idSpan = document.createElement("span");
        idSpan.className = "sent-id";
        idSpan.textContent = s.id + (el.classList.contains("dup") ? " (again)" : "");
        el.appendChild(idSpan);

        var txt = document.createTextNode(s.text);
        el.appendChild(txt);

        if (s.id === q.target) {
          el.classList.add("is-target");
          var mark = document.createElement("span");
          mark.className = "sent-mark";
          mark.textContent = " ← the answer lives here";
          el.appendChild(mark);
        }
        col.appendChild(el);
      });

      row.appendChild(col);
      wrap.appendChild(row);
    });

    // caption describing the current chunking
    var parts = [];
    parts.push("Chunk size " + state.chunkSize +
      (state.overlap > 0 ? " with " + state.overlap + "-sentence overlap" : ", no overlap") +
      " → " + current.chunks.length + " chunk" + (current.chunks.length === 1 ? "" : "s") + ".");
    if (current.nMixed === 0) {
      parts.push("Each chunk holds one topic — clean points on the map.");
    } else if (current.nMixed === current.chunks.length) {
      parts.push("Every chunk mixes topics, so every point slides toward the middle of the map — vaguely similar to everything, precisely similar to nothing.");
    } else {
      parts.push(current.nMixed + " chunk" + (current.nMixed === 1 ? " mixes" : "s mix") + " topics — watch it slide toward the middle of the map.");
    }
    els.chunkCaption.textContent = parts.join(" ");
  }

  /* --- Render: meaning map canvas -------------------------------------------- */

  function mapGeom() {
    // map the 0..100 point space into the canvas with padding
    var pad = 26;
    var w = els.canvas.width, h = els.canvas.height;
    function sx(x) { return pad + (w - 2 * pad) * x / 100; }
    function sy(y) { return pad + (h - 2 * pad) * y / 100; }
    return { sx: sx, sy: sy };
  }

  function drawMap() {
    if (!current) return;                 // nothing computed yet (first boot)
    var canvas = els.canvas;
    var ctx = canvas.getContext("2d");
    var g = mapGeom();
    var w = canvas.width, h = canvas.height;
    var q = activeQuery();

    ctx.clearRect(0, 0, w, h);

    // subtle grid (helps judge the layout)
    ctx.strokeStyle = "rgba(143,160,189,0.07)";
    ctx.lineWidth = 1;
    for (var gx = 0; gx <= 100; gx += 20) {
      ctx.beginPath();
      ctx.moveTo(g.sx(gx), g.sy(0));
      ctx.lineTo(g.sx(gx), g.sy(100));
      ctx.stroke();
    }
    for (var gy = 0; gy <= 100; gy += 20) {
      ctx.beginPath();
      ctx.moveTo(g.sx(0), g.sy(gy));
      ctx.lineTo(g.sx(100), g.sy(gy));
      ctx.stroke();
    }

    // faint per-sentence micro-dots (the "true" meaning of each sentence)
    DOC.forEach(function (s) {
      ctx.beginPath();
      ctx.arc(g.sx(s.x), g.sy(s.y), 3, 0, Math.PI * 2);
      ctx.fillStyle = TOPICS[s.topic].color;
      ctx.globalAlpha = 0.35;
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    // chunk points (the stored embeddings)
    current.chunks.forEach(function (c) {
      var col = chipColor(c);
      var px = g.sx(c.cx), py = g.sy(c.cy);
      var r = 7 + 1.4 * c.sentences.length;

      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.globalAlpha = 0.9;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.stroke();

      // chunk id label
      ctx.font = "600 13px ui-monospace, Consolas, monospace";
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(223,230,242,0.92)";
      ctx.fillText(c.id, px, py - r - 5);
    });

    // query point + retrieval links
    var qx = g.sx(q.x), qy = g.sy(q.y);

    current.retrieved.forEach(function (row, idx) {
      var c = row.chunk;
      var px = g.sx(c.cx), py = g.sy(c.cy);
      ctx.beginPath();
      ctx.moveTo(qx, qy);
      ctx.lineTo(px, py);
      ctx.strokeStyle = idx === 0 ? "rgba(125,211,252,0.85)" : "rgba(125,211,252,0.4)";
      ctx.lineWidth = idx === 0 ? 2 : 1;
      ctx.stroke();
    });

    // query dot (white ring, gentle pulse when animation is allowed)
    var ring = 10 + 4 * Math.sin(pulse * Math.PI * 2) * (reducedMotion ? 0 : 1);
    ctx.beginPath();
    ctx.arc(qx, qy, 12, 0, Math.PI * 2);
    ctx.strokeStyle = COLOR_QUERY;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(qx, qy, ring, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.font = "600 12px -apple-system, 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(223,230,242,0.95)";
    ctx.fillText("your question", qx, qy + 30);
  }

  /* --- Render: ranking list ---------------------------------------------------- */

  function renderRanking() {
    var q = activeQuery();
    var list = els.rankingList;
    list.innerHTML = "";

    var methodLabel = state.mode === "semantic"
      ? "Nearest point on the map wins. Score = closeness to your question (real systems usually use cosine similarity over hundreds of dimensions)."
      : "Chunks are scored by how many exact question words they contain. Score = matched words (shown), best chunk = 100%.";
    els.rankingMethod.textContent = methodLabel;

    current.rows.forEach(function (row, idx) {
      var c = row.chunk;
      var inTopK = false;
      current.retrieved.forEach(function (r) { if (r.chunk === c) inTopK = true; });
      var holdsAnswer = current.targetChunks.indexOf(c.id) !== -1;

      var div = document.createElement("div");
      div.className = "rank-row" + (inTopK ? " in-topk" : "") + (holdsAnswer && !inTopK ? " missing" : "");

      var no = document.createElement("span");
      no.className = "rank-no";
      no.textContent = "#" + (idx + 1);
      div.appendChild(no);

      var chip = document.createElement("span");
      chip.className = "rank-chip";
      chip.style.background = chipColor(c);
      chip.style.color = chipInk(c);
      chip.textContent = c.id;
      div.appendChild(chip);

      var snip = document.createElement("span");
      snip.className = "rank-snippet";
      snip.textContent = c.text.length > 110 ? c.text.slice(0, 107) + "…" : c.text;
      div.appendChild(snip);

      var score = document.createElement("span");
      score.className = "rank-score";
      score.title = state.mode === "keyword" && row.matched.length
        ? "matched: " + row.matched.join(", ")
        : "";
      score.textContent = state.mode === "semantic"
        ? row.score + "%"
        : (row.hits > 0 ? "✱ " + row.hits : "no match");
      div.appendChild(score);

      if (holdsAnswer && !inTopK) {
        var note = document.createElement("p");
        note.className = "rank-has-answer";
        note.textContent = "⚠ the sentence that answers this question lives in " + c.id +
          (current.targetRank >= 0 ? " (rank #" + (current.targetRank + 1) + ")" : "") +
          " — it did not reach the model.";
        div.appendChild(note);
      } else if (holdsAnswer && inTopK) {
        var ok = document.createElement("p");
        ok.className = "rank-has-answer";
        ok.textContent = "✓ contains the sentence that answers this question.";
        div.appendChild(ok);
      }

      list.appendChild(div);
    });

    // keyword mode with zero hits anywhere
    if (state.mode === "keyword") {
      var totalHits = 0;
      current.rows.forEach(function (r) { totalHits += r.hits; });
      if (totalHits === 0) {
        var empty = document.createElement("p");
        empty.className = "rank-has-answer";
        empty.textContent = "No chunk shares an exact word with the question — keyword retrieval returns nothing.";
        list.appendChild(empty);
      }
    }
  }

  /* --- Render: the prompt + verdict --------------------------------------------- */

  function sentById(id) {
    for (var i = 0; i < DOC.length; i++) if (DOC[i].id === id) return DOC[i];
    return null;
  }

  function renderPrompt() {
    var q = activeQuery();
    var box = els.promptBox;
    var html = "";
    var empty = current.retrieved.length === 0;
    box.classList.toggle("empty", empty);

    html += '<span class="instr-line">Answer the question using only the context below. Cite the chunk you used.</span>';

    if (empty) {
      html += '<span class="ctx-line">— no context retrieved —</span>';
    } else {
      current.retrieved.forEach(function (row) {
        var c = row.chunk;
        var txt = c.text.length > 150 ? c.text.slice(0, 147) + "…" : c.text;
        html += '<span class="ctx-line"><span class="ctx-tag">[' + c.id + "]</span> " + escapeHtml(txt) + "</span>";
      });
    }

    html += '<span class="question-line">Q: ' + escapeHtml(q.label) + "</span>";
    box.innerHTML = html;
  }

  function renderVerdict() {
    var q = activeQuery();
    var targetSent = sentById(q.target);
    var box = els.answerPanel;
    var html = "";
    var reason = "";

    if (current.targetRetrieved) {
      // good path: whichever chunks made it, the answer chunk is among them
      var chunkLabel = current.targetChunks.join(", ");
      html += '<p class="verdict good">✓ Grounded — the model can answer from your policy.</p>';
      html += '<div class="answer-reply">“' + escapeHtml(targetSent.text) + '”' +
        '<div class="m-label" style="margin-top:6px">The passage that answers this is inside retrieved chunk ' +
        chunkLabel + ". Nothing needs to be invented — the model reads it from context.</div></div>";
      reason = state.mode === "keyword"
        ? "Keyword search happened to find it — it works when the question happens to use the document's words."
        : "Semantic search found it even though the question and the answer barely share words: meaning, not spelling, is what matched.";
    } else if (current.retrieved.length === 0) {
      html += '<p class="verdict bad">✗ Not grounded — no context was retrieved at all.</p>';
      html += '<div class="answer-reply bad">Without any context, the model falls back on its own training data — which knows nothing about ' +
        'Aurora’s policy. This is exactly the situation where confident hallucination happens.</div>';
      reason = "The exact-word retriever needs the question to reuse the document's vocabulary. “" +
        q.label.replace("?", "") + "” and the policy sentence (“" + targetSent.text.slice(0, 60) + "…”) share no words.";
    } else {
      // something was retrieved but it wasn't the answer chunk
      var where = current.targetChunks.length
        ? (current.targetRank >= 0 ? "It ranked #" + (current.targetRank + 1) + " — just below the top-" + current.k + "." : "It was in chunk " + current.targetChunks.join(", ") + ".")
        : "";
      html += '<p class="verdict bad">✗ Not grounded — retrieval missed the passage with the answer.</p>';
      html += '<div class="answer-reply bad">The model gets the retrieved chunks above and answers from them. The sentence it really needed — ' +
        '“' + escapeHtml(targetSent.text) + '” — lives in ' +
        (current.targetChunks.join(" and ") || "a chunk") + " but never reached the prompt. " + where + "</div>";
      reason = state.mode === "semantic"
        ? "Chunking put the answer in a chunk whose blended point landed away from your question, or your question is far from all chunks. Try a chunk size that keeps each topic together (size 4, overlap 0–1)."
        : "The exact words that matched (“" + q.label.replace("?", "") + "”) pointed at a chunk that only shares an incidental word with the question. Semantic search would read the meaning instead.";
    }

    html += '<p class="answer-risk">' + reason + "</p>";
    box.innerHTML = html;
  }

  /* --- Full render --------------------------------------------------------------- */

  function renderAll() {
    compute();
    renderChunkBand();
    renderRanking();
    renderPrompt();
    renderVerdict();
    els.queryBtns.querySelectorAll("button").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-i") === String(state.query)));
    });
    els.modeBtns.querySelectorAll("button").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-mode") === state.mode));
    });
    // slider value labels
    els.chunkVal.textContent = state.chunkSize;
    els.overlapVal.textContent = state.overlap;
    els.topkVal.textContent = clampTopK(state.topK, current.chunks.length);
    els.overlapSlider.max = String(Math.max(0, Math.min(2, state.chunkSize - 1)));
    els.overlapSlider.disabled = state.chunkSize <= 1;
    drawMap();   // map must refresh on every control change too
  }

  /* --- Control wiring -------------------------------------------------------------- */

  function buildQueryButtons() {
    var wrap = els.queryBtns;
    wrap.innerHTML = "";
    QUERIES.forEach(function (q, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("data-i", String(i));
      b.textContent = "Q" + (i + 1) + " · " + q.label;
      b.title = q.note;
      b.addEventListener("click", function () { state.query = i; renderAll(); });
      wrap.appendChild(b);
    });
  }

  function buildModeButtons() {
    var wrap = els.modeBtns;
    wrap.innerHTML = "";
    var opts = [
      { mode: "semantic", label: "Semantic (meaning)" },
      { mode: "keyword", label: "Keyword (exact words)" }
    ];
    opts.forEach(function (o) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("data-mode", o.mode);
      b.textContent = o.label;
      b.addEventListener("click", function () { state.mode = o.mode; renderAll(); });
      wrap.appendChild(b);
    });
  }

  function wireSliders() {
    els.chunkSlider.addEventListener("input", function () {
      state.chunkSize = parseInt(els.chunkSlider.value, 10);
      state.overlap = Math.min(state.overlap, Math.max(0, state.chunkSize - 1));
      renderAll();
    });
    els.overlapSlider.addEventListener("input", function () {
      state.overlap = parseInt(els.overlapSlider.value, 10);
      renderAll();
    });
    els.topkSlider.addEventListener("input", function () {
      state.topK = parseInt(els.topkSlider.value, 10);
      renderAll();
    });
  }

  /* --- Animation loop (UI pulse only; content stays static per design) --------------- */

  function tick(now) {
    var last = tick.last || now;
    var dt = Math.min(0.05, (now - last) / 1000);
    tick.last = now;
    pulse += dt;
    drawMap();
    requestAnimationFrame(tick);
  }

  /* --- Public API --------------------------------------------------------------------- */

  var api = {
    init: function (elsIn) {
      els = elsIn;
      reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // responsive canvas
      function fitCanvas() {
        var rect = els.canvas.getBoundingClientRect();
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        els.canvas.width = Math.max(200, Math.round(rect.width * dpr));
        els.canvas.height = Math.max(120, Math.round(rect.height * dpr));
        drawMap();
      }

      buildQueryButtons();
      buildModeButtons();
      wireSliders();

      var canv = els.canvas;
      canv.setAttribute("aria-label", "meaning map: colored dots are chunk embeddings, the white ring is the question point");
      fitCanvas();
      window.addEventListener("resize", fitCanvas);
      renderAll();

      // renderAll() draws the map; reduced motion only disables the pulse loop
      if (!reducedMotion) {
        tick.last = performance.now();
        requestAnimationFrame(tick);
      }
    }
  };

  global.RAGLab = api;
})(window);
