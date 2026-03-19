import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, Trophy, Zap, RotateCcw, Play, Send } from "lucide-react";

const GAME_DURATION = 20;
const TARGET_SIZE = 88;
const ARENA_PADDING = 20;

type Phase = "idle" | "countdown" | "playing" | "finished";

type SubmissionStatus = "idle" | "submitting" | "success" | "error";

export default function ReactionRush() {
  const arenaRef = useRef<HTMLDivElement | null>(null);
  const countdownRef = useRef<number | null>(null);
  const gameTimerRef = useRef<number | null>(null);

  const [phase, setPhase] = useState<Phase>("idle");
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>("idle");
  const [targetPosition, setTargetPosition] = useState({ x: 120, y: 120 });
  const [playerName, setPlayerName] = useState("Apollo");

  useEffect(() => {
    const savedBest = localStorage.getItem("vennx-reaction-rush-best");
    if (savedBest) setBestScore(Number(savedBest));
    return () => {
      if (countdownRef.current) window.clearInterval(countdownRef.current);
      if (gameTimerRef.current) window.clearInterval(gameTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem("vennx-reaction-rush-best", String(score));
    }
  }, [score, bestScore]);

  const accuracyLabel = useMemo(() => {
    if (score >= 35) return "Elite";
    if (score >= 25) return "Sharp";
    if (score >= 15) return "Focused";
    return "Warming up";
  }, [score]);

  function randomizeTarget() {
    const arena = arenaRef.current;
    if (!arena) return;

    const maxX = arena.clientWidth - TARGET_SIZE - ARENA_PADDING;
    const maxY = arena.clientHeight - TARGET_SIZE - ARENA_PADDING;

    const x = Math.max(ARENA_PADDING, Math.floor(Math.random() * maxX));
    const y = Math.max(ARENA_PADDING, Math.floor(Math.random() * maxY));

    setTargetPosition({ x, y });
  }

  function startCountdown() {
    setSubmissionStatus("idle");
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setCountdown(3);
    setPhase("countdown");

    if (countdownRef.current) window.clearInterval(countdownRef.current);

    countdownRef.current = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) window.clearInterval(countdownRef.current);
          startGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function startGame() {
    setPhase("playing");
    randomizeTarget();

    if (gameTimerRef.current) window.clearInterval(gameTimerRef.current);

    gameTimerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (gameTimerRef.current) window.clearInterval(gameTimerRef.current);
          setPhase("finished");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function handleTargetHit() {
    if (phase !== "playing") return;
    setScore((prev) => prev + 1);
    randomizeTarget();
  }

  async function submitScore() {
    try {
      setSubmissionStatus("submitting");

      const response = await fetch("/api/reaction-rush/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: playerName || "Anonymous",
          score,
          game: "reaction-rush",
          playedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error("Submission failed");

      setSubmissionStatus("success");
    } catch (error) {
      console.error(error);
      setSubmissionStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(140,82,255,0.22),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_25%)]" />
      <div className="absolute -top-10 left-1/4 h-44 w-44 rounded-full bg-purple-500/20 blur-3xl" />
      <div className="absolute bottom-10 right-10 h-56 w-56 rounded-full bg-violet-400/10 blur-3xl" />

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-6 items-stretch">
          <section className="lg:w-[320px] rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-400/10 px-3 py-1 text-sm text-purple-200 mb-4">
              <Zap className="h-4 w-4" />
              VennX Original
            </div>

            <h1 className="text-4xl font-bold tracking-tight mb-2">Reaction Rush</h1>
            <p className="text-white/70 leading-6 mb-6">
              Hit the moving target as fast as possible before the timer runs out.
            </p>

            <div className="space-y-3 mb-6">
              <StatRow icon={<Trophy className="h-4 w-4" />} label="Score" value={score} />
              <StatRow icon={<Timer className="h-4 w-4" />} label="Time Left" value={`${timeLeft}s`} />
              <StatRow icon={<Zap className="h-4 w-4" />} label="Rating" value={accuracyLabel} />
              <StatRow icon={<Trophy className="h-4 w-4" />} label="Best" value={bestScore} />
            </div>

            <label className="block text-sm text-white/75 mb-2">Player name</label>
            <input
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-purple-400/50"
              placeholder="Enter name"
            />

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={startCountdown}
                className="inline-flex items-center gap-2 rounded-2xl bg-purple-500 px-5 py-3 font-medium text-white shadow-[0_0_30px_rgba(168,85,247,0.35)] transition hover:scale-[1.02]"
              >
                <Play className="h-4 w-4" />
                Start Game
              </button>

              <button
                onClick={() => {
                  setPhase("idle");
                  setScore(0);
                  setTimeLeft(GAME_DURATION);
                  setSubmissionStatus("idle");
                  if (countdownRef.current) window.clearInterval(countdownRef.current);
                  if (gameTimerRef.current) window.clearInterval(gameTimerRef.current);
                }}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-medium text-white/90 transition hover:bg-white/10"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
            </div>

            {phase === "finished" && (
              <button
                onClick={submitScore}
                className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-purple-400/30 bg-purple-400/10 px-5 py-3 font-medium text-purple-100 transition hover:bg-purple-400/20"
              >
                <Send className="h-4 w-4" />
                Submit Score
              </button>
            )}

            <p className="mt-4 text-sm text-white/60">
              {submissionStatus === "submitting" && "Submitting score..."}
              {submissionStatus === "success" && "Score submitted successfully."}
              {submissionStatus === "error" && "Backend not connected yet. API route placeholder is ready."}
            </p>
          </section>

          <section className="flex-1 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 shadow-2xl min-h-[560px] relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:32px_32px] opacity-30" />

            <div
              ref={arenaRef}
              className="relative h-[520px] rounded-[28px] border border-white/10 bg-black/50 overflow-hidden"
            >
              <AnimatePresence>
                {phase === "countdown" && (
                  <motion.div
                    key="countdown"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.2 }}
                    className="absolute inset-0 flex items-center justify-center text-8xl font-black text-purple-300"
                  >
                    {countdown}
                  </motion.div>
                )}
              </AnimatePresence>

              {phase === "idle" && (
                <div className="absolute inset-0 flex items-center justify-center text-center px-8">
                  <div>
                    <h2 className="text-3xl font-semibold mb-3">Ready to test your reflexes?</h2>
                    <p className="text-white/65 max-w-md mx-auto leading-7">
                      Press start. You will get 20 seconds to hit as many glowing targets as possible.
                    </p>
                  </div>
                </div>
              )}

              {phase === "playing" && (
                <motion.button
                  key={`${targetPosition.x}-${targetPosition.y}`}
                  initial={{ opacity: 0.5, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.16 }}
                  onClick={handleTargetHit}
                  className="absolute rounded-full border border-white/30 bg-purple-400/80 shadow-[0_0_40px_rgba(168,85,247,0.75)]"
                  style={{
                    left: targetPosition.x,
                    top: targetPosition.y,
                    width: TARGET_SIZE,
                    height: TARGET_SIZE,
                  }}
                >
                  <span className="sr-only">Hit target</span>
                  <span className="absolute inset-3 rounded-full border border-white/40" />
                  <span className="absolute inset-6 rounded-full bg-black/30" />
                </motion.button>
              )}

              {phase === "finished" && (
                <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
                  <div className="rounded-3xl border border-white/10 bg-black/70 backdrop-blur-xl p-8 max-w-lg">
                    <h2 className="text-4xl font-bold mb-3">Round Complete</h2>
                    <p className="text-white/70 mb-2">Final score</p>
                    <div className="text-7xl font-black text-purple-300 mb-4">{score}</div>
                    <p className="text-white/60 leading-7">
                      Nice run. This screen is already set up for leaderboard and payout integration next.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function StatRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
      <div className="flex items-center gap-2 text-white/70">
        {icon}
        <span>{label}</span>
      </div>
      <div className="font-semibold text-white">{value}</div>
    </div>
  );
}
