What happens if the agent context window is filled?

When an agent's context window fills, it doesn't just stop cleanly:
1. Hard limit vs. practical limit:
- Hard limit: API rejects new tokens / truncates input. Task fails if not handled.
- Practical limit hits much earlier: called context rot, context collapse, context poisoning.
1. What actually happens:
- Silent degradation: agent keeps running with partial context, producing plausible but wrong results.
- Forgetting: loses early constraints, file relationships, customer name, no external dependencies rule.
- Lost in the middle: attention dilutes, misses detail even if technically still in window. Sharp drop after ~100k tokens even on 200k-1M token models.
- Contradictions / loops: changes own earlier decisions, re-reads files already read, builds on earlier mistakes.
- Cost / latency blowup: re-processing history each step = quadratic cost, linear latency increase.
1. How agents handle it:
- Compaction / summarization: summarize history into new fresh window, e.g. Claude Code auto-compacts on approach.
- Tool-result clearing: drop raw tool outputs, keep only summary.
- Fresh sessions / subagents: break into smaller tasks, delegate research to subagent with separate window, return only 1-2k token summary.
- External memory: NOTES.md / AGENTS.md / vector retrieval + selective retention instead of full history.
Sources: addyosmani.com (https://addyosmani.com/agentic-engineering/context-collapse), ability.ai (https://www.ability.ai/blog/context-rot-agent-limits), comet.com (https://www.comet.com/site/blog/context-window), anthropic.com (http://anthropic.com/engineering/effective-context-engineering-for-ai-agents)





### Top-K and Top-P Sampling
explain how attention mechanism works in details with diagrams
