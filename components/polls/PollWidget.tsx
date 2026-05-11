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

  const stateKey = useMemo(() => {
    // If you have state-specific widgets later, pass it in via query param and/or props.
    return undefined;
  }, []);

  useEffect(() => {
    // If poll prop is provided, do not fetch.
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

        if ("success" in data && (data as any).success === false) {
          setStatus("empty");
          return;
        }

        const p = (data as any).poll;
        if (!p) {
          setStatus("empty");
          return;
        }

        setPollData(p);
        setStatus("ready");
      } catch (e: any) {
        if (cancelled) return;
        setStatus("error");
      }
    };

    // 3-second timeout: never show infinite spinner
    timeoutRef.current = window.setTimeout(() => {
      if (cancelled) return;
      setStatus("empty");
    }, 3000);

    run().finally(() => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    });

    return () => {
      cancelled = true;
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [poll, stateKey]);

  const mockPoll = useMemo(() => {
    const fallback = {
      id: "1",
      question:
        "Should local district councils have veto power over state infrastructure projects?",
      options: [
        { id: "A", text: "Yes, fully", votes: 450, percentage: 45 },
        { id: "B", text: "No, states decide", votes: 300, percentage: 30 },
        { id: "C", text: "Only on environmental grounds", votes: 250, percentage: 25 },
      ],
      totalVotes: 1000,
    };

    if (!pollData) return fallback;

    const optionsRaw = pollData.options;
    // optionsRaw is stored in DB as Json; API casts it to string[].
    const optionsArr: any[] = Array.isArray(optionsRaw) ? optionsRaw : [];

    const resultsArr: Array<{ label: string; progress: number }> = Array.isArray(pollData.results)
      ? pollData.results
      : [];

    // When API returns strings in optionsArr, treat those strings as option text.
    // We use option text for voting because /api/polls/vote expects `selected_option` string.
    const normalizedOptions = optionsArr.map((opt: any, idx: number) => {
      const text = typeof opt === "string" ? opt : opt?.text ?? opt?.label ?? "";
      const id = typeof opt === "string" ? String.fromCharCode(65 + idx) : String(idx);
      const match = resultsArr.find((r) => r.label === text);
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

  // For vote submissions we must use the actual option label/text (API stores options as strings).
  const optionTextById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const opt of mockPoll.options) {
      map[opt.id] = opt.text;
    }
    return map;
  }, [mockPoll.options]);


  const handleRetry = () => {
    // best-effort retry: just reload
    window.location.reload();
  };

  const handleVote = async (optionId: string) => {
    if (isVoting) return;
    if (!pollData?.id) return;

    if (!votedOption) setVotedOption(optionId);

    setIsVoting(true);
    try {
      // Convert displayed option.id -> actual option text/label expected by API vote.
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

      // Re-fetch to show updated bars.
      // (Small delay to allow DB write.)
      setTimeout(() => {
        window.location.reload();
      }, 600);
    } catch (e: any) {
      toast.error(e?.message || "Vote unavailable");
      setVotedOption(null);
    } finally {
      setIsVoting(false);
    }
  };

  if (status === "loading") {
    // Render nothing but keep UI stable; requirement says never infinite spinner.
    return (
      <div className="border border-border rounded-lg p-4 bg-background">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarClock size={16} /> Checking active poll...
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="border border-border rounded-lg p-4 bg-background">
        <h4 className="text-sm font-semibold mb-2">Poll unavailable</h4>
        <p className="text-sm text-muted-foreground mb-4">
          We couldn’t load the current poll. Try again.
        </p>
        <button
          onClick={handleRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-accent-blue/30 bg-accent-blue/10 text-accent-blue text-sm font-black hover:bg-accent-blue/20"
        >
          <RotateCcw size={16} /> Retry
        </button>
      </div>
    );
  }

  if (status === "empty" || !pollData) {
    return (
      <div className="border border-border rounded-lg p-6 bg-background">
        <div className="flex items-center justify-center gap-3 mb-3">
          <CalendarClock size={18} className="text-accent-blue" />
          <h4 className="text-sm font-semibold text-center">No active poll right now. Check back soon.</h4>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg p-4 bg-background">
      <h4 className="text-sm font-semibold mb-4 leading-tight">{mockPoll.question}</h4>

      <div className="space-y-3">
        {mockPoll.options.map((option: any) => (
          <div key={option.id} className="relative">
            <button
              onClick={() => handleVote(option.id)}
              disabled={!!votedOption || isVoting}
              className={`w-full text-left p-3 rounded-md text-sm font-medium border transition-all z-10 relative ${
                votedOption === option.id
                  ? "border-primary bg-primary/10 text-primary"
                  : votedOption
                    ? "border-transparent bg-transparent text-foreground"
                    : "border-border hover:border-primary hover:bg-secondary/5"
              }`}
            >
              <div className="flex justify-between items-center">
                <span>{option.text}</span>
                {votedOption && <span className="font-bold">{option.percentage}%</span>}
              </div>
            </button>

            {/* Animated Bar Background (shows only after voting) */}
            {votedOption && (
              <div
                className={`absolute top-0 left-0 h-full rounded-md -z-0 opacity-20 transition-all duration-1000 ease-out ${
                  votedOption === option.id ? "bg-primary" : "bg-muted-foreground"
                }`}
                style={{ width: `${option.percentage}%` }}
              />
            )}
          </div>
        ))}
      </div>

      {votedOption && (
        <div className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-green-500 bg-green-500/10 py-1.5 rounded-md animate-in fade-in zoom-in">
          <CheckCircle2 size={14} />
          Vote recorded!
        </div>
      )}
    </div>
  );
}

