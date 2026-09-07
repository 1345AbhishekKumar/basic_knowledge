# Sources — Self-Attention & the Transformer

Every fact in this lesson was verified during web research (see `interactive-lessons/references/research.md`). Numbers and claims below were cross-checked against 2+ independent sources.

## Facts used in this lesson

- **The Transformer was introduced by Vaswani et al., "Attention Is All You Need" (2017, NeurIPS).** — Source: arXiv:1706.03762 ([arxiv.org/abs/1706.03762](https://arxiv.org/abs/1706.03762)); also *Wikipedia: Attention Is All You Need* ([en.wikipedia.org/wiki/Attention_Is_All_You_Need](https://en.wikipedia.org/wiki/Attention_Is_All_You_Need)).
- **Scaled dot-product attention formula: Attention(Q,K,V) = softmax(QKᵀ / √dₖ) · V.** — Source: arXiv:1706.03762 §3.2.1; The Illustrated Transformer ([jalammar.github.io/illustrated-transformer](https://jalammar.github.io/illustrated-transformer/)).
- **Scaling rationale: dot products grow large in magnitude with dₖ, "pushing the softmax function into regions where it has extremely small gradients"; dividing by √dₖ counteracts that.** — Source: paper §3.2.1 verbatim quote (verified via multiple independent reproductions, incl. deeplearning.ai community thread, 2023–2025); The Illustrated Transformer ("This leads to having more stable gradients").
- **Original model dimensions: h = 8 heads; d_k = d_v = d_model/h = 64; d_model = 512; N = 6 encoder and 6 decoder layers.** — Source: paper §3.2.2 ("we employ h = 8 parallel attention layers... dk = dv = dmodel/h = 64"); The Illustrated Transformer (embedding 512, Q/K/V 64, six encoders/decoders); multiple secondary explainers agree (e.g. krypticmouse.hashnode.dev, glassboxmedicine.com).
- **Q, K, V are produced by multiplying each token's embedding by learned weight matrices W^Q, W^K, W^V; each head has its own set of projection matrices.** — Source: The Illustrated Transformer; deeplearning.ai community ("Queries, Keys and Values are obtained by multiplying the input embeddings with learned weight matrices").
- **Softmax turns the raw (scaled) scores into positive weights that sum to 1 over the sequence; attention output is the weighted sum of the Value vectors.** — Source: The Illustrated Transformer ("Softmax normalizes the scores so they're all positive and add up to 1"; step 5–6 weighted sum of value vectors).
- **Multi-head attention runs h parallel attention computations (each in its own projection subspace) and concatenates the results, projecting with W^O.** — Source: paper §3.2.2; The Illustrated Transformer ("The Transformer uses eight attention heads...").
- **Different heads learn different patterns. In the original paper's model, while encoding "it" in "The animal didn't cross the street because it was too tired", one head focused mostly on "animal" and another on "tired".** — Source: The Illustrated Transformer (observed in the Tensor2Tensor notebook visualization of the paper's model).
- **Self-attention alone is order-agnostic (permutation-invariant): "The dog bit the man" vs "The man bit the dog" produce identical attention without position information. Transformers inject order via positional encoding added to the embeddings (sine/cosine functions in the original paper, §3.5).** — Source: The Illustrated Transformer ("One thing that's missing... a way to account for the order of the words"); datascience.stackexchange Q.122865 ("The need for positional encoding... is justified by permutation invariance of self-attention"); d2l.ai *Self-Attention and Positional Encoding* chapter; multiple explainers agree.
- **Encoder structure: each layer = multi-head self-attention + position-wise feed-forward, each sub-layer wrapped in a residual connection + layer norm. Decoder additionally masks future positions in its self-attention and has an encoder-decoder attention layer taking Q from below and K,V from the encoder.** — Source: The Illustrated Transformer; paper §3.
- **"it"-type coreference is the classic worked example**: the model must figure out what "it" refers to using the whole sentence. — Source: The Illustrated Transformer.

## Toy data in the playground

The playground's Q/K/V vectors are **illustrative stand-ins** hand-tuned for teaching: the sentence-level *arithmetic* (dot product → ÷√dₖ → softmax → weighted sum) is the real operation, but the vectors are not from a trained model. The two heads shown ("meaning" and "next-word") illustrate the *kinds* of patterns real models learn — content/coreference heads and positional heads — based on the observations above.

## Further reading for the learner

- Vaswani et al., **Attention Is All You Need** (the paper) — https://arxiv.org/abs/1706.03762
- Jay Alammar, **The Illustrated Transformer** — https://jalammar.github.io/illustrated-transformer/
- Harvard NLP, **The Annotated Transformer** — http://nlp.seas.harvard.edu/annotated-transformer/
- d2l.ai, **Self-Attention and Positional Encoding** — https://d2l.ai/chapter_attention-mechanisms-and-transformers/self-attention-and-positional-encoding.html
- Wikipedia, **Attention Is All You Need** — https://en.wikipedia.org/wiki/Attention_Is_All_You_Need
