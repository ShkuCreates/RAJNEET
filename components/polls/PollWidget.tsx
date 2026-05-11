"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, CalendarClock, RotateCcw } from "lucide-react";
import { toast } from "sonner";

type PollApiResponse =
  | { success: true; poll: any }
  | { success: false; message?: string; error?: string };

export default function PollWidget({ poll }: { poll?: any }) {
  const [votedOption, setVotedOption] = useState<string | null>(null);
  const [pollData, setPollData] = useState<any | null>(poll ?? null);
  const [status, setStatus] = useState<"loading" | "empty" | "error" | "ready">(
    poll ? "ready" : "loading"
  );
  const [isVoting, setIsVoting] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const stateKey = useMemo(() => undefined, []);

  useEffect(() => {
    if (poll) return;

    let cancelled = false;

    const run = async () => {
      try {
        setStatus("loading");
        const res = await fetch(
          `/api/polls/featured${stateKey ? `?state=${encodeURIComponent(stateKey)}` : ""}`,
          { method: "GET" }
        );
        const data = (await res.json()) as PollApiResponse;

        if (cancelled) return;

        if ("success" in data && data.success === false) {
          setStatus("empty");
          return;
        }

        const live = (data as any).poll;
        if (!live) {
          setStatus("empty");
          return;
        }

        setPollData(live);
        setStatus("ready");
      } catch {
        if (cancelled) return;
        setStatus("error");
      }
    };

    timeoutRef.current = window.setTimeout(() => {
      if (!cancelled) setStatus("empty");
    }, 3000);

    run().finally(() => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    });

    return () => {
      cancelled = true;
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [poll, stateKey]);

  const livePoll = useMemo(() => {
    if (!pollData) return null;

    const optionsRaw = pollData.options;
    const optionsArr: any[] = Array.isArray(optionsRaw) ? optionsRaw : [];
    const resultsArr: Array<{ label: string; progress: number }> = Array.isArray(pollData.results)
      ? pollData.results
      : [];

    const normalizedOptions = optionsArr.map((opt: any, idx: number) => {
      const text = typeof opt === "string" ? opt : opt?.text ?? opt?.label ?? "";
      const id = typeof opt === "string" ? String.fromCharCode(65 + idx) : String(idx);
      const match = resultsArr.find((result) => result.label === text);
      return {
        id,
        text,
        percentage: match?.progress ?? 0,
      };
    });

    return {
      id: pollData.id,
      question: pollData.question,
      options: normalizedOptions,
      totalVotes: pollData.totalVotes ?? 0,
    };
  }, [pollData]);

  const optionTextById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const opt of livePoll?.options ?? []) {
      map[opt.id] = opt.text;
    }
    return map;
  }, [livePoll?.options]);

  const handleRetry = () => {
    window.location.reload();
  };

  const handleVote = async (optionId: string) => {
    if (isVoting || !pollData?.id) return;

    if (!votedOption) setVotedOption(optionId);

    setIsVoting(true);
    try {
      const selectedOptionText = optionTextById[optionId] || optionId;
      const res = await fetch("/api/polls/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pollId: pollData.id, option: selectedOptionText }),
      });

      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Vote failed");
      }

      toast.success("Vote recorded!");
      window.setTimeout(() => window.location.reload(), 600);
    } catch (error: any) {
      toast.error(error?.message || "Vote unavailable");
      setVotedOption(null);
    } finally {
      setIsVoting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="rounded-lg border border-border bg-background p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarClock size={16} /> Checking active poll...
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-lg border border-border bg-background p-4">
        <h4 className="mb-2 text-sm font-semibold">Poll unavailable</h4>
        <p className="mb-4 text-sm text-muted-foreground">
          We could not load the current poll. Try again.
        </p>
        <button
          onClick={handleRetry}
          className="inline-flex items-center gap-2 rounded-md border border-accent-blue/30 bg-accent-blue/10 px-4 py-2 text-sm font-black text-accent-blue hover:bg-accent-blue/20"
        >
          <RotateCcw size={16} /> Retry
        </button>
      </div>
    );
  }

  if (status === "empty" || !pollData || !livePoll) {
    return (
      <div className="rounded-lg border border-border bg-background p-6">
        <div className="mb-3 flex items-center justify-center gap-3">
          <CalendarClock size={18} className="text-accent-blue" />
          <h4 className="text-center text-sm font-semibold">No active poll right now. Check back soon.</h4>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <h4 className="mb-4 text-sm font-semibold leading-tight">{livePoll.question}</h4>

      <div className="space-y-3">
        {livePoll.options.map((option: any) => (
          <div key={option.id} className="relative">
            <button
              onClick={() => handleVote(option.id)}
              disabled={!!votedOption || isVoting}
              className={`relative z-10 w-full rounded-md border p-3 text-left text-sm font-medium transition-all ${
                votedOption === option.id
                  ? "border-primary bg-primary/10 text-primary"
                  : votedOption
                    ? "border-transparent bg-transparent text-foreground"
                    : "border-border hover:border-primary hover:bg-secondary/5"
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{option.text}</span>
                {votedOption ? <span className="font-bold">{option.percentage}%</span> : null}
              </div>
            </button>

            {votedOption ? (
              <div
                className={`absolute left-0 top-0 -z-0 h-full rounded-md opacity-20 transition-all duration-1000 ease-out ${
                  votedOption === option.id ? "bg-primary" : "bg-muted-foreground"
                }`}
                style={{ width: `${option.percentage}%` }}
              />
            ) : null}
          </div>
        ))}
      </div>

      {votedOption ? (
        <div className="mt-4 flex items-center justify-center gap-2 rounded-md bg-green-500/10 py-1.5 text-xs font-bold text-green-500 animate-in fade-in zoom-in">
          <CheckCircle2 size={14} />
          Vote recorded!
        </div>
      ) : null}
    </div>
  );
}
